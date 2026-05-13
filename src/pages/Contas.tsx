import { Plus, Wallet, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFinance, Conta } from "../contexts/FinanceContext";
import { EditModal } from "../components/EditModal";
import { AddModal } from "../components/AddModal";
import { motion, AnimatePresence } from "framer-motion";

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
          <h1 className="text-[28px] font-bold text-slate-900 dark:text-white tracking-tight">Contas e Cartões</h1>
          <p className="text-sm text-slate-400 font-medium tracking-tight">Gerencie suas instituições financeiras</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {contas.length > 0 ? (
            contas.map((conta, index) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
                key={conta.id} 
                className="iphone-card p-7 shadow-sm cursor-pointer active:scale-[0.98] transition-all hover:bg-slate-50 dark:hover:bg-[#323235] border-t-4"
                style={{ borderTopColor: conta.institution === 'Nubank' ? '#9333ea' : conta.institution === 'Bradesco' ? '#e11d48' : '#000' }}
                onClick={() => handleEdit(conta)}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-[#1F1F1F] rounded-[18px] flex items-center justify-center text-slate-400 dark:text-slate-500">
                      <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-[18px] tracking-tight">{conta.name}</h3>
                      <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{conta.institution}</p>
                    </div>
                  </div>
                  <div className="bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-full">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{conta.type}</span>
                  </div>
                </div>
                
                 <div className="grid grid-cols-2 gap-8 pt-6 border-t border-black/[0.02] dark:border-white/5">
                   <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">Saldo / Limite</span>
                    <p className="font-bold text-[20px] text-slate-900 dark:text-white tracking-tight">
                      {conta.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                   <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">Previsto</span>
                    <p className="font-bold text-[20px] text-slate-600 dark:text-slate-300 tracking-tight">
                      {conta.expectedBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-white dark:bg-[#2C2C2E] rounded-[40px] p-20 text-center border border-black/[0.02] dark:border-white/5"
             >
              <Wallet className="w-16 h-16 text-slate-200 dark:text-slate-600 mx-auto mb-6" />
              <p className="text-slate-400 font-bold tracking-tight">Adicione sua primeira conta!</p>
            </motion.div>
          )}
        </AnimatePresence>
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
