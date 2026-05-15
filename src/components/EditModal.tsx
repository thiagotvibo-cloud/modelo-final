import { X } from "lucide-react";
import React, { useState } from "react";
import { parseLocaleNumber } from "../lib/utils";
import { useFinance } from "../contexts/FinanceContext";

type EditModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  initialData: any;
  onSave: (data: any) => void;
  onDelete?: () => void;
  onDeleteSeries?: () => void;
};

export function EditModal({ isOpen, onClose, title, initialData, onSave, onDelete, onDeleteSeries }: EditModalProps) {
  const { contas } = useFinance();
  const [formData, setFormData] = useState(initialData);

  React.useEffect(() => {
    if (isOpen && initialData) {
      const data = { ...initialData };
      // If it's a Parcela, show the total value for editing
      if (data.type === 'Parcela') {
        data.value = Number((data.value * (data.totalInstallments || 1)).toFixed(2));
      }
      setFormData(data);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let finalValue: any = value;
    
    // List of numeric fields to be parsed correctly
    const numericFields = ['value', 'target', 'limit', 'totalAmount', 'paidAmount', 'balance', 'spent', 'saved', 'totalInstallments', 'yield', 'interestRate', 'expectedBalance'];
    
    if (numericFields.includes(name)) {
      finalValue = typeof value === 'string' ? parseLocaleNumber(value) : value;
      if (isNaN(finalValue)) finalValue = 0;
    }
    
    setFormData((prev: any) => ({ ...prev, [name]: finalValue }));
  };

  const handleSave = () => {
    const data = { ...formData };
    // If it's a Parcela, divide the total value back to installment value
    if (data.type === 'Parcela') {
      const count = Number(data.totalInstallments) || 1;
      data.value = Number((data.value / count).toFixed(2));
    }
    onSave(data);
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

  const handleDeleteSeries = () => {
    if (onDeleteSeries) {
      if (window.confirm("Você tem certeza que deseja excluir TODA esta compra e todas as suas parcelas?")) {
        onDeleteSeries();
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/80 backdrop-blur-sm z-[100] flex flex-col justify-end sm:justify-center items-center">
      <div className="bg-white dark:bg-[#1F1F1F] w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] p-6 pb-12 sm:pb-8 shadow-2xl relative animate-in slide-in-from-bottom-full duration-200 border border-transparent dark:border-white/10">
        <div className="w-12 h-1.5 bg-slate-100 dark:bg-white/10 rounded-full mx-auto mb-6 sm:hidden pointer-events-none"></div>
        
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="max-h-[60vh] overflow-y-auto space-y-5 pr-1 hide-scrollbar">
              {Object.keys(initialData)
                .filter(key => !['id', 'type', 'currentInstallment', 'account', 'seriesId', 'created_at', 'user_id', 'userId', 'createdAt'].includes(key))
                .map((key) => {
                  const val = formData[key];
                  const isDate = key === 'date' || key === 'deadline';
                  const numericFields = ['value', 'target', 'limit', 'totalAmount', 'paidAmount', 'balance', 'spent', 'saved', 'totalInstallments'];
                  const isNumeric = numericFields.includes(key);
                  
                  const inputType = isDate ? 'date' : 'text';
                  const inputMode = isNumeric ? 'decimal' : undefined;

                  // Only show name and color for items that seem to be 'Conta' (Labels)
                  if (initialData.type === 'Etiqueta' && !['name', 'color'].includes(key)) {
                    return null;
                  }

                  const labels: Record<string, string> = {
                    description: 'Descrição',
                    title: 'Título',
                    name: 'Nome da Etiqueta',
                    value: formData.type === 'Parcela' ? 'Valor Total da Compra' : 'Valor',
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
                    expectedBalance: 'Saldo Previsto',
                    bank: 'Conta de Origem',
                    observations: 'Observações',
                    color: 'Cor da Etiqueta'
                  };

                  if (key === 'status') {
                    return (
                      <div key={key}>
                        <label className="block text-[13px] font-semibold text-slate-500 mb-1.5">{labels[key] || key}</label>
                        <select
                          name={key}
                          value={val || ''}
                          onChange={handleChange}
                          className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-800 dark:text-white focus:outline-none focus:border-black bg-slate-50 dark:bg-[#2C2C2E]"
                        >
                          <option value="Pago">Pago / Recebido</option>
                          <option value="Recebido">Recebido</option>
                          <option value="Pendente">Pendente</option>
                          <option value="Previsto">Previsto</option>
                        </select>
                      </div>
                    );
                  }

                  if (key === 'bank') {
                    return (
                      <div key={key}>
                        <label className="block text-[13px] font-semibold text-slate-500 mb-1.5">{labels[key] || key}</label>
                        {contas.length > 0 ? (
                          <select
                            name={key}
                            value={val || ''}
                            onChange={handleChange}
                            className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-800 dark:text-white focus:outline-none focus:border-black bg-slate-50 dark:bg-[#2C2C2E]"
                          >
                            {contas.map(c => (
                              <option key={c.id} value={c.name}>{c.name}</option>
                            ))}
                            <option value="">Nenhuma / Outra</option>
                          </select>
                        ) : (
                          <input 
                            type="text"
                            name={key}
                            value={val || ''}
                            onChange={handleChange}
                            className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-800 dark:text-white focus:outline-none focus:border-black bg-slate-50 dark:bg-[#2C2C2E]"
                          />
                        )}
                      </div>
                    );
                  }

                  if (key === 'color') {
                    if (initialData.type !== 'Etiqueta') return null;
                    return (
                      <div key={key}>
                        <label className="block text-[13px] font-semibold text-slate-500 mb-1.5">{labels[key] || key}</label>
                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1 hide-scrollbar">
                          {[
                            '#ef4444', '#b91c1c', '#f97316', '#c2410c', '#f59e0b', '#b45309',
                            '#eab308', '#a16207', '#84cc16', '#4d7c0f', '#22c55e', '#15803d',
                            '#10b981', '#047857', '#14b8a6', '#0f766e', '#06b6d4', '#0891b2',
                            '#0ea5e9', '#0369a1', '#3b82f6', '#1d4ed8', '#6366f1', '#4338ca',
                            '#8b5cf6', '#6d28d9', '#a855f7', '#7e22ce', '#d946ef', '#a21caf',
                            '#ec4899', '#be185d', '#f43f5e', '#be123c', '#64748b', '#334155',
                            '#000000', '#333333'
                          ].map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setFormData((prev: any) => ({ ...prev, color: c }))}
                              className={`w-7 h-7 rounded-full border-2 transition-all ${formData.color === c ? 'border-black dark:border-white scale-110 shadow-lg' : 'border-transparent opacity-80 hover:opacity-100'}`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={key}>
                      <label className="block text-[13px] font-semibold text-slate-500 mb-1.5">{labels[key] || key}</label>
                      <input 
                        type={inputType}
                        inputMode={inputMode as any}
                        name={key}
                        value={isDate && val ? (!isNaN(Date.parse(String(val))) ? new Date(String(val)).toISOString().split('T')[0] : '') : (val !== undefined && val !== null ? val : '')} 
                        onChange={handleChange}
                        className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-800 dark:text-white focus:outline-none focus:border-black bg-slate-50 dark:bg-[#2C2C2E]"
                      />
                      {key === 'value' && formData.type === 'Parcela' && (
                        <div className="px-1 py-1 text-[13px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-500/10 rounded-xl mt-2 flex justify-between items-center px-4">
                          <span>Plano de Pagamento:</span>
                          <span>{(Number(formData.totalInstallments) || 1)}x de {(Number(formData.value) / (Number(formData.totalInstallments) || 1)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <div className="flex gap-2">
              {onDelete && (
                <button 
                  onClick={handleDelete}
                  className="w-1/2 bg-red-100 dark:bg-red-500/10 hover:bg-red-200 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold py-3.5 rounded-xl transition-colors text-sm"
                >
                  Excluir Parcela
                </button>
              )}
              <button 
                onClick={handleSave}
                className={`${onDelete ? 'w-1/2' : 'w-full'} mt-0 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-black font-bold py-3.5 rounded-xl transition-colors`}
              >
                Salvar
              </button>
            </div>
            {onDeleteSeries && (
              <button 
                onClick={handleDeleteSeries}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-red-500/20"
              >
                Excluir toda a compra
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
