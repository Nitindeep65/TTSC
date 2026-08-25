import os
import re
import json
import logging
from typing import Optional, List, Dict, Any
from openai import OpenAI
from app.Models.schema import (
    ClarificationResponse,
    ExtractedSQLData,
    SchemaInfoResponse,
    TableInfo,
    ColumnInfo,
    VisualIntent,
)
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Cloud PostgreSQL Live Database Schema Definition
LIVE_DATABASE_SCHEMA_SQL = """-- Cloud PostgreSQL Schema (Supabase / Neon / AWS RDS)

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'customer', -- 'customer', 'admin', 'merchant'
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    attributes JSONB,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    total_amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'pending', 'processing', 'completed', 'cancelled', 'refunded'
    shipping_address JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    amount NUMERIC(12, 2) NOT NULL,
    payment_method VARCHAR(50), -- 'credit_card', 'paypal', 'stripe', 'bank_transfer'
    status VARCHAR(50) NOT NULL, -- 'succeeded', 'pending', 'failed', 'refunded'
    transaction_ref VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
"""

STRUCTURED_TABLES_INFO = [
    TableInfo(
        table_name="users",
        description="Registered user accounts and credentials",
        columns=[
            ColumnInfo(name="id", type="UUID", is_primary_key=True, description="Unique user identifier"),
            ColumnInfo(name="email", type="VARCHAR(255)", description="Unique user email"),
            ColumnInfo(name="name", type="VARCHAR(100)", description="Full user display name"),
            ColumnInfo(name="role", type="VARCHAR(50)", description="Role: customer, admin, merchant"),
            ColumnInfo(name="is_active", type="BOOLEAN", description="Active account flag"),
            ColumnInfo(name="metadata", type="JSONB", description="User profile settings & preferences"),
            ColumnInfo(name="created_at", type="TIMESTAMPTZ", description="Registration timestamp"),
            ColumnInfo(name="updated_at", type="TIMESTAMPTZ", description="Last profile update timestamp"),
        ]
    ),
    TableInfo(
        table_name="products",
        description="Catalog items available for purchase",
        columns=[
            ColumnInfo(name="id", type="UUID", is_primary_key=True, description="Unique product ID"),
            ColumnInfo(name="name", type="VARCHAR(255)", description="Product title"),
            ColumnInfo(name="category", type="VARCHAR(100)", description="Product category taxonomy"),
            ColumnInfo(name="price", type="NUMERIC(10,2)", description="Unit retail price"),
            ColumnInfo(name="stock_quantity", type="INTEGER", description="Current inventory quantity in stock"),
            ColumnInfo(name="attributes", type="JSONB", description="Dynamic product specs, tags, dimensions"),
            ColumnInfo(name="is_available", type="BOOLEAN", description="Availability flag for store display"),
            ColumnInfo(name="created_at", type="TIMESTAMPTZ", description="Product listing creation timestamp"),
        ]
    ),
    TableInfo(
        table_name="orders",
        description="Customer transactions and purchase orders",
        columns=[
            ColumnInfo(name="id", type="UUID", is_primary_key=True, description="Unique order ID"),
            ColumnInfo(name="user_id", type="UUID", is_foreign_key=True, references="users(id)", description="Purchasing user ID"),
            ColumnInfo(name="total_amount", type="NUMERIC(12,2)", description="Final checkout amount charged"),
            ColumnInfo(name="status", type="VARCHAR(50)", description="pending, processing, completed, cancelled, refunded"),
            ColumnInfo(name="shipping_address", type="JSONB", description="Delivery address object"),
            ColumnInfo(name="created_at", type="TIMESTAMPTZ", description="Order placement timestamp"),
            ColumnInfo(name="updated_at", type="TIMESTAMPTZ", description="Last status update timestamp"),
        ]
    ),
    TableInfo(
        table_name="order_items",
        description="Line items contained within each order",
        columns=[
            ColumnInfo(name="id", type="UUID", is_primary_key=True, description="Unique order item ID"),
            ColumnInfo(name="order_id", type="UUID", is_foreign_key=True, references="orders(id)", description="Parent order reference"),
            ColumnInfo(name="product_id", type="UUID", is_foreign_key=True, references="products(id)", description="Referenced product"),
            ColumnInfo(name="quantity", type="INTEGER", description="Units purchased (> 0)"),
            ColumnInfo(name="unit_price", type="NUMERIC(10,2)", description="Historical unit price at time of purchase"),
            ColumnInfo(name="created_at", type="TIMESTAMPTZ", description="Line item creation timestamp"),
        ]
    ),
    TableInfo(
        table_name="payments",
        description="Payment transactions, methods, and status",
        columns=[
            ColumnInfo(name="id", type="UUID", is_primary_key=True, description="Unique payment ID"),
            ColumnInfo(name="order_id", type="UUID", is_foreign_key=True, references="orders(id)", description="Associated order reference"),
            ColumnInfo(name="amount", type="NUMERIC(12,2)", description="Transaction amount charged"),
            ColumnInfo(name="payment_method", type="VARCHAR(50)", description="credit_card, paypal, stripe, bank_transfer"),
            ColumnInfo(name="status", type="VARCHAR(50)", description="succeeded, pending, failed, refunded"),
            ColumnInfo(name="transaction_ref", type="VARCHAR(100)", description="External gateway reference ID"),
            ColumnInfo(name="created_at", type="TIMESTAMPTZ", description="Payment processing timestamp"),
        ]
    ),
]


