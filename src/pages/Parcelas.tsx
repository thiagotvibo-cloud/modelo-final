import { Plus, Check, Pencil, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useFinance, Parcela } from "../contexts/FinanceContext";
import { EditModal } from "../components/EditModal";

export function Parcelas() {
  const { parcelas, updateParcela, deleteParcela } = useFinance();
  const [editingItem, setEditingItem] = useState<Parcela | null>(null);

  const handleEdit = (parcela: Parcela) => {
    setEditingItem(parcela);
  };

  const handleSaveEdit = (data: Partial<Parcela>) => {
    if (editingItem) {
      updateParcela(editingItem.id, data);
    }
  };

  const toggleStatus = (e: React.MouseEvent, parcela: Parcela) => {
    e.stopPropagation();
    updateParcela(parcela.id, { status: parcela.status === 'Pago' ? 'Pendente' : 'Pago' });
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-slate-800">Parcelas</h1>
          <p className="text-sm text-slate-500">Compras parceladas e assinaturas</p>
        </div>
        <div>
          <button className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-3 rounded-xl text-sm font-bold transition-colors">
            <Plus className="w-5 h-5" />
            Novo
          </button>
        </div>
      </div>

      <div className="bg-slate-100 p-1 rounded-xl flex mb-6">
        <button className="flex-1 bg-white shadow-sm py-2 text-sm font-bold text-slate-800 rounded-lg text-center">
          Parcelas
        </button>
        <button className="flex-1 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 text-center transition-colors">
          Assinaturas
        </button>
      </div>

      <div className="space-y-4">
        {parcelas.map((parcela) => {
          const isPago = parcela.status === 'Pago';
          const perc = Math.round((parcela.currentInstallment / parcela.totalInstallments) * 100);
          const remaining = (parcela.totalInstallments - parcela.currentInstallment) * parcela.value;
          
          return (
            <div 
               key={parcela.id}
               onClick={() => handleEdit(parcela)}
               className={`bg-white p-5 rounded-2xl border border-slate-200 shadow-sm pb-4 cursor-pointer active:scale-[0.98] transition-transform ${isPago && parcela.currentInstallment === parcela.totalInstallments ? 'opacity-60' : ''}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-slate-800 text-[15px] mb-1">{parcela.description}</h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1">
                     <span className="flex items-center gap-1">
                      {parcela.date}
                    </span>
                    <span>•</span>
                     <span className="uppercase font-semibold">{parcela.method}</span>
                     <span>•</span>
                      <span>{parcela.account}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <p className="font-bold text-red-600 text-base">{parcela.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                  <span className="text-[12px] font-bold text-slate-500">{parcela.currentInstallment}/{parcela.totalInstallments}</span>
                </div>
              </div>
              
              <div className="mb-2">
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-800 rounded-full" style={{ width: `${perc}%` }}></div>
                </div>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 font-medium mb-3">
                <span>Faltam {parcela.totalInstallments - parcela.currentInstallment}</span>
                <span>Restante: {remaining.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
              
              <div className={`flex items-center gap-2 pt-3 border-t border-slate-100 ${parcela.currentInstallment === parcela.totalInstallments ? 'justify-end' : ''}`}>
                 {parcela.currentInstallment < parcela.totalInstallments && (
                   <button 
                     onClick={(e) => toggleStatus(e, parcela)}
                     className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[13px] font-bold transition-colors ${isPago ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-700'}`}
                   >
                     {isPago ? 'Pago' : <><Check className="w-4 h-4" /> Pagar parcela</>}
                   </button>
                 )}
                 <button 
                   onClick={(e) => { e.stopPropagation(); deleteParcela(parcela.id); }}
                   className="p-2 border border-slate-200 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition-colors"
                 >
                   <Trash2 className="w-4 h-4" />
                 </button>
              </div>
            </div>
          );
        })}
      </div>

      <EditModal 
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        title="Editar Parcela"
        initialData={editingItem || {}}
        onSave={handleSaveEdit}
        onDelete={() => { if(editingItem) deleteParcela(editingItem.id) }}
      />
    </div>
  );
}
