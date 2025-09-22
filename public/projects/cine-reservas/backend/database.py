"""
Configuración de la base de datos PostgreSQL.
Maneja la conexión, sesiones y operaciones de limpieza automática.
"""

import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from models import Base
import logging

# Configuración del logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# URL de conexión a PostgreSQL
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://cinema_user:cinema_pass@localhost:5432/cine_reservas")

# Crear engine de SQLAlchemy
engine = create_engine(
    DATABASE_URL,
    echo=False,  # Cambiar a True para ver SQL queries en logs
    pool_pre_ping=True,  # Verificar conexiones antes de usar
    pool_recycle=3600    # Reciclar conexiones cada hora
)

# Crear sessionmaker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def create_tables():
    """
    Crear todas las tablas en la base de datos.
    Se ejecuta al iniciar la aplicación.
    """
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Tablas de la base de datos creadas exitosamente")
    except Exception as e:
        logger.error(f"❌ Error al crear tablas: {e}")
        raise


def get_db():
    """
    Dependency para obtener una sesión de base de datos.
    Se usa en los endpoints de FastAPI.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def cleanup_expired_users(db_session):
    """
    Limpia usuarios expirados y sus reservas asociadas.
    Actualiza el estado de los asientos liberados.
    
    Returns:
        int: Número de usuarios eliminados
    """
    try:
        # Ejecutar función almacenada de limpieza
        result = db_session.execute(text("SELECT cleanup_expired_users()"))
        deleted_count = result.scalar()
        
        if deleted_count > 0:
            db_session.commit()
            logger.info(f"🧹 Limpieza automática: {deleted_count} usuarios expirados eliminados")
        
        return deleted_count
        
    except Exception as e:
        logger.error(f"❌ Error en limpieza automática: {e}")
        db_session.rollback()
        return 0


def get_database_stats(db_session):
    """
    Obtiene estadísticas actuales de la base de datos.
    Útil para logging y monitoreo.
    
    Returns:
        dict: Estadísticas de la base de datos
    """
    try:
        # Contar usuarios activos (no expirados)
        active_users = db_session.execute(
            text("SELECT COUNT(*) FROM users WHERE expires_at > CURRENT_TIMESTAMP")
        ).scalar()
        
        # Contar asientos por estado
        seats_stats = db_session.execute(text("""
            SELECT status, COUNT(*) 
            FROM seats 
            GROUP BY status
        """)).fetchall()
        
        # Contar reservas activas
        active_reservations = db_session.execute(
            text("SELECT COUNT(*) FROM reservations")
        ).scalar()
        
        return {
            "active_users": active_users,
            "active_reservations": active_reservations,
            "seats": dict(seats_stats)
        }
        
    except Exception as e:
        logger.error(f"❌ Error obteniendo estadísticas: {e}")
        return {"error": str(e)}