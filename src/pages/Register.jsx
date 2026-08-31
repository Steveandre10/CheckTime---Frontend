/**
 * @file Register.jsx
 * @description Pantalla de registro de usuarios en CheckTime.
 * Ofrece un formulario interactivo para registrar un nuevo usuario con validaciones de contraseña, correo institucional y documento.
 */

import React, { useState } from "react";
import { registerUser } from "../services/authService";
import { useNavigate } from "react-router-dom";
import logo from '../assets/logo.jpeg';
import ThemeToggle from '../components/ThemeToggle';

/**
 * Componente de página de Registro.
 * @component
 */
export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    password: "",
    documento: "",
    telefono: "",
    id_role: 4,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Sistema de Toasts
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "error"
  });

  const triggerNotification = (message, type = "error") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "id_role" ? parseInt(value, 10) : value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Validaciones frontend básicas antes de enviar
    const { nombre, apellido, correo, password, documento, id_role } = form;
    if (!nombre || !apellido || !correo || !password || !documento || !id_role) {
      triggerNotification("Por favor, completa todos los campos obligatorios.", "error");
      return;
    }

    if (password.length < 6) {
      triggerNotification("La contraseña debe tener al menos 6 caracteres.", "error");
      return;
    }

    setIsLoading(true);

    try {
      await registerUser(form);
      
      // Redirigir al login y pasar un state para que Login.jsx sepa que debe mostrar el Toast de éxito
      navigate("/login", { state: { registered: true } });

    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "Error al registrar el usuario. Revisa los datos.";
      triggerNotification(errorMsg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-slate-50 via-indigo-50/20 to-blue-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 text-slate-800 dark:text-slate-100 font-sans relative overflow-hidden transition-colors duration-300">
      
      {/* Top Header Bar with Theme Toggle */}
      <div className="w-full max-w-6xl mx-auto px-6 py-4 flex items-center justify-between z-10">
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a Iniciar Sesión
        </button>
        <ThemeToggle />
      </div>

      {/* Toast Notification */}
      <div 
        className={`fixed top-5 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl border transition-all duration-300 ${
          notification.show ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8 pointer-events-none"
        } ${
          notification.type === "success" 
            ? "bg-emerald-50 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200" 
            : "bg-rose-50 dark:bg-rose-950/90 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200"
        }`}
      >
        {notification.type === "success" ? (
          <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        <span className="text-sm font-semibold">{notification.message}</span>
      </div>

      {/* Main card */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 animate-fade-in-up">
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 max-w-md w-full flex flex-col items-center animate-scale-in transition-all duration-300">
          
          {/* Brand Header */}
          <div className="flex flex-col items-center mb-6">
            <img src={logo} alt="Logo" className="w-28 h-24 mb-3 drop-shadow-md rounded-2xl object-cover" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 text-center">Registro de Cuenta</h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium text-center mt-1">
              Únete a la gestión académica digital con CheckTime
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="w-full flex flex-col gap-4">
            
            {/* Nombre y Apellido Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-extrabold tracking-wider text-slate-500 dark:text-slate-400 uppercase px-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="nombre"
                  placeholder="Ej. Carlos"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/60 dark:hover:bg-slate-700/60 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-600/20 rounded-xl outline-none text-sm transition-all duration-200 text-slate-800 dark:text-slate-100"
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-extrabold tracking-wider text-slate-500 dark:text-slate-400 uppercase px-1">
                  Apellido *
                </label>
                <input
                  type="text"
                  name="apellido"
                  placeholder="Ej. Gómez"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/60 dark:hover:bg-slate-700/60 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-600/20 rounded-xl outline-none text-sm transition-all duration-200 text-slate-800 dark:text-slate-100"
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Correo Field */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-extrabold tracking-wider text-slate-500 dark:text-slate-400 uppercase px-1">
                Correo Institucional *
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4.5 text-slate-400 dark:text-slate-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  type="email"
                  name="correo"
                  placeholder="carlos.gomez@institucion.edu"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/60 dark:hover:bg-slate-700/60 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-600/20 rounded-xl outline-none text-sm transition-all duration-200 text-slate-800 dark:text-slate-100"
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Documento y Teléfono Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-extrabold tracking-wider text-slate-500 dark:text-slate-400 uppercase px-1">
                  Documento *
                </label>
                <input
                  type="text"
                  name="documento"
                  placeholder="Ej. 10234567"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/60 dark:hover:bg-slate-700/60 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-600/20 rounded-xl outline-none text-sm transition-all duration-200 text-slate-800 dark:text-slate-100"
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-extrabold tracking-wider text-slate-500 dark:text-slate-400 uppercase px-1">
                  Teléfono
                </label>
                <input
                  type="text"
                  name="telefono"
                  placeholder="Ej. 300123456"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/60 dark:hover:bg-slate-700/60 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-600/20 rounded-xl outline-none text-sm transition-all duration-200 text-slate-800 dark:text-slate-100"
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Contraseña Field */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-extrabold tracking-wider text-slate-500 dark:text-slate-400 uppercase px-1">
                Contraseña *
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4.5 text-slate-400 dark:text-slate-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Contraseña (mín. 6 caracteres)"
                  className="w-full pl-11 pr-12 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/60 dark:hover:bg-slate-700/60 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-600/20 rounded-xl outline-none text-sm transition-all duration-200 text-slate-800 dark:text-slate-100"
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-none"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Rol de Usuario Selector */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-extrabold tracking-wider text-slate-500 dark:text-slate-400 uppercase px-1">
                Rol Institucional *
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4.5 text-slate-400 dark:text-slate-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </span>
                <select
                  name="id_role"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/60 dark:hover:bg-slate-700/60 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-emerald-600 dark:focus:border-emerald-500 rounded-xl outline-none text-sm transition-all duration-200 appearance-none cursor-pointer text-slate-800 dark:text-slate-100"
                  onChange={handleChange}
                  value={form.id_role}
                  disabled={isLoading}
                >
                  <option value={4}>Profesor</option>
                  <option value={3}>Coordinador</option>
                  <option value={2}>Rector</option>
                  <option value={1}>Admin</option>
                </select>
                {/* Arrow indicator */}
                <span className="absolute right-4 pointer-events-none text-slate-400 dark:text-slate-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold py-3.5 px-4 rounded-2xl shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/35 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 flex items-center justify-center transition-all duration-200 disabled:bg-slate-400 disabled:shadow-none"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                "Registrarme"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="w-full h-[1px] bg-slate-100 dark:bg-slate-800 my-5"></div>

          {/* Login Link */}
          <p className="text-slate-500 dark:text-slate-400 text-xs text-center">
            ¿Ya tienes una cuenta?{" "}
            <button
              onClick={() => navigate("/login")}
              className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors focus:outline-none"
              disabled={isLoading}
            >
              Inicia sesión
            </button>
          </p>

        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center py-6 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500">
        &copy; 2026 CheckTime Academic Management. Todos los derechos reservados.
      </footer>

    </div>
  );
}