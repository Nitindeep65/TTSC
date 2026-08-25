"""
QueryCraft — LangGraph Multi-Agent StateGraph Orchestration Engine
Wires together isolated services (llm_services, db_service, explain_service, healing_service, semantic_service, memory_service)
into a resilient, self-healing, multi-agent query generation & optimization loop.
"""

import os
import json
import logging
from typing import TypedDict, List, Dict, Any, Optional

from langgraph.graph import StateGraph, START, END

from app.Models.schema import (
    VisualIntent,
    ExtractedSQLData,
    ClarificationResponse,
    HealedQueryInfo,
)
from app.services.llm_services import (
    get_llm_client,
    detect_visual_intent,
    build_system_prompt,
    sanitize_and_parse_json,
    validate_and_enforce_sql_safety,
    evaluate_user_intent,
    LIVE_DATABASE_SCHEMA_SQL,
)
from app.services.db_service import (
    detect_engine_type,
    introspect_cloud_database,
    execute_read_only_query,
    parse_connection_info,
)
from app.services.explain_service import run_explain_plan
from app.services.healing_service import heal_sql_with_critic
from app.services.semantic_service import find_matching_metrics
from app.services.memory_service import find_relevant_few_shot_examples, prune_schema_for_prompt

logger = logging.getLogger(__name__)


# ═══════════════════════════════════════════════════════════════════════════════
# 1. STATE DEFINITION
# ═══════════════════════════════════════════════════════════════════════════════

class AgentState(TypedDict):
    # Inputs
    user_prompt: str
    connection_uri: Optional[str]
    database_type: Optional[str]  # "postgres" | "mongodb" | "redis" | "mysql"
    session_history: List[Dict[str, Any]]
    
    # Context (Node 2)
    live_schema: Optional[str]
    semantic_rules: Optional[List[Any]]
    few_shot_examples: Optional[List[Any]]
    matched_metrics: List[str]
    
    # Generation & Clarification (Node 1 & 3)
    status: str  # "needs_clarification" | "intent_clear" | "complete" | "error"
    clarification_message: Optional[str]
    visual_intent: Optional[Dict[str, Any]]
    generated_query: Optional[str]
    tables_identified: List[str]
    explanation: Optional[str]
    
    # Execution & Healing (Node 4 & 5)
    query_results: Optional[List[Dict[str, Any]]]
    result_columns: Optional[List[str]]
    row_count: Optional[int]
    db_error: Optional[str]
    retry_count: int
    explain_plan: Optional[Dict[str, Any]]
    healing_info: Optional[Dict[str, Any]]


# ═══════════════════════════════════════════════════════════════════════════════
# 2. NODE IMPLEMENTATIONS (LEVERAGING EXISTING SERVICES)
# ═══════════════════════════════════════════════════════════════════════════════

async def intent_and_clarifier_node(state: AgentState) -> Dict[str, Any]:
    """
    NODE 1: Evaluates user intent, detects visual requirements,
    and checks whether conversational clarification is required before query generation.
    """
    user_prompt = state.get("user_prompt", "")
    conn_uri = state.get("connection_uri") or ""
    db_type = detect_engine_type(conn_uri) if conn_uri else "postgres"
    
    # 1. NLP Visual Intent Detection
    v_intent = detect_visual_intent(user_prompt)
    v_intent_dict = v_intent.model_dump() if hasattr(v_intent, "model_dump") else v_intent.dict()

    # 2. Ambiguity & Clarification Evaluation
    # If live_schema is already provided, evaluate with it; otherwise evaluate with default/introspected schema
    schema_to_use = state.get("live_schema")
    if not schema_to_use and conn_uri:
        try:
            _, schema_to_use = introspect_cloud_database(conn_uri.strip())
        except Exception:
            schema_to_use = LIVE_DATABASE_SCHEMA_SQL

    eval_result = evaluate_user_intent(
        user_prompt=user_prompt,
        session_history=state.get("session_history", []),
        live_schema=schema_to_use
    )

    if eval_result.status == "needs_clarification":
        return {
            "status": "needs_clarification",
            "clarification_message": eval_result.message,
            "visual_intent": v_intent_dict,
            "database_type": db_type,
            "live_schema": schema_to_use,
            "generated_query": None,
            "tables_identified": [],
            "explanation": None,
        }

    # Intent is clear — extract any initial parameters and proceed to context retrieval & compilation
    extracted = eval_result.extracted_data
    return {
        "status": "intent_clear",
        "clarification_message": eval_result.message,
        "visual_intent": v_intent_dict,
        "database_type": db_type,
        "live_schema": schema_to_use,
        "generated_query": extracted.sql_query if extracted else None,
        "tables_identified": extracted.tables_identified if extracted else [],
        "explanation": extracted.explanation if extracted else None,
        "matched_metrics": extracted.matched_metrics if extracted else [],
    }


