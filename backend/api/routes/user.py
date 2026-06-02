from fastapi import APIRouter, Depends
from backend.Schemas.usuario import usuarioCreate, usuarioResponse
from backend.Database.config import get_db
from sqlalchemy.orm import Session
from backend.Modelos.usuario import Usuario
router = APIRouter(
    prefix="/users",
    tags=["users"],
)

@router.post("/create",response_model=usuarioResponse, status_code=201)
def create_user(usuario:usuarioCreate, db:Session = Depends(get_db)):
    """Crea un usuario nuevo en la base de datos si no existe"""
    
    exists = db.query(Usuario).filter(Usuario.cedula == usuario.cedula).first() or db.query(Usuario).filter(Usuario.email == usuario.email).first() 
    
    if exists: 
        return {"error": "El usuario con esa cédula o email ya existe"}
    new_user= Usuario(
        nombre=usuario.nombre,
        cedula=usuario.cedula,
        email=usuario.email,
        celular=usuario.celular
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {
        "nombre": new_user.nombre,
        "cedula": new_user.cedula,
        "email": new_user.email,
        "celular": new_user.celular
    }

@router.get("/get_by_cedula/{cedula}", response_model=usuarioResponse)
def get_user_by_cedula(cedula:str, db:Session = Depends(get_db)):
    """Obtiene un usuario por cédula"""
    usuario = db.query(Usuario).filter(Usuario.cedula ==cedula).first()
    
    if not usuario:
        return {"error": "Usuario no encontrado"}
    return {
        "nombre": usuario.nombre,
        "cedula": usuario.cedula,
        "email": usuario.email,
        "celular": usuario.celular
    }
@router.get("/get_by_email/{email}", response_model=usuarioResponse)
def get_user_by_email(email:str, db:Session = Depends(get_db)):
    """Obtiene un usuario por email"""
    usuario = db.query(Usuario).filter(Usuario.email == email).first()
    
    if not usuario:
        return {"error": "Usuario no encontrado"}
    return {
        "nombre": usuario.nombre,
        "cedula": usuario.cedula,
        "email": usuario.email,
        "celular": usuario.celular
    }

