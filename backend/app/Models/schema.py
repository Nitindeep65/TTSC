from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field

class ExtractedSQLData(BaseModel):
    sql_query: str = Field(description="Production-ready PostgreSQL SELECT query")
    tables_identified: List[str] = Field(description="List of database tables referenced in the query")
    explanation: str = Field(description="1-2 sentence plain-English explanation of joins, filters, aggregations, and limits applied")

class ClarificationResponse(BaseModel):
    status: Literal["needs_clarification", "complete"]
    message: str = Field(description="Direct acknowledgment/clarification question or friendly confirmation message")
    extracted_data: Optional[ExtractedSQLData] = None

class ClarificationRequest(BaseModel):
    user_prompt: str
    session_history: List[Dict[str, Any]] = []
    live_schema: Optional[str] = None
    connection_uri: Optional[str] = None
    db_uri: Optional[str] = None

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

class ExecuteQueryResponse(BaseModel):
    status: str
    columns: List[str]
    rows: List[Dict[str, Any]]
    row_count: int