from fastapi import APIRouter, HTTPException
from app.Models.schema import (
    DBConnectRequest,
    DBConnectResponse,
    ExecuteQueryRequest,
    ExecuteQueryResponse,
)
from app.services.db_service import (
    test_db_connection,
    introspect_cloud_database,
    execute_read_only_query,
    parse_connection_info,
)

router = APIRouter(
    prefix="/api/database",
    tags=["Cloud Database Connection & Introspection"]
)

@router.post("/test")
def test_connection(request: DBConnectRequest):
    """
    Tests live connection to the specified cloud PostgreSQL database.
    """
    try:
        result = test_db_connection(request.connection_uri.strip())
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/connect", response_model=DBConnectResponse)
def connect_and_introspect(request: DBConnectRequest):
    """
    Connects to the cloud PostgreSQL database (Supabase, Neon, AWS RDS, etc.),
    introspects all tables, columns, types, and constraints, and returns the live schema.
    """
    uri = request.connection_uri.strip()
    try:
        # Introspect schema
        table_infos, schema_sql = introspect_cloud_database(uri)
        conn_info = parse_connection_info(uri)

        return DBConnectResponse(
            status="connected",
            host=conn_info.get("host", "cloud-postgres"),
            database=conn_info.get("database", "postgres"),
            user=conn_info.get("user", "postgres"),
            tables_count=len(table_infos),
            schema_sql=schema_sql,
            tables=table_infos,
            message=f"Successfully connected to {conn_info.get('host')} and introspected {len(table_infos)} tables."
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Database connection or introspection failed: {str(e)}")


@router.post("/execute", response_model=ExecuteQueryResponse)
def execute_query(request: ExecuteQueryRequest):
    """
    Safely executes a read-only SELECT query against the connected cloud PostgreSQL database.
    """
    try:
        result = execute_read_only_query(
            connection_uri=request.connection_uri.strip(),
            sql_query=request.sql_query.strip(),
            limit=request.limit or 50
        )
        return ExecuteQueryResponse(
            status="success",
            columns=result.get("columns", []),
            rows=result.get("rows", []),
            row_count=result.get("row_count", 0)
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Execution error: {str(e)}")
