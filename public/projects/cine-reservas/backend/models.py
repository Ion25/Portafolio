"""
Modelos de base de datos para el sistema de reservas de cine.
Utiliza SQLAlchemy ORM para definir las tablas y relaciones.
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime, timedelta

Base = declarative_base()


class User(Base):
    """
    Modelo de usuario del sistema.
    - Máximo 12 usuarios simultáneos
    - Cada cuenta expira en 10 minutos
    - Contraseñas hasheadas con bcrypt
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=func.now())
    expires_at = Column(DateTime, default=lambda: datetime.utcnow() + timedelta(minutes=10))
    is_premium = Column(Boolean, default=False)

    # Relación con reservas
    reservations = relationship("Reservation", back_populates="user", cascade="all, delete-orphan")

    def is_expired(self):
        """Verifica si el usuario ha expirado"""
        return datetime.utcnow() > self.expires_at

    def __repr__(self):
        return f"<User(username='{self.username}', premium={self.is_premium})>"


class Seat(Base):
    """
    Modelo de asiento del cine.
    - Organizados por fila (letra) y número
    - Estados: available, reserved, occupied, premium
    - Algunos asientos son premium (mejores ubicaciones)
    """
    __tablename__ = "seats"

    id = Column(Integer, primary_key=True, index=True)
    row_letter = Column(String(1), nullable=False)
    number = Column(Integer, nullable=False)
    status = Column(String(20), default="available", index=True)  # available, reserved, occupied, premium
    is_premium = Column(Boolean, default=False)

    # Constraint de unicidad para fila + número
    __table_args__ = (UniqueConstraint('row_letter', 'number', name='unique_seat_position'),)

    # Relación con reservas
    reservations = relationship("Reservation", back_populates="seat")

    @property
    def seat_name(self):
        """Retorna el nombre del asiento (ej: A1, B5, etc.)"""
        return f"{self.row_letter}{self.number}"

    def __repr__(self):
        return f"<Seat({self.seat_name}, status='{self.status}', premium={self.is_premium})>"


class Reservation(Base):
    """
    Modelo de reserva de asientos.
    - Vincula usuario con asiento
    - Incluye combos seleccionados
    - Se elimina automáticamente cuando expira el usuario
    """
    __tablename__ = "reservations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    seat_id = Column(Integer, ForeignKey("seats.id", ondelete="CASCADE"), nullable=False)
    combo = Column(String(100))  # Combo seleccionado (ej: "Popcorn Large + Soda")
    created_at = Column(DateTime, default=func.now())

    # Constraint de unicidad para evitar dobles reservas del mismo asiento
    __table_args__ = (UniqueConstraint('seat_id', name='unique_seat_reservation'),)

    # Relaciones
    user = relationship("User", back_populates="reservations")
    seat = relationship("Seat", back_populates="reservations")

    def __repr__(self):
        return f"<Reservation(user_id={self.user_id}, seat={self.seat.seat_name if self.seat else 'N/A'})>"