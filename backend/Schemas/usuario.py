from pydantic import BaseModel, EmailStr

class usuarioCreate(BaseModel):
    nombre:str
    cedula:str
    email:EmailStr
    celular:str

class usuarioResponse(BaseModel):
    nombre:str
    cedula:str
    email:EmailStr
    celular:str
    
    class Config:
        from_attributes = True
    
    