from fastapi import APIRouter, HTTPException
from app.Models.schema import (
    SaveVerifiedQueryRequest,
    VerifiedQuery,
    VerifiedQueriesResponse,
)
from app.services.memory_service import (
    load_verified_queries,
    add_verified_query,
    delete_verified_query,
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
