"""
Aplicación principal del sistema de reservas de cine.
FastAPI backend con funcionalidades de autenticación, reservas y premium.

Características principales:
- API REST completa con documentación automática
- Autenticación JWT con expiración de sesiones
- Sistema de reservas de asientos con estados
- Funcionalidad premium con beneficios exclusivos
- Simulación de bot para concurrencia
- Limpieza automática de usuarios expirados
- Logging detallado de todas las operaciones
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from apscheduler.schedulers.background import BackgroundScheduler
from contextlib import asynccontextmanager
import logging
from datetime import datetime
import os

# Imports locales
from database import create_tables, get_db, cleanup_expired_users, get_database_stats
from routers import auth, reservations
from schemas import ApiResponse

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('cinema_backend.log')
    ]
)
logger = logging.getLogger(__name__)

# Variables globales para el scheduler
scheduler = None
app_start_time = datetime.utcnow()


def cleanup_job():
    """
    Job programado para limpiar usuarios expirados.
    Se ejecuta cada 2 minutos en background.
    """
    try:
        from database import SessionLocal
        db = SessionLocal()
        
        deleted_count = cleanup_expired_users(db)
        stats = get_database_stats(db)
        
        if deleted_count > 0 or stats.get("active_users", 0) > 0:
            logger.info(f"🕒 Limpieza programada - Eliminados: {deleted_count} | "
                       f"Usuarios activos: {stats.get('active_users', 0)} | "
                       f"Reservas: {stats.get('active_reservations', 0)}")
        
        db.close()
        
    except Exception as e:
        logger.error(f"❌ Error en limpieza programada: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Context manager para manejar el ciclo de vida de la aplicación.
    Inicializa la base de datos y el scheduler al inicio.
    """
    global scheduler
    
    try:
        # Inicializar base de datos
        logger.info("🚀 Iniciando sistema de reservas de cine...")
        create_tables()
        
        # Inicializar scheduler para limpieza automática
        scheduler = BackgroundScheduler()
        scheduler.add_job(
            cleanup_job, 
            'interval', 
            minutes=2,  # Ejecutar cada 2 minutos
            id='cleanup_expired_users'
        )
        scheduler.start()
        logger.info("⏰ Scheduler de limpieza iniciado (cada 2 minutos)")
        
        # Log de inicio exitoso
        logger.info("✅ Sistema de reservas de cine iniciado correctamente")
        logger.info("🎭 API disponible en: http://localhost:8000")
        logger.info("📖 Documentación en: http://localhost:8000/docs")
        
        yield
        
    except Exception as e:
        logger.error(f"❌ Error durante inicialización: {e}")
        raise
    finally:
        # Cleanup al cerrar la aplicación
        if scheduler and scheduler.running:
            scheduler.shutdown()
            logger.info("⏰ Scheduler de limpieza detenido")
        
        logger.info("👋 Sistema de reservas de cine detenido")


# Crear aplicación FastAPI
app = FastAPI(
    title="🎬 Cinema Reservations API",
    description="""
    ## Sistema de Reservas de Cine - Demo

    Una API REST completa para gestión de reservas de cine con las siguientes características:

    ### 🚀 Funcionalidades Principales
    - **Autenticación temporal**: Usuarios con expiración automática en 10 minutos
    - **Sistema de asientos**: Grilla interactiva con estados (libre, reservado, premium)
    - **Reservas inteligentes**: Gestión de asientos con validaciones de concurrencia
    - **Premium Experience**: Upgrade con descuentos y auto-selección de mejores asientos
    - **Bot Simulator**: Simulación de usuarios concurrentes para testing

    ### 🔒 Seguridad
    - Contraseñas hasheadas con bcrypt
    - Autenticación JWT con expiración
    - Límite máximo de 12 usuarios simultáneos
    - Limpieza automática de sesiones expiradas

    ### 🎯 Tecnologías
    - **FastAPI** para la API REST
    - **PostgreSQL** para persistencia
    - **SQLAlchemy** como ORM
    - **JWT** para autenticación
    - **APScheduler** para tareas en background

    ### 📊 Monitoreo
    - Logging detallado de todas las operaciones
    - Estadísticas en tiempo real del sistema
    - Limpieza automática cada 2 minutos
    """,
    version="1.0.0",
    contact={
        "name": "Cinema Reservations System",
        "url": "https://github.com/tu-repo/cinema-reservations",
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT",
    },
    lifespan=lifespan
)

# Configuración de CORS para permitir el frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React development server
        "http://localhost:3001",  # React production build
        "http://frontend:3000",   # Docker container
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar routers
app.include_router(auth.router, prefix="/api")
app.include_router(reservations.router, prefix="/api")


# Endpoints principales
@app.get("/", response_model=ApiResponse)
async def root():
    """
    Endpoint raíz con información básica de la API.
    """
    return ApiResponse(
        success=True,
        message="🎬 Cinema Reservations API - Sistema funcionando correctamente",
        data={
            "version": "1.0.0",
            "docs": "/docs",
            "api_prefix": "/api",
            "uptime_minutes": (datetime.utcnow() - app_start_time).total_seconds() / 60
        }
    )


@app.get("/health", response_model=ApiResponse)
async def health_check(db: Session = Depends(get_db)):
    """
    Health check endpoint para verificar el estado del sistema.
    Incluye verificación de base de datos y estadísticas básicas.
    """
    try:
        # Verificar conexión a base de datos
        stats = get_database_stats(db)
        
        return ApiResponse(
            success=True,
            message="Sistema saludable - Todos los servicios funcionando",
            data={
                "status": "healthy",
                "database": "connected",
                "uptime_minutes": round((datetime.utcnow() - app_start_time).total_seconds() / 60, 2),
                "stats": stats
            }
        )
        
    except Exception as e:
        logger.error(f"❌ Health check falló: {e}")
        return JSONResponse(
            status_code=503,
            content={
                "success": False,
                "message": f"Sistema no saludable: {str(e)}",
                "data": {
                    "status": "unhealthy",
                    "error": str(e)
                }
            }
        )


# Manejador de errores global
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """
    Manejador global de excepciones para logging y respuestas consistentes.
    """
    logger.error(f"❌ Error no manejado en {request.url}: {exc}")
    
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "Error interno del servidor",
            "data": {
                "error_type": type(exc).__name__,
                "timestamp": datetime.utcnow().isoformat()
            }
        }
    )


# Mensaje de bienvenida al iniciar
if __name__ == "__main__":
    import uvicorn
    
    logger.info("🎬 Iniciando Cinema Reservations API...")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )