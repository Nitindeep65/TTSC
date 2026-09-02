import os
from fastapi import FastAPI
# MVP: dashboard and semantic routers are disabled for the MVP scope
# from app.routers import clarification, database, semantic, memory, settings, dashboard, guard, workspaces
from app.routers import clarification, database, memory, settings, guard, workspaces
from app.routers.workspaces import auth_router
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI(title="QueryCraft — AI-Powered PostgreSQL Safety & Intelligence Layer")

# Register Core MVP Routers
app.include_router(clarification.router)
app.include_router(database.router)
app.include_router(memory.router)
app.include_router(settings.router)
app.include_router(guard.router)
app.include_router(workspaces.router)
app.include_router(auth_router)  # CLI OAuth token exchange: /api/auth/cli-token, /api/auth/cli-verify

# MVP Disabled Routers (commented out — not deleted, recoverable)
# app.include_router(dashboard.router)   # BI Dashboard Canvas — out of MVP scope
# app.include_router(semantic.router)    # Enterprise Semantic Layer — postponed

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/")
def health():
    return {
        "message": "QueryCraft — AI-Powered PostgreSQL Safety & Intelligence Layer is online",
        "version": "2.0.0-mvp",
        "features": [
            "Zero-Hallucination Schema Grounding",
            "Automatic Self-Healing SQL Doctor (max 3 retries)",
            "PostgreSQL EXPLAIN Cost Estimator",
            "Unified Risk Classification: LOW / MEDIUM / HIGH",
            "Sequential Scan Detection & Index Advisor",
            "Schema RAG & Few-Shot Memory",
            "MCP Server: evaluate_and_heal_sql, inspect_schema, generate_safe_sql",
            "CLI: querycraft ask, check, doctor, run",
        ],
        "database_engines": ["PostgreSQL"],
        "disabled_features": ["BI Dashboard Canvas", "Semantic Layer", "ChatGPT Custom Action"],
    }

# MVP Disabled: ChatGPT Plugin Manifest & OpenAPI Action
# These endpoints are commented out as ChatGPT integration is out of MVP scope.
# To re-enable, uncomment and ensure docs/chatgpt_custom_action.json is present.

# @app.get("/.well-known/ai-plugin.json")
# def openai_plugin_manifest(): ...

# @app.get("/api/gpt-action/openapi.json")
# def get_gpt_action_openapi_schema(): ...