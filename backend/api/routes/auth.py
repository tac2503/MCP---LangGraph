from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.Database.config import get_db
from backend.Modelos.auth_user import AuthUser
from backend.Schemas.auth_user import (
    AuthUserRegister,
    AuthUserLogin,
    TokenResponse,
    AuthUserResponse
)
from backend.utils.utils import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)

router = APIRouter(prefix= "/auth",tags=["Authentication"])

@router.post("/register", response_model=AuthUserResponse,status_code=201)
def register(user_data:AuthUserRegister,db:Session=Depends(get_db)):
    
    existing_user = db.query(AuthUser).filter(
        (AuthUser.email == user_data.email) | (AuthUser.username == user_data.username)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail= "Username o email ya está en uso"
        )
    
    new_auth_user = AuthUser(
        username=user_data.username,
        email = user_data.email,
        password_hash = hash_password(user_data.password),
        full_name=user_data.username
    )
    db.add(new_auth_user)
    db.commit()
    db.refresh(new_auth_user)
    return new_auth_user
@router.post("/login",response_model=TokenResponse)
def login(credentials: AuthUserLogin, db:Session = Depends(get_db)):
    
    auth_user = db.query(AuthUser).filter(
        (AuthUser.username == credentials.username)
    ).first()
    
    
    if not auth_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas"
        )
    if not verify_password(credentials.password,auth_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas"
        )
    
    access_token = create_access_token(data={
        "sub": str(auth_user.id),
        "username": auth_user.username,
        "email": auth_user.email,
        
    })
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.get("/me",response_model=AuthUserResponse)
def get_current_user_info(current_user:dict = Depends(get_current_user),db:Session=Depends(get_db)):
    
    auth_user = db.query(AuthUser).filter(
        AuthUser.id == int(current_user["sub"])
    ).first()
    
    if not auth_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    return auth_user