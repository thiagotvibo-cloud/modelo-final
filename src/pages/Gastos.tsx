import { ChevronLeft, ChevronRight, Plus, Check, Pencil, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useFinance, Gasto } from "../contexts/FinanceContext";
import { EditModal } from "../components/EditModal";
import { AddModal } from "../components/AddModal";
import { formatDateShort } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function Gastos() {
  const { gastos, updateGasto, deleteGasto, contas } = useFinance();
  const [editingItem, setEditingItem] = useState<Gasto | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const getSafeDate = (dateStr: string) => {
    const datePart = dateStr.split('T')[0];
    const [y, m, d] = datePart.split('-');
    return new Date(Number(y), Number(m) - 1, Number(d), 12, 0, 0);
  };

  const filterByDate = (dateStr: string) => {
    const date = getSafeDate(dateStr);
    return date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear();
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  const currentGastos = gastos.filter(g => filterByDate(g.date));

  const handleEdit = (gasto: Gasto) => {
    setEditingItem(gasto);
  };

  const handleSaveEdit = (data: Partial<Gasto>) => {
    if (editingItem) {
      updateGasto(editingItem.id, data);
    }
  };

  const isPago = (gasto: Gasto) => gasto.status === 'Pago';

  const toggleStatus = (e: React.MouseEvent, gasto: Gasto) => {
    e.stopPropagation();
    updateGasto(gasto.id, { status: gasto.status === 'Pago' ? 'Pendente' : 'Pago' });
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">Gastos</h1>
          <p className="text-sm text-slate-400 font-medium">Controle suas despesas variáveis</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg shadow-black/10 active:scale-95 transition-all"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="flex items-center justify-between mb-10 bg-white dark:bg-[#2C2C2E] border border-black/[0.03] dark:border-white/5 rounded-[24px] p-2 shadow-sm">
        <button onClick={() => changeMonth(-1)} className="p-3 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-all">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest px-4">{capitalizedMonth}</span>
        <button onClick={() => changeMonth(1)} className="p-3 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-all">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {currentGastos.length > 0 ? currentGastos.map((gasto, index) => {
            const formattedDate = formatDateShort(gasto.date);
            const paid = isPago(gasto);
            
            return (
              <motion.div 
                 layout
                 initial={{ opacity: 0, y: 20, scale: 0.95 }}
                 animate={{ opacity: 1, y: 0, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                 transition={{ duration: 0.25, delay: index * 0.05 }}
                 key={gasto.id} 
                 onClick={() => handleEdit(gasto)}
                 className={`iphone-card p-6 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all hover:bg-slate-50 dark:hover:bg-[#323235] ${paid ? 'opacity-50 grayscale' : ''}`}
              >
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 dark:text-white text-[17px] tracking-tight mb-2 flex items-center gap-2">
                    {gasto.description}
                    {gasto.bank && (
                      <span 
                        className="text-[10px] px-2 py-0.5 rounded text-white font-bold uppercase tracking-widest leading-none"
                        style={{ backgroundColor: contas.find(c => c.name === gasto.bank)?.color || 'rgba(0,0,0,0.1)' }}
                      >
                        {gasto.bank}
                      </span>
                    )}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-slate-100 dark:bg-white/5 text-[10px] font-bold text-slate-500 dark:text-slate-400 px-2 py-1 rounded-lg uppercase tracking-wider">{formattedDate}</span>
                    <span className="bg-slate-100 dark:bg-white/5 text-[10px] font-bold text-slate-500 dark:text-slate-400 px-2 py-1 rounded-lg uppercase tracking-wider">{gasto.method}</span>
                    {gasto.category && gasto.category !== "Outros" && (
                      <span className="bg-slate-100 dark:bg-white/5 text-[10px] font-bold text-slate-500 dark:text-slate-400 px-2 py-1 rounded-lg uppercase tracking-wider">{gasto.category}</span>
                    )}
                  </div>
                  {gasto.observations && (
                    <p className="mt-2.5 text-[12px] text-slate-400 italic font-medium leading-tight">“{gasto.observations}”</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-3 ml-4">
                  <p className="font-bold text-red-500 text-[18px] tracking-tight">
                    {gasto.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => toggleStatus(e, gasto)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[12px] font-bold transition-all shadow-sm ${paid ? 'bg-green-500 text-white' : 'bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-slate-200'}`}
                    >
                      {paid ? <Check className="w-4 h-4 stroke-[3]" /> : 'Pagar'}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          }) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#2C2C2E] rounded-[32px] p-16 flex flex-col items-center justify-center text-center border border-black/[0.02] dark:border-white/5"
            >
              <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                <Plus className="w-10 h-10 text-slate-200 dark:text-slate-600" />
              </div>
              <p className="text-slate-400 font-bold tracking-tight">Vazio por enquanto...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <EditModal 
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        title="Editar Gasto"
        initialData={editingItem || {}}
        onSave={handleSaveEdit}
        onDelete={() => { if(editingItem) deleteGasto(editingItem.id) }}
      />

      <AddModal 
        isOpen={isAdding}
        onClose={() => setIsAdding(false)}
        defaultType="Gasto"
      />
    </div>
  );
}
