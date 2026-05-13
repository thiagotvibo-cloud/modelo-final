import { Plus, Trash2, Check } from "lucide-react";
import { useState } from "react";
import { useFinance, Divida } from "../contexts/FinanceContext";
import { EditModal } from "../components/EditModal";
import { AddModal } from "../components/AddModal";
import { motion, AnimatePresence } from "framer-motion";

export function Dividas() {
  const { dividas, updateDivida, deleteDivida } = useFinance();
  const [editingItem, setEditingItem] = useState<Divida | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleEdit = (divida: Divida) => {
    setEditingItem(divida);
  };

  const handleSaveEdit = (data: Partial<Divida>) => {
    if (editingItem) {
      updateDivida(editingItem.id, data);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 dark:text-white tracking-tight">Dívidas</h1>
          <p className="text-sm text-slate-400 font-medium tracking-tight">Gestão e amortização de débitos</p>
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
          {dividas.length > 0 ? dividas.map((divida, index) => {
            const perc = Math.min(100, Math.round((divida.paidAmount / divida.totalAmount) * 100));
            const remaining = divida.totalAmount - divida.paidAmount;
            
            return (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
                key={divida.id} 
                onClick={() => handleEdit(divida)}
                className="iphone-card p-7 shadow-sm active:scale-[0.98] transition-all hover:bg-slate-50 dark:hover:bg-[#323235]"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-[19px] tracking-tight mb-2">{divida.description}</h3>
                    <div className="bg-slate-100 dark:bg-white/5 inline-block px-3 py-1.5 rounded-lg">
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">
                        Taxa: {divida.interestRate || 0}% a.m.
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-none mb-1">
                      {divida.totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                    <p className="text-[11px] font-bold text-green-500 dark:text-green-400 uppercase tracking-widest">Pago: {divida.paidAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                  </div>
                </div>
                
                <div className="h-4 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden mb-4 p-1 border border-black/[0.03] dark:border-white/5">
                  <div 
                    className="h-full rounded-full bg-black dark:bg-white transition-all duration-1000 ease-out" 
                    style={{ width: `${perc}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center text-[12px] font-bold uppercase tracking-[0.1em]">
                   <span className="text-slate-400 dark:text-slate-500">{perc}% quitado</span>
                   <span className="text-red-500 bg-red-50 dark:bg-red-500/10 px-3 py-1.5 rounded-lg">FALTAM: {remaining.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
              </motion.div>
            );
          }) : (
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-white dark:bg-[#2C2C2E] rounded-[32px] p-20 flex flex-col items-center justify-center text-center border border-black/[0.02] dark:border-white/5"
            >
              <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                <Check className="w-10 h-10 text-slate-200 dark:text-slate-600" />
              </div>
              <p className="text-slate-400 font-bold tracking-tight">Sem dívidas pendentes. Parabéns!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <EditModal 
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        title="Editar Dívida"
        initialData={editingItem || {}}
        onSave={handleSaveEdit}
        onDelete={() => { if(editingItem) deleteDivida(editingItem.id) }}
      />
      
      <AddModal 
        isOpen={isAdding}
        onClose={() => setIsAdding(false)}
        defaultType="Dívida"
      />
    </div>
  );
}
