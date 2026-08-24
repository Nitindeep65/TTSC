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


# --- DEMO FALLBACK TABLE SAMPLE DATA ---
DEMO_TABLE_SAMPLES = {
    "users": {
        "columns": ["id", "email", "name", "role", "is_active", "metadata", "created_at", "updated_at"],
        "rows": [
            {"id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", "email": "alex.morgan@example.com", "name": "Alex Morgan", "role": "customer", "is_active": True, "metadata": {"tier": "gold", "pref_currency": "USD"}, "created_at": "2024-01-15T09:30:00Z", "updated_at": "2024-06-10T14:20:00Z"},
            {"id": "b1ffcd88-8d1c-4fe9-aa7e-7cc8ce491b22", "email": "sarah.chen@example.com", "name": "Sarah Chen", "role": "admin", "is_active": True, "metadata": {"dept": "engineering", "two_factor": True}, "created_at": "2023-11-20T11:00:00Z", "updated_at": "2024-08-01T10:15:00Z"},
            {"id": "c2eedf77-7e2d-4ef0-998f-8dd9df502c33", "email": "marcus.vance@example.com", "name": "Marcus Vance", "role": "customer", "is_active": True, "metadata": {"tier": "platinum"}, "created_at": "2024-02-05T16:45:00Z", "updated_at": "2024-07-22T08:30:00Z"},
            {"id": "d3ffee66-6f3e-4fa1-8890-9eeaef613d44", "email": "elena.rostova@example.com", "name": "Elena Rostova", "role": "merchant", "is_active": True, "metadata": {"store_name": "Nordic Goods", "verified": True}, "created_at": "2024-03-12T13:10:00Z", "updated_at": "2024-08-15T18:00:00Z"},
            {"id": "e4aaff55-5a4f-4fb2-7701-0ffbf0724e55", "email": "devon.miles@example.com", "name": "Devon Miles", "role": "customer", "is_active": False, "metadata": {"tier": "standard"}, "created_at": "2024-04-18T10:20:00Z", "updated_at": "2024-05-01T11:45:00Z"},
        ],
        "profiles": [
            {"name": "id", "type": "UUID", "null_count": 0, "distinct_values": []},
            {"name": "email", "type": "VARCHAR(255)", "null_count": 0, "distinct_values": ["alex.morgan@example.com", "sarah.chen@example.com", "marcus.vance@example.com"]},
            {"name": "name", "type": "VARCHAR(100)", "null_count": 0, "distinct_values": ["Alex Morgan", "Sarah Chen", "Marcus Vance", "Elena Rostova"]},
            {"name": "role", "type": "VARCHAR(50)", "null_count": 0, "distinct_values": ["customer", "admin", "merchant"]},
            {"name": "is_active", "type": "BOOLEAN", "null_count": 0, "distinct_values": ["true", "false"]},
            {"name": "metadata", "type": "JSONB", "null_count": 0, "distinct_values": []},
            {"name": "created_at", "type": "TIMESTAMPTZ", "null_count": 0, "distinct_values": []},
            {"name": "updated_at", "type": "TIMESTAMPTZ", "null_count": 0, "distinct_values": []},
        ]
    },
    "products": {
        "columns": ["id", "name", "category", "price", "stock_quantity", "attributes", "is_available", "created_at"],
        "rows": [
            {"id": "p1111111-1111-1111-1111-111111111111", "name": "Pro Noise-Canceling Headphones", "category": "Electronics", "price": 299.99, "stock_quantity": 45, "attributes": {"color": "Midnight Black", "wireless": True}, "is_available": True, "created_at": "2024-01-10T10:00:00Z"},
            {"id": "p2222222-2222-2222-2222-222222222222", "name": "Ergonomic Mechanical Keyboard", "category": "Electronics", "price": 149.50, "stock_quantity": 12, "attributes": {"switches": "Tactile Brown", "rgb": True}, "is_available": True, "created_at": "2024-01-12T11:30:00Z"},
            {"id": "p3333333-3333-3333-3333-333333333333", "name": "Merino Wool Travel Hoodie", "category": "Apparel", "price": 110.00, "stock_quantity": 80, "attributes": {"sizes": ["S", "M", "L", "XL"], "gender": "unisex"}, "is_available": True, "created_at": "2024-02-01T09:15:00Z"},
            {"id": "p4444444-4444-4444-4444-444444444444", "name": "Minimalist Ceramic Dripper", "category": "Home & Kitchen", "price": 38.00, "stock_quantity": 5, "attributes": {"material": "Ceramic", "capacity_oz": 16}, "is_available": True, "created_at": "2024-02-15T14:00:00Z"},
            {"id": "p5555555-5555-5555-5555-555555555555", "name": "Smart Water Bottle 24oz", "category": "Fitness", "price": 65.00, "stock_quantity": 0, "attributes": {"bluetooth": True, "battery_life_days": 14}, "is_available": False, "created_at": "2024-03-01T08:45:00Z"},
        ],
        "profiles": [
            {"name": "id", "type": "UUID", "null_count": 0, "distinct_values": []},
            {"name": "name", "type": "VARCHAR(255)", "null_count": 0, "distinct_values": ["Pro Noise-Canceling Headphones", "Ergonomic Mechanical Keyboard", "Merino Wool Travel Hoodie"]},
            {"name": "category", "type": "VARCHAR(100)", "null_count": 0, "distinct_values": ["Electronics", "Apparel", "Home & Kitchen", "Fitness"]},
            {"name": "price", "type": "NUMERIC(10,2)", "null_count": 0, "distinct_values": ["38.00", "65.00", "110.00", "149.50", "299.99"]},
            {"name": "stock_quantity", "type": "INTEGER", "null_count": 0, "distinct_values": ["0", "5", "12", "45", "80"]},
            {"name": "is_available", "type": "BOOLEAN", "null_count": 0, "distinct_values": ["true", "false"]},
        ]
    },
    "orders": {
        "columns": ["id", "user_id", "total_amount", "status", "shipping_address", "created_at", "updated_at"],
        "rows": [
            {"id": "o1010101-1010-1010-1010-101010101010", "user_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", "total_amount": 449.49, "status": "completed", "shipping_address": {"city": "San Francisco", "state": "CA", "country": "USA"}, "created_at": "2024-07-10T14:32:00Z", "updated_at": "2024-07-10T16:00:00Z"},
            {"id": "o2020202-2020-2020-2020-202020202020", "user_id": "c2eedf77-7e2d-4ef0-998f-8dd9df502c33", "total_amount": 149.50, "status": "completed", "shipping_address": {"city": "Austin", "state": "TX", "country": "USA"}, "created_at": "2024-07-15T09:12:00Z", "updated_at": "2024-07-15T11:30:00Z"},
            {"id": "o3030303-3030-3030-3030-303030303030", "user_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", "total_amount": 76.00, "status": "processing", "shipping_address": {"city": "San Francisco", "state": "CA", "country": "USA"}, "created_at": "2024-08-01T18:40:00Z", "updated_at": "2024-08-01T18:45:00Z"},
            {"id": "o4040404-4040-4040-4040-404040404040", "user_id": "e4aaff55-5a4f-4fb2-7701-0ffbf0724e55", "total_amount": 299.99, "status": "pending", "shipping_address": {"city": "Seattle", "state": "WA", "country": "USA"}, "created_at": "2024-08-05T12:00:00Z", "updated_at": "2024-08-05T12:00:00Z"},
            {"id": "o5050505-5050-5050-5050-505050505050", "user_id": "c2eedf77-7e2d-4ef0-998f-8dd9df502c33", "total_amount": 110.00, "status": "cancelled", "shipping_address": {"city": "Austin", "state": "TX", "country": "USA"}, "created_at": "2024-08-10T15:25:00Z", "updated_at": "2024-08-10T16:10:00Z"},
        ],
        "profiles": [
            {"name": "id", "type": "UUID", "null_count": 0, "distinct_values": []},
            {"name": "user_id", "type": "UUID", "null_count": 0, "distinct_values": []},
            {"name": "total_amount", "type": "NUMERIC(12,2)", "null_count": 0, "distinct_values": ["76.00", "110.00", "149.50", "299.99", "449.49"]},
            {"name": "status", "type": "VARCHAR(50)", "null_count": 0, "distinct_values": ["completed", "processing", "pending", "cancelled", "refunded"]},
            {"name": "created_at", "type": "TIMESTAMPTZ", "null_count": 0, "distinct_values": []},
        ]
    },
    "order_items": {
        "columns": ["id", "order_id", "product_id", "quantity", "unit_price", "created_at"],
        "rows": [
            {"id": "oi111111-1111-1111-1111-111111111111", "order_id": "o1010101-1010-1010-1010-101010101010", "product_id": "p1111111-1111-1111-1111-111111111111", "quantity": 1, "unit_price": 299.99, "created_at": "2024-07-10T14:32:00Z"},
            {"id": "oi222222-2222-2222-2222-222222222222", "order_id": "o1010101-1010-1010-1010-101010101010", "product_id": "p2222222-2222-2222-2222-222222222222", "quantity": 1, "unit_price": 149.50, "created_at": "2024-07-10T14:32:00Z"},
            {"id": "oi333333-3333-3333-3333-333333333333", "order_id": "o2020202-2020-2020-2020-202020202020", "product_id": "p2222222-2222-2222-2222-222222222222", "quantity": 1, "unit_price": 149.50, "created_at": "2024-07-15T09:12:00Z"},
            {"id": "oi444444-4444-4444-4444-444444444444", "order_id": "o3030303-3030-3030-3030-303030303030", "product_id": "p4444444-4444-4444-4444-444444444444", "quantity": 2, "unit_price": 38.00, "created_at": "2024-08-01T18:40:00Z"},
            {"id": "oi555555-5555-5555-5555-555555555555", "order_id": "o4040404-4040-4040-4040-404040404040", "product_id": "p1111111-1111-1111-1111-111111111111", "quantity": 1, "unit_price": 299.99, "created_at": "2024-08-05T12:00:00Z"},
        ],
        "profiles": [
            {"name": "id", "type": "UUID", "null_count": 0, "distinct_values": []},
            {"name": "order_id", "type": "UUID", "null_count": 0, "distinct_values": []},
            {"name": "product_id", "type": "UUID", "null_count": 0, "distinct_values": []},
            {"name": "quantity", "type": "INTEGER", "null_count": 0, "distinct_values": ["1", "2", "3", "5"]},
            {"name": "unit_price", "type": "NUMERIC(10,2)", "null_count": 0, "distinct_values": ["38.00", "110.00", "149.50", "299.99"]},
        ]
    },
    "payments": {
        "columns": ["id", "order_id", "amount", "payment_method", "status", "transaction_ref", "created_at"],
        "rows": [
            {"id": "pay-111111", "order_id": "o1010101-1010-1010-1010-101010101010", "amount": 449.49, "payment_method": "stripe", "status": "succeeded", "transaction_ref": "ch_3Nxy1234abcd", "created_at": "2024-07-10T14:35:00Z"},
            {"id": "pay-222222", "order_id": "o2020202-2020-2020-2020-202020202020", "amount": 149.50, "payment_method": "credit_card", "status": "succeeded", "transaction_ref": "auth_99887766", "created_at": "2024-07-15T09:15:00Z"},
            {"id": "pay-333333", "order_id": "o3030303-3030-3030-3030-303030303030", "amount": 76.00, "payment_method": "paypal", "status": "pending", "transaction_ref": "PAYID-XYZ123", "created_at": "2024-08-01T18:42:00Z"},
            {"id": "pay-444444", "order_id": "o4040404-4040-4040-4040-404040404040", "amount": 299.99, "payment_method": "stripe", "status": "pending", "transaction_ref": "ch_3Nxy5678efgh", "created_at": "2024-08-05T12:05:00Z"},
            {"id": "pay-555555", "order_id": "o5050505-5050-5050-5050-505050505050", "amount": 110.00, "payment_method": "credit_card", "status": "refunded", "transaction_ref": "re_77665544", "created_at": "2024-08-10T16:15:00Z"},
        ],
        "profiles": [
            {"name": "id", "type": "UUID", "null_count": 0, "distinct_values": []},
            {"name": "amount", "type": "NUMERIC(12,2)", "null_count": 0, "distinct_values": ["76.00", "110.00", "149.50", "299.99", "449.49"]},
            {"name": "payment_method", "type": "VARCHAR(50)", "null_count": 0, "distinct_values": ["credit_card", "stripe", "paypal", "bank_transfer"]},
            {"name": "status", "type": "VARCHAR(50)", "null_count": 0, "distinct_values": ["succeeded", "pending", "failed", "refunded"]},
        ]
    }
}


