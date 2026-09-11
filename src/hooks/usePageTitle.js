/**
 * @file usePageTitle.js
 * @description Hook personalizado para sincronizar dinámicamente el título de la pestaña del navegador.
 * Formatea el título como 'CheckTime | [Sección]' o 'CheckTime' por defecto.
 */

import { useEffect } from 'react';

/**
 * Establece el título de la página en la pestaña del navegador.
 * @param {string} [title] - Nombre de la sección o vista actual.
 */
export function usePageTitle(title) {
  useEffect(() => {
    if (title && title.trim()) {
      document.title = `CheckTime | ${title.trim()}`;
    } else {
      document.title = 'CheckTime';
    }
  }, [title]);
}

export default usePageTitle;
