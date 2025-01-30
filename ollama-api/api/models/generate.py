from pydantic import BaseModel

class GenerationRequest(BaseModel):
    prompt: str
    model: str = "deepseek-r1:14b"
    temperature: float = 0.7
    max_tokens: int = 512