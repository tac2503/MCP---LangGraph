#nombre,cedula,email, celular
from sqlalchemy import Column, Integer, String
from backend.Database.config import Base

class Usuario(Base):
    __tablename__ = "usuarios"
    
    id = Column(Integer, primary_key=True, autoincrement = True)
    nombre = Column(String(50), nullable=False)
    cedula = Column(String(10), nullable=False, unique=True)
    email = Column(String(100), nullable=False, unique=True)
    celular = Column(String(15), nullable=False)