import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFinance, Orcamento } from "../contexts/FinanceContext";
import { useAuth } from "../contexts/AuthContext";
import { EditModal } from "../components/EditModal";
import { AddModal } from "../components/AddModal";
import { motion, AnimatePresence } from "framer-motion";
import { getBaseDescription } from "../lib/utils";

export function Planejamento() {
  const { orcamentos, gastos, parcelas, updateOrcamento, deleteOrcamento } = useFinance();
  const { role } = useAuth();
  const [editingItem, setEditingItem] = useState<Orcamento | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const getSafeDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    const datePart = dateStr.split('T')[0];
    const [y, m, d] = datePart.split('-').map(Number);
    return new Date(y, m - 1, d, 12, 0, 0);
  };

  const filterByDate = (dateStr: string) => {
    const d = getSafeDate(dateStr);
    return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
  };
  
  const deduplicateMonthSeries = (items: any[]) => {
    const seen = new Map();
    return items.filter(item => {
      if (item.type === 'Assinatura' || item.type === 'Recorrente' || item.description?.toLowerCase().includes('aluguel')) {
        const key = item.seriesId || getBaseDescription(item.description);
        if (seen.has(key)) return false;
        seen.set(key, true);
      }
      return true;
    });
  };

  // Calculate dynamic spent for each budget category
  const getDynamicSpent = (category: string) => {
    const matchingGastos = gastos.filter(g => g.category === category && filterByDate(g.date));
    
    // Attempt to match parcelas by searching description for category
    const matchingParcelas = deduplicateMonthSeries(parcelas.filter(p => filterByDate(p.date))).filter(p => {
       // Many Parcelas don't have explicit category fields stored yet, we infer by description matching
       return p.description.toLowerCase().includes(category.toLowerCase());
    });
    
    return matchingGastos.reduce((acc, curr) => acc + curr.value, 0) + 
           matchingParcelas.reduce((acc, curr) => acc + curr.value, 0);
  };

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
          <h1 className="text-[28px] font-bold text-slate-900 dark:text-white tracking-tight">Orçamentos</h1>
          <p className="text-sm text-slate-400 font-medium tracking-tight">Limites mensais ({currentDate.toLocaleDateString('pt-BR', { month: 'long' })})</p>
        </div>
        {role === 'Administrador' && (
          <button 
            onClick={() => setIsAdding(true)}
            className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all"
          >
            <Plus className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {orcamentos.length > 0 ? (
            orcamentos.map((orcamento, index) => {
              const currentSpent = getDynamicSpent(orcamento.category);
              const perc = Math.min(100, Math.round((currentSpent / orcamento.limit) * 100));
              const isOverLimit = currentSpent > orcamento.limit;
              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  key={orcamento.id} 
                  className={`iphone-card p-7 shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-[#323235] ${role === 'Administrador' ? 'cursor-pointer active:scale-[0.98]' : ''}`}
                  onClick={() => role === 'Administrador' && handleEdit(orcamento)}
                >
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="font-bold text-slate-900 dark:text-white text-[19px] tracking-tight">{orcamento.category}</h3>
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${isOverLimit ? 'bg-red-500 text-white' : 'bg-green-500 text-white shadow-lg shadow-green-500/10'}`}>
                      {isOverLimit ? 'Excedido' : 'No Prazo'}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-end mb-4">
                     <p className={`text-3xl font-bold tracking-tight ${isOverLimit ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                       {perc}%
                     </p>
                     <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Gasto vs Limite</p>
                        <p className="text-sm font-bold text-slate-600 dark:text-slate-300 tracking-tight">
                          {currentSpent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} de {orcamento.limit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                     </div>
                  </div>
                  <div className="h-4 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden p-1 border border-black/[0.03] dark:border-white/5">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${isOverLimit ? 'bg-red-500' : 'bg-black dark:bg-white'}`} 
                      style={{ width: `${perc}%` }}
                    ></div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-white dark:bg-[#2C2C2E] rounded-[40px] p-20 text-center border border-black/[0.02] dark:border-white/5"
            >
              <Plus className="w-16 h-16 text-slate-200 dark:text-slate-600 mx-auto mb-6" />
              <p className="text-slate-400 font-bold tracking-tight">Crie seu primeiro orçamento!</p>
            </motion.div>
          )}
        </AnimatePresence>
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
