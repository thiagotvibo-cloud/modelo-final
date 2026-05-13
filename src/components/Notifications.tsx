import React, { useMemo, useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { differenceInDays, parseISO, isAfter, addDays, startOfDay } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, X, CheckCircle2, TrendingUp, Target, TrendingDown } from 'lucide-react';

export function Notifications() {
  const { gastos, parcelas, receitas, metas, orcamentos, notificationSettings } = useFinance();
  const navigate = useNavigate();
  const [closedIds, setClosedIds] = useState<Set<string>>(new Set());

  const notifications = useMemo(() => {
    if (!notificationSettings?.enabled) return [];
    
    const today = startOfDay(new Date());
    const threshold = addDays(today, 3);
    const result: { id: string; title: string; type: 'gasto' | 'parcela' | 'receita' | 'meta' | 'orcamento'; daysToDue: number; isOverdue: boolean }[] = [];

    if (notificationSettings.gastos) {
      gastos.filter(g => g.status === 'Pendente').forEach(g => {
        if (!g.date) return;
        const gDate = startOfDay(parseISO(g.date));
        if (!isAfter(gDate, threshold)) {
          const days = differenceInDays(gDate, today);
          if (days >= -30) {
            result.push({ id: `gasto-${g.id}`, title: g.description, type: 'gasto', daysToDue: days, isOverdue: days < 0 });
          }
        }
      });
    }

    if (notificationSettings.parcelas) {
      parcelas.filter(p => p.status === 'Pendente').forEach(p => {
        if (!p.date) return;
        const pOriginalDate = startOfDay(parseISO(p.date));
        
        // Project to current month
        let pDate = new Date(today.getFullYear(), today.getMonth(), pOriginalDate.getDate());
        
        // If the date is strictly a "Parcela", verify we haven't exceeded totalInstallments
        if (p.type === 'Parcela') {
          const originalYear = pOriginalDate.getFullYear();
          const originalMonth = pOriginalDate.getMonth();
          const monthDiff = (today.getFullYear() - originalYear) * 12 + (today.getMonth() - originalMonth);
          if (monthDiff < 0 || monthDiff >= p.totalInstallments) return;
        }

        if (!isAfter(pDate, threshold)) {
          const days = differenceInDays(pDate, today);
          if (days >= -30) {
            result.push({ id: `parcela-${p.id}`, title: p.description, type: 'parcela', daysToDue: days, isOverdue: days < 0 });
          }
        }
      });
    }

    if (notificationSettings.receitas) {
      receitas.filter(r => r.status === 'Previsto').forEach(r => {
        if (!r.date) return;
        const rDate = startOfDay(parseISO(r.date));
        if (!isAfter(rDate, threshold)) {
          const days = differenceInDays(rDate, today);
          if (days >= -30) {
            result.push({ id: `receita-${r.id}`, title: r.description, type: 'receita', daysToDue: days, isOverdue: days < 0 });
          }
        }
      });
    }

    if (notificationSettings.metas) {
      metas.forEach(m => {
        if (!m.deadline || m.saved >= m.target) return;
        const mDate = startOfDay(parseISO(m.deadline));
        const metaThreshold = addDays(today, 7); // Remind 1 week before
        if (!isAfter(mDate, metaThreshold)) {
          const days = differenceInDays(mDate, today);
          if (days >= -30) {
            result.push({ id: `meta-${m.id}`, title: m.title, type: 'meta', daysToDue: days, isOverdue: days < 0 });
          }
        }
      });
    }

    if (notificationSettings.orcamentos) {
      orcamentos.forEach(o => {
        if (o.limit > 0) {
          const perc = Math.round((o.spent / o.limit) * 100);
          if (perc >= 90) {
            result.push({ id: `orcamento-${o.id}`, title: o.category, type: 'orcamento', daysToDue: 0, isOverdue: perc > 100 });
          }
        }
      });
    }

    return result.sort((a, b) => {
      // Prioritize overdue over everything
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      // Then prioritize closer dates
      return a.daysToDue - b.daysToDue;
    }).filter(n => !closedIds.has(n.id));
  }, [gastos, parcelas, receitas, metas, orcamentos, notificationSettings, closedIds]);

  if (notifications.length === 0) return null;

  const notif = notifications[0];

  const handleClick = () => {
    if (notif.type === 'gasto') navigate('/gastos');
    else if (notif.type === 'parcela') navigate('/parcelas');
    else if (notif.type === 'receita') navigate('/receitas');
    else if (notif.type === 'meta') navigate('/planejamento');
    else if (notif.type === 'orcamento') navigate('/planejamento');
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setClosedIds(prev => new Set(prev).add(notif.id));
  };

  const isOverdue = notif.isOverdue;
  const isToday = notif.daysToDue === 0;

  let timeText = `em ${notif.daysToDue} dias`;
  if (isToday) timeText = 'hoje';
  if (notif.daysToDue === 1) timeText = 'amanhã';
  if (isOverdue && notif.type !== 'orcamento') timeText = `há ${Math.abs(notif.daysToDue)} dias`;

  let titlePrefix = 'Vencimento';
  let typeLabel = '';
  let Icon = AlertCircle;
  let bgClass = isOverdue ? 'bg-gradient-to-r from-red-500 to-rose-600 shadow-red-500/30' : 'bg-gradient-to-r from-orange-400 to-amber-600 shadow-orange-500/30';

  if (notif.type === 'gasto') {
    typeLabel = 'Gasto:';
    Icon = TrendingDown;
  } else if (notif.type === 'parcela') {
    typeLabel = 'Parcela:';
    Icon = AlertCircle;
  } else if (notif.type === 'receita') {
    typeLabel = 'Recebimento:';
    titlePrefix = 'Previsto';
    Icon = TrendingUp;
    bgClass = isOverdue ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-blue-500/30' : 'bg-gradient-to-r from-emerald-400 to-green-600 shadow-emerald-500/30';
  } else if (notif.type === 'meta') {
    typeLabel = 'Meta:';
    titlePrefix = 'Prazo';
    Icon = Target;
    bgClass = isOverdue ? 'bg-gradient-to-r from-red-500 to-rose-600 shadow-red-500/30' : 'bg-gradient-to-r from-blue-400 to-indigo-600 shadow-blue-500/30';
  } else if (notif.type === 'orcamento') {
    typeLabel = 'Orçamento:';
    titlePrefix = isOverdue ? 'Limite Excedido' : 'Quase no Limite';
    timeText = '';
    Icon = AlertCircle;
    bgClass = isOverdue ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-red-500/30' : 'bg-gradient-to-r from-orange-400 to-amber-600 shadow-orange-500/30';
  }

  return (
    <div className="absolute top-[88px] left-4 right-4 z-50 animate-in fade-in slide-in-from-top-6 zoom-in-95 duration-500">
      <div 
        onClick={handleClick}
        className={`relative overflow-hidden w-full ${bgClass} rounded-[24px] p-4 shadow-xl flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-all group border border-white/20 dark:border-white/10`}
      >
        <div className="absolute top-0 right-0 -mr-16 w-32 h-full bg-white/10 transform -skew-x-12 translate-x-[200%] group-hover:translate-x-[-250%] transition-transform duration-1000"></div>

        <div className={`w-11 h-11 rounded-[16px] bg-white/20 text-white flex items-center justify-center shrink-0 shadow-inner backdrop-blur-sm ${isOverdue ? 'animate-pulse' : ''}`}>
          <Icon className="w-6 h-6 drop-shadow-md" />
        </div>
        
        <div className="flex-1 overflow-hidden relative z-10">
          <h4 className="text-[15px] font-bold text-white truncate flex items-center gap-2 drop-shadow-sm">
            {titlePrefix} {timeText}
          </h4>
          <p className="text-[13px] text-white/90 font-medium truncate mt-0.5 drop-shadow-sm">
            <span className="opacity-80 font-normal">{typeLabel}</span> {notif.title}
          </p>
        </div>
        
        <button 
          onClick={handleClose}
          className="p-2.5 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full relative z-10 backdrop-blur-sm"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
