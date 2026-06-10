from sqlalchemy import Column, Integer, String, DateTime
from backend.Database.config import Base
from datetime import datetime

class AuthUser(Base):
    
    __tablename__ = "auth_users"
    
    id = Column(Integer, primary_key=True, autoincrement = True)
    username = Column(String(50), nullable=False, unique=True)
    email = Column(String(100), nullable=False, unique=True)
    password_hash = Column(String(255), nullable = False)
    full_name = Column(String(100), nullable = False)
    created_at = Column(DateTime,default=datetime.utcnow)