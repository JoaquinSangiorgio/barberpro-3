import { useState, useEffect } from "react";
import { ServicioBarberia } from "../services/ajustesService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (servicio: Omit<ServicioBarberia, "id">) => void;
  initialData?: ServicioBarberia;
  isEditing?: boolean;
}

export default function ModalServicio({ isOpen, onClose, onSave, initialData, isEditing }: Props) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    if (initialData && isEditing) {
      setName(initialData.name);
      setPrice(String(initialData.price));
    } else {
      setName("");
      setPrice("");
    }
  }, [isOpen, initialData, isEditing]);



    

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;
    onSave({ name, price: Number(price) });
    setName("");
    setPrice("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm pointer-events-none touch-none">
      <div className="bg-[#161920] border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl pointer-events-auto" style={{ touchAction: 'none' }}>
        <h3 className="text-lg font-black text-slate-100 uppercase tracking-wider mb-4">
          {isEditing ? "Editar Servicio" : "Crear Servicio"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nombre del Servicio</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)}
              className="w-full bg-[#0f1115] border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
              placeholder="Ej: Corte + Barba"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Precio ($)</label>
            <input 
              type="number" 
              value={price} 
              onChange={e => setPrice(e.target.value)}
              className="w-full bg-[#0f1115] border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
              placeholder="Ej: 15000"
              step="100"
              min="0"
              required
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors text-sm">Cancelar</button>
            <button type="submit" className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-[#0f1115] font-black rounded-xl transition-colors text-sm">
              {isEditing ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}