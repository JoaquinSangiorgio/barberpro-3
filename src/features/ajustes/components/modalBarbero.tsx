import { useState, useEffect } from "react";
import { Barbero } from "../services/ajustesService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (barbero: Omit<Barbero, "id">) => void;
  initialData?: Barbero;
  isEditing?: boolean;
}

export default function ModalBarbero({ isOpen, onClose, onSave, initialData, isEditing }: Props) {
  const [name, setName] = useState("");
  const [commission, setCommission] = useState(50);

  useEffect(() => {
    if (initialData && isEditing) {
      setName(initialData.name);
      setCommission(initialData.commissionPercentage);
    } else {
      setName("");
      setCommission(50);
    }
  }, [isOpen, initialData, isEditing]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name, commissionPercentage: Number(commission), isActive: true });
    setName("");
    setCommission(50);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#161920] border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
        <h3 className="text-lg font-black text-slate-100 uppercase tracking-wider mb-4">
          {isEditing ? "Editar Barbero" : "Agregar Barbero"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nombre</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)}
              className="w-full bg-[#0f1115] border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
              placeholder="Ej: Franco"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Porcentaje de Comisión (%)</label>
            <input 
              type="number" 
              value={commission} 
              onChange={e => setCommission(Number(e.target.value))}
              className="w-full bg-[#0f1115] border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
              min="0" max="100" required
            />
            <p className="text-xs text-slate-500 mt-1">El barbero cobrará el {commission}% de cada ingreso registrado</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors text-sm">Cancelar</button>
            <button type="submit" className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-[#0f1115] font-black rounded-xl transition-colors text-sm">
              {isEditing ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}