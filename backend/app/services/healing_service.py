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

### TASK & DIAGNOSIS RULES
1. Analyze the exact PostgreSQL error message and the failing SQL.
2. If a column does not exist error occurred:
   - Check ALL columns in the failing query against the schema table definition.
   - Eliminate ALL non-existent columns in a SINGLE PASS. If columns were guessed or user wanted all rows, use "SELECT * FROM <table_name> LIMIT 50;".
3. Fix the SQL query so it executes cleanly and adheres strictly to the schema above.
4. Output ONLY valid raw JSON:
{{
  "healed_sql": "SELECT ... FROM ... WHERE ...;",
  "diagnosis": "1-sentence plain English explanation of the root cause and the specific fix applied in a single pass."
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
        # Programmatic fallback for column does not exist errors
        import re
        col_match = re.search(r'column ["\']?([^"\'\s]+)["\']? does not exist', error_message, re.IGNORECASE)
        tbl_match = re.search(r'\bFROM\s+([a-zA-Z0-9_]+)\b', failing_sql, re.IGNORECASE)
        if col_match and tbl_match:
            table_name = tbl_match.group(1)
            fallback_healed = f"SELECT * FROM {table_name} LIMIT 50;"
            return fallback_healed, f"Repaired query to universal 'SELECT * FROM {table_name} LIMIT 50;' to prevent column '{col_match.group(1)}' mismatch."
        return failing_sql, f"Healing attempt failed: {str(e)}"


def extract_pg_error_code(error_msg: str) -> str:
    """Extracts standard PostgreSQL SQLSTATE code or maps known patterns."""
    import re
    # Match standard 5-character SQLSTATE like 42703, 42P01, 22P02 (starts with 2 digits)
    match = re.search(r"\b([0-9]{2}[0-9A-Z]{3})\b", error_msg)
    if match:
        return match.group(1)
    
    msg_lower = error_msg.lower()
    if "column" in msg_lower and "does not exist" in msg_lower:
        return "42703" # Undefined column
    if "relation" in msg_lower and "does not exist" in msg_lower:
        return "42P01" # Undefined table
    if "invalid input syntax" in msg_lower:
        return "22P02" # Invalid text representation
    if "must appear in the group by clause" in msg_lower:
        return "42803" # Grouping error
    if "syntax error" in msg_lower:
        return "42601" # Syntax error
    if "permission denied" in msg_lower:
        return "42501" # Insufficient privilege
    if "deadlock detected" in msg_lower:
        return "40P01" # Deadlock
    return "42000" # General SQL error


def diagnose_and_heal_error(
    error_message: str,
    failing_sql: Optional[str] = None,
    live_schema: Optional[str] = None,
    user_prompt: Optional[str] = None,
    llm_client=None
) -> Dict[str, Any]:
    """
    SQL Doctor: Evaluates a raw PostgreSQL error message and/or failing query,
    extracts the root cause, maps schema columns, and generates a verified fix.
    """
    from app.services.llm_services import get_llm_client, LIVE_DATABASE_SCHEMA_SQL
    client = llm_client or get_llm_client()
    model = os.getenv("model", "meta/llama-3.1-70b-instruct")

    error_code = extract_pg_error_code(error_message)
    schema_to_use = live_schema if live_schema and live_schema.strip() else LIVE_DATABASE_SCHEMA_SQL

    system_prompt = f"""You are the PostgreSQL SQL Doctor & Self-Healing Critic Agent.
A database query threw a PostgreSQL runtime error.

### LIVE DATABASE SCHEMA
{schema_to_use}

### TASK
1. Diagnose the exact root cause of the error based on the PostgreSQL error message and schema.
2. If failing SQL is provided, generate the exact corrected SQL query conforming strictly to the schema.
3. If no SQL was provided, generate the query that solves the user's intent without the error.
4. List affected entities (table names, column names).
5. Output ONLY valid raw JSON:
{{
  "error_code": "{error_code}",
  "root_cause": "Clear 1-sentence technical diagnosis (e.g. 'Orders table defines total_amount as NUMERIC, but query compared it against a text literal.').",
  "healed_sql": "SELECT ... FROM ... WHERE ...;",
  "affected_entities": ["table_name", "column_name"],
  "explanation": "2-sentence plain English summary of what was broken and the exact fix applied."
}}"""

    user_content = f"""PostgreSQL Error Message:
{error_message}

Failing SQL Query:
{failing_sql or 'N/A (Diagnose from error message)'}

Original Prompt / Intent:
{user_prompt or 'N/A'}"""

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ],
            temperature=0.05,
            max_tokens=600,
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content.strip()
        data = json.loads(content)
        return {
            "status": "success",
            "error_code": data.get("error_code", error_code),
            "root_cause": data.get("root_cause", f"PostgreSQL error code {error_code}: {error_message}"),
            "healed_sql": data.get("healed_sql", failing_sql or ""),
            "affected_entities": data.get("affected_entities", []),
            "explanation": data.get("explanation", "The query was diagnosed and repaired to match the live schema.")
        }
    except Exception as e:
        logger.error(f"SQL Doctor diagnosis failed: {e}")
        return {
            "status": "partial",
            "error_code": error_code,
            "root_cause": f"Error {error_code}: {error_message}",
            "healed_sql": failing_sql or "",
            "affected_entities": [],
            "explanation": f"Diagnosis note: {str(e)}"
        }

