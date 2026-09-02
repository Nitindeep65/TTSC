"""
Tests for Dashboard Architect & Multi-Agent Sub-Graph Orchestration.
Verifies planner decomposition, parallel worker execution, mock sandbox fallback, and FastAPI endpoints.
"""

import pytest
from unittest.mock import patch, MagicMock
from app.Models.schema import (
    DashboardPlan,
    DashboardWidgetPlan,
    DashboardWidgetResult,
)
from app.services.dashboard_service import (
    plan_dashboard_widgets,
    get_fallback_dashboard_plan,
    execute_dashboard_worker,
    assemble_dashboard_canvas,
    orchestrate_dashboard_generation,
    get_dashboard_templates,
)

def test_get_fallback_dashboard_plan_saas():
    plan = get_fallback_dashboard_plan("Build me a SaaS Executive Dashboard with MRR and Churn")
    assert plan.theme == "executive"
    assert len(plan.widgets) == 4
    assert any("mrr" in w.id.lower() or "revenue" in w.id.lower() for w in plan.widgets)
    assert any(w.recommended_chart == "pie" for w in plan.widgets)

def test_get_fallback_dashboard_plan_ecommerce():
    plan = get_fallback_dashboard_plan("Create an e-commerce order volume dashboard")
    assert plan.theme == "ecommerce"
    assert len(plan.widgets) == 4
    assert any(w.recommended_chart == "line" for w in plan.widgets)

def test_get_dashboard_templates():
    templates = get_dashboard_templates()
    assert len(templates) >= 4
    assert any(t.id == "saas_executive" for t in templates)
    assert any(t.id == "ecommerce_growth" for t in templates)

@pytest.mark.asyncio
async def test_plan_dashboard_widgets_fallback_on_error():
    with patch("app.services.dashboard_service.get_llm_client") as mock_get_client:
        mock_client = MagicMock()
        mock_client.chat.completions.create.side_effect = Exception("LLM provider timeout")
        mock_get_client.return_value = mock_client

        plan = await plan_dashboard_widgets("Build me a SaaS Executive Dashboard")
        assert plan is not None
        assert len(plan.widgets) == 4
        assert "SaaS" in plan.dashboard_title

@pytest.mark.asyncio
async def test_execute_dashboard_worker_sandbox_mode():
    widget = DashboardWidgetPlan(
        id="net_mrr_trend",
        title="Net MRR Velocity",
        prompt="Calculate monthly net revenue",
        recommended_chart="line",
        grid_span=2,
    )
    result = await execute_dashboard_worker(widget, connection_uri=None)
    assert isinstance(result, DashboardWidgetResult)
    assert result.id == "net_mrr_trend"
    assert len(result.rows) > 0
    assert len(result.columns) > 0
    assert result.kpi_value is not None
    assert result.sql_query is not None
    assert "LIMIT 50" in result.sql_query

def test_assemble_dashboard_canvas():
    plan = DashboardPlan(
        theme="executive",
        dashboard_title="Test Executive Dashboard",
        summary="Test summary narrative.",
        widgets=[]
    )
    widget_res = [
        DashboardWidgetResult(
            id="w1",
            title="Total Revenue",
            prompt="SELECT SUM(total_amount) FROM orders;",
            sql_query="SELECT SUM(total_amount) FROM orders LIMIT 50;",
            explanation="Sum of orders",
            recommended_chart="line",
            kpi_value="$78.9K",
            columns=["month", "gross_revenue"],
            rows=[{"month": "Oct 2024", "gross_revenue": 78900}],
            row_count=1,
        )
    ]
    canvas = assemble_dashboard_canvas(plan, widget_res, total_time_ms=150)
    assert canvas.status == "complete"
    assert canvas.dashboard_title == "Test Executive Dashboard"
    assert "$78.9K" in canvas.executive_summary
    assert canvas.total_widgets == 1

@pytest.mark.asyncio
async def test_orchestrate_dashboard_generation_end_to_end():
    canvas = await orchestrate_dashboard_generation(
        user_prompt="Build me an Executive Operations Dashboard",
        connection_uri=None,
    )
    assert canvas.status == "complete"
    assert canvas.total_widgets == 4
    assert len(canvas.widgets) == 4
    for w in canvas.widgets:
        assert w.sql_query is not None
        assert len(w.rows) > 0
        assert len(w.columns) > 0

@pytest.mark.skip(reason="MVP: Dashboard router disabled \u2014 /api/dashboard/* returns 404 intentionally. Re-enable when BI Canvas feature is restored.")
def test_api_dashboard_templates_endpoint(client):
    response = client.get("/api/dashboard/templates")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["templates"]) >= 4

@pytest.mark.skip(reason="MVP: Dashboard router disabled \u2014 /api/dashboard/* returns 404 intentionally. Re-enable when BI Canvas feature is restored.")
def test_api_dashboard_generate_endpoint(client):
    payload = {
        "user_prompt": "Build me a SaaS Executive Dashboard for Q3",
    }
    response = client.post("/api/dashboard/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "complete"
    assert data["total_widgets"] == 4
    assert len(data["widgets"]) == 4
    assert "executive_summary" in data

@pytest.mark.skip(reason="MVP: Dashboard router disabled \u2014 /api/dashboard/* returns 404 intentionally. Re-enable when BI Canvas feature is restored.")
def test_api_dashboard_generate_validation_error(client):
    response = client.post("/api/dashboard/generate", json={"user_prompt": ""})
    assert response.status_code == 400
