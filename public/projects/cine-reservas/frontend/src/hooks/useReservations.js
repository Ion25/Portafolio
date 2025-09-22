/**
 * Hook personalizado para manejar reservas de asientos.
 * Proporciona funcionalidad para seleccionar asientos, reservar, cancelar, etc.
 */

import { useState, useEffect, useCallback } from 'react';
import { reservationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const useReservations = () => {
  // Estados principales
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [myReservations, setMyReservations] = useState([]);
  const [availableCombos, setAvailableCombos] = useState({ regular_combos: [], premium_combos: [] });
  const [selectedCombo, setSelectedCombo] = useState('');
  const [systemStats, setSystemStats] = useState({});
  
  // Estados de carga
  const [isLoading, setIsLoading] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState(null);

  // Contexto de autenticación
  const { user, isAuthenticated } = useAuth();

  /**
   * Cargar grilla de asientos desde la API
   */
  const loadSeats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const seatsData = await reservationAPI.getSeats();
      setSeats(seatsData.seats || []);
      
      console.log('✅ Asientos cargados:', seatsData.seats?.length);
      
    } catch (error) {
      console.error('❌ Error cargando asientos:', error);
      setError('Error cargando asientos');
      toast.error('Error cargando asientos del cine');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Cargar mis reservas actuales
   */
  const loadMyReservations = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const reservationsData = await reservationAPI.getMyReservations();
      setMyReservations(reservationsData.reservations || []);
      
    } catch (error) {
      console.error('❌ Error cargando reservas:', error);
    }
  }, [isAuthenticated]);

  /**
   * Cargar combos disponibles
   */
  const loadCombos = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const combosData = await reservationAPI.getCombos();
      setAvailableCombos(combosData);
      
    } catch (error) {
      console.error('❌ Error cargando combos:', error);
    }
  }, [isAuthenticated]);

  /**
   * Cargar estadísticas del sistema
   */
  const loadSystemStats = useCallback(async () => {
    try {
      const stats = await reservationAPI.getSystemStats();
      setSystemStats(stats);
      
    } catch (error) {
      console.error('❌ Error cargando estadísticas:', error);
    }
  }, []);

  /**
   * Seleccionar o deseleccionar un asiento
   */
  const toggleSeatSelection = useCallback((seatId) => {
    setSelectedSeats(prev => {
      const isSelected = prev.includes(seatId);
      
      if (isSelected) {
        // Deseleccionar
        return prev.filter(id => id !== seatId);
      } else {
        // Seleccionar (máximo 6 asientos)
        if (prev.length >= 6) {
          toast.error('Máximo 6 asientos por reserva');
          return prev;
        }
        return [...prev, seatId];
      }
    });
  }, []);

  /**
   * Limpiar selección de asientos
   */
  const clearSelection = useCallback(() => {
    setSelectedSeats([]);
    setSelectedCombo('');
  }, []);

  /**
   * Reservar asientos seleccionados
   */
  const bookSelectedSeats = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para reservar');
      return { success: false };
    }

    if (selectedSeats.length === 0) {
      toast.error('Selecciona al menos un asiento');
      return { success: false };
    }

    try {
      setIsBooking(true);
      
      const reservationData = {
        seat_ids: selectedSeats,
        combo: selectedCombo || undefined
      };

      const result = await reservationAPI.bookSeats(reservationData);
      
      toast.success(`¡Reserva exitosa! ${selectedSeats.length} asientos reservados`);
      
      // Limpiar selección y recargar datos
      clearSelection();
      await Promise.all([loadSeats(), loadMyReservations()]);
      
      return { success: true, data: result };
      
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Error en la reserva';
      console.error('❌ Error reservando asientos:', error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsBooking(false);
    }
  }, [isAuthenticated, selectedSeats, selectedCombo, clearSelection, loadSeats, loadMyReservations]);

  /**
   * Cancelar una reserva específica
   */
  const cancelReservation = useCallback(async (seatId) => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión');
      return { success: false };
    }

    try {
      await reservationAPI.cancelReservation(seatId);
      
      toast.success('Reserva cancelada exitosamente');
      
      // Recargar datos
      await Promise.all([loadSeats(), loadMyReservations()]);
      
      return { success: true };
      
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Error cancelando reserva';
      console.error('❌ Error cancelando reserva:', error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [isAuthenticated, loadSeats, loadMyReservations]);

  /**
   * Upgrade a premium con auto-selección
   */
  const upgradeToPremium = useCallback(async (autoSelect = true, seatsCount = 2) => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión');
      return { success: false };
    }

    try {
      setIsBooking(true);
      
      const upgradeData = {
        auto_select_seats: autoSelect,
        seats_count: seatsCount
      };

      const result = await reservationAPI.upgradeToPremium(upgradeData);
      
      toast.success('¡Upgrade a Premium exitoso! 🎉');
      toast.success('Disfrutas 15% de descuento y mejores asientos');
      
      // Recargar todos los datos
      await Promise.all([
        loadSeats(), 
        loadMyReservations(), 
        loadCombos()
      ]);
      
      return { success: true, data: result };
      
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Error en upgrade premium';
      console.error('❌ Error en upgrade premium:', error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsBooking(false);
    }
  }, [isAuthenticated, loadSeats, loadMyReservations, loadCombos]);

  /**
   * Simular acción del bot
   */
  const simulateBotAction = useCallback(async () => {
    try {
      const result = await reservationAPI.simulateBotAction();
      
      if (result.success) {
        toast.success(`🤖 Bot: ${result.message}`);
      } else {
        toast.error(`🤖 Bot: ${result.message}`);
      }
      
      // Recargar asientos para ver cambios
      await loadSeats();
      
      return result;
      
    } catch (error) {
      console.error('❌ Error simulando bot:', error);
      toast.error('Error en simulación de bot');
      return { success: false, error: error.message };
    }
  }, [loadSeats]);

  /**
   * Refrescar todos los datos
   */
  const refreshAll = useCallback(async () => {
    await Promise.all([
      loadSeats(),
      loadMyReservations(),
      loadCombos(),
      loadSystemStats()
    ]);
  }, [loadSeats, loadMyReservations, loadCombos, loadSystemStats]);

  // Efectos para cargar datos iniciales
  useEffect(() => {
    loadSeats();
    loadSystemStats();
  }, [loadSeats, loadSystemStats]);

  useEffect(() => {
    if (isAuthenticated) {
      loadMyReservations();
      loadCombos();
    }
  }, [isAuthenticated, loadMyReservations, loadCombos]);

  // Función auxiliar para obtener el estado de un asiento
  const getSeatStatus = useCallback((seat) => {
    // Si el asiento está en mis reservas, es 'my-reserved'
    const isMyReservation = myReservations.some(res => res.seat_id === seat.id);
    if (isMyReservation) {
      return 'my-reserved';
    }
    
    // Si está seleccionado para reservar, es 'selected'
    const isSelected = selectedSeats.includes(seat.id);
    if (isSelected) {
      return 'selected';
    }
    
    // Devolver estado original
    return seat.status;
  }, [myReservations, selectedSeats]);

  // Estadísticas calculadas
  const stats = {
    totalSeats: seats.length,
    availableSeats: seats.filter(s => s.status === 'available').length,
    myReservationsCount: myReservations.length,
    selectedSeatsCount: selectedSeats.length,
    premiumSeats: seats.filter(s => s.is_premium).length,
    systemStats
  };

  return {
    // Estado
    seats,
    selectedSeats,
    myReservations,
    availableCombos,
    selectedCombo,
    stats,
    isLoading,
    isBooking,
    error,

    // Funciones de asientos
    toggleSeatSelection,
    clearSelection,
    getSeatStatus,

    // Funciones de reservas
    bookSelectedSeats,
    cancelReservation,
    upgradeToPremium,

    // Funciones de combos
    setSelectedCombo,

    // Funciones de sistema
    simulateBotAction,
    refreshAll,
    loadSeats,
    loadMyReservations
  };
};