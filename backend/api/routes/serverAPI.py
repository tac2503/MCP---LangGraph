from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from backend.api.routes.user import router as user_router
from backend.api.routes.auth import router as auth_router
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
app.include_router(auth_router)
app.include_router(chat_router)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request:Request, exc:RequestValidationError):
    for error in exc.errors():
        
        campo = error["loc"][-1]
        
        if campo =="email":
            return JSONResponse(
                status_code=400,
                content={
                    "error":"El correo electrónico no es válido"
                }
            )
    return JSONResponse(
        status_code=400,
        content={
            "error":"Datos Invalidos"
        }
    )
