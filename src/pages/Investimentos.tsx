import { Plus, Trash2, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useFinance, Investimento } from "../contexts/FinanceContext";
import { EditModal } from "../components/EditModal";
import { AddModal } from "../components/AddModal";

export function Investimentos() {
  const { investimentos, updateInvestimento, deleteInvestimento } = useFinance();
  const [editingItem, setEditingItem] = useState<Investimento | null>(null);
  const [isAdding, setIsAdding] = useState(false);

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">Investimentos</h1>
          <p className="text-sm text-slate-400 font-medium tracking-tight">Fazendo seu dinheiro trabalhar</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-4">
        {investimentos.length > 0 ? (
          investimentos.map((invest) => (
            <div 
              key={invest.id} 
              className="iphone-card p-7 shadow-sm cursor-pointer active:scale-[0.98] transition-all hover:bg-slate-50"
              onClick={() => handleEdit(invest)}
            >
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-green-500 rounded-[22px] flex items-center justify-center text-white shadow-lg shadow-green-500/20">
                    <TrendingUp className="w-7 h-7 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-[19px] tracking-tight">{invest.name}</h3>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">{invest.type}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-black/[0.02]">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Saldo Atual</span>
                  <p className="font-bold text-[22px] text-slate-900 tracking-tight leading-none">
                    {invest.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
                 <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Rendimento</span>
                  <p className="font-bold text-[18px] text-green-500 flex items-center gap-1.5 leading-none">
                    <TrendingUp className="w-4 h-4 stroke-[3]" />
                    +{invest.yield.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-[40px] p-20 text-center border border-black/[0.02]">
            <TrendingUp className="w-16 h-16 text-slate-200 mx-auto mb-6" strokeWidth={1} />
            <p className="text-slate-400 font-bold tracking-tight">Onde você vai investir hoje?</p>
          </div>
        )}
      </div>

      <EditModal 
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        title="Editar Investimento"
        initialData={editingItem || {}}
        onSave={handleSaveEdit}
        onDelete={() => { if(editingItem) deleteInvestimento(editingItem.id) }}
      />

       <AddModal 
        isOpen={isAdding}
        onClose={() => setIsAdding(false)}
        defaultType="Investimento" 
      />
    </div>
  );
}
