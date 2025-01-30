from fastapi import FastAPI

def create_app() -> FastAPI:
    app = FastAPI(
        title="Ollama API Wrapper",
        description="API para interactuar con modelos LLM mediante Ollama",
        version="1.0.0"
    )
    return app