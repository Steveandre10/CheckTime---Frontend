/**
 * @file api.js
 * @description Configuración del cliente Axios global para realizar peticiones HTTP a la API del backend.
 * Incluye un interceptor de solicitudes que adjunta de forma automática el token de autenticación (JWT) almacenado en `localStorage`.
 */

import axios from 'axios';

/**
 * Instancia configurada de Axios con base URL y cabeceras por defecto.
 * @type {import('axios').AxiosInstance}
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor de solicitudes para inyectar automáticamente el header 'Authorization' con el Bearer token JWT
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // ignorar error en entornos sin localStorage
  }
  return config;
}, (error) => Promise.reject(error));

export default api;

