from fastapi import APIRouter
import ollama

router = APIRouter(prefix="/health", tags=["health"])

@router.get("")
async def health_check():
    """Verificar estado del servicio"""
    return {"status": "active", "ollama_version": ollama.version()}