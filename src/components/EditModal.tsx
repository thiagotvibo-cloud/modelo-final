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

  React.useEffect(() => {
    if (isOpen && initialData) {
      setFormData(initialData);
    }
  }, [isOpen, initialData]);

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
      <div className="bg-white w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] p-6 pb-12 sm:pb-8 shadow-2xl relative animate-in slide-in-from-bottom-full duration-300">
        <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-6 sm:hidden pointer-events-none"></div>
        
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="max-h-[60vh] overflow-y-auto space-y-5 pr-1 hide-scrollbar">
              {Object.keys(initialData)
                .filter(key => !['id', 'type', 'currentInstallment', 'account'].includes(key))
                .map((key) => {
                  const val = formData[key];
                  const isNumber = typeof val === 'number';
                  const isDate = key === 'date' || key === 'deadline';
                  const inputType = isNumber ? 'number' : isDate ? 'date' : 'text';

                  const labels: Record<string, string> = {
                    description: 'Descrição',
                    title: 'Título',
                    name: 'Nome',
                    value: 'Valor',
                    date: 'Data',
                    method: 'Forma / Tipo',
                    status: 'Status',
                    category: 'Categoria / Banco',
                    totalInstallments: 'Total de Parcelas',
                    totalAmount: 'Valor Total',
                    paidAmount: 'Valor Pago',
                    interestRate: 'Taxa de Juros',
                    target: 'Meta Alvo',
                    saved: 'Valor Salvo',
                    deadline: 'Prazo',
                    balance: 'Saldo Atual',
                    yield: 'Rendimento',
                    limit: 'Limite',
                    spent: 'Gasto',
                    institution: 'Instituição',
                    expectedBalance: 'Saldo Previsto'
                  };

                  if (key === 'status') {
                    return (
                      <div key={key}>
                        <label className="block text-[13px] font-semibold text-slate-500 mb-1.5">{labels[key] || key}</label>
                        <select
                          name={key}
                          value={val || ''}
                          onChange={handleChange}
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#007AFF] bg-slate-50"
                        >
                          <option value="Pago">Pago / Recebido</option>
                          <option value="Recebido">Recebido</option>
                          <option value="Pendente">Pendente</option>
                          <option value="Previsto">Previsto</option>
                        </select>
                      </div>
                    );
                  }

                  return (
                    <div key={key}>
                      <label className="block text-[13px] font-semibold text-slate-500 mb-1.5">{labels[key] || key}</label>
                      <input 
                        type={inputType}
                        name={key}
                        value={isDate && val ? (!isNaN(Date.parse(String(val))) ? new Date(String(val)).toISOString().split('T')[0] : '') : (val !== undefined && val !== null ? val : '')} 
                        onChange={handleChange}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#007AFF] bg-slate-50"
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
