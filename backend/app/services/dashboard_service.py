"""
QueryCraft — Dashboard Architect (Multi-Agent Sub-Graph Service)
Implements the Supervisor Agent pattern in LangGraph / Python:
1. Supervisor Planner Agent: Decomposes natural language requests into 3-5 cohesive widget sub-tasks.
2. Parallel Worker Agents: Compiles grounded SQL, enforces read-only safety, and executes concurrently via asyncio.
3. Critic Doctor: Automatically heals failing widget queries.
4. Canvas Assembler: Synthesizes execution results, extracts KPI hero cards, and drafts an executive summary.
"""

import os
import time
import json
import logging
import asyncio
from datetime import datetime
from typing import List, Dict, Any, Optional

from app.Models.schema import (
    DashboardPlan,
    DashboardWidgetPlan,
    DashboardWidgetResult,
    DashboardCanvasResponse,
    DashboardTemplate,
)
from app.services.llm_services import (
    get_llm_client,
    sanitize_and_parse_json,
    validate_and_enforce_sql_safety,
    LIVE_DATABASE_SCHEMA_SQL,
)
from app.services.db_service import (
    introspect_cloud_database,
    execute_read_only_query,
)
from app.services.healing_service import heal_sql_with_critic
from app.services.semantic_service import find_matching_metrics

logger = logging.getLogger(__name__)

# Predefined templates for instant 1-click exploration
DEFAULT_TEMPLATES: List[DashboardTemplate] = [
    DashboardTemplate(
        id="saas_executive",
        title="SaaS Executive Overview",
        badge="Executive",
        description="Core MRR trends, active churn rates, top enterprise cohorts, and plan distribution.",
        prompt="Build me an Executive SaaS Performance Dashboard tracking Net MRR, Churn Rate, Top Accounts, and Subscription Tier distribution.",
        icon="TrendingUp",
        tags=["SaaS", "MRR", "Churn", "Finance"],
    ),
    DashboardTemplate(
        id="ecommerce_growth",
        title="E-Commerce & Orders",
        badge="Operations",
        description="Daily sales volume, order status breakdown, customer spend tiers, and revenue velocity.",
        prompt="Create an E-Commerce Operations Dashboard with total revenue trends, order status breakdown, top customers by spend, and payment method distribution.",
        icon="ShoppingBag",
        tags=["E-Commerce", "Revenue", "Orders"],
    ),
    DashboardTemplate(
        id="customer_retention",
        title="Customer Retention & Cohorts",
        badge="Growth",
        description="User registration velocity, order frequency cohorts, customer lifetime spend, and active status.",
        prompt="Generate a Customer Retention Dashboard showing new user signups over time, customer status distribution, top 10 most loyal buyers, and average spend.",
        icon="Users",
        tags=["Customers", "Retention", "Cohorts"],
    ),
    DashboardTemplate(
        id="catalog_inventory",
        title="Product & Catalog Health",
        badge="Inventory",
        description="Inventory stock levels, low-stock alerts, category price distributions, and catalog availability.",
        prompt="Build a Product Catalog & Inventory Health Dashboard showing low stock warnings, stock quantity by category, and price distribution.",
        icon="Layers",
        tags=["Catalog", "Stock", "Products"],
    ),
]


# Default Fallback Plans when LLM is offline or unreachable
def get_fallback_dashboard_plan(user_prompt: str) -> DashboardPlan:
    p = user_prompt.lower()
    if "saas" in p or "mrr" in p or "churn" in p:
        return DashboardPlan(
            theme="executive",
            dashboard_title="SaaS Executive Performance Dashboard",
            summary="Autonomous multi-agent synthesis of key SaaS revenue metrics, subscription retention, and customer lifetime value.",
            widgets=[
                DashboardWidgetPlan(
                    id="net_mrr_trend",
                    title="Net MRR Velocity",
                    prompt="Calculate total monthly revenue and net MRR trends over time",
                    recommended_chart="line",
                    grid_span=2,
                    metric_type="currency",
                    description="Monthly recurring revenue trends and revenue velocity",
                ),
                DashboardWidgetPlan(
                    id="order_status_breakdown",
                    title="Order & Transaction Status",
                    prompt="Breakdown orders by status including completed, processing, and cancelled",
                    recommended_chart="pie",
                    grid_span=1,
                    metric_type="percentage",
                    description="Distribution of order fulfillment and payment statuses",
                ),
                DashboardWidgetPlan(
                    id="top_spenders",
                    title="Top 5 High-Value Customers",
                    prompt="List top 5 users by total completed order amount with email and total spend",
                    recommended_chart="bar",
                    grid_span=1,
                    metric_type="currency",
                    description="Highest grossing customer accounts",
                ),
                DashboardWidgetPlan(
                    id="avg_order_value",
                    title="Average Order Value (AOV) by Category",
                    prompt="Calculate average order amount and total revenue per product category",
                    recommended_chart="bar",
                    grid_span=2,
                    metric_type="currency",
                    description="Revenue yield per product segment",
                ),
            ],
        )
    else:
        # Default E-commerce / General Operations Dashboard
        return DashboardPlan(
            theme="ecommerce",
            dashboard_title="Executive Operations & Revenue Dashboard",
            summary="Comprehensive view of operational KPIs, customer spend distributions, order volumes, and sales velocity.",
            widgets=[
                DashboardWidgetPlan(
                    id="revenue_trend",
                    title="Gross Revenue Velocity",
                    prompt="Show daily or monthly total order revenue for completed transactions",
                    recommended_chart="line",
                    grid_span=2,
                    metric_type="currency",
                    description="Revenue trends across recent fulfillment cycles",
                ),
                DashboardWidgetPlan(
                    id="order_status_dist",
                    title="Order Status Distribution",
                    prompt="Count of orders grouped by status",
                    recommended_chart="donut",
                    grid_span=1,
                    metric_type="percentage",
                    description="Order fulfillment pipeline breakdown",
                ),
                DashboardWidgetPlan(
                    id="top_customers",
                    title="Top Spenders by Volume",
                    prompt="Top 5 users by cumulative order spend",
                    recommended_chart="bar",
                    grid_span=1,
                    metric_type="currency",
                    description="Key account contribution to gross volume",
                ),
                DashboardWidgetPlan(
                    id="category_breakdown",
                    title="Revenue by Product Category",
                    prompt="Total revenue and product count per category",
                    recommended_chart="bar",
                    grid_span=2,
                    metric_type="currency",
                    description="Sales performance grouped by product classification",
                ),
            ],
        )


def build_planner_prompt(user_prompt: str, live_schema: str, matched_metrics: List[Any]) -> str:
    schema = live_schema.strip() if live_schema and live_schema.strip() else LIVE_DATABASE_SCHEMA_SQL
    metrics_context = "\n".join([f"- {m.name}: {m.definition}" for m in matched_metrics]) if matched_metrics else "None defined."

    return f"""You are the Supervisor Dashboard Architect in QueryCraft.
Your goal is to receive a natural language dashboard request and autonomously decompose it into a cohesive, production-grade 4-widget analytical dashboard plan.

GROUNDED DATABASE SCHEMA:
{schema}

BUSINESS METRICS (SEMANTIC LAYER):
{metrics_context}

RULES:
1. Deconstruct the dashboard into EXACTLY 4 complementary widgets that together address the user's objective.
2. Ensure every widget query can be answered STRICTLY using the tables and columns present in the schema. Do not invent non-existent columns.
3. Assign appropriate chart types: 'line' for trends/time series, 'bar' for rankings/comparisons, 'pie' or 'donut' for percentage breakdowns, 'table' for detailed listings.
4. Set grid_span: 2 for wide trend charts, 1 for compact breakdown/ranking widgets.
5. Return ONLY a valid JSON object matching this schema (no markdown, no backticks):

{{
  "theme": "executive" | "ecommerce" | "finance" | "operations",
  "dashboard_title": "Clear Title of Dashboard",
  "summary": "1-2 sentence executive overview of what this dashboard measures.",
  "widgets": [
    {{
      "id": "unique_snake_case_id",
      "title": "Widget Display Title",
      "prompt": "Specific natural language query for the SQL worker to compile",
      "recommended_chart": "line" | "bar" | "pie" | "donut" | "table",
      "grid_span": 1 | 2,
      "metric_type": "currency" | "percentage" | "count" | "trend",
      "description": "Brief 1-sentence description of the metric"
    }}
  ]
}}"""


async def plan_dashboard_widgets(
    user_prompt: str,
    live_schema: Optional[str] = None,
    matched_metrics: Optional[List[Any]] = None,
) -> DashboardPlan:
    """
    SUPERVISOR PLANNER AGENT:
    Uses Llama 3.1 70B to deconstruct a high-level dashboard prompt into 4 distinct widget specifications.
    """
    matched = matched_metrics or find_matching_metrics(user_prompt, top_k=3)
    system_prompt = build_planner_prompt(user_prompt, live_schema or LIVE_DATABASE_SCHEMA_SQL, matched)

    client = get_llm_client()
    model = os.getenv("model", "meta/llama-3.1-70b-instruct")

    def _call_planner():
        return client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Decompose this dashboard request: '{user_prompt}'"},
            ],
            temperature=0.1,
            max_tokens=800,
            response_format={"type": "json_object"},
            timeout=8.0,
        )

    try:
        response = await asyncio.wait_for(asyncio.to_thread(_call_planner), timeout=9.0)
        raw_content = response.choices[0].message.content
        parsed = sanitize_and_parse_json(raw_content)

        widgets = []
        for w in parsed.get("widgets", []):
            widgets.append(
                DashboardWidgetPlan(
                    id=w.get("id", f"widget_{len(widgets) + 1}"),
                    title=w.get("title", "Metric Overview"),
                    prompt=w.get("prompt", "SELECT 1;"),
                    recommended_chart=w.get("recommended_chart", "bar"),
                    grid_span=w.get("grid_span", 1),
                    metric_type=w.get("metric_type", "count"),
                    description=w.get("description", ""),
                )
            )

        if len(widgets) >= 3:
            return DashboardPlan(
                theme=parsed.get("theme", "executive"),
                dashboard_title=parsed.get("dashboard_title", "Custom Dashboard"),
                summary=parsed.get("summary", "Autonomous multi-agent dashboard synthesis."),
                widgets=widgets[:5],
            )
    except Exception as e:
        logger.warning(f"Supervisor Planner Agent LLM failed, using intelligent schema fallback: {e}")

    return get_fallback_dashboard_plan(user_prompt)


