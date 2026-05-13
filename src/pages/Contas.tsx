import { Plus, Wallet, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFinance, Conta } from "../contexts/FinanceContext";
import { EditModal } from "../components/EditModal";
import { AddModal } from "../components/AddModal";

export function Contas() {
  const { contas, updateConta, deleteConta } = useFinance();
  const [editingItem, setEditingItem] = useState<Conta | null>(null);
  const [isAdding, setIsAdding] = useState(false);

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">Contas e Cartões</h1>
          <p className="text-sm text-slate-400 font-medium tracking-tight">Gerencie suas instituições financeiras</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-4">
        {contas.length > 0 ? (
          contas.map((conta) => (
            <div 
              key={conta.id} 
              className="iphone-card p-7 shadow-sm cursor-pointer active:scale-[0.98] transition-all hover:bg-slate-50 border-t-4"
              style={{ borderTopColor: conta.institution === 'Nubank' ? '#9333ea' : conta.institution === 'Bradesco' ? '#e11d48' : '#000' }}
              onClick={() => handleEdit(conta)}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-[18px] flex items-center justify-center text-slate-400">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-[18px] tracking-tight">{conta.name}</h3>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{conta.institution}</p>
                  </div>
                </div>
                <div className="bg-slate-100 px-3 py-1.5 rounded-full">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{conta.type}</span>
                </div>
              </div>
              
               <div className="grid grid-cols-2 gap-8 pt-6 border-t border-black/[0.02]">
                 <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Saldo / Limite</span>
                  <p className="font-bold text-[20px] text-slate-900 tracking-tight">
                    {conta.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
                 <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Previsto</span>
                  <p className="font-bold text-[20px] text-slate-600 tracking-tight">
                    {conta.expectedBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
           <div className="bg-white rounded-[40px] p-20 text-center border border-black/[0.02]">
            <Wallet className="w-16 h-16 text-slate-200 mx-auto mb-6" />
            <p className="text-slate-400 font-bold tracking-tight">Adicione sua primeira conta!</p>
          </div>
        )}
      </div>

      <EditModal 
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        title="Editar Conta / Cartão"
        initialData={editingItem || {}}
        onSave={handleSaveEdit}
        onDelete={() => { if(editingItem) deleteConta(editingItem.id) }}
      />

      <AddModal 
        isOpen={isAdding}
        onClose={() => setIsAdding(false)}
        defaultType="Conta"
      />
    </div>
  );
}
