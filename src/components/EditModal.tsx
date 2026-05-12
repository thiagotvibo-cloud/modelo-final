import { X } from "lucide-react";
import React, { useState } from "react";

type EditModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  initialData: any;
  onSave: (data: any) => void;
  onDelete?: () => void;
};

export function EditModal({ isOpen, onClose, title, initialData, onSave, onDelete }: EditModalProps) {
  const [formData, setFormData] = useState(initialData);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: name === 'value' ? Number(value) : value }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete) {
      if (window.confirm("Você tem certeza que deseja excluir?")) {
        onDelete();
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-[100] flex flex-col justify-end sm:justify-center items-center">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 pb-10 sm:pb-6 shadow-2xl relative animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-1">
            {Object.keys(initialData).filter(key => key !== 'id').map((key) => {
              const val = formData[key];
              const isNumber = typeof val === 'number';
              const inputType = isNumber ? 'number' : 'text';

              if (key === 'status') {
                return (
                  <div key={key}>
                    <label className="block text-sm font-medium text-slate-700 mb-1 capitalize">{key}</label>
                    <select
                      name={key}
                      value={val || ''}
                      onChange={handleChange}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-800 bg-white"
                    >
                      <option value="Pago">Pago / Recebido</option>
                      <option value="Pendente">Pendente / Previsto</option>
                    </select>
                  </div>
                );
              }

              return (
                <div key={key}>
                  <label className="block text-sm font-medium text-slate-700 mb-1 capitalize">{key}</label>
                  <input 
                    type={inputType}
                    name={key}
                    value={val !== undefined && val !== null ? val : ''} 
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-800"
                  />
                </div>
              );
            })}
          </div>

          <div className="flex gap-2 mt-4">
            {onDelete && (
              <button 
                onClick={handleDelete}
                className="w-1/3 bg-red-100 hover:bg-red-200 text-red-600 font-bold py-3.5 rounded-xl transition-colors"
              >
                Excluir
              </button>
            )}
            <button 
              onClick={handleSave}
              className={`${onDelete ? 'w-2/3' : 'w-full'} mt-0 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-colors`}
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
