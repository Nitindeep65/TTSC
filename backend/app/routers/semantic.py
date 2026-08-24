from fastapi import APIRouter, HTTPException
from app.Models.schema import (
    CreateMetricRequest,
    TeachAIRequest,
    PolicyUploadRequest,
    PolicyUploadResponse,
    SemanticRule,
    SemanticMetricsResponse,
)
from app.services.semantic_service import (
    load_semantic_rules,
    add_or_update_metric,
    delete_metric,
    teach_ai_metric_from_instruction,
    extract_metrics_from_policy_document,
)

router = APIRouter(
    prefix="/api/semantic",
    tags=["Semantic Layer & Custom Business Metrics"]
)

@router.get("/metrics", response_model=SemanticMetricsResponse)
def get_metrics():
    """Returns all custom business metrics and glossary rules."""
    rules = load_semantic_rules()
    return SemanticMetricsResponse(
        status="success",
        metrics=rules,
        total_count=len(rules)
    )

@router.post("/metrics", response_model=SemanticRule)
def create_metric(request: CreateMetricRequest):
    """Creates a new explicit business metric or rule."""
    try:
        new_rule = add_or_update_metric(request)
        return new_rule
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/metrics/{metric_id}")
def remove_metric(metric_id: str):
    """Deletes a business metric by ID."""
    success = delete_metric(metric_id)
    if not success:
        raise HTTPException(status_code=404, detail="Metric not found")
    return {"status": "success", "message": f"Metric '{metric_id}' deleted."}

@router.post("/teach", response_model=SemanticRule)
def teach_ai(request: TeachAIRequest):
    """
    Conversational 'Teach the AI' endpoint:
    Parses natural language instructions into structured business rules.
    """
    try:
        rule = teach_ai_metric_from_instruction(request.instruction.strip())
        if not rule:
            raise ValueError("Could not extract a valid business rule from instruction.")
        return rule
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/upload-policy", response_model=PolicyUploadResponse)
def upload_policy_document(request: PolicyUploadRequest):
    """
    Document RAG: Upload a business policy document (text, markdown, CSV, or extracted PDF),
    automatically extract KPI definitions and formulas, and store in the Semantic Layer.
    """
    try:
        extracted = extract_metrics_from_policy_document(
            document_text=request.document_text.strip(),
            document_title=request.document_title
        )
        return PolicyUploadResponse(
            status="success",
            extracted_metrics=extracted,
            count=len(extracted),
            message=f"Successfully extracted and indexed {len(extracted)} business metrics into the Semantic Layer."
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Policy processing failed: {str(e)}")

