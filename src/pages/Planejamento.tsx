import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFinance, Orcamento } from "../contexts/FinanceContext";
import { EditModal } from "../components/EditModal";
import { AddModal } from "../components/AddModal";

export function Planejamento() {
  const { orcamentos, updateOrcamento, deleteOrcamento } = useFinance();
  const [editingItem, setEditingItem] = useState<Orcamento | null>(null);
  const [isAdding, setIsAdding] = useState(false);

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">Orçamentos</h1>
          <p className="text-sm text-slate-400 font-medium tracking-tight">Defina seus limites mensais</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-4">
        {orcamentos.length > 0 ? (
          orcamentos.map((orcamento) => {
            const perc = Math.min(100, Math.round((orcamento.spent / orcamento.limit) * 100));
            const isOverLimit = orcamento.spent > orcamento.limit;
            return (
              <div 
                key={orcamento.id} 
                className="iphone-card p-7 shadow-sm active:scale-[0.98] transition-all hover:bg-slate-50"
                onClick={() => handleEdit(orcamento)}
              >
                <div className="flex justify-between items-start mb-6">
                  <h3 className="font-bold text-slate-900 text-[19px] tracking-tight">{orcamento.category}</h3>
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${isOverLimit ? 'bg-red-500 text-white' : 'bg-green-500 text-white shadow-lg shadow-green-500/10'}`}>
                    {isOverLimit ? 'Excedido' : 'No Prazo'}
                  </div>
                </div>
                
                <div className="flex justify-between items-end mb-4">
                   <p className={`text-3xl font-bold tracking-tight ${isOverLimit ? 'text-red-500' : 'text-slate-900'}`}>
                     {perc}%
                   </p>
                   <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Gasto vs Limite</p>
                      <p className="text-sm font-bold text-slate-600 tracking-tight">
                        {orcamento.spent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} de {orcamento.limit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                   </div>
                </div>
                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1 border border-black/[0.03]">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${isOverLimit ? 'bg-red-500' : 'bg-black'}`} 
                    style={{ width: `${perc}%` }}
                  ></div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-[40px] p-20 text-center border border-black/[0.02]">
            <Plus className="w-16 h-16 text-slate-200 mx-auto mb-6" />
            <p className="text-slate-400 font-bold tracking-tight">Crie seu primeiro orçamento!</p>
          </div>
        )}
      </div>

      <EditModal 
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        title="Editar Orçamento"
        initialData={editingItem || {}}
        onSave={handleSaveEdit}
        onDelete={() => { if(editingItem) deleteOrcamento(editingItem.id) }}
      />

      <AddModal 
        isOpen={isAdding}
        onClose={() => setIsAdding(false)}
        defaultType="Orcamento"
      />
    </div>
  );
}
