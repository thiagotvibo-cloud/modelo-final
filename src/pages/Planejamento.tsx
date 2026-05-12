import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFinance, Orcamento } from "../contexts/FinanceContext";
import { EditModal } from "../components/EditModal";

export function Planejamento() {
  const { orcamentos, updateOrcamento, deleteOrcamento } = useFinance();
  const [editingItem, setEditingItem] = useState<Orcamento | null>(null);

  const handleEdit = (orcamento: Orcamento) => {
    setEditingItem(orcamento);
  };

  const handleSaveEdit = (data: Partial<Orcamento>) => {
    if (editingItem) {
      updateOrcamento(editingItem.id, data);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-slate-800">Planejamento</h1>
          <p className="text-sm text-slate-500 mt-1">Limites de gasto por categoria</p>
        </div>
        <div>
          <button className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-3 rounded-xl text-sm font-bold transition-colors">
            <Plus className="w-5 h-5" />
            Novo
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {orcamentos.map((orcamento) => {
          const perc = Math.min(100, Math.round((orcamento.spent / orcamento.limit) * 100));
          const isOverLimit = orcamento.spent > orcamento.limit;
          return (
            <div 
              key={orcamento.id} 
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm cursor-pointer active:scale-[0.98] transition-transform"
              onClick={() => handleEdit(orcamento)}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-slate-800 text-[15px]">{orcamento.category}</h3>
                 <button 
                  onClick={(e) => { e.stopPropagation(); deleteOrcamento(orcamento.id); }}
                  className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex justify-between items-end mb-2">
                 <p className={`font-bold ${isOverLimit ? 'text-red-500' : 'text-slate-700'}`}>{perc}%</p>
                 <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
                    {orcamento.spent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} de {orcamento.limit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                 </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${isOverLimit ? 'bg-red-500' : 'bg-slate-800'}`} 
                  style={{ width: `${perc}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      <EditModal 
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        title="Editar Orçamento"
        initialData={editingItem || {}}
        onSave={handleSaveEdit}
        onDelete={() => { if(editingItem) deleteOrcamento(editingItem.id) }}
      />
    </div>
  );
}
