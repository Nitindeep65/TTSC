import re
import logging
from typing import Dict, List, Any, Optional, Tuple
import psycopg2
from psycopg2.extras import RealDictCursor
from app.Models.schema import TableInfo, ColumnInfo, SchemaInfoResponse, HealedQueryInfo

logger = logging.getLogger(__name__)

# Query to introspect all tables, columns, data types, primary keys, and foreign keys
INTROSPECTION_QUERY = """
SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    c.udt_name,
    c.is_nullable,
    c.column_default,
    COALESCE(pk.is_pk, false) AS is_primary_key,
    fk.foreign_table_name,
    fk.foreign_column_name
FROM information_schema.tables t
JOIN information_schema.columns c 
    ON t.table_name = c.table_name 
    AND t.table_schema = c.table_schema
LEFT JOIN (
    SELECT 
        kcu.table_schema,
        kcu.table_name,
        kcu.column_name,
        true AS is_pk
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name 
        AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'PRIMARY KEY'
) pk ON c.table_schema = pk.table_schema 
     AND c.table_name = pk.table_name 
     AND c.column_name = pk.column_name
LEFT JOIN (
    SELECT 
        kcu.table_schema,
        kcu.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name 
        AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage ccu 
        ON tc.constraint_name = ccu.constraint_name 
        AND tc.table_schema = ccu.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
) fk ON c.table_schema = fk.table_schema 
     AND c.table_name = fk.table_name 
     AND c.column_name = fk.column_name
WHERE t.table_schema = 'public' 
  AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name, c.ordinal_position;
"""


def parse_connection_info(connection_uri: str) -> Dict[str, str]:
    """Extracts safe metadata (host, port, dbname, user) from connection string."""
    try:
        pattern = r"postgres(?:ql)?://(?:([^:@]+)(?::([^@]+))?@)?([^:/]+)(?::(\d+))?(?:/([^?]+))?"
        match = re.match(pattern, connection_uri)
        if match:
            user, _, host, port, dbname = match.groups()
            return {
                "host": host or "localhost",
                "port": port or "5432",
                "database": dbname or "postgres",
                "user": user or "postgres",
            }
    except Exception:
        pass
    return {"host": "cloud-postgres", "database": "postgres", "user": "postgres"}


def test_db_connection(connection_uri: str) -> Dict[str, Any]:
    """Tests connection to the cloud PostgreSQL database."""
    conn = None
    try:
        conn = psycopg2.connect(connection_uri, connect_timeout=8)
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()[0]
        cursor.close()
        
        info = parse_connection_info(connection_uri)
        return {
            "status": "connected",
            "version": version,
            "host": info.get("host"),
            "database": info.get("database"),
            "user": info.get("user")
        }
    except Exception as e:
        logger.error(f"Database connection failed: {str(e)}")
        raise ValueError(f"Failed to connect to PostgreSQL: {str(e)}")
    finally:
        if conn:
            conn.close()


def introspect_cloud_database(connection_uri: str) -> Tuple[List[TableInfo], str]:
    """
    Introspects the connected cloud database and returns:
    1. List of structured TableInfo objects
    2. Formatted SQL DDL string for LLM system prompt
    """
    conn = None
    try:
        conn = psycopg2.connect(connection_uri, connect_timeout=10)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(INTROSPECTION_QUERY)
        rows = cursor.fetchall()
        cursor.close()

        if not rows:
            raise ValueError("No tables found in the public schema of the connected database.")

        tables_dict: Dict[str, List[ColumnInfo]] = {}
        for row in rows:
            t_name = row["table_name"]
            if t_name not in tables_dict:
                tables_dict[t_name] = []

            data_type = row["data_type"].upper()
            if data_type == "USER-DEFINED":
                data_type = row["udt_name"].upper()

            is_fk = bool(row["foreign_table_name"])
            ref_str = f"{row['foreign_table_name']}({row['foreign_column_name']})" if is_fk else None

            col_info = ColumnInfo(
                name=row["column_name"],
                type=data_type,
                is_primary_key=bool(row["is_primary_key"]),
                is_foreign_key=is_fk,
                references=ref_str,
                description=f"Default: {row['column_default']}" if row["column_default"] else None
            )
            tables_dict[t_name].append(col_info)

        table_info_list: List[TableInfo] = []
        schema_sql_lines: List[str] = ["-- Live Introspected PostgreSQL Schema\n"]

        for t_name, cols in tables_dict.items():
            table_info = TableInfo(
                table_name=t_name,
                description=f"Table with {len(cols)} columns",
                columns=cols
            )
            table_info_list.append(table_info)

            col_ddl_parts = []
            for col in cols:
                parts = [f"    {col.name} {col.type}"]
                if col.is_primary_key:
                    parts.append("PRIMARY KEY")
                if col.is_foreign_key and col.references:
                    parts.append(f"REFERENCES {col.references}")
                col_ddl_parts.append(" ".join(parts))

            table_ddl = f"CREATE TABLE {t_name} (\n" + ",\n".join(col_ddl_parts) + "\n);\n"
            schema_sql_lines.append(table_ddl)

        full_schema_sql = "\n".join(schema_sql_lines)
        return table_info_list, full_schema_sql

    except Exception as e:
        logger.error(f"Schema introspection error: {str(e)}")
        raise ValueError(f"Schema introspection failed: {str(e)}")
    finally:
        if conn:
            conn.close()


