"""
Rutas de reservas para el sistema de cine.
Maneja operaciones de asientos, reservas y funcionalidades premium.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict
from datetime import datetime

from database import get_db, cleanup_expired_users
from models import User, Seat, Reservation
from schemas import (
    SeatResponse, SeatsGridResponse, ReservationCreate, ReservationResponse, 
    ReservationSummary, PremiumUpgrade, PremiumResponse, ComboResponse,
    BotAction, BotResponse, ApiResponse, SystemStats
)
from auth import get_current_user
from services import ReservationService, PremiumService, BotService, get_available_combos
import logging

# Configuración del logger
logger = logging.getLogger(__name__)

# Router para endpoints de reservas
router = APIRouter(prefix="/reservations", tags=["reservations"])


@router.get("/seats", response_model=SeatsGridResponse)
async def get_seats_grid(db: Session = Depends(get_db)):
    """
    Obtiene la grilla completa de asientos del cine con sus estados.
    
    Estados de asientos:
    - available: Libre para reservar
    - reserved: Reservado por algún usuario
    - occupied: Ocupado (simulación)
    - premium: Asiento premium disponible
    
    Returns:
        SeatsGridResponse: Grilla completa de asientos organizados
    """
    try:
        # Limpiar usuarios expirados primero
        cleanup_expired_users(db)
        
        # Obtener todos los asientos
        seats = ReservationService.get_all_seats(db)
        
        if not seats:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No se encontraron asientos en el sistema"
            )
        
        # Convertir a formato de respuesta
        seat_responses = []
        for seat in seats:
            # Actualizar estado basado en reservas actuales
            has_reservation = db.query(Reservation).filter(Reservation.seat_id == seat.id).first()
            
            if has_reservation:
                seat.status = "reserved"
            elif seat.status == "reserved" and not has_reservation:
                seat.status = "available"  # Liberar asiento si no hay reserva
                db.add(seat)  # Marcar para actualizar
            
            seat_responses.append(SeatResponse(
                id=seat.id,
                row_letter=seat.row_letter,
                number=seat.number,
                status=seat.status,
                is_premium=seat.is_premium,
                seat_name=seat.seat_name
            ))
        
        db.commit()  # Guardar cambios de estado
        
        # Obtener estadísticas
        rows = sorted(list(set(seat.row_letter for seat in seats)))
        seats_per_row = max(seat.number for seat in seats) if seats else 0
        total_seats = len(seats)
        available_seats = len([s for s in seat_responses if s.status == "available"])
        premium_seats = len([s for s in seat_responses if s.is_premium])
        
        logger.info(f"🎭 Consulta de asientos: {available_seats}/{total_seats} disponibles")
        
        return SeatsGridResponse(
            seats=seat_responses,
            rows=rows,
            seats_per_row=seats_per_row,
            total_seats=total_seats,
            available_seats=available_seats,
            premium_seats=premium_seats
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error obteniendo asientos: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.post("/book", response_model=ReservationSummary)
async def book_seats(
    reservation_data: ReservationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Reserva asientos para el usuario autenticado.
    
    Args:
        reservation_data: Datos de la reserva (asientos y combo)
        current_user: Usuario autenticado
        db: Sesión de base de datos
        
    Returns:
        ReservationSummary: Resumen de la reserva realizada
        
    Raises:
        HTTPException: Si hay errores en la reserva
    """
    try:
        # Realizar reserva
        success, message, new_reservations = ReservationService.reserve_seats(
            db, current_user, reservation_data.seat_ids, reservation_data.combo
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=message
            )
        
        # Obtener todas las reservas del usuario
        all_user_reservations = ReservationService.get_user_reservations(db, current_user)
        
        # Calcular costo total
        total_cost = ReservationService.calculate_total_cost(all_user_reservations, current_user.is_premium)
        
        # Crear respuestas de reservas
        reservation_responses = []
        for reservation in all_user_reservations:
            reservation_responses.append(ReservationResponse(
                id=reservation.id,
                user_id=reservation.user_id,
                seat_id=reservation.seat_id,
                combo=reservation.combo,
                created_at=reservation.created_at,
                seat=SeatResponse(
                    id=reservation.seat.id,
                    row_letter=reservation.seat.row_letter,
                    number=reservation.seat.number,
                    status=reservation.seat.status,
                    is_premium=reservation.seat.is_premium,
                    seat_name=reservation.seat.seat_name
                )
            ))
        
        logger.info(f"🎫 Reserva exitosa: {current_user.username} - {len(new_reservations)} nuevos asientos")
        
        return ReservationSummary(
            user=current_user,
            reservations=reservation_responses,
            total_seats=len(all_user_reservations),
            total_cost=total_cost
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error en reserva: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.delete("/cancel/{seat_id}", response_model=ApiResponse)
async def cancel_seat_reservation(
    seat_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Cancela la reserva de un asiento específico.
    
    Args:
        seat_id: ID del asiento a cancelar
        current_user: Usuario autenticado
        db: Sesión de base de datos
        
    Returns:
        ApiResponse: Confirmación de cancelación
    """
    try:
        success, message = ReservationService.cancel_reservation(db, current_user, seat_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=message
            )
        
        return ApiResponse(
            success=True,
            message=message,
            timestamp=datetime.utcnow()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error cancelando reserva: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.get("/my-reservations", response_model=ReservationSummary)
async def get_my_reservations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtiene todas las reservas activas del usuario autenticado.
    
    Args:
        current_user: Usuario autenticado
        db: Sesión de base de datos
        
    Returns:
        ReservationSummary: Resumen de reservas del usuario
    """
    try:
        # Obtener reservas del usuario
        user_reservations = ReservationService.get_user_reservations(db, current_user)
        
        # Calcular costo total
        total_cost = ReservationService.calculate_total_cost(user_reservations, current_user.is_premium)
        
        # Crear respuestas de reservas
        reservation_responses = []
        for reservation in user_reservations:
            reservation_responses.append(ReservationResponse(
                id=reservation.id,
                user_id=reservation.user_id,
                seat_id=reservation.seat_id,
                combo=reservation.combo,
                created_at=reservation.created_at,
                seat=SeatResponse(
                    id=reservation.seat.id,
                    row_letter=reservation.seat.row_letter,
                    number=reservation.seat.number,
                    status=reservation.seat.status,
                    is_premium=reservation.seat.is_premium,
                    seat_name=reservation.seat.seat_name
                )
            ))
        
        return ReservationSummary(
            user=current_user,
            reservations=reservation_responses,
            total_seats=len(user_reservations),
            total_cost=total_cost
        )
        
    except Exception as e:
        logger.error(f"Error obteniendo reservas: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.post("/premium", response_model=PremiumResponse)
async def upgrade_to_premium(
    upgrade_data: PremiumUpgrade,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Actualiza el usuario a premium con beneficios especiales.
    
    Beneficios premium:
    - 15% de descuento en todas las reservas
    - Acceso a combos exclusivos
    - Auto-selección de mejores asientos
    - Servicio prioritario
    
    Args:
        upgrade_data: Configuración del upgrade premium
        current_user: Usuario autenticado
        db: Sesión de base de datos
        
    Returns:
        PremiumResponse: Información del upgrade premium
    """
    try:
        if current_user.is_premium:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El usuario ya es premium"
            )
        
        # Realizar upgrade a premium
        success, message, selected_seats = PremiumService.upgrade_to_premium(
            db, current_user, upgrade_data.auto_select_seats, upgrade_data.seats_count
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=message
            )
        
        # Obtener reservas actualizadas
        user_reservations = ReservationService.get_user_reservations(db, current_user)
        total_cost = ReservationService.calculate_total_cost(user_reservations, True)  # Con descuento premium
        
        # Preparar respuesta
        selected_seat_responses = []
        for seat in selected_seats:
            selected_seat_responses.append(SeatResponse(
                id=seat.id,
                row_letter=seat.row_letter,
                number=seat.number,
                status=seat.status,
                is_premium=seat.is_premium,
                seat_name=seat.seat_name
            ))
        
        premium_benefits = [
            "15% de descuento en todas las reservas",
            "Acceso a combos VIP exclusivos",
            "Auto-selección de mejores asientos",
            "Servicio prioritario al cliente",
            "Asientos premium garantizados"
        ]
        
        return PremiumResponse(
            user=current_user,
            auto_selected_seats=selected_seat_responses,
            discount_applied=0.15,
            total_cost=total_cost,
            premium_benefits=premium_benefits
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error en upgrade premium: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.get("/combos", response_model=ComboResponse)
async def get_available_combos(current_user: User = Depends(get_current_user)):
    """
    Obtiene los combos disponibles según el tipo de usuario.
    
    Args:
        current_user: Usuario autenticado
        
    Returns:
        ComboResponse: Lista de combos disponibles
    """
    try:
        combos_data = get_available_combos(current_user.is_premium)
        
        return ComboResponse(**combos_data)
        
    except Exception as e:
        logger.error(f"Error obteniendo combos: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.post("/bot-simulation", response_model=BotResponse)
async def simulate_bot_action(
    action_data: BotAction,
    db: Session = Depends(get_db)
):
    """
    Simula una acción del bot para demostrar concurrencia.
    
    Este endpoint permite simular usuarios concurrentes realizando
    reservas aleatorias para mostrar cómo el sistema maneja múltiples
    usuarios simultáneamente.
    
    Args:
        action_data: Configuración de la acción del bot
        db: Sesión de base de datos
        
    Returns:
        BotResponse: Resultado de la acción simulada
    """
    try:
        action_type, success, message, affected_seats = BotService.simulate_user_action(db)
        
        # Preparar respuesta de asientos afectados
        seat_responses = []
        for seat in affected_seats:
            seat_responses.append(SeatResponse(
                id=seat.id,
                row_letter=seat.row_letter,
                number=seat.number,
                status=seat.status,
                is_premium=seat.is_premium,
                seat_name=seat.seat_name
            ))
        
        return BotResponse(
            action_type=action_type,
            success=success,
            message=message,
            seats_affected=seat_responses,
            timestamp=datetime.utcnow()
        )
        
    except Exception as e:
        logger.error(f"Error en simulación de bot: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


@router.get("/stats", response_model=SystemStats)
async def get_system_stats(db: Session = Depends(get_db)):
    """
    Obtiene estadísticas generales del sistema.
    
    Útil para monitoreo y debugging del estado actual del cine.
    
    Args:
        db: Sesión de base de datos
        
    Returns:
        SystemStats: Estadísticas del sistema
    """
    try:
        # Limpiar usuarios expirados
        cleanup_expired_users(db)
        
        # Obtener estadísticas
        active_users = db.query(User).filter(User.expires_at > datetime.utcnow()).count()
        premium_users = db.query(User).filter(
            User.expires_at > datetime.utcnow(), 
            User.is_premium == True
        ).count()
        
        total_seats = db.query(Seat).count()
        available_seats = db.query(Seat).filter(Seat.status == "available").count()
        reserved_seats = db.query(Seat).filter(Seat.status == "reserved").count()
        total_reservations = db.query(Reservation).count()
        
        return SystemStats(
            active_users=active_users,
            total_seats=total_seats,
            available_seats=available_seats,
            reserved_seats=reserved_seats,
            premium_users=premium_users,
            total_reservations=total_reservations,
            uptime_minutes=0.0  # Placeholder - se podría implementar un contador real
        )
        
    except Exception as e:
        logger.error(f"Error obteniendo estadísticas: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )