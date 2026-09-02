from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field

# --- VISUAL INTENT DETECTION (kept for backwards-compat with existing tests) ---
class VisualIntent(BaseModel):
    should_visualize: bool = False
    recommended_chart: Optional[Literal["bar", "line", "area", "pie", "donut", "table"]] = "table"
    x_key: Optional[str] = None
    y_key: Optional[str] = None
    title: Optional[str] = None

# --- EXTRACTED SQL DATA ---
class ExtractedSQLData(BaseModel):
    sql_query: str = Field(description="Production-ready PostgreSQL SELECT query")
    tables_identified: List[str] = Field(description="List of database tables referenced in the query")
    explanation: str = Field(description="1-2 sentence plain-English explanation of joins, filters, aggregations, and limits applied")
    # visual_intent kept for backward-compat but deprecated — frontend handles visualization
    visual_intent: Optional[VisualIntent] = None
    matched_metrics: Optional[List[str]] = Field(default=[], description="Semantic business metrics applied")
    risk_level: Optional[Literal["LOW", "MEDIUM", "HIGH"]] = Field(
        default=None,
        description="Query risk classification: LOW (safe), MEDIUM (review), HIGH (block)"
    )

class ClarificationResponse(BaseModel):
    status: Literal["needs_clarification", "complete"]
    message: str = Field(description="Direct acknowledgment/clarification question or friendly confirmation message")
    extracted_data: Optional[ExtractedSQLData] = None
    # visual_intent kept for backward-compat
    visual_intent: Optional[VisualIntent] = None
    risk_level: Optional[Literal["LOW", "MEDIUM", "HIGH"]] = Field(
        default=None,
        description="Pre-flight query risk classification based on EXPLAIN analysis"
    )

class ClarificationRequest(BaseModel):
    user_prompt: str
    session_history: List[Dict[str, Any]] = []
    live_schema: Optional[str] = None
    connection_uri: Optional[str] = None
    db_uri: Optional[str] = None

# --- SCHEMA INFO ---
class ColumnInfo(BaseModel):
    name: str
    type: str
    is_primary_key: bool = False
    is_foreign_key: bool = False
    references: Optional[str] = None
    description: Optional[str] = None

class TableInfo(BaseModel):
    table_name: str
    description: str
    columns: List[ColumnInfo]

class SchemaInfoResponse(BaseModel):
    database_type: str = "Cloud PostgreSQL (Supabase / Neon / AWS RDS)"
    tables: List[TableInfo]

# --- DB CONNECTION & QUERY EXECUTION ---
class DBConnectRequest(BaseModel):
    connection_uri: str = Field(description="Cloud PostgreSQL connection string (Supabase, Neon, AWS RDS, etc.)")

class DBConnectResponse(BaseModel):
    status: str
    host: str
    database: str
    user: str
    tables_count: int
    schema_sql: str
    tables: List[TableInfo]
    message: str = "Database connected and schema introspected successfully"

class ExecuteQueryRequest(BaseModel):
    connection_uri: str
    sql_query: str
    limit: Optional[int] = 50
    auto_heal: Optional[bool] = True
    user_prompt: Optional[str] = None
    live_schema: Optional[str] = None

class HealedQueryInfo(BaseModel):
    was_healed: bool = False
    original_sql: Optional[str] = None
    healed_sql: Optional[str] = None
    diagnosis: Optional[str] = None
    error_message: Optional[str] = None

class ExecuteQueryResponse(BaseModel):
    status: str
    columns: List[str]
    rows: List[Dict[str, Any]]
    row_count: int
    healing_info: Optional[HealedQueryInfo] = None
    visual_intent: Optional[VisualIntent] = None

# --- POSTGRESQL EXPLAIN & PERFORMANCE GUARD ---
class ExplainPlanRequest(BaseModel):
    connection_uri: str
    sql_query: str

class ExplainPlanResponse(BaseModel):
    status: str
    total_cost: float
    startup_cost: float
    plan_rows: int
    plan_width: int
    has_seq_scan: bool
    scan_details: List[str] = []
    performance_rating: Literal["fast", "moderate", "heavy"]
    rating_label: str
    # MVP: Unified 3-tier risk classification across Cost Guard and Explain Service
    risk_level: Literal["LOW", "MEDIUM", "HIGH"] = Field(
        default="LOW",
        description="LOW = safe to execute, MEDIUM = review recommended, HIGH = execution blocked"
    )
    index_recommendations: List[str] = []
    raw_plan: Optional[Dict[str, Any]] = None

# --- RAG SEMANTIC LAYER & BUSINESS METRICS ---
class SemanticRule(BaseModel):
    id: str
    name: str
    definition: str
    sql_formula: Optional[str] = None
    category: str = "Finance" # Finance, Customer, Inventory, Marketing, Operations
    tags: List[str] = []
    created_at: str

class CreateMetricRequest(BaseModel):
    name: str
    definition: str
    sql_formula: Optional[str] = None
    category: Optional[str] = "General"
    tags: Optional[List[str]] = []

class TeachAIRequest(BaseModel):
    instruction: str = Field(description="Plain English instruction e.g. 'From now on, consider VIP Customer as total spend > 1000'")

class PolicyUploadRequest(BaseModel):
    document_title: Optional[str] = "Company Policy Document"
    document_text: str = Field(description="Raw text, markdown, CSV, or extracted PDF content of business policy/metrics definitions")

class PolicyUploadResponse(BaseModel):
    status: str
    extracted_metrics: List[SemanticRule]
    count: int
    message: str

class SemanticMetricsResponse(BaseModel):
    status: str
    metrics: List[SemanticRule]
    total_count: int

# --- FEW-SHOT VERIFIED QUERY MEMORY ---
class VerifiedQuery(BaseModel):
    id: str
    user_prompt: str
    verified_sql: str
    tables: List[str] = []
    explanation: Optional[str] = None
    tags: List[str] = []
    created_at: str

class SaveVerifiedQueryRequest(BaseModel):
    user_prompt: str
    verified_sql: str
    tables: Optional[List[str]] = []
    explanation: Optional[str] = None
    tags: Optional[List[str]] = []

class VerifiedQueriesResponse(BaseModel):
    status: str
    queries: List[VerifiedQuery]
    total_count: int

# --- TABLE DATA PROFILER & CATEGORICAL SAMPLER ---
class ColumnSampleData(BaseModel):
    name: str
    type: str
    null_count: int = 0
    distinct_values: List[str] = []

class TableSampleRequest(BaseModel):
    connection_uri: Optional[str] = None
    table_name: str
    limit: Optional[int] = 5

class TableSampleResponse(BaseModel):
    status: str
    table_name: str
    columns: List[str]
    rows: List[Dict[str, Any]]
    column_profiles: List[ColumnSampleData] = []
    row_count: int
    message: Optional[str] = None

# --- STANDALONE SQL DOCTOR & ERROR DIAGNOSER ---
class DiagnoseErrorRequest(BaseModel):
    error_message: str
    failing_sql: Optional[str] = None
    live_schema: Optional[str] = None
    user_prompt: Optional[str] = None
    connection_uri: Optional[str] = None

class DiagnoseErrorResponse(BaseModel):
    status: str
    error_code: Optional[str] = None
    # MVP: Structured SQLSTATE error category for frontend display
    error_category: Optional[str] = Field(
        default=None,
        description="Structured error class: undefined_column, undefined_table, syntax_error, type_error, aggregation_error, runtime_error"
    )
    root_cause: str
    healed_sql: Optional[str] = None
    affected_entities: List[str] = []
    explanation: str

# --- SAVED QUERY NOTEBOOK & SNIPPETS LIBRARY ---
class SavedNotebookQuery(BaseModel):
    id: str
    title: str
    user_prompt: str
    sql_query: str
    tags: List[str] = []
    database_host: Optional[str] = None
    created_at: str

class SaveNotebookQueryRequest(BaseModel):
    title: Optional[str] = None
    user_prompt: str
    sql_query: str
    tags: Optional[List[str]] = []
    database_host: Optional[str] = None

class NotebookQueriesResponse(BaseModel):
    status: str
    queries: List[SavedNotebookQuery]
    total_count: int

# --- DASHBOARD ARCHITECT & MULTI-AGENT SUB-GRAPH ---
class DashboardWidgetPlan(BaseModel):
    id: str
    title: str
    prompt: str
    recommended_chart: Literal["bar", "line", "area", "pie", "donut", "table", "kpi"] = "bar"
    grid_span: int = 1  # 1 column or 2 columns in a responsive 2-3 column layout
    metric_type: Optional[str] = None  # e.g. "currency", "percentage", "count", "trend"
    description: Optional[str] = None

class DashboardPlan(BaseModel):
    theme: str
    dashboard_title: str
    summary: str
    widgets: List[DashboardWidgetPlan]

class DashboardWidgetResult(BaseModel):
    id: str
    title: str
    prompt: str
    sql_query: str
    dialect: str = "postgresql"
    explanation: str
    recommended_chart: str = "bar"
    grid_span: int = 1
    columns: List[str] = []
    rows: List[Dict[str, Any]] = []
    row_count: int = 0
    kpi_value: Optional[str] = None
    kpi_delta: Optional[str] = None
    db_error: Optional[str] = None
    execution_time_ms: Optional[int] = 0

class DashboardGenerateRequest(BaseModel):
    user_prompt: str = Field(description="High-level dashboard goal e.g. 'Build me a SaaS Executive Dashboard for Q3'")
    theme: Optional[str] = "executive"
    connection_uri: Optional[str] = None
    db_uri: Optional[str] = None
    live_schema: Optional[str] = None

class DashboardCanvasResponse(BaseModel):
    status: str
    dashboard_title: str
    executive_summary: str
    theme: str = "executive"
    widgets: List[DashboardWidgetResult]
    total_widgets: int
    execution_time_total_ms: int = 0
    timestamp: str

class DashboardTemplate(BaseModel):
    id: str
    title: str
    badge: str
    description: str
    prompt: str
    icon: str
    tags: List[str] = []

class DashboardTemplatesResponse(BaseModel):
    status: str
    templates: List[DashboardTemplate]