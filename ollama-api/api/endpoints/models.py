from fastapi import APIRouter, HTTPException
import ollama

router = APIRouter(prefix="/models", tags=["models"])

@router.get("")
async def list_models():
    """Listar modelos disponibles"""
    try:
        models = ollama.list()
        return models
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))