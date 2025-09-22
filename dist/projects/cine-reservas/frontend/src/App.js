/**
 * Componente principal de la aplicación Cinema Reservations.
 * Configura el enrutamiento, contextos y componentes de layout.
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import CinemaPage from './pages/CinemaPage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

// Configuración de toast notifications
const toastConfig = {
  duration: 4000,
  position: 'top-center',
  style: {
    background: '#374151',
    color: '#fff',
    border: '1px solid #4B5563',
  },
  success: {
    duration: 3000,
    iconTheme: {
      primary: '#10B981',
      secondary: '#fff',
    },
  },
  error: {
    duration: 5000,
    iconTheme: {
      primary: '#EF4444',
      secondary: '#fff',
    },
  },
};

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-900 text-white font-cinema">
            {/* Sistema de notificaciones */}
            <Toaster
              position={toastConfig.position}
              toastOptions={toastConfig}
            />

            {/* Enrutamiento principal */}
            <Routes>
              {/* Ruta de autenticación */}
              <Route 
                path="/login" 
                element={<AuthPage />} 
              />

              {/* Ruta principal protegida */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <CinemaPage />
                  </ProtectedRoute>
                } 
              />

              {/* Redirección por defecto */}
              <Route 
                path="*" 
                element={<Navigate to="/" replace />} 
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;