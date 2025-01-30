from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.endpoints import generate, chat, models, health

app = FastAPI(
    title="Ollama API Wrapper",
    description="API para interactuar con modelos LLM mediante Ollama",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(generate.router)
app.include_router(chat.router)
app.include_router(models.router)
app.include_router(health.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)