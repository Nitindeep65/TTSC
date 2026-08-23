from fastapi import APIRouter
from app.Models.schema import ClarificationRequest, ClarificationResponse, SchemaInfoResponse
from app.services.llm_services import evaluate_user_intent, get_schema_info

router = APIRouter(
    prefix="/api/clarification",
    tags=["Clarification & Query Engine"]
)

@router.post("/", response_model=ClarificationResponse)
def run_clarification(request: ClarificationRequest):
    """
    Evaluates user prompt and session history against the cloud PostgreSQL schema,
    clarifies ambiguities or generates production-ready SQL.
    """
    schema_to_use = request.live_schema
    if not schema_to_use and request.connection_uri:
        try:
            from app.services.db_service import introspect_cloud_database
            _, schema_sql = introspect_cloud_database(request.connection_uri.strip())
            schema_to_use = schema_sql
        except Exception:
            pass

    ai_response = evaluate_user_intent(
        user_prompt=request.user_prompt,
        session_history=request.session_history,
        live_schema=schema_to_use
    )
    return ai_response

@router.get("/schema", response_model=SchemaInfoResponse)
def get_live_schema():
    """
    Returns the live Cloud PostgreSQL database schema, tables, column types, and constraints.
    """
    return get_schema_info()