def generate_mock_rows_for_widget(widget: DashboardWidgetPlan) -> Dict[str, Any]:
    """Generates realistic sandbox rows and columns when no live database connection is attached."""
    w_id = widget.id.lower()
    chart = widget.recommended_chart

    if "revenue" in w_id or "mrr" in w_id or chart == "line":
        columns = ["month", "gross_revenue", "order_count"]
        rows = [
            {"month": "May 2024", "gross_revenue": 34200.00, "order_count": 210},
            {"month": "Jun 2024", "gross_revenue": 41850.50, "order_count": 265},
            {"month": "Jul 2024", "gross_revenue": 49200.00, "order_count": 310},
            {"month": "Aug 2024", "gross_revenue": 58400.75, "order_count": 380},
            {"month": "Sep 2024", "gross_revenue": 67150.00, "order_count": 425},
            {"month": "Oct 2024", "gross_revenue": 78900.25, "order_count": 510},
        ]
        kpi = "$78.9K"
        delta = "+17.5% MoM"
    elif "status" in w_id or chart in ["pie", "donut"]:
        columns = ["status", "orders_count", "total_volume"]
        rows = [
            {"status": "completed", "orders_count": 1420, "total_volume": 182400.00},
            {"status": "processing", "orders_count": 180, "total_volume": 24300.00},
            {"status": "pending", "orders_count": 95, "total_volume": 12100.00},
            {"status": "cancelled", "orders_count": 45, "total_volume": 5800.00},
            {"status": "refunded", "orders_count": 22, "total_volume": 2900.00},
        ]
        kpi = "81.0%"
        delta = "Completion Rate"
    elif "top" in w_id or "customer" in w_id:
        columns = ["customer_name", "orders_count", "total_spent"]
        rows = [
            {"customer_name": "Acme Corp", "orders_count": 48, "total_spent": 19450.00},
            {"customer_name": "Nexus Dynamics", "orders_count": 39, "total_spent": 16200.50},
            {"customer_name": "Starlight Ltd", "orders_count": 34, "total_spent": 14100.00},
            {"customer_name": "Apex Global", "orders_count": 29, "total_spent": 11850.75},
            {"customer_name": "Vortex Media", "orders_count": 25, "total_spent": 9940.00},
        ]
        kpi = "$19.45K"
        delta = "Top Account"
    else:
        # Category / General Breakdown
        columns = ["category", "item_count", "total_sales"]
        rows = [
            {"category": "Enterprise Software", "item_count": 12, "total_sales": 84200.00},
            {"category": "Cloud Infrastructure", "item_count": 8, "total_sales": 63100.50},
            {"category": "Security & Auth", "item_count": 15, "total_sales": 45200.00},
            {"category": "Developer Tools", "item_count": 24, "total_sales": 32800.00},
            {"category": "Data & Analytics", "item_count": 19, "total_sales": 29400.00},
        ]
        kpi = "$84.2K"
        delta = "Leading Segment"

    return {
        "columns": columns,
        "rows": rows,
        "row_count": len(rows),
        "kpi_value": kpi,
        "kpi_delta": delta,
    }


