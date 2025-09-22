"""
Rutas de autenticación para el sistema de reservas de cine.
Maneja registro, login y operaciones de usuarios.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta, datetime

from database import get_db, cleanup_expired_users
from models import User
from schemas import UserCreate, UserLogin, UserResponse, Token, ApiResponse
from auth import (
    authenticate_user, 
    create_access_token, 
    get_password_hash, 
    check_user_limit,
    get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
import logging

# Configuración del logger
logger = logging.getLogger(__name__)

# Router para endpoints de autenticación
router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", response_model=Token)
async def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Registra un nuevo usuario en el sistema.
    
    Restricciones:
    - Máximo 12 usuarios simultáneos
    - Username único
    - Contraseña hasheada automáticamente
    - Cuenta expira en 10 minutos
    
    Args:
        user_data: Datos del nuevo usuario (username, password)
        db: Sesión de base de datos
        
    Returns:
        Token: JWT token con información del usuario
        
    Raises:
        HTTPException: Si hay errores de validación o límites
    """
    try:
        # Limpiar usuarios expirados antes de verificar límite
        cleanup_expired_users(db)
        
        # Verificar límite de usuarios
        if not check_user_limit(db):
            logger.warning(f"🚫 Intento de registro rechazado: límite de 12 usuarios alcanzado")
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Límite máximo de usuarios alcanzado (12). Intenta más tarde."
            )
        
        # Verificar si el username ya existe
        existing_user = db.query(User).filter(User.username == user_data.username.lower()).first()
        if existing_user:
            # Si existe pero ha expirado, eliminarlo
            if existing_user.is_expired():
                logger.info(f"🗑️ Eliminando usuario expirado: {existing_user.username}")
                db.delete(existing_user)
                db.commit()
            else:
                logger.warning(f"❌ Intento de registro con username existente: {user_data.username}")
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="El nombre de usuario ya está en uso"
                )
        
        # Hashear contraseña
        hashed_password = get_password_hash(user_data.password)
        
        # Crear nuevo usuario
        new_user = User(
            username=user_data.username.lower(),
            password_hash=hashed_password,
            created_at=datetime.utcnow(),
            expires_at=datetime.utcnow() + timedelta(minutes=10),
            is_premium=False
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # Crear token JWT
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": new_user.username, "user_id": new_user.id},
            expires_delta=access_token_expires
        )
        
        logger.info(f"✅ Nuevo usuario registrado: {new_user.username} (ID: {new_user.id})")
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": UserResponse.from_orm(new_user),
            "expires_in_minutes": ACCESS_TOKEN_EXPIRE_MINUTES
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error en registro de usuario: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.post("/login", response_model=Token)
async def login_user(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Autentica un usuario existente.
    
    Args:
        user_credentials: Credenciales de login (username, password)
        db: Sesión de base de datos
        
    Returns:
        Token: JWT token con información del usuario
        
    Raises:
        HTTPException: Si las credenciales son incorrectas
    """
    try:
        # Limpiar usuarios expirados
        cleanup_expired_users(db)
        
        # Autenticar usuario
        user = authenticate_user(db, user_credentials.username, user_credentials.password)
        
        if not user:
            logger.warning(f"❌ Intento de login fallido: {user_credentials.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales incorrectas o usuario expirado",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Crear token JWT
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.username, "user_id": user.id},
            expires_delta=access_token_expires
        )
        
        logger.info(f"🔑 Login exitoso: {user.username} {'👑' if user.is_premium else '👤'}")
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": UserResponse.from_orm(user),
            "expires_in_minutes": ACCESS_TOKEN_EXPIRE_MINUTES
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error en login: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Obtiene información del usuario autenticado actual.
    
    Args:
        current_user: Usuario actual (obtenido del token JWT)
        
    Returns:
        UserResponse: Información del usuario
    """
    logger.info(f"📋 Consulta de perfil: {current_user.username}")
    return UserResponse.from_orm(current_user)


@router.post("/logout", response_model=ApiResponse)
async def logout_user(current_user: User = Depends(get_current_user)):
    """
    Cierra sesión del usuario actual.
    Nota: En JWT stateless, el logout es principalmente del lado cliente.
    
    Args:
        current_user: Usuario actual (obtenido del token JWT)
        
    Returns:
        ApiResponse: Confirmación del logout
    """
    logger.info(f"👋 Logout: {current_user.username}")
    
    return ApiResponse(
        success=True,
        message=f"Logout exitoso para {current_user.username}",
        timestamp=datetime.utcnow()
    )


@router.delete("/delete-account", response_model=ApiResponse)
async def delete_user_account(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Elimina la cuenta del usuario actual y todas sus reservas.
    
    Args:
        current_user: Usuario actual (obtenido del token JWT)
        db: Sesión de base de datos
        
    Returns:
        ApiResponse: Confirmación de eliminación
    """
    try:
        username = current_user.username
        
        # Eliminar usuario (las reservas se eliminan automáticamente por CASCADE)
        db.delete(current_user)
        db.commit()
        
        logger.info(f"🗑️ Cuenta eliminada: {username}")
        
        return ApiResponse(
            success=True,
            message=f"Cuenta {username} eliminada exitosamente",
            timestamp=datetime.utcnow()
        )
        
    except Exception as e:
        logger.error(f"Error eliminando cuenta: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )