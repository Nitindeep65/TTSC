import os
import json
import logging
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.Models.schema import SemanticRule, CreateMetricRequest

logger = logging.getLogger(__name__)

DATA_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "semantic_rules.json")

def load_semantic_rules() -> List[SemanticRule]:
    """Loads all saved semantic rules and business metrics from storage."""
    try:
        if os.path.exists(DATA_FILE):
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                raw_list = json.load(f)
                return [SemanticRule(**item) for item in raw_list]
    except Exception as e:
        logger.error(f"Error loading semantic rules: {e}")
    return []

def save_semantic_rules(rules: List[SemanticRule]) -> bool:
    """Persists semantic rules to storage."""
    try:
        os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump([r.dict() for r in rules], f, indent=2)
        return True
    except Exception as e:
        logger.error(f"Error saving semantic rules: {e}")
        return False

def add_or_update_metric(req: CreateMetricRequest) -> SemanticRule:
    """Creates a new custom business metric or updates an existing one."""
    rules = load_semantic_rules()
    rule_id = f"metric-{int(datetime.utcnow().timestamp() * 1000)}"
    new_rule = SemanticRule(
        id=rule_id,
        name=req.name.strip(),
        definition=req.definition.strip(),
        sql_formula=req.sql_formula.strip() if req.sql_formula else None,
        category=req.category or "Custom",
        tags=req.tags or [],
        created_at=datetime.utcnow().isoformat() + "Z"
    )
    rules.append(new_rule)
    save_semantic_rules(rules)
    return new_rule

def delete_metric(metric_id: str) -> bool:
    """Deletes a business metric by ID."""
    rules = load_semantic_rules()
    filtered = [r for r in rules if r.id != metric_id]
    if len(filtered) != len(rules):
        save_semantic_rules(filtered)
        return True
    return False

def find_matching_metrics(prompt: str, top_k: int = 3) -> List[SemanticRule]:
    """
    RAG-style retrieval: Matches relevant business metrics and custom definitions
    based on keywords and token overlap in the user prompt.
    """
    rules = load_semantic_rules()
    if not rules:
        return []

    prompt_lower = prompt.lower()
    prompt_tokens = set(prompt_lower.split())

    scored_rules = []
    for rule in rules:
        score = 0
        rule_name_lower = rule.name.lower()
        
        # Exact phrase match in prompt
        if rule_name_lower in prompt_lower:
            score += 10
            
        # Token overlap with name and tags
        name_tokens = set(rule_name_lower.split())
        score += len(prompt_tokens.intersection(name_tokens)) * 3
        
        tag_tokens = set([t.lower() for t in rule.tags])
        score += len(prompt_tokens.intersection(tag_tokens)) * 2

        # Definition keyword overlap
        def_tokens = set(rule.definition.lower().split())
        score += len(prompt_tokens.intersection(def_tokens)) * 0.5

        if score > 0:
            scored_rules.append((score, rule))

    scored_rules.sort(key=lambda x: x[0], reverse=True)
    return [r for _, r in scored_rules[:top_k]]

def teach_ai_metric_from_instruction(instruction: str, llm_client=None) -> Optional[SemanticRule]:
    """
    Parses conversational user instructions like:
    'From now on, consider VIP Customer as anyone who spent over $1,000 this year'
    into a structured SemanticRule using Llama 3.1.
    """
    from app.services.llm_services import get_llm_client
    client = llm_client or get_llm_client()
    model = os.getenv("model", "meta/llama-3.1-70b-instruct")

    system_prompt = """You are a Semantic Layer & Metric Extraction Specialist.
Analyze the user's plain-English business rule instruction and extract:
1. "name": Concise metric/entity name (e.g. "VIP Customer", "Net MRR", "Churned User").
2. "definition": Clear explanation of the business rule.
3. "sql_formula": PostgreSQL WHERE clause snippet or aggregation expression.
4. "category": "Finance", "Customer", "Inventory", "Marketing", or "Operations".
5. "tags": Array of 2-4 lowercase search keywords.

Return ONLY raw valid JSON:
{
  "name": "...",
  "definition": "...",
  "sql_formula": "...",
  "category": "...",
  "tags": ["..."]
}"""

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": instruction}
            ],
            temperature=0.1,
            max_tokens=300,
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content.strip()
        data = json.loads(content)
        
        req = CreateMetricRequest(
            name=data.get("name", "Custom Rule"),
            definition=data.get("definition", instruction),
            sql_formula=data.get("sql_formula"),
            category=data.get("category", "General"),
            tags=data.get("tags", [])
        )
        return add_or_update_metric(req)
    except Exception as e:
        logger.error(f"Failed to teach AI metric: {e}")
        # Fallback metric creation
        req = CreateMetricRequest(
            name=instruction[:30] + "...",
            definition=instruction,
            category="Custom",
            tags=["custom"]
        )
        return add_or_update_metric(req)


def extract_metrics_from_policy_document(
    document_text: str,
    document_title: Optional[str] = None,
    llm_client=None
) -> List[SemanticRule]:
    """
    Document RAG: Ingests and chunks a policy document (e.g. 'Q3 Revenue Definitions', 'Retention Policy'),
    extracts all concrete business metrics, definitions, and SQL filters, and saves them to the Semantic Layer.
    """
    from app.services.llm_services import get_llm_client
    client = llm_client or get_llm_client()
    model = os.getenv("model", "meta/llama-3.1-70b-instruct")

    system_prompt = """You are a Principal Analytics Engineer & Semantic Modeler.
Analyze the provided business policy document and extract ALL distinct business metrics, formulas, or KPIs mentioned.

For each metric extracted, return:
- "name": Concise standard KPI name (e.g. "Net MRR", "Active Churn", "High Value Order", "Gross Margin")
- "definition": 1-2 sentence plain-English business rule
- "sql_formula": Standard PostgreSQL expression/condition if applicable (or null)
- "category": "Finance", "Customer", "Inventory", "Marketing", or "Operations"
- "tags": Array of 2-4 lowercase search keywords

Return ONLY valid raw JSON:
{
  "metrics": [
    {
      "name": "...",
      "definition": "...",
      "sql_formula": "...",
      "category": "...",
      "tags": ["..."]
    }
  ]
}"""

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Document: {document_title or 'Business Policy'}\n\nContent:\n{document_text[:4000]}"}
            ],
            temperature=0.1,
            max_tokens=1000,
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content.strip()
        data = json.loads(content)
        raw_metrics = data.get("metrics", [])
        
        extracted_rules = []
        for item in raw_metrics:
            if item.get("name") and item.get("definition"):
                req = CreateMetricRequest(
                    name=item["name"].strip(),
                    definition=item["definition"].strip(),
                    sql_formula=item.get("sql_formula"),
                    category=item.get("category", "General"),
                    tags=item.get("tags", [])
                )
                saved_rule = add_or_update_metric(req)
                extracted_rules.append(saved_rule)

        return extracted_rules
    except Exception as e:
        logger.error(f"Error extracting metrics from policy document: {e}")
        return []