def get_schema_info() -> SchemaInfoResponse:
    """Returns the live database schema metadata."""
    return SchemaInfoResponse(
        database_type="Cloud PostgreSQL (Supabase / Neon / AWS RDS)",
        tables=STRUCTURED_TABLES_INFO
    )


def get_llm_client() -> OpenAI:
    api_key = os.getenv("NVIDIA_API_KEY")
    base_url = os.getenv("Base_url", "https://integrate.api.nvidia.com/v1")
    return OpenAI(base_url=base_url, api_key=api_key, timeout=30.0)


def detect_visual_intent(prompt: str) -> VisualIntent:
    """NLP intent detector for visual keywords (chart, graph, plot, trend, breakdown, etc.)."""
    p_lower = prompt.lower()
    
    # Check for visual keywords
    visual_keywords = [
        "chart", "graph", "plot", "visualize", "visualization",
        "trend", "timeline", "breakdown", "distribution",
        "bar chart", "line chart", "pie chart", "area chart", "donut"
    ]
    should_visualize = any(kw in p_lower for kw in visual_keywords)
    
    recommended_chart = "table"
    if "line" in p_lower or "trend" in p_lower or "over time" in p_lower or "daily" in p_lower or "monthly" in p_lower:
        recommended_chart = "line"
    elif "pie" in p_lower or "donut" in p_lower or "share" in p_lower or "proportion" in p_lower:
        recommended_chart = "pie"
    elif "area" in p_lower:
        recommended_chart = "area"
    elif "bar" in p_lower or "breakdown" in p_lower or "compare" in p_lower or "by category" in p_lower:
        recommended_chart = "bar"
    elif should_visualize:
        recommended_chart = "bar"

    return VisualIntent(
        should_visualize=should_visualize,
        recommended_chart=recommended_chart,
        title="Query Visualization"
    )


