from backend.Database.config import create_tables
import uvicorn

if __name__ == "__main__":
    create_tables()
    uvicorn.run(
        "backend.api.routes.serverAPI:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )