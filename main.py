from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from database.core import init_db, seed_default_data
from routes import api_auth, api_events, api_tickets, api_admin, api_organizer

BASE_DIR = Path(__file__).resolve().parent

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite tables and seed demo dataset
    init_db()
    seed_default_data()
    yield

app = FastAPI(
    title="Online Ticketing Platform",
    description="Dynamic pricing event ticketing platform with authentic visuals",
    version="1.0.0",
    lifespan=lifespan
)

# Mount static assets
static_dir = BASE_DIR / "static"
static_dir.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

# Mount API Routers
app.include_router(api_auth.router)
app.include_router(api_events.router)
app.include_router(api_tickets.router)
app.include_router(api_admin.router)
app.include_router(api_organizer.router)

from fastapi.responses import FileResponse

@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    return FileResponse(static_dir / "index.html")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
