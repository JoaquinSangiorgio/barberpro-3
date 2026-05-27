"use client";

import { useEffect, useState } from "react";
import type { Pago, PacienteLite } from "../services/payments.api";
import type { Barbero, ServicioBarberia } from "../../ajustes/services/ajustesService";

const SIN_TURNO_ID = "sin_turno";

type Props = {
  initial?: Pago;
  pacientes: PacienteLite[];
  barberos: Barbero[]; // Recibe la lista completa con comisión e isActive de Ajustes
  servicios: ServicioBarberia[]; // Recibe la lista de servicios de Ajustes
  onSave: (p: Omit<Pago, "id"> | Pago) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onCancel: () => void;
  onPayWithMP?: (pago: Omit<Pago, "id">) => Promise<void>;
};

export default function PaymentDialog({
  initial, pacientes, barberos, servicios, onSave, onDelete, onCancel,
}: Props) {
  const [pacienteId, setPacienteId] = useState<string>(
    initial?.paciente_id ? String(initial.paciente_id) : SIN_TURNO_ID,
  );
  const [fecha, setFecha] = useState(initial?.fecha ?? new Date().toISOString().split("T")[0]);
  const [metodo, setMetodo] = useState<string>(initial?.metodo ?? "Efectivo");
  
  // Estados para la automatización de la lista de precios de Ajustes
  const [servicioId, setServicioId] = useState<string>("");
  const [concepto, setConcepto] = useState(initial?.concepto ?? "");
  const [monto, setMonto] = useState<string>(initial?.monto ? String(initial.monto) : "");
  const [status, setStatus] = useState<Pago["status"]>(initial?.status ?? "approved");
  
  // Inicialización inteligente del ID del barbero para soportar registros viejos (strings) y nuevos (IDs)
  const [barberId, setBarberId] = useState<string>(() => {
    if (initial?.barberId) return initial.barberId;
    if (initial?.barbero) {
      const encontrado = barberos.find(b => b.name.toLowerCase() === initial.barbero?.toLowerCase());
      return encontrado?.id ?? "";
    }
    return "";
  });

  // Bloqueo de scroll del body al abrir el diálogo 
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

 
  

  // Sincronización al editar un registro existente
  useEffect(() => {
    if (initial) {
      setPacienteId(String(initial.paciente_id));
      setFecha(initial.fecha);
      setMetodo(initial.metodo);
      setConcepto(initial.concepto);
      setMonto(initial.monto ? String(initial.monto) : "");
      setStatus(initial.status);
      setServicioId(initial.serviceId ?? "");
      
      // Resolución de ID retrocompatible para el selector
      if (initial.barberId) {
        setBarberId(initial.barberId);
      } else if (initial.barbero) {
        const encontrado = barberos.find(b => b.name.toLowerCase() === initial.barbero?.toLowerCase());
        setBarberId(encontrado?.id ?? "");
      } else {
        setBarberId("");
      }
    }
  }, [initial, barberos]);

  // Manejador del cambio de servicio: auto-rellena concepto y precio base
  const handleServicioChange = (id: string) => {
    setServicioId(id);
    const svc = servicios.find(s => s.id === id);
    if (svc) {
      setConcepto(svc.name);
      setMonto(String(svc.price));
    } else {
      setConcepto("");
      setMonto("");
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const esSinTurno = pacienteId === SIN_TURNO_ID;
    const pac = pacientes.find((p) => String(p.id) === pacienteId);
    const barberoSeleccionado = barberos.find((b) => b.id === barberId);
    
    const finalMonto = Number(monto) || 0;

    // Cálculo automático de la porción de dinero del empleado
    const porcentajeComision = barberoSeleccionado?.commissionPercentage ?? 50;
    const comisionCalculada = (finalMonto * porcentajeComision) / 100;

    const payload: any = {
      paciente_id: pacienteId,
      paciente_nombre: esSinTurno
        ? "Cliente sin turno"
        : (pac?.nombre_completo ?? initial?.paciente_nombre ?? ""),
      fecha,
      metodo,
      concepto,
      serviceId: servicioId || undefined,
      monto: finalMonto,
      status,
      barberId: barberId || undefined,
      barbero: barberoSeleccionado?.name ?? undefined, // Nombre plano denormalizado para listados rápidos
      comisionBarbero: comisionCalculada, // Impacta directo en el Cierre de Caja
    };

    if (initial?.id) {
      await onSave({ ...payload, id: initial.id });
    } else {
      await onSave(payload);
    }
  }

  // Si es un NUEVO corte, ocultamos los barberos desactivados para que no se elijan por error
  const barberosFiltrados = initial 
    ? barberos 
    : barberos.filter(b => b.isActive);

  return (
    <div className="fixed inset-0 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm z-50 p-0 sm:p-4">
      <div className="bg-[#161920] w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl border border-slate-800/80 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 relative max-h-[calc(100dvh-76px)] mb-[76px] sm:mb-0 flex flex-col">
        <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

        {/* Indicador visual táctil para celulares */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-slate-700" />
        </div>

        {/* Encabezado */}
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-[#12141a] shrink-0">
          <h2 className="text-base font-black text-slate-100 uppercase tracking-wide">
            {initial ? "Editar Registro" : "Nuevo Pago"}
          </h2>
          <button onClick={onCancel} className="text-slate-500 hover:text-slate-300 transition-colors">
            <span className="text-xl">✕</span>
          </button>
        </div>

        {/* Cuerpo del Formulario */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 token-custom-scrollbar">

          {/* Selector de Barberos */}
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
              Barbero *
            </label>
            <select
              value={barberId}
              onChange={(e) => setBarberId(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#12141a] border border-slate-800 rounded-2xl focus:border-amber-500 outline-none transition-all font-bold text-slate-200 text-sm"
            >
              <option value="" className="bg-[#161920]">Seleccionar barbero...</option>
              {barberosFiltrados.map((b) => (
                <option key={b.id} value={b.id} className="bg-[#161920]">
                  {b.name} ({b.commissionPercentage}%)
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Clientes */}
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
              Cliente
            </label>
            <select
              value={pacienteId}
              onChange={(e) => setPacienteId(e.target.value)}
              className="w-full px-4 py-3 bg-[#12141a] border border-slate-800 rounded-2xl focus:border-amber-500 outline-none transition-all font-bold text-slate-200 text-sm"
            >
              <option value={SIN_TURNO_ID} className="bg-[#161920]">
                Cliente sin turno
              </option>
              {pacientes.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#161920]">
                  {p.nombre_completo}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Servicios / Conceptos de Ajustes */}
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
              Servicio / Concepto *
            </label>
            <select
              value={servicioId}
              onChange={(e) => setServicioId(e.target.value)}
              onInput={(e) => handleServicioChange((e.target as HTMLSelectElement).value)}
              required={servicios.length > 0}
              className="w-full px-4 py-3 bg-[#12141a] border border-slate-800 rounded-2xl focus:border-amber-500 outline-none transition-all font-bold text-slate-200 text-sm"
            >
              <option value="" className="bg-[#161920]">Seleccionar servicio del local...</option>
              {servicios.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#161920]">
                  {s.name} — ${s.price.toLocaleString("es-AR")}
                </option>
              ))}
              <option value="custom" className="bg-[#161920]">Otro concepto / Monto personalizado</option>
            </select>

            {/* Input secundario dinámico para conceptos libres */}
            {servicioId === "custom" && (
              <input
                type="text"
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                placeholder="Ej: Venta de Pomada, Alisado..."
                required
                className="w-full mt-2 px-4 py-3 bg-[#12141a] border border-slate-800 rounded-2xl focus:border-amber-500 outline-none transition-all font-bold text-slate-200 text-sm placeholder:text-slate-700 animate-in fade-in duration-200"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Fecha */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                Fecha
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#12141a] border border-slate-800 rounded-2xl focus:border-amber-500 outline-none transition-all font-bold text-slate-200 text-sm"
              />
            </div>

            {/* Monto (Se bloquea si el precio viene directo de Ajustes) */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                Monto ($)
              </label>
              <input
                type="number"
                step="any"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="0"
                required
                disabled={servicioId !== "custom" && servicioId !== ""}
                className={`w-full px-4 py-3 bg-[#12141a] border border-slate-800 rounded-2xl focus:border-amber-500 outline-none transition-all font-bold text-slate-200 text-sm placeholder:text-slate-700 ${
                  servicioId !== "custom" && servicioId !== "" ? "opacity-60 cursor-not-allowed text-amber-500" : ""
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Método de Pago */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                Método
              </label>
              <select
                value={metodo}
                onChange={(e) => setMetodo(e.target.value)}
                className="w-full px-4 py-3 bg-[#12141a] border border-slate-800 rounded-2xl focus:border-amber-500 outline-none transition-all font-bold text-slate-200 text-sm"
              >
                <option className="bg-[#161920]">Efectivo</option>
                <option className="bg-[#161920]">Transferencia</option>
                <option className="bg-[#161920]">Mercado Pago</option>
                <option className="bg-[#161920]">Débito</option>
                <option className="bg-[#161920]">Crédito</option>
              </select>
            </div>

            {/* Estado del Pago */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                Estado
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Pago["status"])}
                className="w-full px-4 py-3 bg-[#12141a] border border-slate-800 rounded-2xl focus:border-amber-500 outline-none transition-all font-bold text-slate-200 text-sm"
              >
                <option value="approved" className="bg-[#161920]">Aprobado</option>
                <option value="pending" className="bg-[#161920]">Pendiente</option>
                <option value="rejected" className="bg-[#161920]">Rechazado</option>
              </select>
            </div>
          </div>
       

          {/* Botones de Acción */}
          <div className="flex flex-col gap-3 pt-4 border-t border-slate-800">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-3 rounded-2xl border border-slate-800 text-slate-400 font-bold hover:bg-slate-800 transition-all text-sm uppercase tracking-wider"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                className="flex-1 px-4 py-3 rounded-2xl bg-amber-600 text-white font-bold hover:bg-amber-500 shadow-lg shadow-amber-950/40 border border-amber-500/15 transition-all active:scale-95 text-sm uppercase tracking-wider"
              >
                Guardar
              </button>
            </div>
             <br />

            {initial && onDelete && (
              <button
                type="button"
                className="w-full py-2 text-rose-400 text-xs font-bold uppercase tracking-widest hover:text-rose-300 transition-colors"
                onClick={() => onDelete(initial.id)}
              >
                Eliminar Registro Permanentemente
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}