from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from typing import Generator
import ollama
from api.models.generate import GenerationRequest

router = APIRouter(prefix="/generate", tags=["generate"])

@router.post("")
async def generate_text(request: GenerationRequest):
    """Generación de texto completo"""
    try:
        response = ollama.generate(
            model=request.model,
            prompt=request.prompt,
            options={
                "temperature": request.temperature,
                "num_predict": request.max_tokens
            }
        )
        return {"response": response["response"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/stream")
async def stream_generate_text(request: GenerationRequest) -> StreamingResponse:
    """Streaming de texto en tiempo real"""
    def generate() -> Generator[str, None, None]:
        try:
            stream = ollama.generate(
                model=request.model,
                prompt=request.prompt,
                stream=True,
                options={
                    "temperature": request.temperature,
                    "num_predict": request.max_tokens
                }
            )
            for chunk in stream:
                yield chunk["response"]
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    return StreamingResponse(generate(), media_type="text/plain")