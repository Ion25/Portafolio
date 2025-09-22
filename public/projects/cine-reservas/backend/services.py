"""
Servicios de lógica de negocio para el sistema de reservas.
Contiene funciones para manejar reservas, premium, combos y simulación de bot.
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from models import User, Seat, Reservation
from schemas import ReservationCreate, PremiumUpgrade
from typing import List, Dict, Optional, Tuple
import random
import logging
from datetime import datetime

# Configuración del logger
logger = logging.getLogger(__name__)

# Configuración de combos disponibles
REGULAR_COMBOS = [
    {"name": "Combo Clásico", "description": "Popcorn mediano + Bebida mediana", "price": 12.99},
    {"name": "Combo Familiar", "description": "Popcorn grande + 2 Bebidas grandes", "price": 19.99},
    {"name": "Combo Dulce", "description": "Nachos + Bebida + Dulces", "price": 15.99},
    {"name": "Solo Bebida", "description": "Bebida grande de tu preferencia", "price": 4.99},
    {"name": "Solo Popcorn", "description": "Popcorn grande con mantequilla", "price": 8.99},
]

PREMIUM_COMBOS = [
    {"name": "Combo VIP", "description": "Popcorn gourmet + Bebida premium + Snacks selectos", "price": 24.99},
    {"name": "Combo Ejecutivo", "description": "Bandeja de sushi + Sake + Postre", "price": 34.99},
    {"name": "Combo Premium", "description": "Todo incluido + servicio a la butaca", "price": 42.99},
]

# Precios base
BASE_SEAT_PRICE = 10.99
PREMIUM_SEAT_PRICE = 16.99
PREMIUM_DISCOUNT = 0.15  # 15% de descuento para usuarios premium


class ReservationService:
    """Servicio para manejo de reservas de asientos"""

    @staticmethod
    def get_all_seats(db: Session) -> List[Seat]:
        """
        Obtiene todos los asientos con su estado actual.
        
        Args:
            db: Sesión de base de datos
            
        Returns:
            List[Seat]: Lista de todos los asientos
        """
        try:
            seats = db.query(Seat).order_by(Seat.row_letter, Seat.number).all()
            logger.info(f"📋 Consultando {len(seats)} asientos del cine")
            return seats
        except Exception as e:
            logger.error(f"Error obteniendo asientos: {e}")
            return []

    @staticmethod
    def get_available_seats(db: Session, premium_only: bool = False) -> List[Seat]:
        """
        Obtiene asientos disponibles para reserva.
        
        Args:
            db: Sesión de base de datos
            premium_only: Si True, solo devuelve asientos premium
            
        Returns:
            List[Seat]: Lista de asientos disponibles
        """
        query = db.query(Seat).filter(Seat.status == "available")
        
        if premium_only:
            query = query.filter(Seat.is_premium == True)
            
        seats = query.order_by(Seat.row_letter, Seat.number).all()
        logger.info(f"✅ {len(seats)} asientos disponibles {'premium' if premium_only else ''}")
        return seats

    @staticmethod
    def reserve_seats(db: Session, user: User, seat_ids: List[int], combo: Optional[str] = None) -> Tuple[bool, str, List[Reservation]]:
        """
        Reserva asientos para un usuario.
        
        Args:
            db: Sesión de base de datos
            user: Usuario que realiza la reserva
            seat_ids: Lista de IDs de asientos a reservar
            combo: Combo seleccionado (opcional)
            
        Returns:
            Tuple[bool, str, List[Reservation]]: (éxito, mensaje, reservas creadas)
        """
        try:
            # Verificar que los asientos existen y están disponibles
            seats = db.query(Seat).filter(
                and_(
                    Seat.id.in_(seat_ids),
                    Seat.status == "available"
                )
            ).all()
            
            if len(seats) != len(seat_ids):
                unavailable_ids = set(seat_ids) - {seat.id for seat in seats}
                return False, f"Asientos no disponibles: {unavailable_ids}", []
            
            # Verificar límite de reservas por usuario (máximo 6 asientos)
            existing_reservations = db.query(Reservation).filter(Reservation.user_id == user.id).count()
            if existing_reservations + len(seat_ids) > 6:
                return False, f"Límite de reservas excedido. Máximo 6 asientos por usuario", []
            
            # Crear las reservas
            new_reservations = []
            for seat in seats:
                reservation = Reservation(
                    user_id=user.id,
                    seat_id=seat.id,
                    combo=combo
                )
                db.add(reservation)
                new_reservations.append(reservation)
                
                # Actualizar estado del asiento
                seat.status = "reserved"
            
            db.commit()
            
            # Log de la acción
            seat_names = [seat.seat_name for seat in seats]
            logger.info(f"🎫 Usuario {user.username} reservó asientos: {seat_names} {f'con combo: {combo}' if combo else ''}")
            
            return True, f"Reserva exitosa de {len(seats)} asientos", new_reservations
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error en reserva de asientos: {e}")
            return False, f"Error interno: {str(e)}", []

    @staticmethod
    def cancel_reservation(db: Session, user: User, seat_id: int) -> Tuple[bool, str]:
        """
        Cancela una reserva específica del usuario.
        
        Args:
            db: Sesión de base de datos
            user: Usuario propietario de la reserva
            seat_id: ID del asiento a cancelar
            
        Returns:
            Tuple[bool, str]: (éxito, mensaje)
        """
        try:
            # Buscar la reserva
            reservation = db.query(Reservation).filter(
                and_(
                    Reservation.user_id == user.id,
                    Reservation.seat_id == seat_id
                )
            ).first()
            
            if not reservation:
                return False, "Reserva no encontrada"
            
            # Liberar asiento
            seat = reservation.seat
            seat.status = "available"
            
            # Eliminar reserva
            db.delete(reservation)
            db.commit()
            
            logger.info(f"❌ Usuario {user.username} canceló reserva del asiento {seat.seat_name}")
            return True, f"Reserva del asiento {seat.seat_name} cancelada exitosamente"
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error cancelando reserva: {e}")
            return False, f"Error interno: {str(e)}"

    @staticmethod
    def get_user_reservations(db: Session, user: User) -> List[Reservation]:
        """
        Obtiene todas las reservas activas de un usuario.
        
        Args:
            db: Sesión de base de datos
            user: Usuario del cual obtener reservas
            
        Returns:
            List[Reservation]: Lista de reservas del usuario
        """
        reservations = db.query(Reservation).filter(Reservation.user_id == user.id).all()
        return reservations

    @staticmethod
    def calculate_total_cost(reservations: List[Reservation], is_premium: bool = False) -> float:
        """
        Calcula el costo total de las reservas.
        
        Args:
            reservations: Lista de reservas
            is_premium: Si el usuario es premium (aplica descuento)
            
        Returns:
            float: Costo total calculado
        """
        total = 0.0
        
        for reservation in reservations:
            # Precio del asiento
            if reservation.seat.is_premium:
                total += PREMIUM_SEAT_PRICE
            else:
                total += BASE_SEAT_PRICE
            
            # Precio del combo
            if reservation.combo:
                combo_price = ReservationService._get_combo_price(reservation.combo, is_premium)
                total += combo_price
        
        # Aplicar descuento premium
        if is_premium:
            total *= (1 - PREMIUM_DISCOUNT)
        
        return round(total, 2)

    @staticmethod
    def _get_combo_price(combo_name: str, is_premium: bool = False) -> float:
        """Obtiene el precio de un combo por su nombre"""
        all_combos = REGULAR_COMBOS + (PREMIUM_COMBOS if is_premium else [])
        
        for combo in all_combos:
            if combo["name"] == combo_name:
                return combo["price"]
        
        return 0.0


class PremiumService:
    """Servicio para funcionalidades premium"""

    @staticmethod
    def upgrade_to_premium(db: Session, user: User, auto_select_seats: bool = True, seats_count: int = 2) -> Tuple[bool, str, List[Seat]]:
        """
        Actualiza un usuario a premium y opcionalmente auto-selecciona mejores asientos.
        
        Args:
            db: Sesión de base de datos
            user: Usuario a actualizar
            auto_select_seats: Si auto-seleccionar mejores asientos
            seats_count: Cantidad de asientos a auto-seleccionar
            
        Returns:
            Tuple[bool, str, List[Seat]]: (éxito, mensaje, asientos seleccionados)
        """
        try:
            # Actualizar usuario a premium
            user.is_premium = True
            
            selected_seats = []
            
            if auto_select_seats:
                # Cancelar reservas existentes
                existing_reservations = db.query(Reservation).filter(Reservation.user_id == user.id).all()
                for reservation in existing_reservations:
                    reservation.seat.status = "available"
                    db.delete(reservation)
                
                # Seleccionar mejores asientos disponibles
                best_seats = PremiumService._get_best_available_seats(db, seats_count)
                
                # Reservar los mejores asientos
                for seat in best_seats:
                    reservation = Reservation(
                        user_id=user.id,
                        seat_id=seat.id,
                        combo="Combo VIP"  # Combo premium por defecto
                    )
                    db.add(reservation)
                    seat.status = "reserved"
                    selected_seats.append(seat)
            
            db.commit()
            
            logger.info(f"⭐ Usuario {user.username} actualizado a PREMIUM con {len(selected_seats)} asientos VIP")
            return True, "Upgrade a Premium exitoso", selected_seats
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error en upgrade premium: {e}")
            return False, f"Error interno: {str(e)}", []

    @staticmethod
    def _get_best_available_seats(db: Session, count: int) -> List[Seat]:
        """
        Obtiene los mejores asientos disponibles (filas D y E, posiciones centrales).
        
        Args:
            db: Sesión de base de datos
            count: Cantidad de asientos a obtener
            
        Returns:
            List[Seat]: Lista de mejores asientos disponibles
        """
        # Priorizar filas D y E (mejores del cine) y posiciones centrales
        best_seats = db.query(Seat).filter(
            and_(
                Seat.status == "available",
                or_(Seat.row_letter == "D", Seat.row_letter == "E"),
                Seat.number.between(4, 9)  # Posiciones centrales
            )
        ).order_by(
            Seat.row_letter,
            Seat.number
        ).limit(count).all()
        
        # Si no hay suficientes en las mejores filas, completar con otros premium
        if len(best_seats) < count:
            additional_seats = db.query(Seat).filter(
                and_(
                    Seat.status == "available",
                    Seat.is_premium == True,
                    ~Seat.id.in_([s.id for s in best_seats])
                )
            ).limit(count - len(best_seats)).all()
            
            best_seats.extend(additional_seats)
        
        return best_seats[:count]


class BotService:
    """Servicio para simulación de bot que actúa como usuario concurrente"""

    @staticmethod
    def simulate_user_action(db: Session) -> Tuple[str, bool, str, List[Seat]]:
        """
        Simula una acción aleatoria del bot (reserva, cancelación, etc.).
        
        Args:
            db: Sesión de base de datos
            
        Returns:
            Tuple[str, bool, str, List[Seat]]: (acción, éxito, mensaje, asientos afectados)
        """
        try:
            # Obtener usuario bot
            bot_user = db.query(User).filter(User.username == "cinema_bot").first()
            if not bot_user:
                return "error", False, "Bot no encontrado", []
            
            # Decidir acción aleatoria
            actions = ["reserve", "cancel", "reserve", "reserve"]  # Sesgo hacia reservar
            action = random.choice(actions)
            
            if action == "reserve":
                return BotService._bot_reserve_seats(db, bot_user)
            elif action == "cancel":
                return BotService._bot_cancel_reservation(db, bot_user)
            
            return "unknown", False, "Acción desconocida", []
            
        except Exception as e:
            logger.error(f"Error en simulación de bot: {e}")
            return "error", False, str(e), []

    @staticmethod
    def _bot_reserve_seats(db: Session, bot_user: User) -> Tuple[str, bool, str, List[Seat]]:
        """Simula reserva de asientos por el bot"""
        try:
            # Seleccionar 1-3 asientos aleatorios disponibles
            available_seats = ReservationService.get_available_seats(db)
            
            if not available_seats:
                return "reserve", False, "No hay asientos disponibles", []
            
            seats_to_reserve = random.sample(available_seats, min(random.randint(1, 3), len(available_seats)))
            seat_ids = [seat.id for seat in seats_to_reserve]
            
            # Seleccionar combo aleatorio
            combo = random.choice([combo["name"] for combo in REGULAR_COMBOS] + [None, None])  # 50% sin combo
            
            success, message, reservations = ReservationService.reserve_seats(
                db, bot_user, seat_ids, combo
            )
            
            if success:
                logger.info(f"🤖 Bot reservó {len(seats_to_reserve)} asientos: {[s.seat_name for s in seats_to_reserve]}")
            
            return "reserve", success, f"Bot: {message}", seats_to_reserve if success else []
            
        except Exception as e:
            return "reserve", False, f"Bot error: {str(e)}", []

    @staticmethod
    def _bot_cancel_reservation(db: Session, bot_user: User) -> Tuple[str, bool, str, List[Seat]]:
        """Simula cancelación de reserva por el bot"""
        try:
            bot_reservations = ReservationService.get_user_reservations(db, bot_user)
            
            if not bot_reservations:
                return "cancel", False, "Bot no tiene reservas para cancelar", []
            
            # Cancelar una reserva aleatoria
            reservation_to_cancel = random.choice(bot_reservations)
            seat = reservation_to_cancel.seat
            
            success, message = ReservationService.cancel_reservation(
                db, bot_user, reservation_to_cancel.seat_id
            )
            
            if success:
                logger.info(f"🤖 Bot canceló reserva del asiento: {seat.seat_name}")
            
            return "cancel", success, f"Bot: {message}", [seat] if success else []
            
        except Exception as e:
            return "cancel", False, f"Bot error: {str(e)}", []


def get_available_combos(is_premium: bool = False) -> Dict:
    """
    Obtiene los combos disponibles según el tipo de usuario.
    
    Args:
        is_premium: Si el usuario es premium
        
    Returns:
        Dict: Diccionario con combos regulares y premium
    """
    response = {
        "regular_combos": REGULAR_COMBOS,
        "premium_combos": PREMIUM_COMBOS if is_premium else [],
        "recommendations": [
            "Combo Clásico es el más popular",
            "Combo Familiar perfecto para compartir",
            "Usuarios premium tienen acceso a combos exclusivos"
        ]
    }
    
    if is_premium:
        response["recommendations"].append("¡Disfruta tu 15% de descuento premium!")
    
    return response