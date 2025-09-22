"""
Esquemas Pydantic para validación y serialización de datos.
Define los contratos de entrada y salida de la API REST.
"""

from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional, List
import re


# --- Esquemas de Usuario ---

class UserCreate(BaseModel):
    """Datos para crear un nuevo usuario"""
    username: str = Field(..., min_length=3, max_length=50, description="Nombre de usuario único")
    password: str = Field(..., min_length=4, max_length=100, description="Contraseña (será hasheada)")

    @validator('username')
    def validate_username(cls, v):
        if not re.match(r'^[a-zA-Z0-9_]+$', v):
            raise ValueError('El username solo puede contener letras, números y guiones bajos')
        return v.lower()


class UserLogin(BaseModel):
    """Datos para login de usuario"""
    username: str = Field(..., description="Nombre de usuario")
    password: str = Field(..., description="Contraseña")


class UserResponse(BaseModel):
    """Respuesta con datos del usuario (sin contraseña)"""
    id: int
    username: str
    created_at: datetime
    expires_at: datetime
    is_premium: bool

    class Config:
        from_attributes = True


class Token(BaseModel):
    """Respuesta del token JWT"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
    expires_in_minutes: int


# --- Esquemas de Asientos ---

class SeatResponse(BaseModel):
    """Información de un asiento"""
    id: int
    row_letter: str
    number: int
    status: str  # available, reserved, occupied
    is_premium: bool
    seat_name: str

    class Config:
        from_attributes = True


class SeatsGridResponse(BaseModel):
    """Respuesta con la grilla completa de asientos"""
    seats: List[SeatResponse]
    rows: List[str]
    seats_per_row: int
    total_seats: int
    available_seats: int
    premium_seats: int


# --- Esquemas de Reservas ---

class ReservationCreate(BaseModel):
    """Datos para crear una nueva reserva"""
    seat_ids: List[int] = Field(..., min_items=1, max_items=6, description="IDs de asientos a reservar")
    combo: Optional[str] = Field(None, max_length=100, description="Combo seleccionado")

    @validator('seat_ids')
    def validate_seat_ids(cls, v):
        if len(v) != len(set(v)):
            raise ValueError('No se pueden repetir asientos en la misma reserva')
        return v


class ReservationResponse(BaseModel):
    """Información de una reserva"""
    id: int
    user_id: int
    seat_id: int
    combo: Optional[str]
    created_at: datetime
    seat: SeatResponse

    class Config:
        from_attributes = True


class ReservationSummary(BaseModel):
    """Resumen de reservas de un usuario"""
    user: UserResponse
    reservations: List[ReservationResponse]
    total_seats: int
    total_cost: float


# --- Esquemas de Premium ---

class PremiumUpgrade(BaseModel):
    """Datos para upgrade a premium"""
    auto_select_seats: bool = Field(True, description="Auto-seleccionar mejores asientos disponibles")
    seats_count: int = Field(2, ge=1, le=4, description="Cantidad de asientos a auto-seleccionar")


class PremiumResponse(BaseModel):
    """Respuesta del upgrade a premium"""
    user: UserResponse
    auto_selected_seats: List[SeatResponse]
    discount_applied: float
    total_cost: float
    premium_benefits: List[str]


# --- Esquemas de Bot ---

class BotAction(BaseModel):
    """Acción del bot para simulación"""
    action: str = Field(..., description="Tipo de acción: reserve, cancel, upgrade")
    seat_count: Optional[int] = Field(1, ge=1, le=3, description="Cantidad de asientos para reservar")
    combo: Optional[str] = Field(None, description="Combo a seleccionar")


class BotResponse(BaseModel):
    """Respuesta de acción del bot"""
    action_type: str
    success: bool
    message: str
    seats_affected: List[SeatResponse]
    timestamp: datetime


# --- Esquemas de Sistema ---

class SystemStats(BaseModel):
    """Estadísticas del sistema"""
    active_users: int
    total_seats: int
    available_seats: int
    reserved_seats: int
    premium_users: int
    total_reservations: int
    uptime_minutes: float


class ApiResponse(BaseModel):
    """Respuesta estándar de la API"""
    success: bool
    message: str
    data: Optional[dict] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# --- Esquemas de Combos ---

class ComboOption(BaseModel):
    """Opción de combo disponible"""
    name: str
    description: str
    price: float
    is_premium_exclusive: bool = False


class ComboResponse(BaseModel):
    """Lista de combos disponibles"""
    regular_combos: List[ComboOption]
    premium_combos: List[ComboOption]
    recommendations: List[str]