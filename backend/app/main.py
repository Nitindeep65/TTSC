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