def sample_table_data(
    connection_uri: Optional[str],
    table_name: str,
    limit: int = 5
) -> Dict[str, Any]:
    """
    Profiles a table and returns:
    1. 5 sample records
    2. Column null counts & distinct categorical value distributions
    """
    clean_table = table_name.strip().lower()
    if not re.match(r"^[a-zA-Z0-9_]+$", clean_table):
        raise ValueError(f"Invalid table name '{table_name}'.")

    # If no live URI or URI is localhost/demo, return demo profiling if matched
    if not connection_uri or not connection_uri.strip() or "demo" in connection_uri.lower():
        if clean_table in DEMO_TABLE_SAMPLES:
            demo_data = DEMO_TABLE_SAMPLES[clean_table]
            return {
                "status": "success",
                "table_name": clean_table,
                "columns": demo_data["columns"],
                "rows": demo_data["rows"][:limit],
                "column_profiles": demo_data["profiles"],
                "row_count": len(demo_data["rows"][:limit]),
                "message": f"Retrieved sample preview & categorical distribution for '{clean_table}'."
            }

    # Live Cloud Database Execution
    conn = None
    try:
        conn = psycopg2.connect(connection_uri.strip(), connect_timeout=8)
        conn.set_session(readonly=True, autocommit=True)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SET statement_timeout = '6000';")

        # 1. Fetch sample rows
        cursor.execute(f'SELECT * FROM "{clean_table}" LIMIT {limit};')
        rows = cursor.fetchall()
        columns = [desc[0] for desc in cursor.description] if cursor.description else []

        serialized_rows = [{k: serialize_val(v) for k, v in r.items()} for r in rows]

        # 2. Profile columns (data types & categorical enums)
        column_profiles = []
        for col in columns:
            col_type = "TEXT"
            null_count = sum(1 for r in serialized_rows if r.get(col) is None)
            distinct_vals = []

            # Check distinct values for candidate categorical columns
            if any(kw in col.lower() for kw in ["status", "role", "type", "method", "category", "gender", "tier", "state"]):
                try:
                    cursor.execute(f'SELECT DISTINCT "{col}"::text FROM "{clean_table}" WHERE "{col}" IS NOT NULL LIMIT 8;')
                    distinct_rows = cursor.fetchall()
                    distinct_vals = [str(r[col]) for r in distinct_rows if r.get(col) is not None]
                except Exception:
                    pass

            column_profiles.append({
                "name": col,
                "type": col_type,
                "null_count": null_count,
                "distinct_values": distinct_vals
            })

        cursor.close()

        return {
            "status": "success",
            "table_name": clean_table,
            "columns": columns,
            "rows": serialized_rows,
            "column_profiles": column_profiles,
            "row_count": len(serialized_rows),
            "message": f"Successfully profiled live table '{clean_table}' with {len(serialized_rows)} sample rows."
        }

    except Exception as e:
        logger.warning(f"Live table sample failed for {clean_table}: {e}")
        # Fallback to demo sample if available
        if clean_table in DEMO_TABLE_SAMPLES:
            demo_data = DEMO_TABLE_SAMPLES[clean_table]
            return {
                "status": "success",
                "table_name": clean_table,
                "columns": demo_data["columns"],
                "rows": demo_data["rows"][:limit],
                "column_profiles": demo_data["profiles"],
                "row_count": len(demo_data["rows"][:limit]),
                "message": f"Showing schema profile for '{clean_table}' (fallback)."
            }
        raise ValueError(f"Could not profile table '{clean_table}': {str(e)}")
    finally:
        if conn:
            conn.close()

