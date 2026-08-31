"""
Universal MCP Client Test & Demonstration Script
Demonstrates how any MCP-compatible client (Gemini, Claude Desktop, Cursor,
or custom LangGraph/LangChain agentic workflows) interacts with the QueryCraft Cost Guard MCP Server.
"""

import sys
import os
import asyncio
from typing import Dict, Any

# Ensure backend root is on sys.path
backend_root = os.path.dirname(os.path.abspath(__file__))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


async def run_mcp_client_inspection():
    print("=" * 70)
    print(" QueryCraft MCP Server — Universal Client Protocol Verification")
    print(" Compatible with: Gemini, Claude Desktop, Cursor, LangGraph, Agents")
    print("=" * 70)

    server_params = StdioServerParameters(
        command=os.path.join(backend_root, ".venv", "bin", "python"),
        args=["-m", "app.mcp_server"],
        cwd=backend_root,
        env={"PYTHONPATH": backend_root},
    )

    async with stdio_client(server_params) as (read_stream, write_stream):
        async with ClientSession(read_stream, write_stream) as session:
            # 1. Initialize MCP Handshake
            await session.initialize()
            print("\n[Handshake] Successfully connected to MCP Server via stdio.")

            # 2. List Available Tools
            tools_result = await session.list_tools()
            print(f"\n[Tools Discovery] Found {len(tools_result.tools)} tool(s):")
            for t in tools_result.tools:
                print(f"  - Tool: {t.name}")
                print(f"    Description: {t.description[:85]}...")

            # 3. Test Case 1: Accidental Cartesian Join (Auto-Healed)
            print("\n" + "-" * 70)
            print("▶ Scenario 1: Accidental Cartesian Join (Cross Join Trap)")
            cartesian_query = (
                "SELECT u.email, a.action "
                "FROM users u, audit_logs a "
                "WHERE u.email = 'user_5@example.com';"
            )
            print(f"Input Query: {cartesian_query}")
            
            result_1 = await session.call_tool(
                "evaluate_and_heal_sql",
                arguments={"sql_query": cartesian_query, "cost_threshold": 150.0},
            )
            print(f"Is Error Flag: {result_1.is_error}")
            print(f"Output Content:\n{result_1.content[0].text}")

            # 4. Test Case 2: Unindexed 500k Scan (Execution Blocked)
            print("\n" + "-" * 70)
            print("▶ Scenario 2: Unindexed 500,000-Row Scan (Infrastructure Block)")
            unindexed_query = "SELECT COUNT(*) FROM audit_logs WHERE action = 'data_export';"
            print(f"Input Query: {unindexed_query}")

            result_2 = await session.call_tool(
                "evaluate_and_heal_sql",
                arguments={"sql_query": unindexed_query, "cost_threshold": 150.0},
            )
            print(f"Is Error Flag (Blocked): {result_2.is_error}")
            print(f"Output Content:\n{result_2.content[0].text}")

            # 5. Test Case 3: Already Safe Query (Verified)
            print("\n" + "-" * 70)
            print("▶ Scenario 3: Pre-Verified Safe Query")
            safe_query = "SELECT id, email FROM users WHERE email = 'admin@example.com' LIMIT 1;"
            print(f"Input Query: {safe_query}")

            result_3 = await session.call_tool(
                "evaluate_and_heal_sql",
                arguments={"sql_query": safe_query, "cost_threshold": 150.0},
            )
            print(f"Is Error Flag: {result_3.is_error}")
            print(f"Output Content:\n{result_3.content[0].text}")

            print("\n" + "=" * 70)
            print("All MCP client interactions completed successfully.")
            print("=" * 70)


if __name__ == "__main__":
    asyncio.run(run_mcp_client_inspection())
