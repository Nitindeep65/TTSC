from fastapi import APIRouter, HTTPException
from app.Models.schema import (
    DBConnectRequest,
    DBConnectResponse,
    ExecuteQueryRequest,
    ExecuteQueryResponse,
    ExplainPlanRequest,
    ExplainPlanResponse,
    TableSampleRequest,
    TableSampleResponse,
    DiagnoseErrorRequest,
    DiagnoseErrorResponse,
)
from app.services.db_service import (
    test_db_connection,
    introspect_cloud_database,
    execute_read_only_query,
    parse_connection_info,
    sample_table_data,
)
from app.services.explain_service import run_explain_plan
from app.services.healing_service import diagnose_and_heal_error

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
    Persists connection to workspaces.json so MCP tools have immediate access.
    """
    uri = request.connection_uri.strip()
    try:
        table_infos, schema_sql = introspect_cloud_database(uri)
        conn_info = parse_connection_info(uri)

        # Automatically sync with workspaces.json
        try:
            import json
            import os
            workspaces_path = os.path.join(os.path.dirname(__file__), "..", "data", "workspaces.json")
            if os.path.exists(workspaces_path):
                with open(workspaces_path, "r") as f:
                    ws_list = json.load(f)
                if isinstance(ws_list, list) and len(ws_list) > 0:
                    ws_list[0]["connectionUri"] = uri
                    ws_list[0]["engine"] = conn_info.get("engine", "postgres")
                    with open(workspaces_path, "w") as f:
                        json.dump(ws_list, f, indent=2)
        except Exception as e:
            logger.warning(f"Could not persist workspace connection: {e}")

        return DBConnectResponse(
            status="connected",
            host=conn_info.get("host", "cloud-postgres"),
            database=conn_info.get("database", "postgres"),
            user=conn_info.get("user", "postgres"),
            tables_count=len(table_infos),
            schema_sql=schema_sql,
            tables=table_infos,
            message=f"Successfully connected to {conn_info.get('host')} and introspected {len(table_infos)} schemas/collections."
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Database connection or introspection failed: {str(e)}")


@router.post("/execute", response_model=ExecuteQueryResponse)
def execute_query(request: ExecuteQueryRequest):
    """
    Safely executes a read-only SELECT query against the connected cloud PostgreSQL database.
    Automatically self-heals failing queries if auto_heal=True.
    """
    try:
        result = execute_read_only_query(
            connection_uri=request.connection_uri.strip(),
            sql_query=request.sql_query.strip(),
            limit=request.limit or 50,
            auto_heal=request.auto_heal if request.auto_heal is not None else True,
            user_prompt=request.user_prompt,
            live_schema=request.live_schema
        )
        return ExecuteQueryResponse(
            status="success",
            columns=result.get("columns", []),
            rows=result.get("rows", []),
            row_count=result.get("row_count", 0),
            healing_info=result.get("healing_info")
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Execution error: {str(e)}")


@router.post("/explain", response_model=ExplainPlanResponse)
def explain_query(request: ExplainPlanRequest):
    """
    Executes PostgreSQL EXPLAIN (FORMAT JSON, COSTS TRUE) in a dry-run transaction
    to estimate execution cost, scan types, and recommend indexes.
    """
    try:
        result = run_explain_plan(
            connection_uri=request.connection_uri.strip(),
            sql_query=request.sql_query.strip()
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Explain plan evaluation failed: {str(e)}")


@router.post("/sample", response_model=TableSampleResponse)
def get_table_sample(request: TableSampleRequest):
    """
    Profiles a table and returns 5 sample records and categorical value distributions.
    """
    try:
        result = sample_table_data(
            connection_uri=request.connection_uri,
            table_name=request.table_name,
            limit=request.limit or 5
        )
        return TableSampleResponse(
            status="success",
            table_name=result.get("table_name", request.table_name),
            columns=result.get("columns", []),
            rows=result.get("rows", []),
            column_profiles=result.get("column_profiles", []),
            row_count=result.get("row_count", 0),
            message=result.get("message")
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Table sampling error: {str(e)}")


@router.post("/diagnose", response_model=DiagnoseErrorResponse)
def diagnose_error(request: DiagnoseErrorRequest):
    """
    SQL Doctor: Evaluates a PostgreSQL error message and/or failing query,
    diagnoses root causes, and returns a verified healed SQL statement.
    """
    try:
        schema_to_use = request.live_schema
        if not schema_to_use and request.connection_uri:
            try:
                _, schema_sql = introspect_cloud_database(request.connection_uri.strip())
                schema_to_use = schema_sql
            except Exception:
                pass

        result = diagnose_and_heal_error(
            error_message=request.error_message.strip(),
            failing_sql=request.failing_sql.strip() if request.failing_sql else None,
            live_schema=schema_to_use,
            user_prompt=request.user_prompt
        )
        return DiagnoseErrorResponse(
            status=result.get("status", "success"),
            error_code=result.get("error_code"),
            root_cause=result.get("root_cause", "Database error diagnosed."),
            healed_sql=result.get("healed_sql"),
            affected_entities=result.get("affected_entities", []),
            explanation=result.get("explanation", "")
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"SQL Doctor diagnosis failed: {str(e)}")