async def execute_dashboard_worker(
    widget_plan: DashboardWidgetPlan,
    connection_uri: Optional[str] = None,
    live_schema: Optional[str] = None,
) -> DashboardWidgetResult:
    """
    PARALLEL WORKER AGENT:
    Compiles production-ready SQL for a single widget, validates read-only safety,
    executes against live database (or generates high-fidelity sandbox data),
    and applies self-healing critic if runtime errors occur.
    """
    start_time = time.time()
    schema_to_use = live_schema or LIVE_DATABASE_SCHEMA_SQL

    # 1. Compile Grounded SQL for this sub-task
    client = get_llm_client()
    model = os.getenv("model", "meta/llama-3.1-70b-instruct")

    prompt_messages = [
        {
            "role": "system",
            "content": (
                "You are an expert SQL compiler worker node in QueryCraft. "
                "Write a clean, optimized PostgreSQL read-only SELECT query for this widget. "
                "Ground all tables and columns strictly in the schema. Do not hallucinate columns. "
                "Always append LIMIT 50. Respond ONLY with JSON: {\"sql_query\": \"...\", \"explanation\": \"...\"}"
            ),
        },
        {"role": "user", "content": f"Schema:\n{schema_to_use}\n\nTask: {widget_plan.prompt}"},
    ]

    sql_query = ""
    explanation = f"Compiled SQL query for {widget_plan.title}."

    def _call_worker():
        return client.chat.completions.create(
            model=model,
            messages=prompt_messages,
            temperature=0.1,
            max_tokens=400,
            response_format={"type": "json_object"},
            timeout=6.0,
        )

    try:
        res = await asyncio.wait_for(asyncio.to_thread(_call_worker), timeout=7.0)
        parsed = sanitize_and_parse_json(res.choices[0].message.content)
        raw_sql = parsed.get("sql_query") or ""
        sql_query = validate_and_enforce_sql_safety(raw_sql)
        explanation = parsed.get("explanation") or explanation
    except Exception as err:
        logger.debug(f"Worker LLM fallback for {widget_plan.id}: {err}")
        # Schema-aware fallback SQL
        if "revenue" in widget_plan.id or "mrr" in widget_plan.id:
            sql_query = "SELECT DATE_TRUNC('month', created_at) AS month, SUM(total_amount) AS gross_revenue, COUNT(*) AS order_count FROM orders GROUP BY 1 ORDER BY 1 LIMIT 50;"
        elif "status" in widget_plan.id:
            sql_query = "SELECT status, COUNT(*) AS orders_count, SUM(total_amount) AS total_volume FROM orders GROUP BY status ORDER BY orders_count DESC LIMIT 50;"
        elif "top" in widget_plan.id or "customer" in widget_plan.id:
            sql_query = "SELECT u.name AS customer_name, COUNT(o.id) AS orders_count, SUM(o.total_amount) AS total_spent FROM users u JOIN orders o ON u.id = o.user_id GROUP BY u.name ORDER BY total_spent DESC LIMIT 5;"
        else:
            sql_query = "SELECT category, COUNT(*) AS item_count, SUM(price) AS total_sales FROM products GROUP BY category ORDER BY total_sales DESC LIMIT 50;"

    # 2. Execute SQL against live DB or produce sandbox preview
    rows: List[Dict[str, Any]] = []
    columns: List[str] = []
    row_count = 0
    kpi_value = None
    kpi_delta = None
    db_error = None

    if connection_uri and connection_uri.strip():
        try:
            exec_res = execute_read_only_query(
                connection_uri=connection_uri.strip(),
                sql_query=sql_query,
                limit=50,
                auto_heal=True,
                user_prompt=widget_plan.prompt,
                live_schema=schema_to_use,
            )
            rows = exec_res.get("rows", [])
            columns = exec_res.get("columns", [])
            row_count = exec_res.get("row_count", 0)

            # Compute hero KPI value from execution results
            if rows and columns:
                first_row = rows[0]
                num_col = None
                for c in columns:
                    val = first_row.get(c)
                    if isinstance(val, (int, float)):
                        num_col = c
                        break
                if num_col:
                    total_val = sum(float(r.get(num_col) or 0) for r in rows)
                    kpi_value = f"{total_val:,.1f}" if total_val > 1000 else str(total_val)
                    kpi_delta = f"Total {num_col.replace('_', ' ').title()}"
        except Exception as exec_err:
            logger.warning(f"Worker live execution error for {widget_plan.id}: {exec_err}")
            # Critic Doctor healing attempt
            try:
                healed_sql, diagnosis = heal_sql_with_critic(
                    failing_sql=sql_query,
                    error_message=str(exec_err),
                    live_schema=schema_to_use,
                    user_prompt=widget_plan.prompt,
                )
                safe_healed = validate_and_enforce_sql_safety(healed_sql)
                sql_query = safe_healed
                explanation += f" (Self-healed by Critic: {diagnosis})"

                # Retry healed SQL
                exec_retry = execute_read_only_query(
                    connection_uri=connection_uri.strip(),
                    sql_query=safe_healed,
                    limit=50,
                    auto_heal=False,
                )
                rows = exec_retry.get("rows", [])
                columns = exec_retry.get("columns", [])
                row_count = exec_retry.get("row_count", 0)
            except Exception as heal_err:
                db_error = str(exec_err)
                # Graceful fallback to sandbox preview so UI widget doesn't crash
                mock_data = generate_mock_rows_for_widget(widget_plan)
                rows = mock_data["rows"]
                columns = mock_data["columns"]
                row_count = mock_data["row_count"]
                kpi_value = mock_data["kpi_value"]
                kpi_delta = mock_data["kpi_delta"]
    else:
        # Sandbox Demo Data (No live connection attached)
        mock_data = generate_mock_rows_for_widget(widget_plan)
        rows = mock_data["rows"]
        columns = mock_data["columns"]
        row_count = mock_data["row_count"]
        kpi_value = mock_data["kpi_value"]
        kpi_delta = mock_data["kpi_delta"]

    elapsed_ms = int((time.time() - start_time) * 1000)

    return DashboardWidgetResult(
        id=widget_plan.id,
        title=widget_plan.title,
        prompt=widget_plan.prompt,
        sql_query=sql_query,
        dialect="postgresql",
        explanation=explanation,
        recommended_chart=widget_plan.recommended_chart,
        grid_span=widget_plan.grid_span,
        columns=columns,
        rows=rows,
        row_count=row_count,
        kpi_value=kpi_value,
        kpi_delta=kpi_delta,
        db_error=db_error,
        execution_time_ms=elapsed_ms,
    )


