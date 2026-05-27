"use client";

import { useEffect, useState } from "react";
import { Settings, UserPlus, Scissors, Check, X, User, Trash2, Edit } from "lucide-react";
import { motion } from "framer-motion";
import { ajustesService, Barbero, ServicioBarberia } from "../services/ajustesService";
import ModalBarbero from "../components/modalBarbero";
import ModalServicio from "../components/modalServicio";
import toast from "react-hot-toast";

export default function AjustesPage() {
  const [barberos, setBarberos] = useState<Barbero[]>([]);
  const [servicios, setServicios] = useState<ServicioBarberia[]>([]);
  
  const [isBarberModalOpen, setIsBarberModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingBarbero, setEditingBarbero] = useState<Barbero | undefined>(undefined);
  const [editingServicio, setEditingServicio] = useState<ServicioBarberia | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  // Control centralizado del bloqueo de scroll cuando hay modales abiertos
  useEffect(() => {
    if (isBarberModalOpen || isServiceModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isBarberModalOpen, isServiceModalOpen]);

  async function cargarDatos() {
    try {
      const [listaBarberos, listaServicios] = await Promise.all([
        ajustesService.getBarberos(),
        ajustesService.getServicios()
      ]);
      setBarberos(listaBarberos);
      setServicios(listaServicios);
    } catch (error) {
      console.error("Error cargando ajustes:", error);
      toast.error("Error cargando configuración ❌");
    } finally {
      setLoading(false);
    }
  }

  const handleAddBarber = async (nuevoBarber: Omit<Barbero, "id">) => {
    try {
      if (editingBarbero?.id) {
        await ajustesService.actualizarBarbero(editingBarbero.id, nuevoBarber);
        setBarberos(barberos.map(b => b.id === editingBarbero.id ? { ...b, ...nuevoBarber } : b));
        toast.success("Barbero actualizado ✅");
      } else {
        const id = await ajustesService.agregarBarbero(nuevoBarber);
        setBarberos([...barberos, { id, ...nuevoBarber }]);
        toast.success("Barbero agregado ✅");
      }
      setEditingBarbero(undefined);
      setIsBarberModalOpen(false);
    } catch (error) {
      toast.error("Error guardando barbero ❌");
    }
  };

  const handleAddService = async (nuevoServicio: Omit<ServicioBarberia, "id">) => {
    try {
      if (editingServicio?.id) {
        await ajustesService.actualizarServicio(editingServicio.id, nuevoServicio);
        setServicios(servicios.map(s => s.id === editingServicio.id ? { ...s, ...nuevoServicio } : s));
        toast.success("Servicio actualizado ✅");
      } else {
        const id = await ajustesService.agregarServicio(nuevoServicio);
        setServicios([...servicios, { id, ...nuevoServicio }]);
        toast.success("Servicio creado ✅");
      }
      setEditingServicio(undefined);
      setIsServiceModalOpen(false);
    } catch (error) {
      toast.error("Error guardando servicio ❌");
    }
  };

  const toggleBarberStatus = async (barbero: Barbero) => {
    if (!barbero.id) return;
    try {
      const nuevoEstado = !barbero.isActive;
      await ajustesService.actualizarBarbero(barbero.id, { isActive: nuevoEstado });
      setBarberos(barberos.map(b => b.id === barbero.id ? { ...b, isActive: nuevoEstado } : b));
      toast.success(nuevoEstado ? "Barbero activado ✅" : "Barbero desactivado ✅");
    } catch (error) {
      toast.error("Error actualizando barbero ❌");
    }
  };

  const handleDeleteServicio = async (id: string) => {
    try {
      await ajustesService.eliminarServicio(id);
      setServicios(servicios.filter(s => s.id !== id));
      toast.success("Servicio eliminado ✅");
    } catch (error) {
      toast.error("Error eliminando servicio ❌");
    }
  };

  const openBarberModal = (barbero?: Barbero) => {
    setEditingBarbero(barbero);
    setIsBarberModalOpen(true);
  };

  const openServiceModal = (servicio?: ServicioBarberia) => {
    setEditingServicio(servicio);
    setIsServiceModalOpen(true);
  };

  const closeBarberModal = () => {
    setEditingBarbero(undefined);
    setIsBarberModalOpen(false);
  };

  const closeServiceModal = () => {
    setEditingServicio(undefined);
    setIsServiceModalOpen(false);
  };

  if (loading) {
    return <div className="text-slate-400 font-bold p-8 bg-[#0f1115] min-h-screen">Cargando configuraciones del local...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0f1115] text-slate-100 flex flex-col">
      
      {/* ── HEADER ── */}
      <header className="w-full lg:pl-64 bg-[#161920] text-white px-6 py-10 shadow-xl border-b border-slate-800/40 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center space-x-5">
            <div className="bg-amber-600/10 p-4 rounded-2xl border border-amber-500/20">
              <Settings className="w-9 h-9 text-amber-500" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-amber-500 uppercase">AJUSTES</h1>
              <p className="text-slate-400 font-medium text-sm">Configuración del negocio</p>
            </div>
          </motion.div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <button
              onClick={() => openBarberModal()}
              className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-amber-950/40 transition-all active:scale-95 text-sm uppercase tracking-wider border border-amber-500/15 flex items-center justify-center gap-2"
            >
              <UserPlus size={16} />
              + Registrar Barbero
            </button>
            
            <button
              onClick={() => openServiceModal()}
              className="bg-[#12141a] hover:bg-[#1d222e] border border-slate-800 hover:border-amber-500/40 text-amber-400 px-5 py-3 rounded-2xl font-black transition-all active:scale-95 text-sm uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <Scissors size={15} />
              + Crear Servicio
            </button>
          </div>

        </div>
      </header>

      {/* ── CUERPO PRINCIPAL ── */}
      <main className="flex-1 p-6 lg:pl-[280px] max-w-7xl w-full mx-auto mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* PANEL DE BARBEROS */}
          <div className="bg-[#161920] border border-slate-800/80 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800/40">
              <User className="text-amber-500 h-5 w-5" />
              <h2 className="text-base font-black text-slate-200 uppercase tracking-wider">Barberos del Staff</h2>
            </div>

            <div className="space-y-2 pt-2">
              {barberos.map(b => (
                <motion.div 
                  key={b.id} 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between p-4 bg-[#0f1115] rounded-2xl border border-slate-800/40 hover:border-slate-700/60 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className={`font-bold text-sm ${b.isActive ? "text-slate-200" : "text-slate-500 line-through"}`}>
                      {b.name}
                    </h4>
                    <p className="text-xs text-slate-500 font-semibold">Comisión: {b.commissionPercentage}%</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openBarberModal(b)}
                      title="Editar"
                      className="p-2 text-amber-400 hover:bg-amber-500/10 rounded-xl border border-transparent hover:border-amber-500/20 transition-all"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => toggleBarberStatus(b)}
                      className={`p-2 rounded-xl border transition-all ${
                        b.isActive 
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400"
                          : "bg-slate-800 border-transparent text-slate-500 hover:bg-emerald-500/10 hover:text-emerald-400"
                      }`}
                      title={b.isActive ? "Desactivar" : "Activar"}
                    >
                      {b.isActive ? <Check size={16} /> : <X size={16} />}
                    </button>
                  </div>
                </motion.div>
              ))}
              {barberos.length === 0 && (
                <p className="text-xs text-slate-600 font-bold uppercase tracking-wider py-4 text-center">No hay barberos registrados</p>
              )}
            </div>
          </div>

          {/* PANEL DE SERVICIOS */}
          <div className="bg-[#161920] border border-slate-800/80 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800/40">
              <Scissors className="text-amber-500 h-5 w-5" />
              <h2 className="text-base font-black text-slate-200 uppercase tracking-wider">Servicios y Tarifas</h2>
            </div>

            <div className="space-y-2 pt-2">
              {servicios.map(s => (
                <motion.div 
                  key={s.id} 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between p-4 bg-[#0f1115] rounded-2xl border border-slate-800/40 hover:border-slate-700/60 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-slate-200">{s.name}</h4>
                    <p className="text-xs text-slate-500 font-semibold">${s.price.toLocaleString("es-AR")}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openServiceModal(s)}
                      title="Editar"
                      className="p-2 text-amber-400 hover:bg-amber-500/10 rounded-xl border border-transparent hover:border-amber-500/20 transition-all"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteServicio(s.id || "")}
                      title="Eliminar"
                      className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl border border-transparent hover:border-rose-500/20 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
              {servicios.length === 0 && (
                <p className="text-xs text-slate-600 font-bold uppercase tracking-wider py-4 text-center">No hay servicios configurados</p>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Controles Modales */}
      <ModalBarbero 
        isOpen={isBarberModalOpen} 
        onClose={closeBarberModal} 
        onSave={handleAddBarber}
        initialData={editingBarbero}
        isEditing={!!editingBarbero}
      />
      <ModalServicio 
        isOpen={isServiceModalOpen} 
        onClose={closeServiceModal} 
        onSave={handleAddService}
        initialData={editingServicio}
        isEditing={!!editingServicio}
      />
    </div>
  );
}