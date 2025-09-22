/**
 * Página principal del sistema de reservas de cine.
 * Contiene el mapa de asientos, selección de combos y panel de control.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Film, 
  User, 
  Crown, 
  LogOut, 
  Bot, 
  RefreshCw, 
  Ticket, 
  Clock,
  Settings,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useReservations } from '../hooks/useReservations';
import SeatsMap from '../components/SeatsMap';
import ComboSelector from '../components/ComboSelector';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const CinemaPage = () => {
  // Estado local
  const [showMobilePanel, setShowMobilePanel] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  // Hooks
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const {
    seats,
    selectedSeats,
    myReservations,
    availableCombos,
    selectedCombo,
    stats,
    isLoading,
    isBooking,
    toggleSeatSelection,
    clearSelection,
    getSeatStatus,
    bookSelectedSeats,
    cancelReservation,
    upgradeToPremium,
    setSelectedCombo,
    simulateBotAction,
    refreshAll
  } = useReservations();

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Timer para mostrar tiempo restante de sesión
  useEffect(() => {
    if (!user?.expires_at) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const expires = new Date(user.expires_at).getTime();
      const difference = expires - now;

      if (difference > 0) {
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      } else {
        setTimeLeft('Expirado');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [user]);

  // Handlers
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleBookSeats = async () => {
    const result = await bookSelectedSeats();
    if (result.success) {
      setShowMobilePanel(false);
    }
  };

  const handleCancelReservation = async (seatId) => {
    if (window.confirm('¿Estás seguro de cancelar esta reserva?')) {
      await cancelReservation(seatId);
    }
  };

  const handlePremiumUpgrade = async () => {
    if (window.confirm('¿Deseas actualizar a Premium? Se auto-seleccionarán los mejores asientos.')) {
      await upgradeToPremium(true, 2);
    }
  };

  const handleBotSimulation = async () => {
    await simulateBotAction();
  };

  const calculateTotal = () => {
    let total = selectedSeats.length * 10.99; // Precio base por asiento
    
    // Agregar precio del combo
    if (selectedCombo) {
      const allCombos = [...(availableCombos.regular_combos || []), ...(availableCombos.premium_combos || [])];
      const combo = allCombos.find(c => c.name === selectedCombo);
      if (combo) {
        total += combo.price;
      }
    }
    
    // Aplicar descuento premium
    if (user?.is_premium) {
      total *= 0.85; // 15% descuento
    }
    
    return total.toFixed(2);
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800/80 backdrop-blur border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo y título */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <Film className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Cinema Reservations</h1>
                <p className="text-xs text-gray-400">Sistema de Reservas</p>
              </div>
            </div>

            {/* Info del usuario y controles */}
            <div className="flex items-center space-x-4">
              {/* Timer de sesión */}
              {timeLeft && (
                <div className="flex items-center space-x-2 bg-gray-700/50 px-3 py-2 rounded-lg">
                  <Clock className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-yellow-400">{timeLeft}</span>
                </div>
              )}

              {/* Estadísticas móviles */}
              <button
                onClick={() => setShowMobilePanel(!showMobilePanel)}
                className="md:hidden bg-primary-500 hover:bg-primary-600 px-3 py-2 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>

              {/* Info del usuario */}
              <div className="hidden sm:flex items-center space-x-2 bg-gray-700/50 px-3 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  {user.is_premium ? (
                    <Crown className="w-4 h-4 text-primary-400" />
                  ) : (
                    <User className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-sm font-medium">{user.username}</span>
                  {user.is_premium && (
                    <span className="text-xs bg-primary-500 text-white px-2 py-0.5 rounded-full">
                      PREMIUM
                    </span>
                  )}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="hidden md:flex items-center space-x-2">
                <button
                  onClick={handleBotSimulation}
                  className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg transition-colors flex items-center space-x-2"
                  title="Simular actividad del bot"
                >
                  <Bot className="w-4 h-4" />
                  <span className="hidden lg:inline text-sm">Bot</span>
                </button>

                <button
                  onClick={refreshAll}
                  className="bg-gray-600 hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors"
                  title="Refrescar datos"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:inline text-sm">Salir</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Mapa de asientos */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <Ticket className="w-5 h-5 text-primary-400" />
                  <span>Selecciona tus Asientos</span>
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Haz clic en los asientos para seleccionarlos (máximo 6)
                </p>
              </div>
              
              <SeatsMap
                seats={seats}
                onSeatClick={toggleSeatSelection}
                getSeatStatus={getSeatStatus}
                selectedSeats={selectedSeats}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Panel lateral */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              
              {/* Panel Premium (si no es premium) */}
              {!user.is_premium && (
                <div className="bg-gradient-to-br from-primary-900/50 to-primary-800/50 rounded-xl border border-primary-600/50 p-6">
                  <div className="text-center">
                    <Crown className="w-12 h-12 text-primary-400 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-white mb-2">¡Actualízate a Premium!</h3>
                    <p className="text-sm text-gray-300 mb-4">
                      • 15% de descuento<br/>
                      • Mejores asientos automáticos<br/>
                      • Combos exclusivos
                    </p>
                    <button
                      onClick={handlePremiumUpgrade}
                      disabled={isBooking}
                      className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
                    >
                      Actualizar a Premium
                    </button>
                  </div>
                </div>
              )}

              {/* Selección de combos */}
              {selectedSeats.length > 0 && (
                <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
                  <ComboSelector
                    availableCombos={availableCombos}
                    selectedCombo={selectedCombo}
                    onComboSelect={setSelectedCombo}
                    isPremium={user.is_premium}
                  />
                </div>
              )}

              {/* Resumen de selección */}
              {selectedSeats.length > 0 && (
                <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Resumen</h3>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Asientos ({selectedSeats.length})</span>
                      <span className="text-white">${(selectedSeats.length * 10.99).toFixed(2)}</span>
                    </div>
                    
                    {selectedCombo && (
                      <div className="flex justify-between">
                        <span className="text-gray-300">Combo</span>
                        <span className="text-white">
                          ${[...availableCombos.regular_combos || [], ...availableCombos.premium_combos || []]
                            .find(c => c.name === selectedCombo)?.price?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    )}
                    
                    {user.is_premium && (
                      <div className="flex justify-between text-primary-400">
                        <span>Descuento Premium (15%)</span>
                        <span>-${(parseFloat(calculateTotal()) * 0.15 / 0.85).toFixed(2)}</span>
                      </div>
                    )}
                    
                    <hr className="border-gray-600" />
                    
                    <div className="flex justify-between font-semibold text-lg">
                      <span className="text-white">Total</span>
                      <span className="text-primary-400">${calculateTotal()}</span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <button
                      onClick={handleBookSeats}
                      disabled={isBooking || selectedSeats.length === 0}
                      className={clsx(
                        "w-full py-3 px-4 rounded-lg font-medium transition-all duration-200",
                        {
                          "bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 text-white shadow-lg": !isBooking,
                          "bg-gray-600 text-gray-400 cursor-not-allowed": isBooking
                        }
                      )}
                    >
                      {isBooking ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                          <span>Reservando...</span>
                        </div>
                      ) : (
                        `Reservar ${selectedSeats.length} asiento${selectedSeats.length > 1 ? 's' : ''}`
                      )}
                    </button>

                    <button
                      onClick={clearSelection}
                      className="w-full py-2 px-4 text-gray-400 hover:text-white transition-colors"
                    >
                      Limpiar selección
                    </button>
                  </div>
                </div>
              )}

              {/* Mis reservas actuales */}
              {myReservations.length > 0 && (
                <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Mis Reservas</h3>
                  
                  <div className="space-y-2">
                    {myReservations.map(reservation => (
                      <div key={reservation.id} className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg">
                        <div>
                          <p className="text-white font-medium">
                            {reservation.seat.seat_name}
                            {reservation.seat.is_premium && <Crown className="w-4 h-4 text-primary-400 inline ml-1" />}
                          </p>
                          {reservation.combo && (
                            <p className="text-xs text-gray-400">{reservation.combo}</p>
                          )}
                        </div>
                        
                        <button
                          onClick={() => handleCancelReservation(reservation.seat_id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Cancelar reserva"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Estadísticas del sistema */}
              <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Estado del Cine</h3>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-400">{stats.availableSeats}</div>
                    <div className="text-gray-400">Disponibles</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-400">{stats.premiumSeats}</div>
                    <div className="text-gray-400">Premium</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{stats.myReservationsCount}</div>
                    <div className="text-gray-400">Mis reservas</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{stats.systemStats.active_users || 0}</div>
                    <div className="text-gray-400">Usuarios</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel móvil */}
      {showMobilePanel && (
        <div className="fixed inset-0 bg-black/50 z-50 md:hidden">
          <div className="absolute bottom-0 left-0 right-0 bg-gray-800 rounded-t-xl p-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Panel de Control</h3>
              <button
                onClick={() => setShowMobilePanel(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Contenido del panel móvil - similar al panel lateral pero adaptado */}
            <div className="space-y-4">
              {/* Aquí iría el contenido similar al panel lateral pero optimizado para móvil */}
              <div className="flex space-x-2">
                <button
                  onClick={handleBotSimulation}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Bot className="w-4 h-4" />
                  <span>Simular Bot</span>
                </button>
                
                <button
                  onClick={refreshAll}
                  className="bg-gray-600 hover:bg-gray-700 py-2 px-4 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 py-2 px-4 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CinemaPage;