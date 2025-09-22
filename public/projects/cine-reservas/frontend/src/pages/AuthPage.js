/**
 * Página de autenticación que permite login y registro de usuarios.
 * Incluye validación de formularios y manejo de estados de carga.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Film, User, Lock, UserPlus, LogIn, Clock, Users, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const AuthPage = () => {
  // Estado local
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  // Hooks
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isLoading, isAuthenticated } = useAuth();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Manejar cambios en los campos del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar errores cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    // Validar username
    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Mínimo 3 caracteres';
    } else if (formData.username.length > 50) {
      newErrors.username = 'Máximo 50 caracteres';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Solo letras, números y guiones bajos';
    }

    // Validar password
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 4) {
      newErrors.password = 'Mínimo 4 caracteres';
    }

    // Validar confirmación de password (solo en registro)
    if (!isLoginMode) {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirma tu contraseña';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const credentials = {
        username: formData.username.trim().toLowerCase(),
        password: formData.password
      };

      let result;
      
      if (isLoginMode) {
        result = await login(credentials);
      } else {
        result = await register(credentials);
      }

      if (result.success) {
        // La redirección se maneja en el useEffect
        setFormData({ username: '', password: '', confirmPassword: '' });
      }
      
    } catch (error) {
      console.error('Error en autenticación:', error);
      toast.error('Error inesperado. Intenta nuevamente.');
    }
  };

  // Alternar entre login y registro
  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setFormData({ username: '', password: '', confirmPassword: '' });
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full mb-4">
            <Film className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Cinema Reservations
          </h1>
          <p className="text-gray-400">
            {isLoginMode ? 'Inicia sesión para reservar' : 'Crea tu cuenta temporal'}
          </p>
        </div>

        {/* Alertas informativas */}
        <div className="mb-6 space-y-3">
          <div className="bg-blue-900/30 border border-blue-600/30 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Clock className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-300">
                <strong>Cuenta temporal:</strong> Expira en 10 minutos automáticamente
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-900/30 border border-yellow-600/30 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Users className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-300">
                <strong>Límite:</strong> Máximo 12 usuarios simultáneos
              </div>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Nombre de usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={clsx(
                    "block w-full pl-10 pr-3 py-2 border rounded-lg bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-colors",
                    {
                      "border-gray-600 focus:ring-primary-500": !errors.username,
                      "border-red-500 focus:ring-red-500": errors.username
                    }
                  )}
                  placeholder="usuario123"
                  disabled={isLoading}
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-400 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.username}</span>
                </p>
              )}
            </div>

            {/* Campo Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={clsx(
                    "block w-full pl-10 pr-3 py-2 border rounded-lg bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-colors",
                    {
                      "border-gray-600 focus:ring-primary-500": !errors.password,
                      "border-red-500 focus:ring-red-500": errors.password
                    }
                  )}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            {/* Campo Confirmar Password (solo en registro) */}
            {!isLoginMode && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={clsx(
                      "block w-full pl-10 pr-3 py-2 border rounded-lg bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-colors",
                      {
                        "border-gray-600 focus:ring-primary-500": !errors.confirmPassword,
                        "border-red-500 focus:ring-red-500": errors.confirmPassword
                      }
                    )}
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.confirmPassword}</span>
                  </p>
                )}
              </div>
            )}

            {/* Botón Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={clsx(
                "w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg font-medium transition-all duration-200",
                {
                  "bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 text-white shadow-lg hover:shadow-primary-500/25": !isLoading,
                  "bg-gray-600 text-gray-400 cursor-not-allowed": isLoading
                }
              )}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isLoginMode ? (
                    <>
                      <LogIn className="w-4 h-4 mr-2" />
                      Iniciar Sesión
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Crear Cuenta
                    </>
                  )}
                </>
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            <button
              onClick={toggleMode}
              className="text-sm text-gray-400 hover:text-primary-400 transition-colors"
              disabled={isLoading}
            >
              {isLoginMode ? (
                <>¿No tienes cuenta? <span className="font-medium">Regístrate aquí</span></>
              ) : (
                <>¿Ya tienes cuenta? <span className="font-medium">Inicia sesión</span></>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>Sistema de reservas demo • Sesiones temporales de 10 minutos</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;