def assemble_dashboard_canvas(
    dashboard_plan: DashboardPlan,
    widget_results: List[DashboardWidgetResult],
    total_time_ms: int,
) -> DashboardCanvasResponse:
    """
    CANVAS ASSEMBLER AGENT:
    Collects results from all parallel workers, formats hero KPI cards,
    and drafts an executive takeaway summary.
    """
    # Draft executive summary narrative
    kpis_collected = [
        f"{w.title}: {w.kpi_value or 'N/A'}"
        for w in widget_results
        if w.kpi_value
    ]
    kpi_summary = " · ".join(kpis_collected) if kpis_collected else "Live operational metrics synchronized."

    executive_summary = (
        f"Autonomous Multi-Agent Synthesis ({len(widget_results)} queries compiled in {total_time_ms}ms). "
        f"{dashboard_plan.summary} Key metrics: {kpi_summary}"
    )

    return DashboardCanvasResponse(
        status="complete",
        dashboard_title=dashboard_plan.dashboard_title,
        executive_summary=executive_summary,
        theme=dashboard_plan.theme,
        widgets=widget_results,
        total_widgets=len(widget_results),
        execution_time_total_ms=total_time_ms,
        timestamp=datetime.utcnow().isoformat() + "Z",
    )


async def orchestrate_dashboard_generation(
    user_prompt: str,
    connection_uri: Optional[str] = None,
    live_schema: Optional[str] = None,
) -> DashboardCanvasResponse:
    """
    MASTER SUPERVISOR ORCHESTRATOR:
    1. Evaluates schema & semantic metrics.
    2. Runs Supervisor Planner Node to generate 4-widget plan.
    3. Runs 4 Worker Nodes in parallel via asyncio.gather.
    4. Runs Canvas Assembler Agent to return the unified dashboard canvas.
    """
    start_total = time.time()
    logger.info(f"Dashboard Architect Supervisor received: '{user_prompt}'")

    # Step 1: Introspect schema if connection provided and schema missing
    schema_to_use = live_schema
    if not schema_to_use and connection_uri and connection_uri.strip():
        try:
            _, schema_sql = introspect_cloud_database(connection_uri.strip())
            schema_to_use = schema_sql
        except Exception as e:
            logger.warning(f"Schema introspection notice: {e}")
            schema_to_use = LIVE_DATABASE_SCHEMA_SQL
    elif not schema_to_use:
        schema_to_use = LIVE_DATABASE_SCHEMA_SQL

    # Step 2: Supervisor Planner Agent
    plan = await plan_dashboard_widgets(user_prompt, schema_to_use)

    # Step 3: Spin up Parallel Worker Agents via asyncio.gather
    worker_tasks = [
        execute_dashboard_worker(widget, connection_uri, schema_to_use)
        for widget in plan.widgets
    ]
    widget_results: List[DashboardWidgetResult] = await asyncio.gather(*worker_tasks)

    total_time_ms = int((time.time() - start_total) * 1000)

    # Step 4: Canvas Assembler Agent
    canvas = assemble_dashboard_canvas(plan, widget_results, total_time_ms)
    logger.info(f"Dashboard Canvas generation completed in {total_time_ms}ms with {len(widget_results)} widgets.")
    return canvas


def get_dashboard_templates() -> List[DashboardTemplate]:
    """Returns curated starter dashboard templates."""
    return DEFAULT_TEMPLATES