def build_system_prompt(
    live_schema: Optional[str] = None,
    matched_metrics: Optional[List[Any]] = None,
    few_shot_examples: Optional[List[Any]] = None
) -> str:
    schema_to_use = live_schema if live_schema and live_schema.strip() else LIVE_DATABASE_SCHEMA_SQL
    
    # 1. Semantic Business Rules Section
    metrics_section = ""
    if matched_metrics and len(matched_metrics) > 0:
        lines = ["\n### RELEVANT BUSINESS METRIC DEFINITIONS & RULES:"]
        for m in matched_metrics:
            formula_str = f" (Formula: {m.sql_formula})" if m.sql_formula else ""
            lines.append(f"- **{m.name}**: {m.definition}{formula_str}")
        metrics_section = "\n".join(lines) + "\n"

    # 2. Few-Shot Verified Examples Section
    few_shot_section = ""
    if few_shot_examples and len(few_shot_examples) > 0:
        lines = ["\n### VERIFIED GOLD-STANDARD FEW-SHOT EXAMPLES:"]
        for ex in few_shot_examples:
            lines.append(f"Prompt: \"{ex.user_prompt}\"")
            lines.append(f"SQL: {ex.verified_sql}")
            lines.append("")
        few_shot_section = "\n".join(lines) + "\n"

    return f"""You are an expert Universal Text-to-Database Clarification and Query Engine specializing in SQL (PostgreSQL, MySQL, Supabase, Neon, AWS RDS) and NoSQL Document/Key-Value environments (MongoDB, Redis, DynamoDB).

Your objective is to analyze user requests, evaluate conversational context, clarify ambiguities, and generate safe, optimized, production-ready queries (PostgreSQL SQL by default, or MongoDB MQL / Redis commands if requested) based strictly on the live schema provided via MCP.

---

### INPUT CONTEXT PROVIDED
- LIVE DATABASE SCHEMA & COLLECTIONS: Tables/collections, column/field names, data types, and constraints retrieved from the connected database.
{schema_to_use}
{metrics_section}
{few_shot_section}
---

### CORE EVALUATION RULES

1. SCHEMA & COLLECTION GROUNDING (ZERO HALLUCINATION):
   - Only reference tables, columns, or collections/fields explicitly present in the provided schema.
   - Respect data types (e.g., UUID, TIMESTAMPTZ, JSONB, BSON object types).
   - Strictly adhere to any Business Metric definitions provided above.

2. CLARIFICATION CRITERIA (WHEN TO PAUSE QUERY GENERATION):
   - Set "status" to "needs_clarification" if any of the following are missing or ambiguous:
     * MULTI-DATABASE CLUSTER DISAMBIGUATION: If the connected cluster contains multiple databases (e.g. "ByteRipple", "cloudpeek", "portfolio", "test") and the user's prompt does not specify which database to target (or if collections with similar names exist across databases), ask a clear clarification question:
       "Which database in your cluster would you like to query? (Available databases: db1, db2, ...)"
     * Time windows or date ranges on cumulative/historical tables or collections.
     * Status filters on transactional entities (e.g., active vs. inactive, completed vs. pending vs. cancelled).
     * Ambiguous ranking/aggregation definitions (e.g., "top users" -> by total spend, by order count, or by activity?).
     * Vague pagination or threshold requirements.
   - In "message", ask a concise, targeted question addressing the missing parameters. Set "extracted_data" to null.

3. COMPLETION CRITERIA (WHEN TO GENERATE QUERY):
   - Set "status" to "complete" ONLY when all required filters, joins/stages, aggregations, and metrics are clearly specified across the conversation history.
   - In "message", provide a brief, professional confirmation.

4. SAFETY & RESOURCE CONSTRAINTS (SQL & NoSQL):
   - READ-ONLY ENFORCEMENT: Output ONLY `SELECT` statements for SQL, or read-only `find()` / `aggregate()` for MongoDB, or read-only commands for Redis. Never generate `INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `TRUNCATE`, `$out`, `$merge`, `SET`, or `DEL`.
   - RESOURCE PROTECTION: Always apply an explicit `LIMIT` (default to 50 if unspecified) on open-ended queries to prevent memory spikes.

---

### STRICT JSON OUTPUT FORMAT
Respond ONLY with a valid, raw JSON object matching this schema (no markdown formatting, no backticks, no code fences):

{{
  "status": "needs_clarification" | "complete",
  "message": "Direct acknowledgment and specific clarification question, OR friendly confirmation message",
  "extracted_data": {{
    "sql_query": "SELECT ... FROM ... WHERE ...; (or db.collection.aggregate([...]))",
    "tables_identified": ["table_or_collection_1", "table_or_collection_2"],
    "explanation": "1-2 sentence plain-English explanation of joins/pipeline stages, filters, aggregations, and limits applied."
  }} | null
}}"""


def sanitize_and_parse_json(raw_text: str) -> Dict[str, Any]:
    """Cleans markdown wrappers, extracts JSON object, and parses securely."""
    text = raw_text.strip()
    
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
        text = re.sub(r"\s*```$", "", text)
        text = text.strip()
        
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            return json.loads(match.group(0))
        raise


