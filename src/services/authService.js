/**
 * @file authService.js
 * @description Módulo de llamadas API para servicios de autenticación de usuarios (inicio de sesión y registro de nuevas cuentas).
 */

import api from './api';

/**
 * Realiza la petición POST de inicio de sesión de un usuario.
 * 
 * @function loginUser
 * @param {Object} data - Credenciales del usuario.
 * @param {string} data.correo - Correo institucional del usuario.
 * @param {string} data.password - Contraseña.
 * @returns {Promise<import('axios').AxiosResponse>} Promesa con la respuesta del backend (token y usuario).
 */
export const loginUser = (data) => {
    return api.post('/auth/login', data);
};

/**
 * Realiza la petición POST de registro para crear una nueva cuenta de usuario.
 * 
 * @function registerUser
 * @param {Object} data - Datos personales e identificadores del nuevo usuario.
 * @returns {Promise<import('axios').AxiosResponse>} Promesa con el resultado de la creación del usuario.
 */
export const registerUser = (data)=>{
    return api.post('/auth/register', data);
};