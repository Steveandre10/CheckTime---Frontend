import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.jpeg';
import ThemeToggle from '../components/ThemeToggle';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-tr from-indigo-50 via-slate-50 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300 relative">
      
      {/* Top Header Navigation Bar with ThemeToggle */}
      <div className="w-full max-w-6xl mx-auto px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="w-8 h-8 rounded-lg shadow-sm" />
          <span className="text-sm font-extrabold tracking-wider text-slate-800 dark:text-slate-100 uppercase">
            Check<span className="text-indigo-600 dark:text-indigo-400">Time</span>
          </span>
        </div>
        <ThemeToggle />
      </div>

      {/* Main Card Container */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 animate-fade-in-up">
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 max-w-md w-full flex flex-col items-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5 animate-scale-in">
          
          {/* Brand Logo */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
            <img src={logo} alt="Logo" className="relative w-28 h-24 mb-3 drop-shadow-md rounded-2xl object-cover" />
          </div>
          <span className="text-xs font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase mt-2">CheckTime</span>

          {/* Heading */}
          <h1 className="text-3xl font-extrabold text-center text-slate-800 dark:text-slate-100 mt-4 tracking-tight">
            Bienvenido a <span className="text-indigo-600 dark:text-indigo-400">CheckTime</span>
          </h1>

          {/* Description */}
          <p className="text-slate-500 dark:text-slate-400 text-sm text-center mt-3 px-2 leading-relaxed">
            Sistema inteligente de gestión académica y asistencia para instituciones educativas.
          </p>

          {/* Button Link */}
          <button
            onClick={() => navigate('/login')}
            className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-semibold py-3.5 px-5 rounded-2xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 flex items-center justify-center gap-3 transition-all duration-200 group"
          >
            <svg 
              className="w-5 h-5 text-indigo-200 group-hover:text-white transition-colors" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Ingresar con Correo Institucional
          </button>

          {/* Secure SSL indicator */}
          <div className="flex items-center gap-2 mt-6 text-slate-400 dark:text-slate-500 text-xs">
            <svg 
              className="w-4 h-4 text-emerald-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Conexión segura SSL</span>
          </div>

        </div>

        {/* Lower Banner Info */}
        <p className="text-slate-400 dark:text-slate-500 text-xs text-center mt-8 max-w-xs leading-relaxed px-4">
          Precisión y claridad en cada registro. Diseñado para educadores del siglo XXI.
        </p>
      </div>

      {/* Footer Area */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-6 border-t border-slate-200/60 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
        <div>
          <span className="font-semibold text-slate-500 dark:text-slate-400">AsisTec</span> &copy; 2026 Todos los derechos reservados.
        </div>
        <div className="flex gap-6">
          <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Soporte Técnico</a>
          <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Política de Privacidad</a>
        </div>
      </footer>

    </div>
  );
}
