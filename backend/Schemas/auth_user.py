from pydantic import BaseModel, EmailStr
from datetime import datetime

class AuthUserRegister(BaseModel):
    username:str
    email: EmailStr
    password: str
    full_name: str

class AuthUserLogin(BaseModel):
    username:str
    password:str

class TokenResponse(BaseModel):
    access_token:str
    token_type:str
    
class AuthUserResponse(BaseModel):
    username:str
    email: EmailStr
    full_name:str
    created_at:datetime
    
    class Config:
        from_attributes = True