import { ChevronLeft, ChevronRight, Plus, Check, Pencil, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useFinance, Gasto } from "../contexts/FinanceContext";
import { EditModal } from "../components/EditModal";

export function Gastos() {
  const { gastos, updateGasto, deleteGasto } = useFinance();
  const [editingItem, setEditingItem] = useState<Gasto | null>(null);

  const handleEdit = (gasto: Gasto) => {
    setEditingItem(gasto);
  };

  const handleSaveEdit = (data: Partial<Gasto>) => {
    if (editingItem) {
      updateGasto(editingItem.id, data);
    }
  };

  const toggleStatus = (e: React.MouseEvent, gasto: Gasto) => {
    e.stopPropagation();
    updateGasto(gasto.id, { status: gasto.status === 'Pago' ? 'Pendente' : 'Pago' });
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-slate-800">Gastos Gerais</h1>
          <p className="text-sm text-slate-500">Controle suas despesas do mês</p>
        </div>
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

      <div className="mb-6 mb-6">
        <button className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-3 rounded-xl text-sm font-bold transition-colors">
          <Plus className="w-5 h-5" />
          Novo Gasto
        </button>
      </div>

      <div className="space-y-3">
        {gastos.map((gasto) => (
          <div 
             key={gasto.id} 
             onClick={() => handleEdit(gasto)}
             className={`bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform ${gasto.status === 'Pago' ? 'opacity-70' : ''}`}
          >
            <div>
              <h3 className="font-bold text-slate-800 text-[15px] mb-0.5">{gasto.description}</h3>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1">
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  {gasto.date}
                </span>
                <span>•</span>
                <span className="uppercase font-semibold">{gasto.method}</span>
              </div>
              {gasto.account && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  {gasto.account}
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-2 text-right">
              <p className="font-bold text-red-600 text-base">
                {gasto.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
              <div className="flex items-center gap-2 border border-slate-200 p-0.5 rounded-lg">
                <button 
                  onClick={(e) => toggleStatus(e, gasto)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-md text-[11px] font-bold transition-colors ${gasto.status === 'Pago' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-50 text-slate-700'}`}
                >
                  {gasto.status === 'Pago' ? 'Pago' : <><Check className="w-3.5 h-3.5" /> Pagar</>}
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteGasto(gasto.id); }}
                  className="p-1.5 text-red-400 hover:bg-slate-50 rounded-md transition-colors border-l border-slate-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {gasto.status === 'Pendente' && <span className="text-[10px] font-bold text-yellow-600">Pendente</span>}
            </div>
          </div>
        ))}
      </div>

      <EditModal 
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        title="Editar Gasto"
        initialData={editingItem || {}}
        onSave={handleSaveEdit}
        onDelete={() => { if(editingItem) deleteGasto(editingItem.id) }}
      />
    </div>
  );
}
