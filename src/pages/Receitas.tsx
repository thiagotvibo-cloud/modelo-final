import { ChevronLeft, ChevronRight, Plus, Check, Pencil, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useFinance, Receita } from "../contexts/FinanceContext";
import { EditModal } from "../components/EditModal";
import { AddModal } from "../components/AddModal";
import { formatDateShort } from "../lib/utils";

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

  const isRecebido = (receita: Receita) => receita.status === 'Recebido';

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">Receitas</h1>
          <p className="text-sm text-slate-400 font-medium tracking-tight">Gestão de entradas e recebimentos</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

       <div className="flex items-center justify-between mb-10 bg-white border border-black/[0.03] rounded-[24px] p-2 shadow-sm">
        <button className="p-3 text-slate-300 hover:text-black hover:bg-slate-50 rounded-2xl transition-all">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <span className="text-sm font-bold text-slate-900 uppercase tracking-widest px-4">Maio 2026</span>
        <button className="p-3 text-slate-300 hover:text-black hover:bg-slate-50 rounded-2xl transition-all">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-10">
        <div className="bg-white p-6 rounded-[28px] border border-black/[0.03] shadow-sm flex flex-col">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">PREVISTO</h3>
          <p className="text-[20px] font-bold text-slate-900 tracking-tight">{totalPrevisto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        </div>
        <div className="bg-white p-6 rounded-[28px] border border-black/[0.03] shadow-sm flex flex-col">
          <h3 className="text-[10px] font-bold text-green-500 uppercase tracking-widest mb-1.5">RECEBIDO</h3>
          <p className="text-[20px] font-bold text-green-600 tracking-tight">{totalRecebido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        </div>
      </div>

      <div className="space-y-4">
        {receitas.length > 0 ? receitas.map((receita) => {
          const formattedDate = formatDateShort(receita.date);
          const received = isRecebido(receita);
          
          return (
            <div 
               key={receita.id}
               onClick={() => handleEdit(receita)}
               className={`iphone-card p-6 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all hover:bg-slate-50 ${received ? 'opacity-40 grayscale' : ''}`}
            >
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 text-[17px] tracking-tight mb-2">{receita.description}</h3>
                <div className="flex items-center gap-3">
                  <span className="bg-slate-100 text-[10px] font-bold text-slate-500 px-2.5 py-1.5 rounded-lg uppercase tracking-wider">{formattedDate}</span>
                  <span className="bg-slate-100 text-[10px] font-bold text-slate-500 px-2.5 py-1.5 rounded-lg uppercase tracking-wider">{receita.category}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3 ml-4">
                 <p className="font-bold text-green-600 text-[18px] tracking-tight leading-none">
                   {receita.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                 </p>
                 <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => toggleStatus(e, receita)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[12px] font-bold transition-all shadow-sm ${received ? 'bg-green-500 text-white' : 'bg-black text-white hover:bg-zinc-800'}`}
                    >
                      {received ? <Check className="w-4 h-4 stroke-[3]" /> : 'Recebido?'}
                    </button>
                 </div>
              </div>
            </div>
          );
        }) : (
          <div className="bg-white rounded-[40px] p-20 flex flex-col items-center justify-center text-center border border-black/[0.02]">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Plus className="w-10 h-10 text-slate-200" />
            </div>
            <p className="text-slate-400 font-bold tracking-tight">Nenhuma receita lançada.</p>
          </div>
        )}
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
