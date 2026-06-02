from langchain.tools import tool
from backend.api.routes.user import create_user, get_user_by_cedula, get_user_by_email
from backend.Database.config import SessionLocal
from backend.Schemas.usuario import usuarioCreate

@tool
def registrar_usuario(nombre:str, cedula:str, email:str, celular:str):
    """Registra un usuario en la base de datos."""
    db = SessionLocal()
    try:
        
        json = usuarioCreate(
            nombre=nombre,
            cedula=cedula,
            email=email,
            celular=celular
        )
    
        return create_user(json,db)
    finally:
        db.close()
@tool
def obtener_usuario_cedula(cedula:str):
    """Consulta un usuario por número de cédula."""
    db = SessionLocal()
    try:
        return get_user_by_cedula(cedula, db)
    finally:
        db.close()
@tool
def obtener_usuario_email(email:str):
    """Consulta un usuario por dirección de correo electrónico."""
    db = SessionLocal()
    try:
        return get_user_by_email(email, db)
    finally:
        db.close()


tools = [obtener_usuario_cedula, obtener_usuario_email, registrar_usuario]
tools_by_name = {tool.name: tool for tool in tools}