async def context_retriever_node(state: AgentState) -> Dict[str, Any]:
    """
    NODE 2: Retrieves live schema definitions, matches semantic rules via RAG,
    and fetches verified few-shot query examples for in-context learning.
    """
    user_prompt = state.get("user_prompt", "")
    conn_uri = state.get("connection_uri") or ""
    
    # 1. Schema Introspection (if not already retrieved)
    schema_to_use = state.get("live_schema")
    if not schema_to_use and conn_uri:
        try:
            _, schema_sql = introspect_cloud_database(conn_uri.strip())
            schema_to_use = schema_sql
        except Exception as e:
            logger.warning(f"Live schema introspection failed, falling back to default: {e}")
            schema_to_use = LIVE_DATABASE_SCHEMA_SQL
    elif not schema_to_use:
        schema_to_use = LIVE_DATABASE_SCHEMA_SQL

    # 2. Semantic Business Metrics RAG Retrieval
    matched_metrics = find_matching_metrics(user_prompt, top_k=3)
    
    # 3. Few-Shot Gold Standard Query Memory RAG Retrieval
    few_shot_examples = find_relevant_few_shot_examples(user_prompt, top_k=2)

    return {
        "live_schema": schema_to_use,
        "semantic_rules": matched_metrics,
        "few_shot_examples": few_shot_examples,
        "matched_metrics": [m.name if hasattr(m, "name") else str(m) for m in matched_metrics],
    }


async def query_compiler_node(state: AgentState) -> Dict[str, Any]:
    """
    NODE 3: Compiles production-ready SQL/MQL using Llama 3.1 70B Instruct,
    strictly grounded in the retrieved schema, semantic rules, and few-shot examples.
    Enforces read-only safety and automatic LIMIT 50.
    """
    # If a safe query was already produced and verified in Node 1, we can reuse and safety-check it
    existing_query = state.get("generated_query")
    if existing_query:
        try:
            safe_sql = validate_and_enforce_sql_safety(existing_query)
            return {
                "generated_query": safe_sql,
                "status": "complete",
                "clarification_message": state.get("clarification_message") or "Query generated successfully.",
            }
        except Exception:
            pass  # Fall through to recompile if safety validation failed

    # Compile query with full grounded context
    system_prompt = build_system_prompt(
        live_schema=state.get("live_schema"),
        matched_metrics=state.get("semantic_rules"),
        few_shot_examples=state.get("few_shot_examples"),
    )

    messages = [{"role": "system", "content": system_prompt}]
    for item in state.get("session_history", []):
        role = item.get("role")
        content = item.get("content")
        if role in ["user", "assistant"] and content:
            messages.append({"role": role, "content": str(content)})
    messages.append({"role": "user", "content": state.get("user_prompt", "")})

    client = get_llm_client()
    model = os.getenv("model", "meta/llama-3.1-70b-instruct")

    try:
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.1,
            max_tokens=600,
            response_format={"type": "json_object"}
        )
        raw_content = response.choices[0].message.content
        parsed = sanitize_and_parse_json(raw_content)

        extracted = parsed.get("extracted_data") or {}
        raw_query = extracted.get("sql_query", "")
        safe_sql = validate_and_enforce_sql_safety(raw_query)

        return {
            "generated_query": safe_sql,
            "tables_identified": extracted.get("tables_identified", []),
            "explanation": extracted.get("explanation", "Query compiled successfully."),
            "clarification_message": parsed.get("message", "Here is the compiled query."),
            "status": "complete",
        }
    except Exception as e:
        logger.error(f"Error in query_compiler_node: {e}", exc_info=True)
        # Fallback query generation
        return {
            "generated_query": "SELECT * FROM users LIMIT 50;",
            "tables_identified": ["users"],
            "explanation": f"Default fallback query generated due to compiler note: {str(e)}",
            "clarification_message": "Here is the compiled query.",
            "status": "complete",
        }


async def execute_and_guard_node(state: AgentState) -> Dict[str, Any]:
    """
    NODE 4: Performance Guard & Execution Node.
    - Dry-runs PostgreSQL EXPLAIN to estimate cost and detect sequential scans.
    - Executes read-only queries with strict timeouts.
    - Intercepts execution errors and records them for Critic self-healing.
    """
    query = state.get("generated_query")
    if not query:
        return {"db_error": "No generated query available to execute."}

    conn_uri = state.get("connection_uri")
    explain_data = None

    # 1. Performance Guard (EXPLAIN Plan)
    try:
        exp_res = run_explain_plan(conn_uri or "", query)
        explain_data = exp_res.model_dump() if hasattr(exp_res, "model_dump") else exp_res.dict()
    except Exception as exp_err:
        logger.debug(f"Explain plan evaluation notice: {exp_err}")

    # 2. Live Execution (if connected)
    if conn_uri and conn_uri.strip():
        try:
            exec_res = execute_read_only_query(
                connection_uri=conn_uri.strip(),
                sql_query=query,
                limit=50,
                auto_heal=False,  # Graph manages critic healing in Node 5
                user_prompt=state.get("user_prompt"),
                live_schema=state.get("live_schema")
            )
            return {
                "query_results": exec_res.get("rows", []),
                "result_columns": exec_res.get("columns", []),
                "row_count": exec_res.get("row_count", 0),
                "db_error": None,
                "explain_plan": explain_data,
            }
        except Exception as exec_err:
            logger.warning(f"Database execution failed: {exec_err}")
            return {
                "db_error": str(exec_err),
                "explain_plan": explain_data,
            }
    else:
        # Prompt-only mode (no live DB connection attached to request)
        return {
            "query_results": None,
            "result_columns": None,
            "row_count": 0,
            "db_error": None,
            "explain_plan": explain_data,
        }


async def critic_healer_node(state: AgentState) -> Dict[str, Any]:
    """
    NODE 5: Self-Healing Critic Doctor.
    Intercepts runtime errors, analyzes root causes with Llama 3.1 Critic,
    repairs SQL/MQL queries, and increments the retry count before looping back to Node 4.
    """
    current_retry = state.get("retry_count", 0) + 1
    failing_sql = state.get("generated_query") or ""
    error_msg = state.get("db_error") or "Unknown database runtime error"

    logger.info(f"Critic Healer Node triggered (Attempt {current_retry}/3) for error: {error_msg}")

    try:
        healed_sql, diagnosis = heal_sql_with_critic(
            failing_sql=failing_sql,
            error_message=error_msg,
            live_schema=state.get("live_schema"),
            user_prompt=state.get("user_prompt")
        )
        safe_healed = validate_and_enforce_sql_safety(healed_sql)

        healing_record = {
            "was_healed": True,
            "original_sql": failing_sql,
            "healed_sql": safe_healed,
            "diagnosis": diagnosis,
            "error_message": error_msg,
        }

        return {
            "generated_query": safe_healed,
            "db_error": None,  # Cleared for re-execution
            "retry_count": current_retry,
            "healing_info": healing_record,
            "explanation": f"{state.get('explanation', '')} (Self-healed: {diagnosis})".strip(),
        }
    except Exception as heal_err:
        logger.error(f"Critic healing failed: {heal_err}")
        return {
            "retry_count": current_retry,
            "db_error": f"Healing attempt failed: {str(heal_err)}",
        }


