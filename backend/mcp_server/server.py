import os
import sys
import requests
from fastmcp import FastMCP
from pydantic import ValidationError


PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.api.routes.user import create_user, get_user_by_cedula, get_user_by_email
from backend.Database.config import SessionLocal
from backend.Schemas.usuario import usuarioCreate


mcp = FastMCP("Sistema de usuarios")

@mcp.tool()
def registrar_usuario(nombre:str, cedula:str, email:str, celular:str):
    """Registra un usuario en la base de datos."""
    try:
        json = usuarioCreate(
                nombre=nombre,
                cedula=cedula,
                email=email,
                celular=celular
            )
    except ValidationError:
        return {"error":"El correo electrónico es inválido"}
    url = "http://localhost:8000/users/create"
    response = requests.post(url, json=json.model_dump())
    return response.json()
@mcp.tool()
def obtener_usuario_cedula(cedula:str):
    """Consulta un usuario por número de cédula."""

    url = f"http://localhost:8000/users/get_by_cedula/{cedula}"
    response = requests.get(url)
    return response.json()
        
@mcp.tool()
def obtener_usuario_email(email:str):
    """Consulta un usuario por dirección de correo electrónico."""

    url = f"http://localhost:8000/users/get_by_email/{email}"
    response = requests.get(url)
    return response.json()
if __name__ == "__main__":
    mcp.run(transport="stdio")