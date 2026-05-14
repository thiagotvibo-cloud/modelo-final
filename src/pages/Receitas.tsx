import { ChevronLeft, ChevronRight, Plus, Check, Pencil, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useFinance, Receita } from "../contexts/FinanceContext";
import { EditModal } from "../components/EditModal";
import { AddModal } from "../components/AddModal";
import { formatDateShort } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function Receitas() {
  const { receitas, updateReceita, deleteReceita } = useFinance();
  const [editingItem, setEditingItem] = useState<Receita | null>(null);
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

  const currentReceitas = receitas.filter(r => filterByDate(r.date));

  const handleEdit = (receita: Receita) => {
    setEditingItem(receita);
  };

  const handleSaveEdit = (data: Partial<Receita>) => {
    if (editingItem) {
      updateReceita(editingItem.id, data);
    }
  };

  const toggleStatus = (e: React.MouseEvent, receita: Receita) => {
    e.stopPropagation();
    updateReceita(receita.id, { status: receita.status === 'Recebido' ? 'Previsto' : 'Recebido' });
  };

  const totalRecebido = currentReceitas.filter(r => r.status === 'Recebido').reduce((acc, curr) => acc + curr.value, 0);
  const totalPrevisto = currentReceitas.reduce((acc, curr) => acc + curr.value, 0);

  const isRecebido = (receita: Receita) => receita.status === 'Recebido';

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">Receitas</h1>
          <p className="text-sm text-slate-400 font-medium tracking-tight">Gestão de entradas e recebimentos</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all"
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

      <div className="grid grid-cols-2 gap-5 mb-10">
        <div className="bg-white dark:bg-[#2C2C2E] p-6 rounded-[28px] border border-black/[0.03] dark:border-white/5 shadow-sm flex flex-col">
          <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">PREVISTO</h3>
          <p className="text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">{totalPrevisto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        </div>
        <div className="bg-white dark:bg-[#2C2C2E] p-6 rounded-[28px] border border-black/[0.03] dark:border-white/5 shadow-sm flex flex-col">
          <h3 className="text-[10px] font-bold text-green-500 dark:text-green-400 uppercase tracking-widest mb-1.5">RECEBIDO</h3>
          <p className="text-[20px] font-bold text-green-600 dark:text-green-500 tracking-tight">{totalRecebido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {currentReceitas.length > 0 ? currentReceitas.map((receita, index) => {
            const formattedDate = formatDateShort(receita.date);
            const received = isRecebido(receita);
            
            return (
              <motion.div 
                 layout
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 transition={{ duration: 0.1 }}
                 key={receita.id}
                 onClick={() => handleEdit(receita)}
                 className={`iphone-card p-6 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all hover:bg-slate-50 dark:hover:bg-[#323235] ${received ? 'opacity-40 grayscale' : ''}`}
              >
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 dark:text-white text-[17px] tracking-tight mb-2">{receita.description}</h3>
                  <div className="flex items-center gap-3">
                    <span className="bg-slate-100 dark:bg-white/5 text-[10px] font-bold text-slate-500 dark:text-slate-400 px-2.5 py-1.5 rounded-lg uppercase tracking-wider">{formattedDate}</span>
                    <span className="bg-slate-100 dark:bg-white/5 text-[10px] font-bold text-slate-500 dark:text-slate-400 px-2.5 py-1.5 rounded-lg uppercase tracking-wider">{receita.category}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3 ml-4">
                   <p className="font-bold text-green-600 dark:text-green-500 text-[18px] tracking-tight leading-none">
                     {receita.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                   </p>
                   <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => toggleStatus(e, receita)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[12px] font-bold transition-all shadow-sm ${received ? 'bg-green-500 text-white' : 'bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-slate-200'}`}
                      >
                        {received ? <Check className="w-4 h-4 stroke-[3]" /> : 'Recebido?'}
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
              className="bg-white dark:bg-[#2C2C2E] rounded-[40px] p-20 flex flex-col items-center justify-center text-center border border-black/[0.02] dark:border-white/5"
            >
               <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                <Plus className="w-10 h-10 text-slate-200 dark:text-slate-600" />
              </div>
              <p className="text-slate-400 font-bold tracking-tight">Nenhuma receita lançada.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <EditModal 
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        title="Editar Receita"
        initialData={editingItem || {}}
        onSave={handleSaveEdit}
        onDelete={() => { if(editingItem) deleteReceita(editingItem.id) }}
      />
      <AddModal 
        isOpen={isAdding}
        onClose={() => setIsAdding(false)}
        defaultType="Receita"
      />
    </div>
  );
}
