from pydantic import BaseModel
from typing import List, Dict

class ChatRequest(BaseModel):
    messages: List[Dict[str, str]]
    model: str = "deepseek-r1"
    temperature: float = 0.7
    max_tokens: int = 512