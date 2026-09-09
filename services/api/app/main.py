from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import catalog, curations, projects

settings = get_settings()

app = FastAPI(title="StyleSync API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(catalog.router)
app.include_router(projects.router)
app.include_router(curations.router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
