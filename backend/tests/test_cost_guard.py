import pytest
from app.services.cost_guard_graph import (
    parse_explain_plan,
    CostMetrics,
    GuardState,
    evaluate_cost,
    should_continue,
    cost_guard_app,
)

def test_explain_plan_parser_detects_seq_scan():
    mock_explain = [{
        "Plan": {
            "Node Type": "Seq Scan",
            "Relation Name": "orders",
            "Total Cost": 842.50,
            "Startup Cost": 0.0,
            "Plan Rows": 15200,
            "Plan Width": 64,
            "Filter": "(total_amount > 500)"
        }
    }]
    _, metrics = parse_explain_plan(mock_explain)
    assert metrics.has_seq_scan is True
    assert "orders" in metrics.scanned_tables
    assert metrics.total_cost == 842.50
    assert metrics.plan_rows == 15200
    assert len(metrics.index_suggestions) > 0


def test_explain_plan_parser_handles_index_scan():
    mock_explain = [{
        "Plan": {
            "Node Type": "Index Scan",
            "Relation Name": "users",
            "Index Name": "users_pkey",
            "Total Cost": 8.45,
            "Startup Cost": 0.28,
            "Plan Rows": 1,
            "Plan Width": 32,
        }
    }]
    _, metrics = parse_explain_plan(mock_explain)
    assert metrics.has_seq_scan is False
    assert metrics.total_cost == 8.45
    assert metrics.plan_rows == 1


def test_evaluate_cost_flags_high_cost_as_unsafe():
    state = GuardState(
        original_query="SELECT * FROM orders;",
        current_query="SELECT * FROM orders;",
        cost_threshold=100.0,
        cost_metrics=CostMetrics(
            total_cost=450.0,
            has_seq_scan=True,
            plan_rows=5000,
        ),
    )
    result = evaluate_cost(state)
    assert result["is_safe"] is False


def test_evaluate_cost_passes_low_cost_query():
    state = GuardState(
        original_query="SELECT id FROM orders WHERE id = 1;",
        current_query="SELECT id FROM orders WHERE id = 1;",
        cost_threshold=100.0,
        cost_metrics=CostMetrics(
            total_cost=8.5,
            has_seq_scan=False,
            plan_rows=1,
        ),
    )
    result = evaluate_cost(state)
    assert result["is_safe"] is True


def test_should_continue_router():
    # Safe query stops
    safe_state = GuardState(
        original_query="SELECT 1;",
        current_query="SELECT 1;",
        is_safe=True,
    )
    assert should_continue(safe_state) == "__end__"

    # Unsafe query with iterations left routes to auto_heal_query
    unsafe_state = GuardState(
        original_query="SELECT * FROM orders;",
        current_query="SELECT * FROM orders;",
        is_safe=False,
        iteration=0,
        max_iterations=2,
    )
    assert should_continue(unsafe_state) == "auto_heal_query"


def test_langgraph_end_to_end_invocation():
    initial_state = GuardState(
        original_query="SELECT * FROM orders WHERE status = 'shipped';",
        current_query="SELECT * FROM orders WHERE status = 'shipped';",
        cost_threshold=100.0,
        max_iterations=1,
    )
    result = cost_guard_app.invoke(initial_state)
    assert "current_query" in result
    assert "cost_metrics" in result
    assert result["iteration"] >= 1


def test_honeypot_cartesian_trap_detected():
    initial_state = GuardState(
        original_query="SELECT u.email, a.action FROM users u, audit_logs a WHERE u.email = 'user_5@example.com';",
        current_query="SELECT u.email, a.action FROM users u, audit_logs a WHERE u.email = 'user_5@example.com';",
        cost_threshold=150.0,
        max_iterations=1,
    )
    result = cost_guard_app.invoke(initial_state)
    assert result["initial_metrics"].total_cost > 100000.0  # Massive cartesian cost
    assert result["initial_metrics"].has_seq_scan is True
    assert "audit_logs" in result["initial_metrics"].scanned_tables


def test_honeypot_unindexed_500k_scan_detected():
    initial_state = GuardState(
        original_query="SELECT COUNT(*) FROM audit_logs WHERE action = 'data_export';",
        current_query="SELECT COUNT(*) FROM audit_logs WHERE action = 'data_export';",
        cost_threshold=150.0,
        max_iterations=1,
    )
    result = cost_guard_app.invoke(initial_state)
    assert result["initial_metrics"].total_cost > 10000.0
    assert result["initial_metrics"].plan_rows == 500000
    assert result["initial_metrics"].has_seq_scan is True
    assert result["action_type"] == "blocked_needs_index"
    assert result["current_query"].startswith("SELECT")  # Must NOT overwrite user SELECT with DDL
    assert "idx_audit_logs_action" in result["suggested_index"]

