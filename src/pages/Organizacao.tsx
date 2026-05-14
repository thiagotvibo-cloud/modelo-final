import React, { useState } from 'react';
import { useFinance, Gasto, Parcela } from '../contexts/FinanceContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, Wallet, Check, AlertCircle, Info } from 'lucide-react';
import { getColorForAccount } from '../lib/utils';

export function Organizacao() {
  const { gastos, parcelas, contas } = useFinance();
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
      projectedParcelas.push({
        ...p,
        displayInstallment: p.currentInstallment,
        displayDate: d.toISOString(),
        isExact: true
      });
    } else if (monthsDiff > 0) {
      let shouldProject = false;
      let newInstallment = p.currentInstallment;
      
      if (p.type === 'Parcela') {
        newInstallment = p.currentInstallment + monthsDiff;
        if (newInstallment <= p.totalInstallments) {
          shouldProject = true;
        }
      } else if (p.type === 'Assinatura' || p.type === 'Recorrente') {
        shouldProject = true;
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
    const key = p.seriesId ? `${p.seriesId}-${p.displayInstallment}` : `${p.id}-${p.displayInstallment}`;
    if (!uniqueParcelas.has(key) || p.isExact) {
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
    type: 'Parcela'
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

  const [expandedGroup, setExpandedGroup] = useState<'inicio' | 'final' | null>('inicio');

  const renderGroup = (title: string, items: typeof currentMonthItems, total: number, period: 'inicio' | 'final', subtitle: string) => (
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
            {items.length > 0 ? items.map((item, idx) => (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={item.id}
                className="bg-white dark:bg-[#1C1C1E] rounded-[24px] p-5 border border-black/[0.02] dark:border-white/[0.05] shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-1.5 font-bold text-slate-900 dark:text-white text-[16px] tracking-tight">
                      {item.description}
                      {item.parcelaInfo && (
                        <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-lg uppercase tracking-widest">
                          {item.parcelaInfo}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="bg-slate-100 dark:bg-white/5 text-[10px] font-bold text-slate-500 dark:text-slate-400 px-2 py-1 rounded-md uppercase tracking-wider">
                        Venc: {new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </span>
                      {item.bank && (
                        <span 
                          className="text-[10px] px-2 py-0.5 rounded text-white font-bold uppercase tracking-widest leading-none"
                          style={{ backgroundColor: contas.find(c => c.name === item.bank)?.color || '#333333' }}
                        >
                          {item.bank}
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${item.status === 'Pago' || item.status === 'Recebido' ? 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'}`}>
                        {item.status}
                      </span>
                    </div>

                    {item.observations && (
                      <p className="mt-2.5 text-[11px] text-slate-400 italic font-medium leading-tight">“{item.observations}”</p>
                    )}
                  </div>
                  <p className="font-bold text-slate-900 dark:text-white text-[17px] tracking-tight shrink-0 mt-0.5">
                    {item.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
              </motion.div>
            )) : (
              <div className="p-10 text-center text-slate-400 text-sm font-medium">
                Nenhum compromisso neste período.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 dark:text-white tracking-tight">Organização</h1>
          <p className="text-sm text-slate-400 font-medium tracking-tight">Períodos de pagamento</p>
        </div>
        <div className="w-12 h-12 bg-white dark:bg-[#2C2C2E] border border-black/[0.03] dark:border-white/5 rounded-2xl flex items-center justify-center shadow-lg">
           <Calendar className="w-6 h-6 text-slate-400" />
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
