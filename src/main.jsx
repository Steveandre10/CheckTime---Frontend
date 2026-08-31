/**
 * @file main.jsx
 * @description Punto de entrada principal de la aplicación React.
 * Inicializa y monta la aplicación en el nodo del DOM con el id 'root' bajo el modo estricto de React.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

