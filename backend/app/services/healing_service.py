import os
import json
import logging
from typing import Dict, Any, Optional, Tuple
from app.Models.schema import HealedQueryInfo, ExtractedSQLData

logger = logging.getLogger(__name__)

def heal_sql_with_critic(
    failing_sql: str,
    error_message: str,
    live_schema: Optional[str] = None,
    user_prompt: Optional[str] = None,
    llm_client=None
) -> Tuple[str, str]:
    """
    Invokes Llama 3.1 Critic Agent to repair a failing PostgreSQL query.
    Returns: (healed_sql, diagnosis_explanation)
    """
    from app.services.llm_services import get_llm_client, LIVE_DATABASE_SCHEMA_SQL
    client = llm_client or get_llm_client()
    model = os.getenv("model", "meta/llama-3.1-70b-instruct")

    schema_to_use = live_schema if live_schema and live_schema.strip() else LIVE_DATABASE_SCHEMA_SQL

    system_prompt = f"""You are an Expert PostgreSQL Self-Healing Agent.
A generated SQL query failed during execution on PostgreSQL.

### LIVE DATABASE SCHEMA
{schema_to_use}

### TASK
1. Analyze the exact PostgreSQL error message and the failing SQL.
2. Identify why it failed (e.g. column name mismatch, invalid data type casting, missing GROUP BY, missing join alias, or syntax error).
3. Fix the SQL query so it executes cleanly and adheres strictly to the schema above.
4. Output ONLY valid raw JSON:
{{
  "healed_sql": "SELECT ... FROM ... WHERE ...;",
  "diagnosis": "1-sentence plain English explanation of the root cause and the specific fix applied."
}}"""

    user_content = f"""Failing SQL Query:
{failing_sql}

PostgreSQL Runtime Error:
{error_message}

Original User Request:
{user_prompt or 'N/A'}"""

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ],
            temperature=0.05,
            max_tokens=500,
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content.strip()
        data = json.loads(content)
        healed_sql = data.get("healed_sql", failing_sql).strip()
        diagnosis = data.get("diagnosis", "Query was self-healed to conform with live PostgreSQL schema.")
        return healed_sql, diagnosis
    except Exception as e:
        logger.error(f"Critic healing failed: {e}")
        return failing_sql, f"Healing attempt failed: {str(e)}"
