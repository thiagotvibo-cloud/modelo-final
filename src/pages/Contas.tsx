import { Plus, Wallet, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFinance, Conta } from "../contexts/FinanceContext";
import { EditModal } from "../components/EditModal";

export function Contas() {
  const { contas, updateConta, deleteConta } = useFinance();
  const [editingItem, setEditingItem] = useState<Conta | null>(null);

  const handleEdit = (conta: Conta) => {
    setEditingItem(conta);
  };

  const handleSaveEdit = (data: Partial<Conta>) => {
    if (editingItem) {
      updateConta(editingItem.id, data);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-slate-800">Contas e Cartões</h1>
          <p className="text-sm text-slate-500 mt-1">Gerencie suas contas e cartões</p>
        </div>
        <div>
          <button className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-3 rounded-xl text-sm font-bold transition-colors">
            <Plus className="w-5 h-5" />
            Nova Conta
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {contas.map((conta) => (
          <div 
            key={conta.id} 
            className="bg-white p-5 rounded-2xl border-t-4 shadow-sm border border-slate-200 cursor-pointer active:scale-[0.98] transition-transform"
            style={{ borderTopColor: conta.institution === 'Nubank' ? '#9333ea' : '#e11d48' }}
            onClick={() => handleEdit(conta)}
          >
            <div className="flex justify-between items-start mb-4">
               <div className="flex items-center gap-3">
                <div className="p-2 border border-slate-200 rounded-lg bg-white">
                  <Wallet className="w-5 h-5 text-slate-400" />
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); deleteConta(conta.id); }}
                className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                title="Deletar Conta"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-[15px] mb-1">{conta.name}</h3>
               <p className="text-xs text-slate-500 mb-2">{conta.institution} ••••</p>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{conta.type}</span>
            </div>
            
             <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
               <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Saldo / Limite</span>
                <p className="font-bold text-[14px] text-slate-800">{conta.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              </div>
               <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Disponível</span>
                <p className="font-bold text-[14px] text-slate-600">{conta.expectedBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <EditModal 
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        title="Editar Conta / Cartão"
        initialData={editingItem || {}}
        onSave={handleSaveEdit}
        onDelete={() => { if(editingItem) deleteConta(editingItem.id) }}
      />
    </div>
  );
}
