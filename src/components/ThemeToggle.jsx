/**
 * @file ThemeToggle.jsx
 * @description Botón interactivo para cambiar entre tema claro y oscuro consumiendo la funcionalidad de useTheme.
 */

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

/**
 * Componente ThemeToggle.
 * Muestra un icono de sol para el modo oscuro (al hacer clic cambia a claro) y un icono de luna para el modo claro (al hacer clic cambia a oscuro).
 * 
 * @component
 * @param {Object} props - Propiedades del componente.
 * @param {string} [props.className=""] - Clases de CSS o Tailwind opcionales para personalizar estilos.
 * @param {boolean} [props.compact=false] - Si es verdadero, oculta el texto descriptivo y solo muestra el icono.
 */
export default function ThemeToggle({ className = "", compact = false }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
      aria-label="Toggle theme"
      className={`relative inline-flex items-center justify-center p-2 rounded-xl transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-amber-400 dark:focus:ring-indigo-400 ${
        isDark
          ? "bg-slate-800/90 text-amber-400 border border-slate-700 hover:bg-slate-700/80 shadow-md shadow-slate-900/50"
          : "bg-white/90 text-indigo-600 border border-slate-200 hover:bg-slate-100 shadow-sm hover:shadow"
      } ${className}`}
    >
      <div className="relative w-5 h-5 flex items-center justify-center transition-transform duration-500 ease-out transform active:scale-90">
        {isDark ? (
          <Sun className="w-5 h-5 transition-all duration-300 transform rotate-0 hover:rotate-45" />
        ) : (
          <Moon className="w-5 h-5 transition-all duration-300 transform -rotate-12 hover:rotate-0" />
        )}
      </div>
      {!compact && (
        <span className="ml-2 text-xs font-semibold tracking-wide hidden sm:inline-block select-none">
          {isDark ? "Oscuro" : "Claro"}
        </span>
      )}
    </button>
  );
}

