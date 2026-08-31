import os
from fastapi import FastAPI
from app.routers import clarification, database, semantic, memory, settings, dashboard, guard, workspaces
from app.routers.workspaces import auth_router
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI(title="Text-to-SQL Clarification & Query Engine API")

# Register Routers
app.include_router(clarification.router)
app.include_router(database.router)
app.include_router(semantic.router)
app.include_router(memory.router)
app.include_router(settings.router)
app.include_router(dashboard.router)
app.include_router(guard.router)
app.include_router(workspaces.router)
app.include_router(auth_router)  # CLI OAuth token exchange: /api/auth/cli-token, /api/auth/cli-verify

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
        "message": "Text-to-SQL Clarification & Query Engine API is online",
        "features": [
            "Zero-Hallucination Schema Grounding",
            "Automatic Self-Healing Critic Loop",
            "PostgreSQL EXPLAIN Cost Estimator",
            "RAG Semantic Layer & Custom Metrics",
            "Adaptive Table/Chart Visualizer",
            "Schema RAG & Few-Shot Memory"
        ]
    }

@app.get("/.well-known/ai-plugin.json")
def openai_plugin_manifest():
    return {
        "schema_version": "v1",
        "name_for_human": "QueryCraft Database Copilot",
        "name_for_model": "querycraft",
        "description_for_human": "Query and inspect your PostgreSQL, MySQL, MongoDB, and Redis databases safely with AI schema grounding and cost guard.",
        "description_for_model": "Universal SQL and NoSQL query engine. Can list workspaces, inspect live schemas, evaluate query safety and cost via EXPLAIN, heal SQL runtime errors, and execute read-only queries.",
        "auth": {
            "type": "none"
        },
        "api": {
            "type": "openapi",
            "url": "http://localhost:8000/api/gpt-action/openapi.json"
        },
        "logo_url": "http://localhost:3000/pics/Card.png",
        "contact_email": "support@querycraft.ai",
        "legal_info_url": "http://localhost:3000"
    }

@app.get("/api/gpt-action/openapi.json")
def get_gpt_action_openapi_schema():
    import json
    schema_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "docs", "chatgpt_custom_action.json")
    if os.path.exists(schema_path):
        with open(schema_path, "r") as f:
            return json.load(f)
    return {
        "openapi": "3.1.0",
        "info": {
            "title": "QueryCraft Database AI Action",
            "version": "1.5.0"
        },
        "paths": {}
    }