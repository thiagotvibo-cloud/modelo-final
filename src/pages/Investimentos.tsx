import { Plus, Trash2, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useFinance, Investimento } from "../contexts/FinanceContext";
import { EditModal } from "../components/EditModal";

export function Investimentos() {
  const { investimentos, updateInvestimento, deleteInvestimento } = useFinance();
  const [editingItem, setEditingItem] = useState<Investimento | null>(null);

  const handleEdit = (investimento: Investimento) => {
    setEditingItem(investimento);
  };

  const handleSaveEdit = (data: Partial<Investimento>) => {
    if (editingItem) {
      updateInvestimento(editingItem.id, data);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-slate-800">Investimentos</h1>
          <p className="text-sm text-slate-500 mt-1">Acompanhe sua carteira</p>
        </div>
        <div>
          <button className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-3 rounded-xl text-sm font-bold transition-colors">
            <Plus className="w-5 h-5" />
            Novo
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {investimentos.map((invest) => {
          return (
            <div 
              key={invest.id} 
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm cursor-pointer active:scale-[0.98] transition-transform"
              onClick={() => handleEdit(invest)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-[15px] mb-1">{invest.name}</h3>
                  <span className="text-[11px] font-medium text-slate-500 uppercase">{invest.type}</span>
                </div>
                 <button 
                  onClick={(e) => { e.stopPropagation(); deleteInvestimento(invest.id); }}
                  className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Saldo Atual</span>
                  <p className="font-bold text-[16px] text-slate-800">{invest.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                </div>
                 <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Rendimento</span>
                  <p className="font-bold text-[14px] text-green-600 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +{invest.yield.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <EditModal 
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        title="Editar Investimento"
        initialData={editingItem || {}}
        onSave={handleSaveEdit}
        onDelete={() => { if(editingItem) deleteInvestimento(editingItem.id) }}
      />
    </div>
  );
}
