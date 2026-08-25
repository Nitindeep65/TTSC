"""
Unit tests for LangGraph multi-agent StateGraph nodes (services/sql_graph.py).
Tests node state transitions, ambiguity evaluation, intent routing, critic healing, and visual routing.
"""

import pytest
from unittest.mock import patch, MagicMock
from app.services.sql_graph import (
    intent_and_clarifier_node,
    context_retriever_node,
    query_compiler_node,
    execute_and_guard_node,
    critic_healer_node,
    visualizer_router_node,
    route_after_clarifier,
    route_after_execution,
    detect_visual_intent,
)
from app.Models.schema import VisualIntent, ClarificationResponse, ExtractedSQLData


class TestLangGraphNodes:
    """Test suite for the 6 individual LangGraph StateGraph nodes."""

    @pytest.mark.asyncio
    async def test_intent_node_ambiguous_prompt_returns_needs_clarification(self):
        """Ambiguous prompt lacking date bounds or filters should transition to needs_clarification."""
        state = {
            "user_prompt": "Show top users",
            "connection_uri": None,
            "session_history": [],
            "live_schema": None,
        }

        mock_eval = ClarificationResponse(
            status="needs_clarification",
            message="Which metric (spend or orders) and date range should we use?",
            extracted_data=None,
            visual_intent=VisualIntent(should_visualize=False, recommended_chart="table")
        )

        with patch("app.services.sql_graph.evaluate_user_intent", return_value=mock_eval):
            next_state = await intent_and_clarifier_node(state)

        assert next_state["status"] == "needs_clarification"
        assert "Which metric" in next_state["clarification_message"]
        assert next_state["generated_query"] is None
        assert route_after_clarifier(next_state) == "end"

    @pytest.mark.asyncio
    async def test_intent_node_clear_prompt_proceeds_to_context_retriever(self):
        """Complete prompt should transition to intent_clear with target tables identified."""
        state = {
            "user_prompt": "Find completed orders from last 7 days",
            "connection_uri": None,
            "session_history": [],
            "live_schema": None,
        }

        mock_extracted = ExtractedSQLData(
            sql_query="SELECT * FROM orders WHERE status = 'completed' AND created_at >= NOW() - INTERVAL '7 days';",
            tables_identified=["orders"],
            explanation="Returns completed orders from last 7 days.",
            visual_intent=VisualIntent(should_visualize=False, recommended_chart="table"),
            matched_metrics=[]
        )
        mock_eval = ClarificationResponse(
            status="complete",
            message="Query compiled successfully.",
            extracted_data=mock_extracted,
            visual_intent=mock_extracted.visual_intent
        )

        with patch("app.services.sql_graph.evaluate_user_intent", return_value=mock_eval):
            next_state = await intent_and_clarifier_node(state)

        assert next_state["status"] == "intent_clear"
        assert next_state["generated_query"] == mock_extracted.sql_query
        assert next_state["tables_identified"] == ["orders"]
        assert route_after_clarifier(next_state) == "context_retriever"

    @pytest.mark.asyncio
    async def test_context_retriever_node_populates_schema_and_rag(self, sample_pg_schema):
        """Context retriever should inject schema DDL, semantic rules RAG, and few-shot pairs."""
        state = {
            "user_prompt": "Find revenue per customer",
            "connection_uri": None,
            "live_schema": sample_pg_schema,
        }

        with patch("app.services.sql_graph.find_matching_metrics", return_value=["Total Spend"]):
            with patch("app.services.sql_graph.find_relevant_few_shot_examples", return_value=[{"prompt": "sample", "sql": "SELECT 1"}]):
                next_state = await context_retriever_node(state)

        assert next_state["live_schema"] == sample_pg_schema
        assert next_state["matched_metrics"] == ["Total Spend"]
        assert len(next_state["few_shot_examples"]) > 0

    @pytest.mark.asyncio
    async def test_query_compiler_node_enforces_safety(self, sample_pg_schema):
        """Compiler node must enforce validate_and_enforce_sql_safety on output query."""
        state = {
            "user_prompt": "Get all active users",
            "connection_uri": None,
            "live_schema": sample_pg_schema,
            "generated_query": "SELECT id, email FROM users WHERE is_active = TRUE",
            "semantic_rules": "",
            "few_shot_examples": "",
            "database_type": "postgres",
        }

        next_state = await query_compiler_node(state)
        assert next_state["status"] == "complete"
        assert "LIMIT 50;" in next_state["generated_query"]

    @pytest.mark.asyncio
    async def test_critic_healer_node_increments_retry_and_heals_query(self, sample_pg_schema):
        """Critic healer node should diagnose runtime error and update generated_query with healed SQL."""
        state = {
            "user_prompt": "Find user emails",
            "generated_query": "SELECT user_email FROM users;",
            "live_schema": sample_pg_schema,
            "database_type": "postgres",
            "db_error": "psycopg2.errors.UndefinedColumn: column 'user_email' does not exist in table users",
            "retry_count": 0,
        }

        healed_sql = "SELECT email FROM users LIMIT 50;"
        mock_diagnosis = "Fixed column user_email -> email"

        with patch("app.services.sql_graph.heal_sql_with_critic", return_value=(healed_sql, mock_diagnosis)):
            next_state = await critic_healer_node(state)

        assert next_state["retry_count"] == 1
        assert next_state["generated_query"] == healed_sql
        assert next_state["db_error"] is None
        assert next_state["healing_info"]["was_healed"] is True
        assert next_state["healing_info"]["diagnosis"] == mock_diagnosis

    @pytest.mark.asyncio
    async def test_visualizer_router_node_sets_chart_types(self):
        """Visualizer node routes line/bar/pie charts based on visual intent and result columns."""
        state = {
            "generated_query": "SELECT created_at, SUM(total_amount) AS revenue FROM orders GROUP BY 1;",
            "result_columns": ["created_at", "revenue"],
            "query_results": [{"created_at": "2024-01-01", "revenue": 500}],
            "row_count": 1,
            "visual_intent": {
                "should_visualize": True,
                "recommended_chart": "line",
                "x_key": "created_at",
                "y_key": "revenue",
                "title": "Daily Revenue Trend",
            },
        }

        next_state = await visualizer_router_node(state)
        assert next_state["visual_intent"]["recommended_chart"] == "line"
        assert next_state["visual_intent"]["x_key"] == "created_at"
        assert next_state["visual_intent"]["y_key"] == "revenue"

    def test_detect_visual_intent_nlp(self):
        """NLP visual intent parser detects chart keywords accurately."""
        trend_intent = detect_visual_intent("Show daily order revenue trend over time")
        assert trend_intent.should_visualize is True
        assert trend_intent.recommended_chart in ["line", "area"]

        dist_intent = detect_visual_intent("Show user distribution breakdown by country")
        assert dist_intent.should_visualize is True
        assert dist_intent.recommended_chart in ["pie", "bar"]

        table_intent = detect_visual_intent("List all users created today")
        assert table_intent.recommended_chart == "table"
