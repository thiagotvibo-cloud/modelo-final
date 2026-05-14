import { Plus, Check, Pencil, Trash2, CreditCard, ChevronLeft, ChevronRight, LayoutGrid, Calendar, Filter } from "lucide-react";
import React, { useState } from "react";
import { useFinance, Parcela } from "../contexts/FinanceContext";
import { EditModal } from "../components/EditModal";
import { AddModal } from "../components/AddModal";
import { formatDateShort, getColorForAccount } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function Parcelas() {
  const { parcelas, updateParcela, deleteParcela, deleteParcelaSeries, contas } = useFinance();
  const [editingItem, setEditingItem] = useState<Parcela | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sortByDate, setSortByDate] = useState(true);

  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  const getSafeDate = (dateStr: string) => {
    const datePart = dateStr.split('T')[0];
    const [y, m, d] = datePart.split('-');
    return new Date(Number(y), Number(m) - 1, Number(d), 12, 0, 0);
  };

  const filterByDate = (p: Parcela) => {
    const d = getSafeDate(p.date);
    return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
  };

  const filterByLabel = (p: Parcela) => {
    if (selectedLabels.length === 0) return true;
    return selectedLabels.includes(p.account || p.bank || '');
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  const currentParcelas = parcelas.filter(p => filterByDate(p) && filterByLabel(p));

  const handleEdit = (parcela: Parcela) => {
    setEditingItem(parcela);
  };

  const handleSaveEdit = (data: Partial<Parcela>) => {
    if (editingItem) {
      updateParcela(editingItem.id, data);
    }
  };

  const handleDeleteSeries = (item: Parcela) => {
    const key = item.seriesId || item.description.split(' (')[0];
    if (item.seriesId) {
      deleteParcelaSeries(item.seriesId);
    } else {
      parcelas.filter(p => p.description.startsWith(key)).forEach(p => deleteParcela(p.id));
    }
    setEditingItem(null);
  };

  const toggleStatus = (e: React.MouseEvent, parcela: Parcela) => {
    e.stopPropagation();
    updateParcela(parcela.id, { status: parcela.status === 'Pago' ? 'Pendente' : 'Pago' });
  };

  const [activeTab, setActiveTab] = useState<'Parcela' | 'Assinatura' | 'Recorrente'>('Parcela');
  const [viewMode, setViewMode] = useState<'monthly' | 'series' | 'banks'>('monthly');

  const filteredParcelas = viewMode === 'monthly' 
    ? currentParcelas.filter(p => p.type === activeTab)
    : parcelas.filter(p => p.type === activeTab);

  const sortedParcelas = sortByDate 
    ? [...filteredParcelas].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    : filteredParcelas;

  // Group by series for the 'series' view mode
  const getGroupedParcelas = () => {
    const groups: Record<string, Parcela[]> = {};
    filteredParcelas.forEach(p => {
      const key = p.seriesId || p.description.split(' (')[0]; // Fallback for old items
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    });
    return Object.values(groups).map(group => {
      // Sort by date to find first/last
      const sorted = [...group].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      return {
        ...sorted[0], // Use first one as representation
        installments: sorted,
        totalPaid: group.filter(p => p.status === 'Pago').length,
        isCompleted: group.every(p => p.status === 'Pago')
      };
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getBankSummary = () => {
    const summary: Record<string, number> = {};
    // Only count Pendente installments for the summary
    parcelas.filter(p => p.status === 'Pendente').forEach(p => {
      const bankKey = p.account || p.bank || 'Não Informado';
      summary[bankKey] = (summary[bankKey] || 0) + p.value;
    });
    return Object.entries(summary).map(([name, total]) => {
      return { name, total, color: contas.find(c => c.name === name)?.color || '#333333' };
    }).sort((a, b) => b.total - a.total);
  };

  const displayParcelas = viewMode === 'monthly' ? sortedParcelas : viewMode === 'series' ? getGroupedParcelas() : [];
  const bankSummary = getBankSummary();

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">Compromissos</h1>
          <p className="text-sm text-slate-400 font-medium">Gestão de pagamentos recorrentes</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setViewMode(viewMode === 'banks' ? 'monthly' : 'banks')}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all border ${
              viewMode === 'banks' ? 'bg-black text-white border-black' : 'bg-white dark:bg-[#2C2C2E] text-slate-400 border-slate-100 dark:border-white/5'
            }`}
            title="Resumo por Banco"
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setViewMode(viewMode === 'monthly' ? 'series' : 'monthly')}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all border ${
              viewMode === 'series' ? 'bg-black text-white border-black' : 'bg-white dark:bg-[#2C2C2E] text-slate-400 border-slate-100 dark:border-white/5'
            }`}
            title={viewMode === 'monthly' ? 'Ver todas as compras' : 'Ver visão mensal'}
          >
            <CreditCard className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-3">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] px-1">Filtrar por Etiqueta</label>
          <div className="flex flex-wrap gap-2">
            {contas.length > 0 ? (
              contas.map(conta => {
                const isSelected = selectedLabels.includes(conta.name);
                return (
                  <button
                    key={conta.id}
                    onClick={() => {
                      setSelectedLabels(prev => 
                        prev.includes(conta.name) 
                          ? prev.filter(l => l !== conta.name)
                          : [...prev, conta.name]
                      );
                    }}
                    className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-all border-2 ${
                      isSelected 
                        ? 'text-white' 
                        : 'bg-white dark:bg-[#2C2C2E] text-slate-500 border-black/[0.03] dark:border-white/5'
                    }`}
                    style={{ 
                      backgroundColor: isSelected ? (conta.color || '#333333') : undefined,
                      borderColor: isSelected ? (conta.color || '#333333') : undefined
                    }}
                  >
                    {conta.name}
                  </button>
                );
              })
            ) : (
              <p className="text-[12px] text-slate-400 italic px-1">Nenhuma etiqueta cadastrada</p>
            )}
            {selectedLabels.length > 0 && (
              <button 
                onClick={() => setSelectedLabels([])}
                className="px-4 py-2 rounded-xl text-[12px] font-black text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all uppercase tracking-widest"
              >
                Limpar
              </button>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'monthly' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="flex items-center justify-between mb-6 bg-white dark:bg-[#2C2C2E] border border-black/[0.03] dark:border-white/5 rounded-[24px] p-2 shadow-sm"
          >
            <button onClick={() => changeMonth(-1)} className="p-3 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-all">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest px-4">{capitalizedMonth}</span>
            <button onClick={() => changeMonth(1)} className="p-3 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-all">
              <ChevronRight className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-slate-100 dark:bg-white/5 p-1.5 rounded-[22px] flex mb-10 overflow-hidden border border-black/[0.03] dark:border-white/5">
        {(['Parcela', 'Assinatura', 'Recorrente'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-[12px] font-bold rounded-[16px] text-center transition-all uppercase tracking-widest ${
              activeTab === tab ? "bg-black dark:bg-white text-white dark:text-black shadow-lg" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            {tab === 'Parcela' ? 'Parcelas' : tab === 'Assinatura' ? 'Assinaturas' : 'Aluguel/Rec.'}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {viewMode === 'banks' ? (
            bankSummary.map((bank, index) => (
              <motion.div
                key={bank.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.1 }}
                className="iphone-card p-6 flex justify-between items-center border-l-4"
                style={{ borderLeftColor: bank.color || 'transparent' }}
              >
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-[17px] tracking-tight">{bank.name}</h3>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total em aberto</p>
                </div>
                <p className="font-bold text-red-500 text-[20px]">{bank.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              </motion.div>
            ))
          ) : displayParcelas.length > 0 ? displayParcelas.map((item, index) => {
            const parcela = item as Parcela & { installments?: Parcela[], totalPaid?: number, isCompleted?: boolean };
            const isPago = parcela.status === 'Pago';
            const isRecorrente = parcela.type !== 'Parcela';
            const currentInstallmentNumber = viewMode === 'monthly' ? parcela.currentInstallment : (parcela.totalPaid || 0);
            
            const totalValue = isRecorrente ? parcela.value : parcela.value * parcela.totalInstallments;
            const formattedDate = formatDateShort(parcela.date);
            const displayTitle = viewMode === 'monthly' ? parcela.description : (parcela.description.split(' (')[0]);
            
            return (
              <motion.div 
                 layout
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 transition={{ duration: 0.1 }}
                 key={parcela.id}
                 onClick={() => handleEdit(parcela)}
                 className={`iphone-card p-6 cursor-pointer active:scale-[0.98] transition-all hover:bg-slate-50 dark:hover:bg-[#323235] ${isPago && parcela.currentInstallment === parcela.totalInstallments && !isRecorrente && viewMode === 'monthly' ? 'opacity-40 grayscale' : ''} ${parcela.isCompleted && viewMode === 'series' ? 'opacity-40 grayscale' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-4">
                    <h3 className="font-bold text-slate-900 dark:text-white text-[17px] tracking-tight mb-2 flex items-center gap-2">
                      {displayTitle}
                      {(parcela.account || parcela.bank) && (
                        <span 
                          className="text-[10px] px-2 py-0.5 rounded text-white font-bold uppercase tracking-widest"
                          style={{ backgroundColor: contas.find(c => c.name === (parcela.account || parcela.bank))?.color || '#333333' }}
                        >
                          {parcela.account || parcela.bank}
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="bg-slate-100 dark:bg-white/5 text-[10px] font-bold text-slate-500 dark:text-slate-400 px-2.5 py-1.5 rounded-lg uppercase tracking-wider">{formattedDate}</span>
                      <span className="bg-slate-100 dark:bg-white/5 text-[10px] font-bold text-slate-500 dark:text-slate-400 px-2.5 py-1.5 rounded-lg uppercase tracking-wider">{parcela.method}</span>
                    </div>
                    {parcela.observations && (
                      <p className="mt-3 text-[12px] text-slate-400 italic font-medium leading-tight">“{parcela.observations}”</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className="font-bold text-red-500 text-[18px] tracking-tight">
                      {viewMode === 'monthly' ? parcela.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                    {!isRecorrente && (
                      <div className="text-right">
                        <span className="text-[12px] font-extrabold text-white bg-red-500 px-2.5 py-1 rounded-lg tracking-widest inline-block shadow-sm">
                          {currentInstallmentNumber} DE {parcela.totalInstallments}
                        </span>
                        {viewMode === 'monthly' && (
                          <div className="mt-1.5 flex flex-col items-end">
                            <span className="text-[9px] font-bold text-slate-300 uppercase leading-none">Compra:</span>
                            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-400">{totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 pt-5 mt-6 border-t border-black/[0.02] dark:border-white/5">
                   {viewMode === 'monthly' && (
                     <button 
                       onClick={(e) => toggleStatus(e, parcela)}
                       className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[13px] font-bold transition-all shadow-sm ${isPago ? 'bg-green-500 text-white' : 'bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-slate-200'}`}
                     >
                       {isPago ? <><Check className="w-4 h-4 stroke-[3]" /> Pago</> : <><Check className="w-4 h-4" /> Marcar como pago</>}
                     </button>
                   )}
                   <button 
                     onClick={(e) => { 
                       e.stopPropagation(); 
                       if (viewMode === 'series') {
                         if (window.confirm("Você deseja excluir TODA esta compra e todas as suas parcelas?")) {
                           const key = parcela.seriesId || parcela.description.split(' (')[0];
                           if (parcela.seriesId) {
                             deleteParcelaSeries(parcela.seriesId);
                           } else {
                             // Fallback for old items: delete by description prefix
                             parcelas.filter(p => p.description.startsWith(key)).forEach(p => deleteParcela(p.id));
                           }
                         }
                       } else {
                        deleteParcela(parcela.id);
                       }
                     }}
                     className="p-3.5 bg-slate-50 dark:bg-white/5 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-all"
                   >
                     <Trash2 className="w-5 h-5" />
                   </button>
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
                <CreditCard className="w-10 h-10 text-slate-200 dark:text-slate-600" />
              </div>
              <p className="text-slate-400 font-bold tracking-tight">Vazio em {activeTab === 'Parcela' ? 'Parcelas' : activeTab === 'Assinatura' ? 'Assinaturas' : 'Recorrentes'}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <EditModal 
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        title="Editar Parcela"
        initialData={editingItem || {}}
        onSave={handleSaveEdit}
        onDelete={() => { if(editingItem) deleteParcela(editingItem.id) }}
        onDeleteSeries={editingItem ? () => handleDeleteSeries(editingItem) : undefined}
      />
      
      <AddModal 
        isOpen={isAdding}
        onClose={() => setIsAdding(false)}
        defaultType="Parcela"
      />
    </div>
  );
}
