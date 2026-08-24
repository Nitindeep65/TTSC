import re
import json
import logging
from typing import Dict, Any, List, Tuple
import psycopg2
from psycopg2.extras import RealDictCursor
from app.Models.schema import ExplainPlanResponse

logger = logging.getLogger(__name__)

def run_explain_plan(connection_uri: str, sql_query: str) -> ExplainPlanResponse:
    """
    Executes PostgreSQL EXPLAIN (FORMAT JSON, COSTS TRUE, VERBOSE TRUE)
    and returns a structured performance grading and index recommendations.
    """
    clean_query = sql_query.strip().rstrip(";")
    if not (re.match(r"^\s*(?:SELECT|WITH)\b", clean_query, re.IGNORECASE)):
        raise ValueError("EXPLAIN can only be run on SELECT queries.")

    explain_sql = f"EXPLAIN (FORMAT JSON, COSTS TRUE, VERBOSE TRUE) {clean_query};"
    
    conn = None
    try:
        conn = psycopg2.connect(connection_uri, connect_timeout=8)
        conn.set_session(readonly=True, autocommit=True)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SET statement_timeout = '5000';")
        cursor.execute(explain_sql)
        
        row = cursor.fetchone()
        cursor.close()
        
        raw_plan_data = row.get("QUERY PLAN") if row else []
        if isinstance(raw_plan_data, list) and len(raw_plan_data) > 0:
            plan_root = raw_plan_data[0].get("Plan", {})
        elif isinstance(raw_plan_data, dict):
            plan_root = raw_plan_data.get("Plan", {})
        else:
            plan_root = {}

        total_cost = float(plan_root.get("Total Cost", 0.0))
        startup_cost = float(plan_root.get("Startup Cost", 0.0))
        plan_rows = int(plan_root.get("Plan Rows", 1))
        plan_width = int(plan_root.get("Plan Width", 0))

        # Traverse node tree for scan types and sequential scans
        scan_details: List[str] = []
        index_recommendations: List[str] = []
        has_seq_scan = False

        def traverse_nodes(node: Dict[str, Any]):
            nonlocal has_seq_scan
            node_type = node.get("Node Type", "Unknown")
            rel_name = node.get("Relation Name")
            filter_cond = node.get("Filter")

            if "Seq Scan" in node_type:
                has_seq_scan = True
                desc = f"Sequential Scan on '{rel_name}'"
                if filter_cond:
                    desc += f" (Filter: {filter_cond})"
                    # Suggest Index
                    clean_filter_col = re.findall(r"\(?([a-zA-Z0-9_]+)\)?\s*(?:=|<|>|LIKE|ILIKE|IN)", str(filter_cond))
                    if clean_filter_col and rel_name:
                        col = clean_filter_col[0]
                        index_recommendations.append(
                            f"CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_{rel_name}_{col} ON {rel_name}({col});"
                        )
                scan_details.append(desc)

            elif "Index Scan" in node_type or "Index Only Scan" in node_type:
                idx_name = node.get("Index Name", "index")
                scan_details.append(f"Index Scan using '{idx_name}' on '{rel_name}'")

            elif "Bitmap Heap Scan" in node_type:
                scan_details.append(f"Bitmap Heap Scan on '{rel_name}'")

            elif "Join" in node_type:
                scan_details.append(f"{node_type}")

            # Recurse children
            for child in node.get("Plans", []):
                traverse_nodes(child)

        traverse_nodes(plan_root)

        # Performance Grading
        if total_cost < 60 and not (has_seq_scan and total_cost > 30):
            rating = "fast"
            rating_label = "Optimal / Indexed (Low Cost)"
        elif total_cost < 300:
            rating = "moderate"
            rating_label = "Moderate (Acceptable Overhead)"
        else:
            rating = "heavy"
            rating_label = "Heavy / Slow Query (Consider Indexing)"

        # Deduplicate index recommendations
        unique_index_recs = list(set(index_recommendations))

        return ExplainPlanResponse(
            status="success",
            total_cost=total_cost,
            startup_cost=startup_cost,
            plan_rows=plan_rows,
            plan_width=plan_width,
            has_seq_scan=has_seq_scan,
            scan_details=scan_details,
            performance_rating=rating,
            rating_label=rating_label,
            index_recommendations=unique_index_recs,
            raw_plan=plan_root
        )

    except Exception as e:
        logger.error(f"EXPLAIN plan failed: {e}")
        # Fallback response
        return ExplainPlanResponse(
            status="error",
            total_cost=0.0,
            startup_cost=0.0,
            plan_rows=0,
            plan_width=0,
            has_seq_scan=False,
            scan_details=[f"EXPLAIN evaluation unavailable: {str(e)}"],
            performance_rating="moderate",
            rating_label="Estimated Standard Cost",
            index_recommendations=[]
        )
    finally:
        if conn:
            conn.close()
