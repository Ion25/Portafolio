/**
 * Contexto de autenticación para manejar estado de usuario y sesión.
 * Proporciona funciones de login, logout y estado de autenticación.
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI, tokenUtils } from '../services/api';
import toast from 'react-hot-toast';

// Estados posibles de autenticación
const AUTH_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated',
  ERROR: 'error'
};

// Acciones del reducer
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_ERROR: 'SET_ERROR',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER'
};

// Estado inicial
const initialState = {
  user: null,
  status: AUTH_STATES.IDLE,
  error: null,
  isLoading: false
};

// Reducer para manejar cambios de estado
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: true,
        status: AUTH_STATES.LOADING,
        error: null
      };

    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        status: AUTH_STATES.AUTHENTICATED,
        isLoading: false,
        error: null
      };

    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        status: AUTH_STATES.ERROR,
        isLoading: false
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        status: AUTH_STATES.UNAUTHENTICATED,
        error: null,
        isLoading: false
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };

    default:
      return state;
  }
};

// Crear contexto
const AuthContext = createContext(null);

/**
 * Provider del contexto de autenticación
 */
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Efecto para inicializar estado desde localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const token = tokenUtils.getToken();
      const user = tokenUtils.getUser();

      if (token && user) {
        try {
          // Verificar que el token aún sea válido
          const currentUser = await authAPI.getCurrentUser();
          dispatch({ type: AUTH_ACTIONS.SET_USER, payload: currentUser });
        } catch (error) {
          console.error('Token inválido o expirado:', error);
          tokenUtils.clearAuth();
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    };

    initializeAuth();
  }, []);

  /**
   * Función para registrar nuevo usuario
   */
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING });

      const response = await authAPI.register(userData);
      
      // Guardar token y usuario
      tokenUtils.saveToken(response.access_token, response.user);
      
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.user });
      
      toast.success(`¡Bienvenido ${response.user.username}! Sesión expira en ${response.expires_in_minutes} minutos.`);
      
      return { success: true, user: response.user };

    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Error en el registro';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Función para iniciar sesión
   */
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING });

      const response = await authAPI.login(credentials);
      
      // Guardar token y usuario
      tokenUtils.saveToken(response.access_token, response.user);
      
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.user });
      
      const premiumStatus = response.user.is_premium ? ' 👑 PREMIUM' : '';
      toast.success(`¡Bienvenido de vuelta ${response.user.username}!${premiumStatus}`);
      
      return { success: true, user: response.user };

    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Error en el login';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Función para cerrar sesión
   */
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      tokenUtils.clearAuth();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      toast.success('Sesión cerrada correctamente');
    }
  };

  /**
   * Función para actualizar a premium
   */
  const upgradeToPremium = async (upgradeData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING });

      // El upgrade se maneja en el contexto de reservas, aquí solo actualizamos el usuario
      dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: { is_premium: true } });
      
      // Actualizar localStorage
      const updatedUser = { ...state.user, is_premium: true };
      localStorage.setItem('cinema_user', JSON.stringify(updatedUser));

      return { success: true };

    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Error en upgrade premium';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Función para eliminar cuenta
   */
  const deleteAccount = async () => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING });

      await authAPI.deleteAccount();
      
      tokenUtils.clearAuth();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      
      toast.success('Cuenta eliminada correctamente');
      
      return { success: true };

    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Error eliminando cuenta';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Función para refrescar datos del usuario
   */
  const refreshUser = async () => {
    try {
      const currentUser = await authAPI.getCurrentUser();
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: currentUser });
      
      // Actualizar localStorage
      localStorage.setItem('cinema_user', JSON.stringify(currentUser));
      
      return currentUser;
    } catch (error) {
      console.error('Error refrescando usuario:', error);
      // Si falla, probablemente el token expiró
      logout();
      return null;
    }
  };

  // Valores y funciones del contexto
  const contextValue = {
    // Estado
    user: state.user,
    status: state.status,
    error: state.error,
    isLoading: state.isLoading,
    isAuthenticated: state.status === AUTH_STATES.AUTHENTICATED,
    
    // Funciones
    register,
    login,
    logout,
    upgradeToPremium,
    deleteAccount,
    refreshUser
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook para usar el contexto de autenticación
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  
  return context;
};

export default AuthContext;