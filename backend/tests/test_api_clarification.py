"""
Integration and contract tests for the /api/clarification router (routers/clarification.py).
Tests API response contracts against Pydantic models with zero external LLM dependencies.
"""

import pytest
from unittest.mock import patch, AsyncMock
from app.Models.schema import ClarificationResponse, ExtractedSQLData, VisualIntent


class TestClarificationApi:
    """Test suite for POST /api/clarification/ and GET /api/clarification/schema."""

    def test_get_live_schema_contract(self, client):
        """GET /api/clarification/schema returns valid default PostgreSQL schema structure."""
        response = client.get("/api/clarification/schema")
        assert response.status_code == 200
        data = response.json()
        assert "tables" in data
        assert isinstance(data["tables"], list)
        assert len(data["tables"]) > 0
        table_names = [t["table_name"] for t in data["tables"]]
        assert "users" in table_names
        assert "orders" in table_names

    def test_clarification_endpoint_needs_clarification(self, client):
        """POST /api/clarification/ returns status 'needs_clarification' for ambiguous requests."""
        mock_graph_return = {
            "status": "needs_clarification",
            "clarification_message": "Which time window and order status would you like to filter by?",
            "generated_query": None,
            "tables_identified": [],
            "explanation": None,
            "visual_intent": {
                "should_visualize": False,
                "recommended_chart": "table",
                "x_key": None,
                "y_key": None,
                "title": "Query Visualization"
            },
            "matched_metrics": []
        }

        with patch("app.routers.clarification.querycraft_graph.ainvoke", new_callable=AsyncMock) as mock_invoke:
            mock_invoke.return_value = mock_graph_return

            payload = {
                "user_prompt": "Show top users",
                "session_history": []
            }
            response = client.post("/api/clarification/", json=payload)

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "needs_clarification"
        assert "Which time window" in data["message"]
        assert data["extracted_data"] is None
        # Pydantic validation
        validated = ClarificationResponse(**data)
        assert validated.status == "needs_clarification"

    def test_clarification_endpoint_complete_query(self, client):
        """POST /api/clarification/ returns status 'complete' and ExtractedSQLData for complete requests."""
        mock_sql = "SELECT id, email, created_at FROM users WHERE is_active = TRUE LIMIT 50;"
        mock_graph_return = {
            "status": "complete",
            "clarification_message": "Here is the compiled PostgreSQL query.",
            "generated_query": mock_sql,
            "tables_identified": ["users"],
            "explanation": "Retrieves all active users ordered by signup date.",
            "visual_intent": {
                "should_visualize": False,
                "recommended_chart": "table",
                "x_key": None,
                "y_key": None,
                "title": "Query Visualization"
            },
            "matched_metrics": ["Active Users"]
        }

        with patch("app.routers.clarification.querycraft_graph.ainvoke", new_callable=AsyncMock) as mock_invoke:
            mock_invoke.return_value = mock_graph_return

            payload = {
                "user_prompt": "Find all active users with their emails",
                "session_history": []
            }
            response = client.post("/api/clarification/", json=payload)

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "complete"
        assert data["extracted_data"] is not None
        assert data["extracted_data"]["sql_query"] == mock_sql
        assert data["extracted_data"]["tables_identified"] == ["users"]
        assert data["extracted_data"]["matched_metrics"] == ["Active Users"]

        # Validate with Pydantic
        validated = ClarificationResponse(**data)
        assert validated.extracted_data.sql_query == mock_sql

    def test_clarification_endpoint_visual_trend(self, client):
        """POST /api/clarification/ passes through chart intent recommendations."""
        mock_sql = "SELECT DATE(created_at) AS date, SUM(total_amount) AS revenue FROM orders GROUP BY 1 ORDER BY 1 LIMIT 50;"
        mock_graph_return = {
            "status": "complete",
            "clarification_message": "Here is your 30-day revenue trend query.",
            "generated_query": mock_sql,
            "tables_identified": ["orders"],
            "explanation": "Aggregates revenue by day.",
            "visual_intent": {
                "should_visualize": True,
                "recommended_chart": "line",
                "x_key": "date",
                "y_key": "revenue",
                "title": "Daily Order Revenue Trend"
            },
            "matched_metrics": ["Daily Revenue"]
        }

        with patch("app.routers.clarification.querycraft_graph.ainvoke", new_callable=AsyncMock) as mock_invoke:
            mock_invoke.return_value = mock_graph_return

            payload = {
                "user_prompt": "Show daily revenue trend over the last 30 days",
                "session_history": []
            }
            response = client.post("/api/clarification/", json=payload)

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "complete"
        assert data["visual_intent"]["should_visualize"] is True
        assert data["visual_intent"]["recommended_chart"] == "line"
        assert data["extracted_data"]["visual_intent"]["recommended_chart"] == "line"


class TestFuzzySchemaMatching:
    """Unit tests for typo-tolerant schema resolution and string similarity."""

    def test_calculate_string_similarity(self):
        from app.services.llm_services import calculate_string_similarity

        assert calculate_string_similarity("counterparties", "counterparties") == 1.0
        assert calculate_string_similarity("counterpatis", "counterparties") > 0.8
        assert calculate_string_similarity("contarcts", "contracts") > 0.75
        assert calculate_string_similarity("usrs", "users") > 0.75
        assert calculate_string_similarity("apple", "banana") < 0.3

    def test_find_closest_schema_table(self):
        from app.services.llm_services import find_closest_schema_table

        tables = ["users", "contracts", "counterparties", "orders", "products"]
        assert find_closest_schema_table("counterpatis", tables) == "counterparties"
        assert find_closest_schema_table("contarcts", tables) == "contracts"
        assert find_closest_schema_table("usrs", tables) == "users"
        assert find_closest_schema_table("prodcts", tables) == "products"
        assert find_closest_schema_table("xyzabc", tables) is None

    def test_extract_table_name_with_typos(self):
        from app.services.llm_services import extract_table_name_from_prompt, compile_fallback_query

        tables = ["users", "contracts", "counterparties"]
        assert extract_table_name_from_prompt("give me the list of the counterpatis", tables) == "counterparties"
        assert extract_table_name_from_prompt("show contarcts", tables) == "contracts"
        assert extract_table_name_from_prompt("bring all usrs", tables) == "users"

        res = compile_fallback_query(
            user_prompt="give me the list of the counterpatis",
            live_schema="CREATE TABLE counterparties (id INT, name TEXT);"
        )
        assert res.status == "complete"
        assert res.extracted_data.sql_query == "SELECT * FROM counterparties LIMIT 50;"

        # Multi-word space separated typos (e.g. "ocunter parties")
        assert extract_table_name_from_prompt("give the list of the ocunter parties", tables) == "counterparties"
        assert extract_table_name_from_prompt("give the list of the counter parties", tables) == "counterparties"

        res_multi = compile_fallback_query(
            user_prompt="give the list of the ocunter parties",
            live_schema="CREATE TABLE counterparties (id INT, name TEXT);"
        )
        assert res_multi.status == "complete"
        assert res_multi.extracted_data.sql_query == "SELECT * FROM counterparties LIMIT 50;"


