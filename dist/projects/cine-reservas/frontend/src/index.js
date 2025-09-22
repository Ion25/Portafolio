/**
 * Punto de entrada principal de la aplicación React.
 * Renderiza la aplicación en el DOM.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Crear el root de React 18
const root = ReactDOM.createRoot(document.getElementById('root'));

// Renderizar la aplicación
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);