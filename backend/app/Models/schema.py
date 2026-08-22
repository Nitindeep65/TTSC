from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class ExtractedSQLData(BaseModel):
    sql_query: str
    tables_identified: List[str]
    explanation: str

class ClarificationResponse(BaseModel):
    status: str
    message: str
    extracted_data: Optional[ExtractedSQLData] = None

class ClarificationRequest(BaseModel):
    user_prompt: str
    session_history: List[Dict[str, Any]] = []