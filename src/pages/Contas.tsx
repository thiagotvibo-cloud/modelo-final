import { Plus, Wallet, Trash2, X, ChevronRight, Calendar, ArrowLeft } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useFinance, Conta, Parcela, Gasto } from "../contexts/FinanceContext";
import { EditModal } from "../components/EditModal";
import { AddModal } from "../components/AddModal";
import { motion, AnimatePresence } from "framer-motion";
import { formatDateShort } from "../lib/utils";

export function Contas() {
  const { contas, updateConta, deleteConta, parcelas, gastos } = useFinance();
  const [editingItem, setEditingItem] = useState<Conta | null>(null);
  const [viewingLabel, setViewingLabel] = useState<Conta | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const getAccountItems = (accountName: string) => {
    const installments = parcelas.filter(p => p.bank === accountName);
    const expenses = gastos.filter(g => g.bank === accountName);
    return [...installments.map(i => ({ ...i, itemType: 'Parcela' })), ...expenses.map(e => ({ ...e, itemType: 'Gasto' }))]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getAccountTotal = (accountName: string) => {
    return parcelas
      .filter(p => p.bank === accountName && p.status === 'Pendente')
      .reduce((sum, p) => sum + p.value, 0);
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
                        style={{ borderLeftColor: conta.color || '#000' }}
                        onPointerDown={() => startPress(conta)}
                        onPointerUp={() => endPress(conta)}
                        onPointerLeave={() => { if(timerRef.current) clearTimeout(timerRef.current); }}
                        onContextMenu={(e) => e.preventDefault()} // Block context menu for cleaner feel
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                              style={{ backgroundColor: conta.color || '#000' }}
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
                  <span className="w-3 h-8 rounded-full" style={{ backgroundColor: viewingLabel.color }}></span>
                  {viewingLabel.name}
                </h1>
                <p className="text-sm text-slate-400 font-medium">Lançamentos vinculados à etiqueta</p>
              </div>
            </div>

            <div className="space-y-3">
              {getAccountItems(viewingLabel.name).length > 0 ? (
                getAccountItems(viewingLabel.name).map((item: any, idx) => (
                  <div key={item.id} className="iphone-card p-5 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400">
                        {item.itemType === 'Parcela' ? <CreditCard className="w-5 h-5" /> : <Wallet className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-[16px] tracking-tight">{item.description}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-widest">{formatDateShort(item.date)}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-white/10"></span>
                          <span className={`${item.status === 'Pago' || item.status === 'Recebido' ? 'text-green-500' : 'text-slate-400'} text-[10px] font-black uppercase tracking-widest`}>{item.status}</span>
                        </div>
                      </div>
                    </div>
                    <p className={`font-bold text-[16px] ${item.itemType === 'Receita' ? 'text-green-500' : 'text-red-500'}`}>
                      {item.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <p className="text-slate-400 font-bold tracking-tight">Nenhum lançamento encontrado</p>
                </div>
              )}
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
