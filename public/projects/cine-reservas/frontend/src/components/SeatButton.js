/**
 * Componente individual de asiento para el mapa del cine.
 * Maneja la visualización y selección de asientos con diferentes estados.
 */

import React from 'react';
import { Crown, Lock, User, Sparkles } from 'lucide-react';
import clsx from 'clsx';

/**
 * Componente SeatButton
 */
const SeatButton = ({ 
  seat, 
  status, 
  onClick, 
  disabled = false,
  showTooltip = true 
}) => {
  // Función para obtener colores según el estado
  const getSeatColors = (status, isPremium) => {
    const baseClasses = "transition-all duration-200 transform hover:scale-105 active:scale-95";
    
    switch (status) {
      case 'available':
        return isPremium 
          ? `${baseClasses} bg-gradient-to-br from-primary-400 to-primary-500 hover:from-primary-300 hover:to-primary-400 text-white shadow-lg hover:shadow-primary-300/50`
          : `${baseClasses} bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-lg hover:shadow-emerald-300/50`;
      
      case 'selected':
        return `${baseClasses} bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl shadow-purple-300/60 ring-2 ring-purple-300`;
      
      case 'my-reserved':
        return `${baseClasses} bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg ring-2 ring-blue-300`;
      
      case 'reserved':
        return `${baseClasses} bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg cursor-not-allowed opacity-75`;
      
      case 'occupied':
        return `${baseClasses} bg-gradient-to-br from-gray-600 to-gray-700 text-white shadow-lg cursor-not-allowed opacity-50`;
      
      default:
        return `${baseClasses} bg-gradient-to-br from-gray-400 to-gray-500 text-white`;
    }
  };

  // Función para obtener el icono según el estado
  const getSeatIcon = (status, isPremium) => {
    const iconClass = "w-3 h-3";
    
    if (isPremium && (status === 'available' || status === 'selected')) {
      return <Crown className={iconClass} />;
    }
    
    switch (status) {
      case 'selected':
        return <Sparkles className={iconClass} />;
      case 'my-reserved':
        return <User className={iconClass} />;
      case 'reserved':
      case 'occupied':
        return <Lock className={iconClass} />;
      default:
        return null;
    }
  };

  // Función para obtener el texto del tooltip
  const getTooltipText = () => {
    const seatName = `${seat.row_letter}${seat.number}`;
    const premiumText = seat.is_premium ? ' (Premium)' : '';
    
    switch (status) {
      case 'available':
        return `Asiento ${seatName}${premiumText} - Disponible`;
      case 'selected':
        return `Asiento ${seatName}${premiumText} - Seleccionado`;
      case 'my-reserved':
        return `Asiento ${seatName}${premiumText} - Tu reserva`;
      case 'reserved':
        return `Asiento ${seatName}${premiumText} - Reservado`;
      case 'occupied':
        return `Asiento ${seatName}${premiumText} - Ocupado`;
      default:
        return `Asiento ${seatName}${premiumText}`;
    }
  };

  // Determinar si el asiento es clickeable
  const isClickable = !disabled && (status === 'available' || status === 'selected');

  const handleClick = () => {
    if (isClickable && onClick) {
      onClick(seat.id);
    }
  };

  return (
    <div className="relative group">
      <button
        onClick={handleClick}
        disabled={!isClickable}
        className={clsx(
          "w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center relative",
          getSeatColors(status, seat.is_premium),
          {
            "cursor-pointer": isClickable,
            "cursor-not-allowed": !isClickable
          }
        )}
        aria-label={getTooltipText()}
      >
        {/* Número del asiento */}
        <span className="absolute inset-0 flex items-center justify-center">
          {seat.number}
        </span>
        
        {/* Icono en la esquina superior derecha */}
        {getSeatIcon(status, seat.is_premium) && (
          <span className="absolute -top-1 -right-1 bg-black/20 rounded-full p-0.5">
            {getSeatIcon(status, seat.is_premium)}
          </span>
        )}

        {/* Efecto de brillo para asientos premium */}
        {seat.is_premium && status === 'available' && (
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse-slow" />
        )}
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
          {getTooltipText()}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black" />
        </div>
      )}
    </div>
  );
};

export default SeatButton;