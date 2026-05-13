import { ChevronLeft, ChevronRight, Plus, Check, Pencil, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useFinance, Gasto } from "../contexts/FinanceContext";
import { EditModal } from "../components/EditModal";
import { AddModal } from "../components/AddModal";

export function Gastos() {
  const { gastos, updateGasto, deleteGasto } = useFinance();
  const [editingItem, setEditingItem] = useState<Gasto | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleEdit = (gasto: Gasto) => {
    setEditingItem(gasto);
  };

  const handleSaveEdit = (data: Partial<Gasto>) => {
    if (editingItem) {
      updateGasto(editingItem.id, data);
    }
  };

  const isPago = (gasto: Gasto) => gasto.status === 'Pago';

  const toggleStatus = (e: React.MouseEvent, gasto: Gasto) => {
    e.stopPropagation();
    updateGasto(gasto.id, { status: gasto.status === 'Pago' ? 'Pendente' : 'Pago' });
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">Gastos</h1>
          <p className="text-sm text-slate-400 font-medium">Controle suas despesas variáveis</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg shadow-black/10 active:scale-95 transition-all"
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

      <div className="space-y-4">
        {gastos.length > 0 ? gastos.map((gasto) => {
          const formattedDate = new Date(gasto.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
          const paid = isPago(gasto);
          
          return (
            <div 
               key={gasto.id} 
               onClick={() => handleEdit(gasto)}
               className={`iphone-card p-6 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all hover:bg-slate-50 ${paid ? 'opacity-50 grayscale' : ''}`}
            >
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 text-[17px] tracking-tight mb-2">{gasto.description}</h3>
                <div className="flex items-center gap-3">
                  <span className="bg-slate-100 text-[10px] font-bold text-slate-500 px-2 py-1 rounded-lg uppercase tracking-wider">{formattedDate}</span>
                  <span className="bg-slate-100 text-[10px] font-bold text-slate-500 px-2 py-1 rounded-lg uppercase tracking-wider">{gasto.method}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3 ml-4">
                <p className="font-bold text-red-500 text-[18px] tracking-tight">
                  {gasto.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => toggleStatus(e, gasto)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[12px] font-bold transition-all shadow-sm ${paid ? 'bg-green-500 text-white' : 'bg-black text-white hover:bg-zinc-800'}`}
                  >
                    {paid ? <Check className="w-4 h-4 stroke-[3]" /> : 'Pagar'}
                  </button>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="bg-white rounded-[32px] p-16 flex flex-col items-center justify-center text-center border border-black/[0.02]">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Plus className="w-10 h-10 text-slate-200" />
            </div>
            <p className="text-slate-400 font-bold tracking-tight">Vazio por enquanto...</p>
          </div>
        )}
      </div>

      <EditModal 
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        title="Editar Gasto"
        initialData={editingItem || {}}
        onSave={handleSaveEdit}
        onDelete={() => { if(editingItem) deleteGasto(editingItem.id) }}
      />

      <AddModal 
        isOpen={isAdding}
        onClose={() => setIsAdding(false)}
        defaultType="Gasto"
      />
    </div>
  );
}