def serialize_val(val):
    if val is None:
        return None
    if hasattr(val, "isoformat"):
        return val.isoformat()
    return str(val)


def _raw_execute_select(connection_uri: str, query: str, limit: int = 50) -> Tuple[List[str], List[Dict[str, Any]]]:
    """Helper to run a read-only query safely with strict timeout."""
    conn = None
    try:
        conn = psycopg2.connect(connection_uri, connect_timeout=8)
        conn.set_session(readonly=True, autocommit=True)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SET statement_timeout = '8000';")
        cursor.execute(query)
        rows = cursor.fetchmany(limit)
        columns = [desc[0] for desc in cursor.description] if cursor.description else []
        cursor.close()

        serialized_rows = [{k: serialize_val(v) for k, v in r.items()} for r in rows]
        return columns, serialized_rows
    finally:
        if conn:
            conn.close()


def execute_read_only_query(
    connection_uri: str,
    sql_query: str,
    limit: int = 50,
    auto_heal: bool = True,
    user_prompt: Optional[str] = None,
    live_schema: Optional[str] = None
) -> Dict[str, Any]:
    """
    Executes a SELECT query safely in read-only mode against the cloud database.
    If execution fails and auto_heal=True, intercepts error and invokes the Critic Agent.
    """
    query = sql_query.strip()
    if not (re.match(r"^\s*(?:SELECT|WITH)\b", query, re.IGNORECASE)):
        raise ValueError("Only SELECT statements can be executed.")

    healing_info = None

    try:
        columns, rows = _raw_execute_select(connection_uri, query, limit)
        return {
            "status": "success",
            "columns": columns,
            "rows": rows,
            "row_count": len(rows),
            "healing_info": None
        }

    except Exception as primary_error:
        err_msg = str(primary_error)
        logger.warning(f"Initial query execution error: {err_msg}")

        # If auto-healing is disabled, propagate error
        if not auto_heal:
            raise ValueError(f"Database query execution error: {err_msg}")

        # Invoke Critic Self-Healing Loop
        try:
            from app.services.healing_service import heal_sql_with_critic
            healed_sql, diagnosis = heal_sql_with_critic(
                failing_sql=query,
                error_message=err_msg,
                live_schema=live_schema,
                user_prompt=user_prompt
            )

            # Re-execute healed SQL query
            columns, rows = _raw_execute_select(connection_uri, healed_sql, limit)

            healing_info = HealedQueryInfo(
                was_healed=True,
                original_sql=query,
                healed_sql=healed_sql,
                diagnosis=diagnosis,
                error_message=err_msg
            )

            return {
                "status": "success",
                "columns": columns,
                "rows": rows,
                "row_count": len(rows),
                "healing_info": healing_info
            }

        except Exception as heal_error:
            logger.error(f"Auto-healing retry failed: {heal_error}")
            raise ValueError(f"Query execution failed: {err_msg} (Healing failed: {str(heal_error)})")
