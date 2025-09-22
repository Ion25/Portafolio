"""
Utilidades de autenticación y seguridad.
Maneja JWT tokens, hashing de contraseñas y validaciones de seguridad.
"""

import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db
from models import User
import logging

# Configuración del logger
logger = logging.getLogger(__name__)

# Configuración de JWT
SECRET_KEY = os.getenv("SECRET_KEY", "tu_clave_secreta_jwt_aqui_cambiar_en_produccion")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10"))

# Contexto para hashing de contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Esquema de autenticación Bearer
security = HTTPBearer()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifica si una contraseña plana coincide con su hash.
    
    Args:
        plain_password: Contraseña en texto plano
        hashed_password: Contraseña hasheada
    
    Returns:
        bool: True si coinciden, False en caso contrario
    """
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        logger.error(f"Error verificando contraseña: {e}")
        return False


def get_password_hash(password: str) -> str:
    """
    Genera un hash seguro de una contraseña.
    
    Args:
        password: Contraseña en texto plano
    
    Returns:
        str: Contraseña hasheada
    """
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Crea un token JWT con los datos del usuario.
    
    Args:
        data: Datos a incluir en el token (normalmente user_id y username)
        expires_delta: Tiempo de expiración personalizado
    
    Returns:
        str: Token JWT codificado
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    
    try:
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        logger.info(f"🔑 Token JWT creado para usuario: {data.get('username', 'unknown')}")
        return encoded_jwt
    except Exception as e:
        logger.error(f"Error creando token JWT: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


def verify_token(token: str) -> dict:
    """
    Verifica y decodifica un token JWT.
    
    Args:
        token: Token JWT a verificar
    
    Returns:
        dict: Datos decodificados del token
    
    Raises:
        HTTPException: Si el token es inválido o ha expirado
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        user_id: int = payload.get("user_id")
        
        if username is None or user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido: datos incompletos",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return {"username": username, "user_id": user_id}
        
    except JWTError as e:
        logger.warning(f"Token JWT inválido: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency para obtener el usuario actual desde el token JWT.
    Verifica que el usuario existe y no ha expirado.
    
    Args:
        credentials: Credenciales Bearer del header Authorization
        db: Sesión de base de datos
    
    Returns:
        User: Usuario autenticado
    
    Raises:
        HTTPException: Si el usuario no existe o ha expirado
    """
    # Verificar token
    token_data = verify_token(credentials.credentials)
    
    # Buscar usuario en base de datos
    user = db.query(User).filter(User.id == token_data["user_id"]).first()
    
    if user is None:
        logger.warning(f"Usuario no encontrado: {token_data['username']}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verificar que el usuario no ha expirado
    if user.is_expired():
        logger.info(f"👤 Usuario expirado intentó acceder: {user.username}")
        # Eliminar usuario expirado de la base de datos
        db.delete(user)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sesión expirada. Por favor, inicia sesión nuevamente",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user


def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    """
    Autentica un usuario con username y password.
    
    Args:
        db: Sesión de base de datos
        username: Nombre de usuario
        password: Contraseña en texto plano
    
    Returns:
        User: Usuario autenticado, None si las credenciales son incorrectas
    """
    user = db.query(User).filter(User.username == username.lower()).first()
    
    if not user:
        logger.warning(f"Intento de login con usuario inexistente: {username}")
        return None
    
    if user.is_expired():
        logger.info(f"Usuario expirado intentó login: {username}")
        # Limpiar usuario expirado
        db.delete(user)
        db.commit()
        return None
    
    if not verify_password(password, user.password_hash):
        logger.warning(f"Intento de login con contraseña incorrecta: {username}")
        return None
    
    logger.info(f"✅ Usuario autenticado exitosamente: {username}")
    return user


def check_user_limit(db: Session) -> bool:
    """
    Verifica si se puede crear un nuevo usuario (límite de 12).
    
    Args:
        db: Sesión de base de datos
    
    Returns:
        bool: True si se puede crear usuario, False si se alcanzó el límite
    """
    active_users = db.query(User).filter(User.expires_at > datetime.utcnow()).count()
    
    if active_users >= 12:
        logger.warning(f"🚫 Límite de usuarios alcanzado: {active_users}/12")
        return False
    
    return True