/**
 * Servicio de API para comunicación con el backend FastAPI.
 * Maneja autenticación, reservas y operaciones del sistema.
 */

import axios from 'axios';

// Configuración base de la API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Crear instancia de axios con configuración por defecto
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos timeout
});

// Interceptor para añadir token JWT automáticamente
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cinema_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si el token expiró, limpiar storage y redirigir
    if (error.response?.status === 401) {
      localStorage.removeItem('cinema_token');
      localStorage.removeItem('cinema_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Servicios de autenticación
 */
export const authAPI = {
  /**
   * Registrar nuevo usuario
   * @param {Object} userData - {username, password}
   */
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Iniciar sesión
   * @param {Object} credentials - {username, password}
   */
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Obtener información del usuario actual
   */
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  /**
   * Cerrar sesión
   */
  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    localStorage.removeItem('cinema_token');
    localStorage.removeItem('cinema_user');
    return response.data;
  },

  /**
   * Eliminar cuenta
   */
  deleteAccount: async () => {
    const response = await apiClient.delete('/auth/delete-account');
    localStorage.removeItem('cinema_token');
    localStorage.removeItem('cinema_user');
    return response.data;
  }
};

/**
 * Servicios de reservas y asientos
 */
export const reservationAPI = {
  /**
   * Obtener grilla completa de asientos
   */
  getSeats: async () => {
    const response = await apiClient.get('/reservations/seats');
    return response.data;
  },

  /**
   * Reservar asientos
   * @param {Object} reservationData - {seat_ids: [], combo?: string}
   */
  bookSeats: async (reservationData) => {
    const response = await apiClient.post('/reservations/book', reservationData);
    return response.data;
  },

  /**
   * Cancelar reserva de un asiento
   * @param {number} seatId - ID del asiento a cancelar
   */
  cancelReservation: async (seatId) => {
    const response = await apiClient.delete(`/reservations/cancel/${seatId}`);
    return response.data;
  },

  /**
   * Obtener mis reservas actuales
   */
  getMyReservations: async () => {
    const response = await apiClient.get('/reservations/my-reservations');
    return response.data;
  },

  /**
   * Actualizar a premium
   * @param {Object} upgradeData - {auto_select_seats: boolean, seats_count: number}
   */
  upgradeToPremium: async (upgradeData) => {
    const response = await apiClient.post('/reservations/premium', upgradeData);
    return response.data;
  },

  /**
   * Obtener combos disponibles
   */
  getCombos: async () => {
    const response = await apiClient.get('/reservations/combos');
    return response.data;
  },

  /**
   * Simular acción del bot
   * @param {Object} actionData - {action: string, seat_count?: number}
   */
  simulateBotAction: async (actionData = {}) => {
    const response = await apiClient.post('/reservations/bot-simulation', actionData);
    return response.data;
  },

  /**
   * Obtener estadísticas del sistema
   */
  getSystemStats: async () => {
    const response = await apiClient.get('/reservations/stats');
    return response.data;
  }
};

/**
 * Servicios generales del sistema
 */
export const systemAPI = {
  /**
   * Health check del sistema
   */
  healthCheck: async () => {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
  },

  /**
   * Información general de la API
   */
  getApiInfo: async () => {
    const response = await axios.get(`${API_BASE_URL}/`);
    return response.data;
  }
};

/**
 * Utilidades para manejo de tokens
 */
export const tokenUtils = {
  /**
   * Guardar token en localStorage
   * @param {string} token - JWT token
   * @param {Object} user - Información del usuario
   */
  saveToken: (token, user) => {
    localStorage.setItem('cinema_token', token);
    localStorage.setItem('cinema_user', JSON.stringify(user));
  },

  /**
   * Obtener token del localStorage
   */
  getToken: () => {
    return localStorage.getItem('cinema_token');
  },

  /**
   * Obtener usuario del localStorage
   */
  getUser: () => {
    const userStr = localStorage.getItem('cinema_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Verificar si hay una sesión activa
   */
  isAuthenticated: () => {
    const token = localStorage.getItem('cinema_token');
    const user = localStorage.getItem('cinema_user');
    return !!(token && user);
  },

  /**
   * Limpiar datos de autenticación
   */
  clearAuth: () => {
    localStorage.removeItem('cinema_token');
    localStorage.removeItem('cinema_user');
  }
};

// Exportar cliente base para casos especiales
export { apiClient };

export default {
  auth: authAPI,
  reservations: reservationAPI,
  system: systemAPI,
  token: tokenUtils
};