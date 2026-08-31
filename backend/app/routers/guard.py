"""
QueryCraft FastAPI Router — /api/v1/guard
Pre-Flight Cost Guard (The AI Firewall)
"""

import os
from typing import Optional, Dict, Any, Literal
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.services.cost_guard_graph import (
    cost_guard_app,
    GuardState,
    CostMetrics,
)

router = APIRouter(prefix="/api/v1", tags=["Reliability Guard"])

DEFAULT_POSTGRES_URI = os.getenv(
    "LOCAL_DATABASE_URL", 
    "postgresql://postgres:postgres@localhost:5432/postgres"
)


class GuardRequest(BaseModel):
    sql_query: str = Field(..., min_length=6, description="Raw SQL query to inspect and guard")
    connection_uri: Optional[str] = Field(
        default=None, 
        description="Optional target PostgreSQL URI. Defaults to local cluster."
    )
    cost_threshold: Optional[float] = Field(
        default=150.0, 
        ge=10.0, 
        description="Maximum permissible cost before triggering AI healing"
    )


class CostComparison(BaseModel):
    initial_cost: float
    final_cost: float
    cost_reduction_pct: float
    initial_has_seq_scan: bool
    final_has_seq_scan: bool
    initial_rows: int
    final_rows: int


class GuardResponse(BaseModel):
    status: Literal["safe", "healed", "unsafe_threshold_exceeded", "blocked_needs_index"]
    original_query: str
    optimized_query: str
    is_safe: bool
    explanation: str
    action_type: str = Field(default="verified", description="'rewritten', 'blocked_needs_index', or 'verified'")
    suggested_index: Optional[str] = None
    cost_comparison: CostComparison
    initial_metrics: CostMetrics
    final_metrics: CostMetrics
    iterations_run: int
    explain_plan: Optional[Dict[str, Any]] = None


@router.post(
    "/guard",
    response_model=GuardResponse,
    status_code=status.HTTP_200_OK,
    summary="Evaluate SQL against PostgreSQL EXPLAIN plan and auto-heal bottlenecks",
)
async def pre_flight_cost_guard(payload: GuardRequest):
    raw_sql = payload.sql_query.strip()
    
    # Validation: Pre-flight cost guard operates strictly on analytical read-only queries
    if not raw_sql.lower().startswith(("select", "with")):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="The Cost Guard only accepts analytical read-only statements (SELECT / WITH).",
        )

    target_uri = payload.connection_uri or DEFAULT_POSTGRES_URI

    # Instantiate LangGraph State
    initial_state = GuardState(
        original_query=raw_sql,
        current_query=raw_sql,
        connection_uri=target_uri,
        cost_threshold=payload.cost_threshold or 150.0,
        max_iterations=2,
    )

    try:
        final_state_dict = cost_guard_app.invoke(initial_state)
        final_state = GuardState(**final_state_dict)

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"LangGraph Cost Guard execution error: {str(exc)}",
        )

    init_m = final_state.initial_metrics or final_state.cost_metrics
    final_m = final_state.cost_metrics

    # Compute cost difference
    cost_reduction = 0.0
    if init_m.total_cost > 0:
        cost_reduction = round(
            max(0.0, ((init_m.total_cost - final_m.total_cost) / init_m.total_cost) * 100),
            1,
        )

    comparison = CostComparison(
        initial_cost=init_m.total_cost,
        final_cost=final_m.total_cost,
        cost_reduction_pct=cost_reduction,
        initial_has_seq_scan=init_m.has_seq_scan,
        final_has_seq_scan=final_m.has_seq_scan,
        initial_rows=init_m.plan_rows,
        final_rows=final_m.plan_rows,
    )

    if final_state.action_type == "blocked_needs_index":
        guard_status = "blocked_needs_index"
    elif final_state.is_safe and final_state.iteration > 0:
        guard_status = "healed"
    elif final_state.is_safe:
        guard_status = "safe"
    else:
        guard_status = "unsafe_threshold_exceeded"

    return GuardResponse(
        status=guard_status,
        original_query=final_state.original_query,
        optimized_query=final_state.current_query,
        is_safe=final_state.is_safe and final_state.action_type != "blocked_needs_index",
        explanation=final_state.explanation,
        action_type=final_state.action_type,
        suggested_index=final_state.suggested_index,
        cost_comparison=comparison,
        initial_metrics=init_m,
        final_metrics=final_m,
        iterations_run=final_state.iteration,
        explain_plan=final_state.explain_plan,
    )
