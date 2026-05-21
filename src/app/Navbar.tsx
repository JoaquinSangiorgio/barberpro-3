"use client";

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Users,
  CalendarDays,
  DollarSign,
  BarChart3,
  ClipboardList,
  Package,
  LogOut,
} from "lucide-react";

export default function Navbar() {
  const location = useLocation();

  const items = [
    { to: "/dashboard", label: "Dashboard", icon: <BarChart3 className="h-5 w-5" /> },
    { to: "/agenda", label: "Agenda", icon: <CalendarDays className="h-5 w-5" /> },
    { to: "/pacientes", label: "Clientes", icon: <Users className="h-5 w-5" /> },
    { to: "/pagos", label: "Pagos", icon: <DollarSign className="h-5 w-5" /> },
    { to: "/historial", label: "Historial", icon: <ClipboardList className="h-5 w-5" /> },
    { to: "/stock", label: "Stock", icon: <Package className="h-5 w-5" /> }, // Cambié a Package para variar el icono de stock
  ];

  return (
    <>
      {/* 📱 1. NAVBAR INFERIOR (Para Celulares, Tablets e iPads - Oculto a partir de lg) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#12141a] border-t border-slate-800/80 px-2 pb-[calc(env(safe-area-inset-bottom)+4px)] pt-2 lg:hidden shadow-2xl backdrop-blur-md">
        <div className="flex justify-around items-center max-w-2xl mx-auto">
          {items.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center justify-center gap-1 min-w-[56px] py-1 transition-all duration-200 rounded-xl ${
                  isActive 
                    ? "text-amber-500 font-black scale-105" 
                    : "text-slate-500 hover:text-slate-300 font-bold"
                }`}
              >
                <div className={isActive ? "text-amber-500" : "text-slate-500"}>
                  {item.icon}
                </div>
                <span className="text-[9px] uppercase tracking-widest leading-none">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* 💻 2. SIDEBAR LATERAL ESCRITORIO (Visible solo en Pantallas Grandes / Notebooks) */}
      <nav className="hidden lg:flex flex-col fixed top-0 bottom-0 left-0 w-64 bg-[#12141a] border-r border-slate-800/60 p-6 z-40 justify-between">
        <div className="space-y-8">
          {/* Logo / Nombre de la Marca */}
          <Link to="/" className="flex items-center gap-2 px-2">
            <span className="text-xl font-black text-slate-100 uppercase tracking-wider">
              Barber<span className="text-amber-500">PRO</span>
            </span>
          </Link>

          {/* Menú de Links */}
          <ul className="space-y-2">
            {items.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 font-bold text-sm ${
                      isActive
                        ? "bg-amber-600/10 border border-amber-500/20 text-amber-500"
                        : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border border-transparent"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Botón de salida abajo del todo */}
        <div className="pt-4 border-t border-slate-200/60">
          <button 
            type="button"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 transition-all duration-200 font-bold text-sm"
          >
            <LogOut className="h-5 w-5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </nav>
    </>
  );
}