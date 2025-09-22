/**
 * Componente principal del mapa de asientos del cine.
 * Muestra la grilla completa de asientos organizados por filas.
 */

import React from 'react';
import { Monitor, Crown, User, Lock, Sparkles, Circle } from 'lucide-react';
import SeatButton from './SeatButton';
import clsx from 'clsx';

const SeatsMap = ({ 
  seats, 
  onSeatClick, 
  getSeatStatus, 
  selectedSeats, 
  isLoading = false,
  className = ""
}) => {
  
  // Organizar asientos por filas
  const seatsByRow = React.useMemo(() => {
    const rows = {};
    
    seats.forEach(seat => {
      if (!rows[seat.row_letter]) {
        rows[seat.row_letter] = [];
      }
      rows[seat.row_letter].push(seat);
    });
    
    // Ordenar asientos dentro de cada fila por número
    Object.keys(rows).forEach(row => {
      rows[row].sort((a, b) => a.number - b.number);
    });
    
    return rows;
  }, [seats]);

  const rowLabels = Object.keys(seatsByRow).sort();

  if (isLoading) {
    return (
      <div className={clsx("w-full p-6", className)}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded mb-6 w-1/3 mx-auto"></div>
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex justify-center space-x-2">
                <div className="w-8 h-6 bg-gray-700 rounded mr-4"></div>
                {[...Array(12)].map((_, j) => (
                  <div key={j} className="w-8 h-8 bg-gray-700 rounded"></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (seats.length === 0) {
    return (
      <div className={clsx("w-full p-6 text-center", className)}>
        <p className="text-gray-400">No se pudieron cargar los asientos</p>
      </div>
    );
  }

  return (
    <div className={clsx("w-full p-4 sm:p-6", className)}>
      {/* Pantalla del cine */}
      <div className="mb-8">
        <div className="relative mx-auto max-w-2xl">
          <div className="bg-gradient-to-b from-gray-300 to-gray-500 h-3 rounded-t-full shadow-lg"></div>
          <div className="bg-gradient-to-b from-gray-400 to-gray-600 h-2 rounded-t-full shadow-inner"></div>
          <div className="flex items-center justify-center mt-2">
            <Monitor className="w-6 h-6 text-gray-400 mr-2" />
            <span className="text-gray-400 text-sm font-medium">PANTALLA</span>
            <Monitor className="w-6 h-6 text-gray-400 ml-2" />
          </div>
        </div>
      </div>

      {/* Leyenda de estados */}
      <div className="mb-6 p-4 bg-gray-800/50 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-300 mb-3 text-center">Leyenda de Asientos</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded flex items-center justify-center">
              <Circle className="w-2 h-2 text-white fill-current" />
            </div>
            <span className="text-gray-300">Libre</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gradient-to-br from-primary-400 to-primary-500 rounded flex items-center justify-center">
              <Crown className="w-2 h-2 text-white" />
            </div>
            <span className="text-gray-300">Premium</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded flex items-center justify-center">
              <Sparkles className="w-2 h-2 text-white" />
            </div>
            <span className="text-gray-300">Seleccionado</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded flex items-center justify-center">
              <User className="w-2 h-2 text-white" />
            </div>
            <span className="text-gray-300">Tu reserva</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gradient-to-br from-red-500 to-red-600 rounded flex items-center justify-center">
              <Lock className="w-2 h-2 text-white" />
            </div>
            <span className="text-gray-300">Ocupado</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-primary-400 font-semibold">
              {selectedSeats.length}/6
            </span>
            <span className="text-gray-300 text-xs">seleccionados</span>
          </div>
        </div>
      </div>

      {/* Grilla de asientos */}
      <div className="space-y-3">
        {rowLabels.map(rowLetter => (
          <div key={rowLetter} className="flex items-center justify-center space-x-2 sm:space-x-3">
            {/* Etiqueta de fila */}
            <div className="w-6 h-8 sm:w-8 sm:h-10 flex items-center justify-center font-bold text-gray-400 text-sm sm:text-base">
              {rowLetter}
            </div>
            
            {/* Asientos de la fila */}
            <div className="flex space-x-1 sm:space-x-2">
              {seatsByRow[rowLetter].map((seat, index) => {
                // Añadir espacio en el medio para simular pasillo
                const shouldAddGap = index === 5; // Después del asiento 6
                
                return (
                  <React.Fragment key={seat.id}>
                    <SeatButton
                      seat={seat}
                      status={getSeatStatus(seat)}
                      onClick={onSeatClick}
                    />
                    {shouldAddGap && (
                      <div className="w-2 sm:w-4"></div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
            
            {/* Etiqueta de fila derecha */}
            <div className="w-6 h-8 sm:w-8 sm:h-10 flex items-center justify-center font-bold text-gray-400 text-sm sm:text-base">
              {rowLetter}
            </div>
          </div>
        ))}
      </div>

      {/* Información adicional */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center space-x-4 text-xs text-gray-400">
          <span>Total: {seats.length} asientos</span>
          <span>•</span>
          <span>Premium: {seats.filter(s => s.is_premium).length} asientos</span>
          <span>•</span>
          <span>Disponibles: {seats.filter(s => s.status === 'available').length} asientos</span>
        </div>
      </div>
    </div>
  );
};

export default SeatsMap;