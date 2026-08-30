"""
QueryCraft — Dashboard Architect API Router
Exposes multi-agent supervisor dashboard generation and starter templates.
"""

from fastapi import APIRouter, HTTPException
from app.Models.schema import (
    DashboardGenerateRequest,
    DashboardCanvasResponse,
    DashboardTemplatesResponse,
)
from app.services.dashboard_service import (
    orchestrate_dashboard_generation,
    get_dashboard_templates,
)

router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard Architect & Multi-Agent Engine"]
)

@router.post("/generate", response_model=DashboardCanvasResponse)
async def generate_dashboard(request: DashboardGenerateRequest):
    """
    Supervisor Agent Multi-Step Workflow:
    1. Evaluates user prompt & grounded schema.
    2. Decomposes prompt into 4 complementary analytical widgets (Planner Node).
    3. Concurrently compiles SQL, validates read-only limits, and executes with parallel workers.
    4. Automatically heals query failures with Critic Doctor.
    5. Assembles unified dashboard canvas with executive takeaways.
    """
    if not request.user_prompt or not request.user_prompt.strip():
        raise HTTPException(status_code=400, detail="Dashboard prompt cannot be empty.")

    conn_uri = request.connection_uri or request.db_uri
    try:
        canvas = await orchestrate_dashboard_generation(
            user_prompt=request.user_prompt.strip(),
            connection_uri=conn_uri,
            live_schema=request.live_schema,
        )
        return canvas
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate dashboard canvas: {str(e)}")

@router.get("/templates", response_model=DashboardTemplatesResponse)
def list_dashboard_templates():
    """
    Returns pre-curated dashboard starter templates for SaaS, E-Commerce, and Operations.
    """
    templates = get_dashboard_templates()
    return DashboardTemplatesResponse(
        status="success",
        templates=templates,
    )
