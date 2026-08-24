from fastapi import APIRouter, HTTPException
from app.Models.schema import (
    SaveVerifiedQueryRequest,
    VerifiedQuery,
    VerifiedQueriesResponse,
    SavedNotebookQuery,
    SaveNotebookQueryRequest,
    NotebookQueriesResponse,
)
from app.services.memory_service import (
    load_verified_queries,
    add_verified_query,
    delete_verified_query,
    load_notebook_queries,
    add_notebook_query,
    delete_notebook_query,
)

router = APIRouter(
    prefix="/api/memory",
    tags=["Verified Query Memory & Few-Shot RAG"]
)

@router.get("/queries", response_model=VerifiedQueriesResponse)
def get_verified_queries():
    """Returns all verified gold-standard query examples."""
    queries = load_verified_queries()
    return VerifiedQueriesResponse(
        status="success",
        queries=queries,
        total_count=len(queries)
    )

@router.post("/verify", response_model=VerifiedQuery)
def save_verified_query(request: SaveVerifiedQueryRequest):
    """Saves a user-verified gold standard query into few-shot memory."""
    try:
        new_q = add_verified_query(request)
        return new_q
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/queries/{query_id}")
def remove_verified_query(query_id: str):
    """Deletes a verified query from memory."""
    success = delete_verified_query(query_id)
    if not success:
        raise HTTPException(status_code=404, detail="Query not found")
    return {"status": "success", "message": f"Query '{query_id}' removed from memory."}


# --- SAVED QUERY NOTEBOOKS & TEAM SNIPPETS ---
@router.get("/notebook", response_model=NotebookQueriesResponse)
def get_notebook_queries():
    """Returns all saved query notebook snippets."""
    queries = load_notebook_queries()
    return NotebookQueriesResponse(
        status="success",
        queries=queries,
        total_count=len(queries)
    )

@router.post("/notebook", response_model=SavedNotebookQuery)
def create_notebook_query(request: SaveNotebookQueryRequest):
    """Saves a query snippet with tags to the notebook."""
    try:
        new_item = add_notebook_query(request)
        return new_item
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/notebook/{query_id}")
def remove_notebook_query(query_id: str):
    """Deletes a saved query snippet from the notebook."""
    success = delete_notebook_query(query_id)
    if not success:
        raise HTTPException(status_code=404, detail="Notebook query not found")
    return {"status": "success", "message": f"Notebook query '{query_id}' deleted."}