def validate_and_enforce_sql_safety(sql_query: str) -> str:
    """Enforces read-only execution and safety constraints for SQL and NoSQL."""
    query = sql_query.strip()
    
    disallowed_patterns = [
        r"\bINSERT\s+INTO\b",
        r"\bUPDATE\s+\w+\s+SET\b",
        r"\bDELETE\s+FROM\b",
        r"\bDROP\s+(?:TABLE|DATABASE|INDEX|VIEW|SCHEMA|COLLECTION)\b",
        r"\bALTER\s+(?:TABLE|DATABASE|INDEX|VIEW|SCHEMA)\b",
        r"\bTRUNCATE\b",
        r"\bGRANT\b",
        r"\bREVOKE\b",
        r"\bEXEC\b",
        r"\bEXECUTE\b",
        r"\b\$out\b",
        r"\b\$merge\b",
        r"\.insertOne\(",
        r"\.insertMany\(",
        r"\.updateOne\(",
        r"\.updateMany\(",
        r"\.deleteOne\(",
        r"\.deleteMany\(",
        r"\.drop\(",
        r"\bFLUSHALL\b",
        r"\bFLUSHDB\b",
    ]
    
    for pattern in disallowed_patterns:
        if re.search(pattern, query, re.IGNORECASE):
            raise ValueError(f"Dangerous operation detected in generated query matching '{pattern}'. Only read-only queries are permitted.")
            
    is_nosql = bool(re.match(r"^\s*(?:db\.|SCAN\b|GET\b|HGETALL\b|LRANGE\b|SMEMBERS\b)", query, re.IGNORECASE))
    
    if not is_nosql:
        if not (re.match(r"^\s*(?:SELECT|WITH)\b", query, re.IGNORECASE)):
            raise ValueError("Generated query is not a valid read-only SELECT or NoSQL query statement.")
            
        is_pure_scalar_agg = bool(re.search(r"^\s*SELECT\s+(?:COUNT|SUM|AVG|MIN|MAX)\(", query, re.IGNORECASE) and not re.search(r"\bGROUP\s+BY\b", query, re.IGNORECASE))
        
        if not is_pure_scalar_agg and not re.search(r"\bLIMIT\s+\d+\b", query, re.IGNORECASE):
            if query.endswith(";"):
                query = query[:-1].rstrip() + " LIMIT 50;"
            else:
                query = query + " LIMIT 50;"
                
    return query


def evaluate_user_intent(
    user_prompt: str,
    session_history: Optional[List[Dict[str, Any]]] = None,
    live_schema: Optional[str] = None
) -> ClarificationResponse:
    """
    Evaluates conversational context against the cloud PostgreSQL schema,
    applies RAG semantic metrics and few-shot verified queries, and returns validated SQL.
    """
    if session_history is None:
        session_history = []

    # 1. Detect NLP Visual Intent
    visual_intent = detect_visual_intent(user_prompt)

    # 2. Retrieve Semantic Business Metrics via RAG
    from app.services.semantic_service import find_matching_metrics
    from app.services.memory_service import find_relevant_few_shot_examples

    matched_metrics = find_matching_metrics(user_prompt, top_k=3)
    few_shot_examples = find_relevant_few_shot_examples(user_prompt, top_k=2)

    # 3. Build System Prompt with injected context
    system_prompt = build_system_prompt(
        live_schema=live_schema,
        matched_metrics=matched_metrics,
        few_shot_examples=few_shot_examples
    )
    
    messages = [{"role": "system", "content": system_prompt}]

    for item in session_history:
        role = item.get("role")
        content = item.get("content")
        if role in ["user", "assistant"] and content:
            messages.append({"role": role, "content": str(content)})

    messages.append({"role": "user", "content": user_prompt})

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
        parsed_data = sanitize_and_parse_json(raw_content)

        status = parsed_data.get("status", "needs_clarification")
        message = parsed_data.get("message", "Could you please clarify your request?")
        extracted_data_raw = parsed_data.get("extracted_data")

        if status == "complete" and extracted_data_raw:
            sql_query = extracted_data_raw.get("sql_query", "")
            safe_sql = validate_and_enforce_sql_safety(sql_query)
            tables = extracted_data_raw.get("tables_identified", [])
            explanation = extracted_data_raw.get("explanation", "")

            extracted_data = ExtractedSQLData(
                sql_query=safe_sql,
                tables_identified=tables,
                explanation=explanation,
                visual_intent=visual_intent,
                matched_metrics=[m.name for m in matched_metrics]
            )
            return ClarificationResponse(
                status="complete",
                message=message,
                extracted_data=extracted_data,
                visual_intent=visual_intent
            )
        else:
            return ClarificationResponse(
                status="needs_clarification",
                message=message,
                extracted_data=None,
                visual_intent=visual_intent
            )

    except Exception as e:
        logger.error(f"Error during LLM evaluation: {str(e)}", exc_info=True)
        return ClarificationResponse(
            status="needs_clarification",
            message="I'd be glad to help formulate this query. Could you specify any required date ranges, status filters, or metrics to ensure an accurate query?",
            extracted_data=None,
            visual_intent=visual_intent
        )