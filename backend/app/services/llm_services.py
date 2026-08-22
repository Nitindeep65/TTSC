import os
import json
from openai import OpenAI
from app.Models.schema import ClarificationResponse
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=os.getenv("NVIDIA_API_KEY")
)

DATABASE_SCHEMA = """
Available tables & schemas:
- users(id, name, email, role, created_at)
- orders(id, user_id, total_amount, status, created_at)
- order_items(id, order_id, product_id, quantity, unit_price)
- products(id, name, category, stock_quantity, price)
"""

def evaluate_user_intent(user_prompt: str, session_history: list) -> ClarificationResponse:
    system_prompt = f"""You are an intelligent, helpful Text-to-SQL Assistant. Your goal is to help users formulate precise PostgreSQL queries from natural language requests.

DATABASE SCHEMA:
{DATABASE_SCHEMA}

REQUIRED QUERY SPECIFICATIONS:
1. Target Data: Specific columns or aggregated metrics (SUM, COUNT, AVG, etc.).
2. Source Entities: Relevant tables from the schema.
3. Conditions & Constraints: Date ranges, status filters, grouping, or ordering.

RULES:
1. CONTEXT IS CRUCIAL: Evaluate the latest user message COMBINED with all previous messages in the conversation history.
2. If previous messages requested a query (e.g., 'top 10 users by spend') and the latest message provides missing details (e.g., 'last 30 days'), merge these parameters into a complete request.
3. If parameters are still missing or ambiguous across the entire conversation, set "status" to "needs_clarification" and "message" to a concise follow-up question. Set "extracted_data" to null.
4. Once all required parameters are gathered across the conversation, set "status" to "complete", formulate the optimized SQL query in "extracted_data.sql_query", list the "tables_identified", and provide a 1-2 sentence "explanation".

CRITICAL: Return ONLY valid JSON:
{{
  "status": "needs_clarification" | "complete",
  "message": "Acknowledgment or follow-up question",
  "extracted_data": {{
    "sql_query": "SELECT ...",
    "tables_identified": ["table_name"],
    "explanation": "..."
  }} | null
}}"""

    messages = [{"role": "system", "content": system_prompt}]

    # Clean and append conversation history
    for item in session_history:
        role = item.get("role")
        content = item.get("content")
        if role in ["user", "assistant"] and content:
            messages.append({"role": role, "content": str(content)})

    # Append current user prompt
    messages.append({"role": "user", "content": user_prompt})

    response = client.chat.completions.create(
        model="meta/llama-3.1-8b-instruct",
        messages=messages,
        temperature=0.1,
        max_tokens=400,
        response_format={"type": "json_object"}
    )

    raw_json_string = response.choices[0].message.content
    parsed_data = json.loads(raw_json_string)
    return ClarificationResponse(**parsed_data)