import React, { useState } from 'react';
import { useFinance, Gasto, Parcela } from '../contexts/FinanceContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, Wallet, Check, AlertCircle, Info, Trash2 } from 'lucide-react';
import { getColorForAccount, getBaseDescription } from '../lib/utils';

export function Organizacao() {
  const { gastos, parcelas, contas, deleteMultipleItems, deleteParcela, deleteGasto } = useFinance();

  const handleDeleteGroup = (e: any, group: any) => {
    e.stopPropagation();
    const msg = group.items.length > 1 
      ? `Tem certeza que deseja apagar todos os ${group.items.length} itens de "${group.description}"?`
      : `Tem certeza que deseja apagar "${group.description}"?`;
    if (window.confirm(msg)) {
       deleteMultipleItems(group.items.map((i: any) => ({ id: i.id, type: i.type })));
    }
  };
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const changeMonth = (delta: number) => {
    const d = new Date(year, month + delta, 1);
    setCurrentDate(d);
  };

  const monthName = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  const getSafeDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    const datePart = dateStr.split('T')[0];
    const [year, month, day] = datePart.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Get current month items
  const filteredGastos = gastos.filter(g => {
    const d = getSafeDate(g.date);
    return d.getFullYear() === year && d.getMonth() === month;
  }).map(g => ({ 
    id: g.id, 
    description: g.description, 
    date: g.date, 
    value: g.value, 
    status: g.status, 
    bank: g.account || g.bank || g.method,
    observations: g.observations || '',
    parcelaInfo: '',
    type: 'Gasto' 
  }));

  const projectedParcelas: any[] = [];
  parcelas.forEach(p => {
    const d = getSafeDate(p.date);
    const rowYear = d.getFullYear();
    const rowMonth = d.getMonth();
    const monthsDiff = (year - rowYear) * 12 + (month - rowMonth);

    if (monthsDiff === 0) {
      // It's an item already in the DB for the current month
      projectedParcelas.push({
        ...p,
        displayInstallment: p.currentInstallment,
        displayDate: d.toISOString(),
        isExact: true
      });
    } else if (monthsDiff > 0) {
      // It's an item from a past month. Should we project it?
      let shouldProject = false;
      let newInstallment = p.currentInstallment;
      
      // ONLY project if it's NOT a fixed installment (Parcela) 
      // OR if the user manually added only the first installment of a series.
      // Since AddModal adds ALL installments by default, we only project Assinaturas/Recorrentes
      // to avoid duplicates for items already in the DB.
      if (p.type === 'Assinatura' || p.type === 'Recorrente') {
        shouldProject = true;
      } else if (p.type === 'Parcela') {
        // Only project if this specific installment sequence is not expected to be in the DB
        // But to be safe and avoid the "double installment" bug, we skip projection for Parcela
        // if they are already accounted for by the exact match.
        // Actually, let's keep it simple: project only if it's a recurring type.
        shouldProject = false; 
      }

      if (shouldProject) {
        const projD = new Date(d);
        projD.setMonth(d.getMonth() + monthsDiff);
        projectedParcelas.push({
          ...p,
          displayInstallment: newInstallment,
          displayDate: projD.toISOString(),
          status: 'Pendente',
          isExact: false
        });
      }
    }
  });

  const uniqueParcelas = new Map();
  projectedParcelas.forEach(p => {
    // For fixed installments (Parcela), we want to see each specific installment (1/10, 2/10 etc)
    // For recurring items (Assinatura/Recorrente), we only want ONE entry per month total for that series/description.
    
    let key = "";
    if (p.type === 'Parcela') {
      key = p.seriesId ? `${p.seriesId}-${p.displayInstallment}` : `${p.id}-${p.displayInstallment}`;
    } else {
      // Recurring: group by seriesId or normalized description to avoid duplicates in the same month
      key = p.seriesId || getBaseDescription(p.description);
    }
    
    const existing = uniqueParcelas.get(key);
    
    // Priority: 
    // 1. Exact match (entry exists in DB for this month)
    // 2. Paid status
    // 3. Most recent ID (if multiple)
    if (!existing || (p.isExact && !existing.isExact) || (p.status === 'Pago' && existing.status !== 'Pago')) {
      uniqueParcelas.set(key, p);
    }
  });

  const filteredParcelas = Array.from(uniqueParcelas.values()).map(p => ({
    id: p.id,
    description: p.description,
    date: p.displayDate,
    value: p.value,
    status: p.status,
    bank: p.account || p.bank || p.method,
    observations: p.observations || '',
    parcelaInfo: p.type === 'Parcela' ? `${p.displayInstallment}/${p.totalInstallments}` : p.type,
    type: 'Parcela',
    seriesId: p.seriesId
  }));

  const currentMonthItems = [...filteredGastos, ...filteredParcelas]
    .sort((a, b) => getSafeDate(a.date).getTime() - getSafeDate(b.date).getTime());

  const inicioMes = currentMonthItems.filter(item => {
    const day = getSafeDate(item.date).getDate();
    return day >= 1 && day <= 19;
  });

  const finalMes = currentMonthItems.filter(item => {
    const day = getSafeDate(item.date).getDate();
    return day >= 20;
  });

  const totalInicio = inicioMes.reduce((acc, item) => acc + item.value, 0);
  const totalFinal = finalMes.reduce((acc, item) => acc + item.value, 0);

  const [expandedGroup, setExpandedGroup] = useState<'inicio' | 'final' | null>(null);
  const [expandedPurchases, setExpandedPurchases] = useState<string[]>([]);

  const togglePurchase = (key: string) => {
    setExpandedPurchases(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const renderGroup = (title: string, items: typeof currentMonthItems, total: number, period: 'inicio' | 'final', subtitle: string) => {
    // Group items by seriesId or normalized description
    const groups: { key: string, items: any[], type: string, description: string }[] = [];
    const processedKeys = new Set();

    items.forEach(item => {
      const baseDesc = getBaseDescription(item.description);
      // Group by seriesId if it exists, otherwise by normalized description
      const key = item.seriesId || baseDesc;
      
      const existingGroupIndex = groups.findIndex(g => g.key === key);
      if (existingGroupIndex > -1) {
        groups[existingGroupIndex].items.push(item);
      } else {
        groups.push({ key, items: [item], type: item.type, description: baseDesc });
      }
    });

    return (
      <div className="mb-6">
        <button 
          onClick={() => setExpandedGroup(expandedGroup === period ? null : period)}
          className={`w-full text-left iphone-card p-6 mb-3 transition-all duration-300 ${expandedGroup === period ? 'ring-2 ring-black dark:ring-white border-transparent' : 'border-black/[0.03] dark:border-white/5'}`}
        >
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">{title}</h2>
              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mt-1">{subtitle}</p>
            </div>
            <div className="text-right">
              <p className="text-[22px] font-black text-slate-900 dark:text-white tracking-tighter">
                {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{items.length} itens</p>
            </div>
          </div>
        </button>

        <AnimatePresence>
          {expandedGroup === period && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="overflow-hidden space-y-3 px-1"
            >
              {groups.length > 0 ? groups.map((group) => {
                const isMulti = group.items.length > 1;
                const isExpanded = expandedPurchases.includes(group.key);
                const firstItem = group.items[0];
                const totalValue = group.items.reduce((acc, i) => acc + i.value, 0);
                const allPaid = group.items.every(i => i.status === 'Pago' || i.status === 'Recebido');
                const somePaid = group.items.some(i => i.status === 'Pago' || i.status === 'Recebido');

                return (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={group.key}
                    className="bg-white dark:bg-[#1C1C1E] rounded-[24px] border border-black/[0.02] dark:border-white/[0.05] shadow-sm overflow-hidden"
                  >
                    <div 
                      className={`p-5 ${isMulti ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.02]' : ''}`}
                      onClick={() => isMulti && togglePurchase(group.key)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 pr-4">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5 font-bold text-slate-900 dark:text-white text-[16px] tracking-tight">
                            <span className="truncate max-w-[200px]">{group.description}</span>
                            {isMulti && (
                              <span className="text-[10px] bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-lg uppercase tracking-widest font-black shrink-0">
                                {group.items.length} itens
                              </span>
                            )}
                            {!isMulti && firstItem.parcelaInfo && (
                              <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-lg uppercase tracking-widest shrink-0">
                                {firstItem.parcelaInfo}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="bg-slate-100 dark:bg-white/5 text-[10px] font-bold text-slate-500 dark:text-slate-400 px-2 py-1 rounded-md uppercase tracking-wider">
                              {isMulti ? 'Vários vencimentos' : `Venc: ${new Date(firstItem.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`}
                            </span>
                            {firstItem.bank && (
                              <span 
                                className="text-[10px] px-2 py-0.5 rounded text-white font-bold uppercase tracking-widest leading-none"
                                style={{ backgroundColor: contas.find(c => c.name === firstItem.bank)?.color || '#333333' }}
                              >
                                {firstItem.bank}
                              </span>
                            )}
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${allPaid ? 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400' : somePaid ? 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' : 'bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'}`}>
                              {isMulti ? (allPaid ? 'Geral Pago' : 'Pendências') : firstItem.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end shrink-0 text-right mt-0.5">
                          <p className="font-bold text-slate-900 dark:text-white text-[17px] tracking-tight">
                            {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </p>
                          <div className="flex items-center gap-1 mt-1 justify-end">
                            <button 
                              onClick={(e) => handleDeleteGroup(e, group)}
                              className="p-1.5 text-slate-300 hover:text-red-500 rounded-full transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            {isMulti && (
                              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                {isExpanded ? 'Recolher' : 'Ver Detalhes'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isMulti && isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-black/[0.03] dark:border-white/[0.03] bg-slate-50/50 dark:bg-white/[0.01]"
                        >
                          <div className="p-4 space-y-3">
                            {group.items.map((subItem) => (
                              <div key={subItem.id} className="flex justify-between items-center bg-white dark:bg-[#1C1C1E] p-3 rounded-xl border border-black/[0.02] dark:border-white/[0.05]">
                                <div className="flex items-center gap-3">
                                  <div className={`w-2 h-2 rounded-full ${subItem.status === 'Pago' || subItem.status === 'Recebido' ? 'bg-green-500' : 'bg-orange-500'}`} />
                                  <div>
                                    <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                                      {subItem.parcelaInfo || subItem.description}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">
                                      Venc: {new Date(subItem.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                  <p className="text-sm font-black text-slate-900 dark:text-white">
                                    {subItem.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                  </p>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (window.confirm(`Tem certeza que deseja apagar "${subItem.description}"?`)) {
                                         deleteMultipleItems([{ id: subItem.id, type: subItem.type }]);
                                      }
                                    }}
                                    className="p-1.5 text-slate-300 hover:text-red-500 rounded-full transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              }) : (
                <div className="p-10 text-center text-slate-400 text-sm font-medium">
                  Nenhum compromisso neste período.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 dark:text-white tracking-tight">Organização</h1>
          <p className="text-sm text-slate-400 font-medium tracking-tight">Períodos de pagamento</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8 bg-white dark:bg-[#2C2C2E] border border-black/[0.03] dark:border-white/5 rounded-[24px] p-2 shadow-sm">
        <button onClick={() => changeMonth(-1)} className="p-3 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-all">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest px-4">{capitalizedMonth}</span>
        <button onClick={() => changeMonth(1)} className="p-3 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-all">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-2">
        {renderGroup("Início do Mês", inicioMes, totalInicio, 'inicio', "Dia 01 ao 19 (Salário)")}
        {renderGroup("Final do Mês", finalMes, totalFinal, 'final', "Dia 20 ao 31 (Vale/Adiant.)")}
      </div>

      <div className="mt-10 p-7 rounded-[32px] bg-black dark:bg-white text-white dark:text-black">
        <div className="flex items-center gap-3 mb-4">
          <Info className="w-5 h-5 opacity-60" />
          <h3 className="font-bold text-[15px] uppercase tracking-widest">Resumo Mensal</h3>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest opacity-60 mb-1">Total de Saídas</p>
            <p className="text-[32px] font-black tracking-tighter leading-none">
              {(totalInicio + totalFinal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
          <div className="text-right">
             <p className="text-[11px] font-bold uppercase tracking-widest opacity-60 mb-1">Status</p>
             <p className="text-[13px] font-bold uppercase tracking-widest">
               {currentMonthItems.filter(i => i.status === 'Pago').length} de {currentMonthItems.length} PAGOS
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
