import { NextResponse } from "next/server"

export async function GET(req) {
  const { protocol, host } = new URL(req.url)
  const currentHost = `${protocol}//${host}`

  const schema = {
    "openapi": "3.1.0",
    "info": {
      "title": "QueryCraft Database AI Action",
      "description": "Safe read-only SQL and NoSQL query engine with live schema grounding and cost protection.",
      "version": "1.5.0"
    },
    "servers": [
      {
        "url": currentHost,
        "description": "Live QueryCraft Production Server"
      }
    ],
    "paths": {
      "/api/workspaces": {
        "get": {
          "summary": "List Available Workspaces",
          "description": "Returns list of database workspaces (Production, Staging, Analytics) for the user.",
          "operationId": "listWorkspaces",
          "parameters": [
            {
              "name": "email",
              "in": "query",
              "required": false,
              "schema": {
                "type": "string"
              },
              "description": "User email identifier"
            }
          ],
          "responses": {
            "200": {
              "description": "List of database workspaces",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "status": { "type": "string" },
                      "count": { "type": "integer" },
                      "workspaces": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "id": { "type": "string" },
                            "name": { "type": "string" },
                            "engine": { "type": "string" },
                            "environment": { "type": "string" },
                            "is_active": { "type": "boolean" },
                            "has_connection": { "type": "boolean" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/api/v1/guard": {
        "post": {
          "summary": "Pre-Flight Cost Guard and Query Execution",
          "description": "Analyzes query syntax, runs EXPLAIN cost estimation, heals potential runtime errors, and executes safely.",
          "operationId": "evaluateAndHealQuery",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": ["query"],
                  "properties": {
                    "query": {
                      "type": "string",
                      "description": "The SQL or MongoDB query to inspect and execute"
                    },
                    "workspace": {
                      "type": "string",
                      "default": "Production",
                      "description": "Target workspace name"
                    },
                    "dry_run": {
                      "type": "boolean",
                      "default": false,
                      "description": "If true, only evaluates EXPLAIN cost without executing against database"
                    }
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Evaluation & Execution Results",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "status": { "type": "string" },
                    "original_query": { "type": "string" },
                    "optimized_query": { "type": "string" },
                    "action_type": { "type": "string" },
                    "is_safe": { "type": "boolean" },
                    "explanation": { "type": "string" },
                    "rows_count": { "type": "integer" },
                    "columns": { "type": "array", "items": { "type": "string" } },
                    "results": {
                      "type": "array",
                      "items": { "type": "object", "additionalProperties": true }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/api/database/connect": {
        "post": {
          "summary": "Introspect Live Schema",
          "description": "Introspects tables, columns, data types, and foreign keys from the configured database.",
          "operationId": "introspectSchema",
          "requestBody": {
            "required": false,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "connection_string": {
                      "type": "string",
                      "description": "Optional custom database URI"
                    }
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Live Introspected Schema",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "status": { "type": "string" },
                    "database_type": { "type": "string" }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return NextResponse.json(schema)
}
