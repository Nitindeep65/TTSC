from fastapi import APIRouter
from app.Models.schema import ClarificationRequest, ClarificationResponse
from app.services.llm_services import evaluate_user_intent

router = APIRouter(
    prefix="/api/clarification",
    tags=["clarification Engine"]
)

@router.post ("/" , response_model=ClarificationResponse)
def run_clarifiaction(request : ClarificationRequest):
    ai_response = evaluate_user_intent(
        user_prompt=request.user_prompt,
        session_history=request.session_history
    )
    return ai_response
                 