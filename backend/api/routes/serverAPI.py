from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.routes.user import router as user_router
from backend.api.routes.chat import (router as chat_router )



app = FastAPI(
    title = "MCP API"

)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   
    allow_credentials = True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(user_router)
app.include_router(chat_router)
