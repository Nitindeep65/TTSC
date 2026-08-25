from fastapi import APIRouter
from app.Models.schema import (
    ClarificationRequest,
    ClarificationResponse,
    SchemaInfoResponse,
    ExtractedSQLData,
    VisualIntent,
)
from app.services.llm_services import get_schema_info
from app.services.sql_graph import querycraft_graph

router = APIRouter(
    prefix="/api/clarification",
    tags=["Clarification & Query Engine"]
)

@router.post("/", response_model=ClarificationResponse)
async def run_clarification(request: ClarificationRequest):
    """
    Evaluates user prompt and session history against the cloud database schema
    via the LangGraph multi-agent StateGraph workflow.
    """
    conn_uri = request.connection_uri or request.db_uri
    initial_state = {
        "user_prompt": request.user_prompt,
        "connection_uri": conn_uri,
        "database_type": None,
        "session_history": request.session_history or [],
        "live_schema": request.live_schema,
        "semantic_rules": None,
        "few_shot_examples": None,
        "matched_metrics": [],
        "status": "needs_clarification",
        "clarification_message": None,
        "visual_intent": None,
        "generated_query": None,
        "tables_identified": [],
        "explanation": None,
        "query_results": None,
        "result_columns": None,
        "row_count": 0,
        "db_error": None,
        "retry_count": 0,
        "explain_plan": None,
        "healing_info": None,
    }

    final_state = await querycraft_graph.ainvoke(initial_state)

    status = final_state.get("status", "needs_clarification")
    if status not in ["complete", "needs_clarification"]:
        status = "complete" if final_state.get("generated_query") else "needs_clarification"

    msg = (
        final_state.get("clarification_message")
        or final_state.get("explanation")
        or ("Could you please clarify your request?" if status == "needs_clarification" else "Query generated successfully.")
    )

    v_intent_raw = final_state.get("visual_intent")
    v_intent = None
    if v_intent_raw:
        if isinstance(v_intent_raw, dict):
            v_intent = VisualIntent(**v_intent_raw)
        elif isinstance(v_intent_raw, VisualIntent):
            v_intent = v_intent_raw

    extracted_data = None
    if status == "complete" and final_state.get("generated_query"):
        extracted_data = ExtractedSQLData(
            sql_query=final_state["generated_query"],
            tables_identified=final_state.get("tables_identified", []),
            explanation=final_state.get("explanation") or "Production-ready query compiled.",
            visual_intent=v_intent,
            matched_metrics=final_state.get("matched_metrics", [])
        )

    return ClarificationResponse(
        status=status,
        message=msg,
        extracted_data=extracted_data,
        visual_intent=v_intent
    )

@router.get("/schema", response_model=SchemaInfoResponse)
def get_live_schema():
    """
    Returns the live Cloud PostgreSQL database schema, tables, column types, and constraints.
    """
    return get_schema_info()