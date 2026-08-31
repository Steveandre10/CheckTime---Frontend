/**
 * @file ThemeContext.jsx
 * @description Contexto de React para gestionar y persistir el tema de la aplicación (Modo Claro / Modo Oscuro).
 * Detecta las preferencias del navegador del usuario por defecto y persiste el tema seleccionado en el `localStorage`.
 */

import React, { createContext, useContext, useEffect, useState } from "react";

/**
 * Contexto del tema.
 * @type {React.Context<any>}
 */
const ThemeContext = createContext();

/**
 * Componente Proveedor que envuelve la aplicación y expone el estado y método de cambio de tema.
 * 
 * @component
 * @param {Object} props - Propiedades del componente.
 * @param {React.ReactNode} props.children - Componentes hijos.
 */
export function ThemeProvider({ children }) {
  // Inicializar estado del tema oscuro consultando localStorage o preferencia del sistema
  const [isDark, setIsDark] = useState(() => {
    try {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) {
        return savedTheme === "dark";
      }
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return false;
    }
  });

  // Efecto que añade o remueve la clase 'dark' de la etiqueta raíz HTML para habilitar clases de TailwindCSS oscuras
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  /**
   * Cambia el tema entre claro y oscuro de manera alternada.
   * @function toggleTheme
   */
  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook personalizado para consumir el contexto del tema de manera simplificada en otros componentes.
 * 
 * @function useTheme
 * @throws {Error} Si el hook es usado fuera de un `ThemeProvider`.
 * @returns {{isDark: boolean, toggleTheme: function}} Contexto con el estado y función de cambio.
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme debe usarse dentro de un ThemeProvider");
  }
  return context;
}

