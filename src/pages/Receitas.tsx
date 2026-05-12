import { ChevronLeft, ChevronRight, Plus, Check, Pencil, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useFinance, Receita } from "../contexts/FinanceContext";
import { EditModal } from "../components/EditModal";
import { AddModal } from "../components/AddModal";

export function Receitas() {
  const { receitas, updateReceita, deleteReceita } = useFinance();
  const [editingItem, setEditingItem] = useState<Receita | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleEdit = (receita: Receita) => {
    setEditingItem(receita);
  };

  const handleSaveEdit = (data: Partial<Receita>) => {
    if (editingItem) {
      updateReceita(editingItem.id, data);
    }
  };

  const toggleStatus = (e: React.MouseEvent, receita: Receita) => {
    e.stopPropagation();
    updateReceita(receita.id, { status: receita.status === 'Recebido' ? 'Previsto' : 'Recebido' });
  };

  const totalRecebido = receitas.filter(r => r.status === 'Recebido').reduce((acc, curr) => acc + curr.value, 0);
  const totalPrevisto = receitas.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-slate-800">Receitas</h1>
        <p className="text-sm text-slate-500 mt-1">Suas entradas do mês</p>
      </div>

       <div className="flex items-center justify-between mb-6 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
        <button className="text-slate-400 hover:text-slate-600 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-semibold text-slate-700">Maio 2026</span>
        <button className="text-slate-400 hover:text-slate-600 transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-6">
        <button 
          onClick={() => setIsAdding(true)}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-3 rounded-xl text-sm font-bold transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nova Receita
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">PREVISTO</h3>
          <p className="text-lg font-bold text-slate-800">{totalPrevisto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">RECEBIDO</h3>
          <p className="text-lg font-bold text-emerald-600">{totalRecebido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        </div>
      </div>

      <div className="space-y-3">
        {receitas.map((receita) => (
          <div 
             key={receita.id}
             onClick={() => handleEdit(receita)}
             className={`bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform ${receita.status === 'Recebido' ? 'opacity-70' : ''}`}
          >
            <div>
              <h3 className="font-bold text-slate-800 text-[15px] mb-0.5">{receita.description}</h3>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1">
                 <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  {receita.date}
                </span>
                <span>•</span>
                <span className="">{receita.category}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
               <p className="font-bold text-emerald-600 text-base">
                 {receita.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
               </p>
               <div className="flex items-center gap-2 border border-slate-200 p-0.5 rounded-lg">
                  <button 
                    onClick={(e) => toggleStatus(e, receita)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-md text-[10px] font-bold transition-colors ${receita.status === 'Recebido' ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-700'}`}
                  >
                    {receita.status === 'Recebido' ? 'Recebido' : <><Check className="w-3 h-3" /> Receber</>}
                  </button>
                   <button 
                     onClick={(e) => { e.stopPropagation(); deleteReceita(receita.id); }}
                     className="p-1.5 text-red-400 hover:bg-slate-50 rounded-md transition-colors border-l border-slate-200"
                   >
                    <Trash2 className="w-4 h-4" />
                  </button>
               </div>
            </div>
          </div>
        ))}
      </div>

      <EditModal 
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        title="Editar Receita"
        initialData={editingItem || {}}
        onSave={handleSaveEdit}
        onDelete={() => { if(editingItem) deleteReceita(editingItem.id) }}
      />
      <AddModal 
        isOpen={isAdding}
        onClose={() => setIsAdding(false)}
        defaultType="Receita"
      />
    </div>
  );
}
