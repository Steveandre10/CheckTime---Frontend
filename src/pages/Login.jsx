/**
 * @file Login.jsx
 * @description Pantalla de inicio de sesión de CheckTime.
 * Permite a los usuarios autenticarse con correo y contraseña, valida credenciales contra la API, almacena el token JWT y los datos de perfil del usuario en el localStorage y los redirige al dashboard adecuado según su rol (Profesor, Coordinador o Rector).
 */

import React, { useState, useEffect } from "react";
import { loginUser } from "../services/authService";
import { useNavigate, useLocation } from "react-router-dom";
import logo from '../assets/logo.jpeg';
import ThemeToggle from '../components/ThemeToggle';
import usePageTitle from '../hooks/usePageTitle';

/**
 * Componente de página de Login.
 * @component
 */
export default function Login() {
  usePageTitle("Login");
  const navigate = useNavigate();
  const location = useLocation();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Sistema de notificaciones personalizadas (Toasts estéticos)
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success" // 'success' | 'error'
  });

  // Mostrar mensaje de éxito si viene redirigido desde el registro
  useEffect(() => {
    if (location.state?.registered) {
      triggerNotification("¡Registro satisfactorio! Por favor, inicia sesión.", "success");
    }
  }, [location]);

  const triggerNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!correo || !password) {
      triggerNotification("Por favor, completa todos los campos.", "error");
      return;
    }

    setIsLoading(true);

    try {
      const res = await loginUser({ correo, password });
      
      // Guardar el token de sesión de forma segura
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("usuario", JSON.stringify(res.data.usuario));

      triggerNotification(`¡Inicio de sesión satisfactorio! Bienvenido, ${res.data.usuario.nombre}.`, "success");
      
      // Simular un pequeño delay de 1.5s para apreciar la animación antes de redirigir
      setTimeout(() => {
        const rol = res.data.usuario.role?.nombre_rol?.toLowerCase();
        if (rol === "rector") {
          navigate("/dashboard/rector");
        } else if (rol === "coordinador") {
          navigate("/dashboard/coordinador");
        } else {
          navigate("/dashboard/profesor");
        }
      }, 1500);

    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "Credenciales incorrectas. Intenta de nuevo.";
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
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Inicio
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
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 max-w-sm w-full flex flex-col items-center animate-scale-in transition-all duration-300">
          
          {/* Brand Logo Grid Header */}
          <div className="flex flex-col items-center mb-6">
            <img src={logo} alt="Logo" className="w-28 h-24 mb-3 drop-shadow-md rounded-2xl object-cover" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 text-center">CheckTime</h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium text-center mt-1">
              Gestión académica con precisión y autoridad
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="w-full flex flex-col gap-5">
            
            {/* Correo Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold tracking-wider text-slate-500 dark:text-slate-400 uppercase px-1">
                Correo Institucional
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-slate-400 dark:text-slate-500">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  type="email"
                  placeholder="ejemplo@institucion.edu"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/60 dark:hover:bg-slate-700/60 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl outline-none text-sm transition-all duration-200 text-slate-800 dark:text-slate-100"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Contraseña Field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-extrabold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                  Contraseña
                </label>
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    triggerNotification("Recuperación de contraseña no disponible en esta demo.", "error");
                  }} 
                  className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors"
                >
                  Olvidé mi contraseña
                </a>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-slate-400 dark:text-slate-500">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="........"
                  className="w-full pl-11 pr-12 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/60 dark:hover:bg-slate-700/60 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl outline-none text-sm transition-all duration-200 text-slate-800 dark:text-slate-100"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
                {/* Visibility Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold py-3.5 px-4 rounded-2xl shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/35 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 flex items-center justify-center transition-all duration-200 disabled:bg-slate-400 disabled:shadow-none"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                "Ingresar"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="w-full h-[1px] bg-slate-100 dark:bg-slate-800 my-6"></div>



          {/* Secure SSL indicator */}
          <div className="flex items-center gap-1.5 mt-4 text-[10px] text-slate-400 dark:text-slate-500">
            <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Conexión Segura</span>
          </div>

        </div>

        {/* Operating Systems Capsule */}
        <button
          onClick={(e) => {
            e.preventDefault();
            triggerNotification("Sistemas operativos: Windows, MacOS, iOS y Android soportados.", "success");
          }}
          className="mt-6 border border-emerald-100 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 text-[10px] font-bold py-2.5 px-4 rounded-full flex items-center gap-2 transition-all duration-200"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          SISTEMAS OPERATIVOS
        </button>
      </div>

      {/* Footer */}
      <footer className="w-full text-center py-6 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500">
        &copy; 2026 CheckTime Academic Management. Todos los derechos reservados.
      </footer>

    </div>
  );
}