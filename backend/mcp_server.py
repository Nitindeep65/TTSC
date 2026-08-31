#!/usr/bin/env python
"""
QueryCraft MCP Server Executable Entrypoint for Cursor IDE
"""

import sys
import os

# Ensure backend root is on sys.path
backend_root = os.path.dirname(os.path.abspath(__file__))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from app.mcp_server import main

if __name__ == "__main__":
    main()
