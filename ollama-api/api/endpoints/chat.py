from fastapi import APIRouter, HTTPException
import ollama
from api.models.chat import ChatRequest

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("")
async def chat_completion(request: ChatRequest):
    """Chat con contexto histórico"""
    try:
        response = ollama.chat(
            model=request.model,
            messages=request.messages,
            options={
                "temperature": request.temperature,
                "num_predict": request.max_tokens
            }
        )
        return {"response": response["message"]["content"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))