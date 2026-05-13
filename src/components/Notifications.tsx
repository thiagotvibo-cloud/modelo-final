import React, { useMemo, useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { differenceInDays, parseISO, isBefore, isAfter, addDays, startOfDay } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronRight, AlertCircle, X } from 'lucide-react';

export function Notifications() {
  const { gastos, parcelas } = useFinance();
  const navigate = useNavigate();
  const [closedIds, setClosedIds] = useState<Set<string>>(new Set());

  const notifications = useMemo(() => {
    const today = startOfDay(new Date());
    const threshold = addDays(today, 3);
    const result: { id: string; title: string; type: 'gasto' | 'parcela'; daysToDue: number }[] = [];

    gastos.filter(g => g.status === 'Pendente').forEach(g => {
      if (!g.date) return;
      const gDate = startOfDay(parseISO(g.date));
      if (!isAfter(gDate, threshold)) {
        const days = differenceInDays(gDate, today);
        if (days >= -30) { // Don't show extremely old ones
          result.push({ id: `gasto-${g.id}`, title: g.description, type: 'gasto', daysToDue: days });
        }
      }
    });

    parcelas.filter(p => p.status === 'Pendente').forEach(p => {
      if (!p.date) return;
      const pDate = startOfDay(parseISO(p.date));
      if (!isAfter(pDate, threshold)) {
        const days = differenceInDays(pDate, today);
        if (days >= -30) {
          result.push({ id: `parcela-${p.id}`, title: p.description, type: 'parcela', daysToDue: days });
        }
      }
    });

    return result.sort((a, b) => a.daysToDue - b.daysToDue).filter(n => !closedIds.has(n.id));
  }, [gastos, parcelas, closedIds]);

  if (notifications.length === 0) return null;

  // Just show the most urgent one to keep it subtle
  const notif = notifications[0];

  const handleClick = () => {
    if (notif.type === 'gasto') {
      navigate('/gastos');
    } else {
      navigate('/parcelas');
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setClosedIds(prev => new Set(prev).add(notif.id));
  };

  const isOverdue = notif.daysToDue < 0;
  const isToday = notif.daysToDue === 0;

  let timeText = `em ${notif.daysToDue} dias`;
  if (isToday) timeText = 'hoje';
  if (notif.daysToDue === 1) timeText = 'amanhã';
  if (isOverdue) timeText = `atrasado há ${Math.abs(notif.daysToDue)} dias`;

  return (
    <div className="absolute top-[88px] left-4 right-4 z-50 animate-in fade-in slide-in-from-top-6 zoom-in-95 duration-500">
      <div 
        onClick={handleClick}
        className={`relative overflow-hidden w-full ${isOverdue ? 'bg-gradient-to-r from-red-500 to-rose-600 shadow-red-500/30' : 'bg-gradient-to-r from-orange-400 to-amber-600 shadow-orange-500/30'} rounded-[24px] p-4 shadow-xl flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-all group border border-white/20 dark:border-white/10`}
      >
        <div className="absolute top-0 right-0 -mr-16 w-32 h-full bg-white/10 transform -skew-x-12 translate-x-[200%] group-hover:translate-x-[-250%] transition-transform duration-1000"></div>

        <div className={`w-11 h-11 rounded-[16px] bg-white/20 text-white flex items-center justify-center shrink-0 shadow-inner backdrop-blur-sm ${isOverdue ? 'animate-pulse' : ''}`}>
          <AlertCircle className="w-6 h-6 drop-shadow-md" />
        </div>
        
        <div className="flex-1 overflow-hidden relative z-10">
          <h4 className="text-[15px] font-bold text-white truncate flex items-center gap-2 drop-shadow-sm">
            Vencimento {timeText}
          </h4>
          <p className="text-[13px] text-white/90 font-medium truncate mt-0.5 drop-shadow-sm">
            <span className="opacity-80 font-normal">{notif.type === 'gasto' ? 'Gasto' : 'Parcela'}:</span> {notif.title}
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
