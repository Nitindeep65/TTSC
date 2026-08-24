import os
import json
import logging
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.Models.schema import VerifiedQuery, SaveVerifiedQueryRequest, TableInfo

logger = logging.getLogger(__name__)

DATA_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "verified_queries.json")

def load_verified_queries() -> List[VerifiedQuery]:
    """Loads all saved verified queries from storage."""
    try:
        if os.path.exists(DATA_FILE):
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                raw_list = json.load(f)
                return [VerifiedQuery(**item) for item in raw_list]
    except Exception as e:
        logger.error(f"Error loading verified queries: {e}")
    return []

def save_verified_queries(queries: List[VerifiedQuery]) -> bool:
    """Persists verified queries to storage."""
    try:
        os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump([q.dict() for q in queries], f, indent=2)
        return True
    except Exception as e:
        logger.error(f"Error saving verified queries: {e}")
        return False

def add_verified_query(req: SaveVerifiedQueryRequest) -> VerifiedQuery:
    """Saves a user-verified gold standard query."""
    queries = load_verified_queries()
    query_id = f"vq-{int(datetime.utcnow().timestamp() * 1000)}"
    new_query = VerifiedQuery(
        id=query_id,
        user_prompt=req.user_prompt.strip(),
        verified_sql=req.verified_sql.strip(),
        tables=req.tables or [],
        explanation=req.explanation.strip() if req.explanation else None,
        tags=req.tags or [],
        created_at=datetime.utcnow().isoformat() + "Z"
    )
    queries.append(new_query)
    save_verified_queries(queries)
    return new_query

def delete_verified_query(query_id: str) -> bool:
    """Deletes a verified query by ID."""
    queries = load_verified_queries()
    filtered = [q for q in queries if q.id != query_id]
    if len(filtered) != len(queries):
        save_verified_queries(filtered)
        return True
    return False

def find_relevant_few_shot_examples(prompt: str, top_k: int = 2) -> List[VerifiedQuery]:
    """
    RAG-style retrieval for few-shot in-context learning:
    Fetches the top verified query examples most semantically relevant to the prompt.
    """
    queries = load_verified_queries()
    if not queries:
        return []

    prompt_lower = prompt.lower()
    prompt_tokens = set(prompt_lower.split())

    scored_queries = []
    for q in queries:
        score = 0
        q_prompt_lower = q.user_prompt.lower()

        # Token overlap with user prompt
        q_tokens = set(q_prompt_lower.split())
        score += len(prompt_tokens.intersection(q_tokens)) * 3

        # Tag overlap
        tag_tokens = set([t.lower() for t in q.tags])
        score += len(prompt_tokens.intersection(tag_tokens)) * 2

        # Table names overlap
        table_tokens = set([t.lower() for t in q.tables])
        score += len(prompt_tokens.intersection(table_tokens)) * 1.5

        if score > 0:
            scored_queries.append((score, q))

    scored_queries.sort(key=lambda x: x[0], reverse=True)
    return [q for _, q in scored_queries[:top_k]]

def prune_schema_for_prompt(all_tables: List[TableInfo], prompt: str, max_tables: int = 8) -> List[TableInfo]:
    """
    Schema RAG: For large databases (e.g. 20+ tables), dynamically scores and selects
    the top relevant tables based on keyword, column name, and foreign key connections.
    """
    if len(all_tables) <= max_tables:
        return all_tables

    prompt_lower = prompt.lower()
    prompt_tokens = set(prompt_lower.split())

    scored_tables = []
    for table in all_tables:
        score = 0
        t_name = table.table_name.lower()
        if t_name in prompt_lower or any(token in t_name for token in prompt_tokens):
            score += 10

        for col in table.columns:
            c_name = col.name.lower()
            if c_name in prompt_lower or any(token in c_name for token in prompt_tokens):
                score += 3
            if col.is_foreign_key:
                score += 1 # keep relational bridges

        scored_tables.append((score, table))

    scored_tables.sort(key=lambda x: x[0], reverse=True)
    return [t for _, t in scored_tables[:max_tables]]
