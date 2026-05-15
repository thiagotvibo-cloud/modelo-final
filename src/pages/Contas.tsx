import { Plus, Wallet, Trash2, X, ChevronRight, Calendar, ArrowLeft, TrendingUp, CreditCard as CreditCardIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useFinance, Conta, Parcela, Gasto, Receita } from "../contexts/FinanceContext";
import { EditModal } from "../components/EditModal";
import { AddModal } from "../components/AddModal";
import { motion, AnimatePresence } from "framer-motion";
import { formatDateShort, getColorForAccount, getBaseDescription } from "../lib/utils";

export function Contas() {
  const { contas, updateConta, deleteConta, parcelas, gastos, receitas } = useFinance();
  const [editingItem, setEditingItem] = useState<Conta | null>(null);
  const [viewingLabel, setViewingLabel] = useState<Conta | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const getAccountItems = (accountName: string) => {
    const installments = parcelas.filter(p => (p.account || p.bank) === accountName);
    const expenses = gastos.filter(g => (g.account || g.bank) === accountName);
    const revenues = receitas.filter(r => (r.account || r.bank) === accountName);
    
    return [
      ...installments.map(i => ({ ...i, itemType: 'Parcela' })), 
      ...expenses.map(e => ({ ...e, itemType: 'Gasto' })),
      ...revenues.map(r => ({ ...r, itemType: 'Receita' }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const [expandedPurchases, setExpandedPurchases] = useState<string[]>([]);

  const togglePurchase = (key: string) => {
    setExpandedPurchases(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const renderAccountDetails = (accountName: string) => {
    const allItems = getAccountItems(accountName);
    const groups: { key: string, items: any[], type: string, description: string }[] = [];

    allItems.forEach(item => {
      const baseDesc = getBaseDescription(item.description);
      const key = item.seriesId || baseDesc;
      
      const existingGroupIndex = groups.findIndex(g => g.key === key);
      if (existingGroupIndex > -1) {
        groups[existingGroupIndex].items.push(item);
      } else {
        groups.push({ key, items: [item], type: (item as any).type || (item as any).itemType, description: baseDesc });
      }
    });

    if (groups.length === 0) {
      return (
        <div className="p-12 text-center">
          <p className="text-slate-400 font-bold tracking-tight">Nenhum lançamento encontrado</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {groups.map((group) => {
          const isExpanded = expandedPurchases.includes(group.key);
          const isMulti = group.items.length > 1;
          const firstItem = group.items[0];
          const totalValue = group.items.reduce((acc, curr) => acc + curr.value, 0);
          const pendingCount = group.items.filter(i => i.status === 'Pendente' || i.status === 'Previsto').length;

          return (
            <div key={group.key} className="iphone-card overflow-hidden">
              <div 
                className={`p-5 flex justify-between items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-all ${isExpanded ? 'border-b border-slate-100 dark:border-white/5' : ''}`}
                onClick={() => isMulti && togglePurchase(group.key)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400">
                    {group.type === 'Parcela' ? <CreditCardIcon className="w-5 h-5" /> : 
                     group.type === 'Receita' ? <TrendingUp className="w-5 h-5 text-green-500" /> :
                     <Wallet className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-[16px] tracking-tight flex items-center gap-2">
                      {group.description}
                      {isMulti && (
                        <span className="text-[10px] bg-slate-100 dark:bg-white/10 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-widest font-black">
                          {group.items.length} itens
                        </span>
                      )}
                    </h4>
                    <p className="text-[10px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                      {isMulti ? `${pendingCount} pendentes` : formatDateShort(firstItem.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`font-bold text-[16px] ${group.type === 'Receita' ? 'text-green-500' : 'text-red-500'}`}>
                      {isMulti ? totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : firstItem.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                    {isMulti && <p className="text-[9px] text-slate-300 uppercase font-black tracking-widest">Total Acumulado</p>}
                  </div>
                  {isMulti && (
                    <ChevronRight className={`w-5 h-5 text-slate-300 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  )}
                </div>
              </div>

              {isMulti && isExpanded && (
                <div className="bg-slate-50/50 dark:bg-black/10 p-2 space-y-2">
                  {[...group.items].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((subItem) => (
                    <div key={subItem.id} className="p-3 px-4 flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${subItem.status === 'Pago' || subItem.status === 'Recebido' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <div>
                          <p className="font-bold text-slate-700 dark:text-slate-300">{subItem.description}</p>
                          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{formatDateShort(subItem.date)}</p>
                        </div>
                      </div>
                      <p className={`font-black ${subItem.itemType === 'Receita' ? 'text-green-500' : 'text-slate-600 dark:text-slate-400'}`}>
                        {subItem.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const getAccountTotal = (accountName: string) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Group parcelas by series to deduplicate recurring items
    const pendingParcelas = parcelas.filter(p => (p.account || p.bank) === accountName && p.status === 'Pendente');
    const seenRecurring = new Set();
    
    const parcelasTotal = pendingParcelas.reduce((sum, p) => {
      const itemDate = new Date(p.date.split('T')[0] + 'T12:00:00');
      const isFuture = itemDate.getFullYear() > currentYear || (itemDate.getFullYear() === currentYear && itemDate.getMonth() > currentMonth);
      
      if (p.type === 'Assinatura' || p.type === 'Recorrente' || p.description.toLowerCase().includes('aluguel')) {
        // For recurring items, we only count the one for the CURRENT month in the "Total em Aberto"
        // to satisfy the "not accumulated" requirement.
        const key = p.seriesId || getBaseDescription(p.description);
        
        // Only count if it's the current month OR if we haven't seen this series yet 
        // (but user said never accumulate, so we strictly only count ONE instance total)
        if (seenRecurring.has(key)) return sum;
        
        // If it's a future recurring item, we skip it for the "Total em Aberto" summary
        if (isFuture) return sum;
        
        // Only count if it's within the month we are looking at (or past)
        seenRecurring.add(key);
        return sum + p.value;
      }
      
      // For fixed installments (Parcela), we sum all pending ones (actual debt)
      return sum + p.value;
    }, 0);

    const gastosTotal = gastos
      .filter(g => (g.account || g.bank) === accountName && g.status === 'Pendente')
      .reduce((sum, g) => sum + g.value, 0);
    const receitasTotal = receitas
      .filter(r => (r.account || r.bank) === accountName && r.status === 'Previsto')
      .reduce((sum, r) => sum + r.value, 0);
    return (parcelasTotal + gastosTotal) - receitasTotal;
  };

  const handleEdit = (conta: Conta) => {
    setEditingItem(conta);
  };

  const handleSaveEdit = (data: Partial<Conta>) => {
    if (editingItem) {
      updateConta(editingItem.id, data);
    }
  };

  // Long press logic
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);

  const startPress = (conta: Conta) => {
    isLongPress.current = false;
    timerRef.current = setTimeout(() => {
      isLongPress.current = true;
      handleEdit(conta);
    }, 600); // 600ms for long press
  };

  const endPress = (conta: Conta) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (!isLongPress.current) {
      setViewingLabel(conta);
    }
  };

  return (
    <div className="w-full min-h-[80vh]">
      <AnimatePresence mode="wait">
        {!viewingLabel ? (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-[28px] font-bold text-slate-900 dark:text-white tracking-tight">Etiquetas de Contas</h1>
                <p className="text-sm text-slate-400 font-medium tracking-tight">Toque para ver gastos | Segure para editar</p>
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
                {contas.length > 0 ? (
                  contas.map((conta, index) => {
                    const total = getAccountTotal(conta.name);
                    return (
                      <motion.div 
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.1 }}
                        key={conta.id} 
                        className="iphone-card p-6 shadow-sm cursor-pointer active:scale-[0.98] transition-all hover:bg-slate-50 dark:hover:bg-[#323235] border-l-[6px] select-none"
                        style={{ borderLeftColor: conta.color || '#333333' }}
                        onPointerDown={() => startPress(conta)}
                        onPointerUp={() => endPress(conta)}
                        onPointerLeave={() => { if(timerRef.current) clearTimeout(timerRef.current); }}
                        onContextMenu={(e) => e.preventDefault()} // Block context menu for cleaner feel
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                              style={{ backgroundColor: conta.color || '#333333' }}
                            >
                              {conta.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 dark:text-white text-[18px] tracking-tight">{conta.name}</h3>
                              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mt-0.5">Etiqueta Ativa</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[11px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest mb-1 leading-none">Total em Aberto</p>
                            <p className="font-black text-[20px] text-red-500 tracking-tighter">
                              {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                          </div>
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
                    <Wallet className="w-16 h-16 text-slate-200 dark:text-slate-600 mx-auto mb-6" />
                    <p className="text-slate-400 font-bold tracking-tight">Adicione sua primeira etiqueta!</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="details"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="pb-10"
          >
            <div className="flex items-center gap-4 mb-8">
              <button 
                onClick={() => setViewingLabel(null)}
                className="p-3 bg-white dark:bg-[#2C2C2E] rounded-2xl shadow-sm border border-black/[0.03] dark:border-white/5 text-slate-400 active:scale-95 transition-all"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-[26px] font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                  <span className="w-3 h-8 rounded-full" style={{ backgroundColor: viewingLabel.color || '#333333' }}></span>
                  {viewingLabel.name}
                </h1>
                <p className="text-sm text-slate-400 font-medium">Lançamentos vinculados à etiqueta</p>
              </div>
            </div>
            <div className="space-y-3">
              {renderAccountDetails(viewingLabel.name)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <EditModal 
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        title="Editar Etiqueta"
        initialData={editingItem || {}}
        onSave={handleSaveEdit}
        onDelete={() => { if(editingItem) deleteConta(editingItem.id) }}
      />

      <AddModal 
        isOpen={isAdding}
        onClose={() => setIsAdding(false)}
        defaultType="Conta"
      />
    </div>
  );
}

function CreditCard({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}