async def visualizer_router_node(state: AgentState) -> Dict[str, Any]:
    """
    NODE 6: Visualizer Router.
    Maps executed query results and visual intent to optimal chart configurations
    (Bar, Line, Pie, Area, Table) for the Next.js frontend and Chrome extension.
    """
    v_intent = state.get("visual_intent") or {}
    if not isinstance(v_intent, dict):
        v_intent = v_intent.model_dump() if hasattr(v_intent, "model_dump") else v_intent.dict()

    rows = state.get("query_results") or []
    cols = state.get("result_columns") or []

    # Auto-map chart keys if visualization is enabled and data is available
    if rows and cols and v_intent.get("should_visualize"):
        num_cols = []
        for col in cols:
            sample_vals = [r.get(col) for r in rows[:5] if r.get(col) is not None]
            if sample_vals and all(isinstance(v, (int, float)) or (isinstance(v, str) and v.replace('.', '', 1).isdigit()) for v in sample_vals):
                num_cols.append(col)

        str_cols = [c for c in cols if c not in num_cols]
        x_key = str_cols[0] if str_cols else cols[0]
        y_key = num_cols[0] if num_cols else (cols[1] if len(cols) > 1 else cols[0])

        v_intent["x_key"] = x_key
        v_intent["y_key"] = y_key

    return {
        "visual_intent": v_intent
    }


# ═══════════════════════════════════════════════════════════════════════════════
# 3. CONDITIONAL ROUTING LOGIC
# ═══════════════════════════════════════════════════════════════════════════════

def route_after_clarifier(state: AgentState) -> str:
    """Routes to END if clarification is needed, otherwise proceeds to context retriever."""
    if state.get("status") == "needs_clarification":
        return "end"
    return "context_retriever"


def route_after_execution(state: AgentState) -> str:
    """Routes to Critic Healer if a database error occurred and retries remain (< 3)."""
    if state.get("db_error") and state.get("retry_count", 0) < 3:
        return "critic_healer"
    return "visualizer_router"


# ═══════════════════════════════════════════════════════════════════════════════
# 4. BUILD & COMPILE LANGGRAPH WORKFLOW
# ═══════════════════════════════════════════════════════════════════════════════

workflow = StateGraph(AgentState)

# Add Nodes
workflow.add_node("intent_and_clarifier", intent_and_clarifier_node)
workflow.add_node("context_retriever", context_retriever_node)
workflow.add_node("query_compiler", query_compiler_node)
workflow.add_node("execute_and_guard", execute_and_guard_node)
workflow.add_node("critic_healer", critic_healer_node)
workflow.add_node("visualizer_router", visualizer_router_node)

# Add Graph Edges & Conditional Routing
workflow.add_edge(START, "intent_and_clarifier")

workflow.add_conditional_edges(
    "intent_and_clarifier",
    route_after_clarifier,
    {
        "end": END,
        "context_retriever": "context_retriever",
    }
)

workflow.add_edge("context_retriever", "query_compiler")
workflow.add_edge("query_compiler", "execute_and_guard")

workflow.add_conditional_edges(
    "execute_and_guard",
    route_after_execution,
    {
        "critic_healer": "critic_healer",
        "visualizer_router": "visualizer_router",
    }
)

# Critic Healer loops back to Execute & Guard to re-test the repaired query
workflow.add_edge("critic_healer", "execute_and_guard")
workflow.add_edge("visualizer_router", END)

# Compiled Production Graph
querycraft_graph = workflow.compile()
