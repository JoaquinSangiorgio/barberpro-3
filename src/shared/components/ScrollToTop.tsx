"use client";

import { useEffect } from "react";
import { useLocation } from "react-router-dom"; 

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Clava el scroll al inicio del viewport de la pantalla
    window.scrollTo(0, 0);
  }, [pathname]); // Se ejecuta CADA VEZ que cambia la ruta/sección

  return null; 
}