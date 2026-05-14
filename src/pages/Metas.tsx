import { Plus, Trash2, Check, Target } from "lucide-react";
import { useState } from "react";
import { useFinance, Meta } from "../contexts/FinanceContext";
import { EditModal } from "../components/EditModal";
import { AddModal } from "../components/AddModal";
import { formatDateShort } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function Metas() {
  const { metas, updateMeta, deleteMeta } = useFinance();
  const [editingItem, setEditingItem] = useState<Meta | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleEdit = (meta: Meta) => {
    setEditingItem(meta);
  };

  const handleSaveEdit = (data: Partial<Meta>) => {
    if (editingItem) {
      updateMeta(editingItem.id, data);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 dark:text-white tracking-tight">Objetivos</h1>
          <p className="text-sm text-slate-400 font-medium tracking-tight">Sua jornada para o sucesso</p>
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
          {metas.length > 0 ? (
            metas.map((meta, index) => {
              const percentage = Math.min((meta.saved / meta.target) * 100, 100);
              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  key={meta.id} 
                  onClick={() => handleEdit(meta)}
                  className="iphone-card p-7 shadow-sm active:scale-[0.98] transition-all hover:bg-slate-50 dark:hover:bg-[#323235]"
                >
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-14 h-14 bg-slate-900 border border-slate-700 dark:border-transparent rounded-[22px] flex items-center justify-center text-white shadow-lg shadow-black/10">
                      <Target className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-[19px] tracking-tight">{meta.title}</h3>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.15em]">{meta.deadline.includes('-') && !isNaN(Date.parse(meta.deadline)) ? formatDateShort(meta.deadline) : meta.deadline}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Acumulado</p>
                      <p className="text-[22px] font-bold text-slate-900 dark:text-white leading-none tracking-tight">
                        {meta.saved.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Objetivo</p>
                      <p className="text-[16px] font-bold text-slate-400 dark:text-slate-500 leading-none tracking-tight">
                        {meta.target.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="w-full h-4 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden p-1 border border-black/[0.03] dark:border-white/5">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${percentage >= 100 ? 'bg-green-500' : 'bg-black dark:bg-white'}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="bg-white dark:bg-[#2C2C2E] rounded-[32px] p-20 text-center border border-black/[0.02] dark:border-white/5"
            >
              <Target className="w-16 h-16 text-slate-200 dark:text-slate-600 mx-auto mb-6" />
              <p className="text-slate-400 font-bold tracking-tight">O que você deseja conquistar?</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <EditModal 
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        title="Editar Objetivo"
        initialData={editingItem || {}}
        onSave={handleSaveEdit}
        onDelete={() => { if(editingItem) deleteMeta(editingItem.id) }}
      />

       <AddModal 
        isOpen={isAdding}
        onClose={() => setIsAdding(false)}
        defaultType="Meta"
      />
    </div>
  );
}
