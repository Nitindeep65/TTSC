"""
Tests for QueryCraft Cost Guard Model Context Protocol (MCP) Server
"""

import pytest
import pytest_asyncio
from app.mcp_server import mcp_server
import mcp.types as types


@pytest.mark.asyncio
async def test_mcp_server_lists_evaluate_and_heal_sql_tool():
    """Verify tool registration, schema, and description in the MCP registry."""
    tools = await mcp_server.list_tools()
    tool_names = [t.name for t in tools]
    assert "evaluate_and_heal_sql" in tool_names

    tool = next(t for t in tools if t.name == "evaluate_and_heal_sql")
    assert "PostgreSQL EXPLAIN compute costs" in tool.description
    assert "sql_query" in tool.input_schema.get("properties", {})


@pytest.mark.asyncio
async def test_mcp_evaluates_and_heals_cartesian_join():
    """
    Test Case 1: Accidental Cartesian Join (users x audit_logs).
    Should auto-heal to explicit ANSI JOIN and return is_error=False.
    """
    cartesian_sql = "SELECT u.email, a.action FROM users u, audit_logs a WHERE u.email = 'user_5@example.com';"
    result = await mcp_server.call_tool(
        "evaluate_and_heal_sql",
        {"sql_query": cartesian_sql, "cost_threshold": 150.0},
    )

    assert result.is_error is False
    assert len(result.content) > 0
    text = result.content[0].text
    assert "COST GUARD HEALED" in text
    assert "JOIN audit_logs a ON u.id = a.user_id" in text
    assert "Optimized Cost:" in text


@pytest.mark.asyncio
async def test_mcp_blocks_unindexed_500k_scan():
    """
    Test Case 2: Unindexed 500k row scan on audit_logs.
    Should block execution, return is_error=True, preserve SELECT, and provide CREATE INDEX.
    """
    unindexed_sql = "SELECT COUNT(*) FROM audit_logs WHERE action = 'data_export';"
    result = await mcp_server.call_tool(
        "evaluate_and_heal_sql",
        {"sql_query": unindexed_sql, "cost_threshold": 150.0},
    )

    assert result.is_error is True
    assert len(result.content) > 0
    text = result.content[0].text
    assert "CRITICAL ERROR: EXECUTION BLOCKED" in text
    assert "CREATE INDEX idx_audit_logs_action ON audit_logs(action);" in text
    assert "SELECT COUNT(*) FROM audit_logs WHERE action = 'data_export';" in text


@pytest.mark.asyncio
async def test_mcp_verifies_already_safe_query():
    """Verify low-cost safe queries pass inspection with is_error=False."""
    safe_sql = "SELECT id, email FROM users WHERE email = 'user_1@example.com' LIMIT 1;"
    result = await mcp_server.call_tool(
        "evaluate_and_heal_sql",
        {"sql_query": safe_sql, "cost_threshold": 150.0},
    )

    assert result.is_error is False
    text = result.content[0].text
    assert "SAFE TO EXECUTE" in text


@pytest.mark.asyncio
async def test_mcp_blocks_mutating_ddl_dml():
    """Verify mutating statements (e.g. DROP TABLE) are rejected with is_error=True."""
    dangerous_sql = "DROP TABLE users CASCADE;"
    result = await mcp_server.call_tool(
        "evaluate_and_heal_sql",
        {"sql_query": dangerous_sql},
    )

    assert result.is_error is True
    text = result.content[0].text
    assert "only permits analytical read-only statements" in text
