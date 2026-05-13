import { Plus, Check, Pencil, Trash2, CreditCard } from "lucide-react";
import React, { useState } from "react";
import { useFinance, Parcela } from "../contexts/FinanceContext";
import { EditModal } from "../components/EditModal";
import { AddModal } from "../components/AddModal";

export function Parcelas() {
  const { parcelas, updateParcela, deleteParcela } = useFinance();
  const [editingItem, setEditingItem] = useState<Parcela | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleEdit = (parcela: Parcela) => {
    setEditingItem(parcela);
  };

  const handleSaveEdit = (data: Partial<Parcela>) => {
    if (editingItem) {
      updateParcela(editingItem.id, data);
    }
  };

  const toggleStatus = (e: React.MouseEvent, parcela: Parcela) => {
    e.stopPropagation();
    updateParcela(parcela.id, { status: parcela.status === 'Pago' ? 'Pendente' : 'Pago' });
  };

  const [activeTab, setActiveTab] = useState<'Parcela' | 'Assinatura' | 'Recorrente'>('Parcela');

  const filteredParcelas = parcelas.filter(p => p.type === activeTab);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">Compromissos</h1>
          <p className="text-sm text-slate-400 font-medium">Gestão de pagamentos recorrentes</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="bg-slate-100 p-1.5 rounded-[22px] flex mb-10 overflow-hidden border border-black/[0.03]">
        {(['Parcela', 'Assinatura', 'Recorrente'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-[12px] font-bold rounded-[16px] text-center transition-all uppercase tracking-widest ${
              activeTab === tab ? "bg-black text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {tab === 'Parcela' ? 'Parcelas' : tab === 'Assinatura' ? 'Assinaturas' : 'Aluguel/Rec.'}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredParcelas.length > 0 ? filteredParcelas.map((parcela) => {
          const isPago = parcela.status === 'Pago';
          const isRecorrente = parcela.type !== 'Parcela';
          const perc = isRecorrente ? 100 : Math.round((parcela.currentInstallment / parcela.totalInstallments) * 100);
          const remaining = isRecorrente ? 0 : (parcela.totalInstallments - parcela.currentInstallment) * parcela.value;
          const formattedDate = new Date(parcela.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
          
          return (
            <div 
               key={parcela.id}
               onClick={() => handleEdit(parcela)}
               className={`iphone-card p-6 cursor-pointer active:scale-[0.98] transition-all hover:bg-slate-50 ${isPago && parcela.currentInstallment === parcela.totalInstallments && !isRecorrente ? 'opacity-40 grayscale' : ''}`}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-bold text-slate-900 text-[17px] tracking-tight mb-2">{parcela.description}</h3>
                  <div className="flex items-center gap-3">
                    <span className="bg-slate-100 text-[10px] font-bold text-slate-500 px-2.5 py-1.5 rounded-lg uppercase tracking-wider">{formattedDate}</span>
                    <span className="bg-slate-100 text-[10px] font-bold text-slate-500 px-2.5 py-1.5 rounded-lg uppercase tracking-wider">{parcela.method}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <p className="font-bold text-red-500 text-[18px] tracking-tight">{parcela.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                  {!isRecorrente && <span className="text-[11px] font-bold text-slate-400 tracking-widest">{parcela.currentInstallment} DE {parcela.totalInstallments}</span>}
                </div>
              </div>
              
              {!isRecorrente && (
                <div className="mb-6">
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-black/[0.03] mb-3">
                    <div className={`h-full bg-black rounded-full transition-all duration-1000 ease-out`} style={{ width: `${perc}%` }}></div>
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    <span>Restam {parcela.totalInstallments - parcela.currentInstallment} vezes</span>
                    <span className="text-slate-900 bg-slate-100 px-2 py-1 rounded-md">SALDO: {remaining.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-4 pt-5 border-t border-black/[0.02]">
                 {(isRecorrente || parcela.currentInstallment < parcela.totalInstallments) && (
                   <button 
                     onClick={(e) => toggleStatus(e, parcela)}
                     className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[13px] font-bold transition-all shadow-sm ${isPago ? 'bg-green-500 text-white' : 'bg-black text-white hover:bg-zinc-800'}`}
                   >
                     {isPago ? <><Check className="w-4 h-4 stroke-[3]" /> Pago</> : <><Check className="w-4 h-4" /> Marcar como pago</>}
                   </button>
                 )}
                 <button 
                   onClick={(e) => { e.stopPropagation(); deleteParcela(parcela.id); }}
                   className="p-3.5 bg-slate-50 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                 >
                   <Trash2 className="w-5 h-5" />
                 </button>
              </div>
            </div>
          );
        }) : (
          <div className="bg-white rounded-[40px] p-20 flex flex-col items-center justify-center text-center border border-black/[0.02]">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <CreditCard className="w-10 h-10 text-slate-200" />
            </div>
            <p className="text-slate-400 font-bold tracking-tight">Vazio em {activeTab === 'Parcela' ? 'Parcelas' : activeTab === 'Assinatura' ? 'Assinaturas' : 'Recorrentes'}</p>
          </div>
        )}
      </div>

      <EditModal 
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        title="Editar Parcela"
        initialData={editingItem || {}}
        onSave={handleSaveEdit}
        onDelete={() => { if(editingItem) deleteParcela(editingItem.id) }}
      />
      
      <AddModal 
        isOpen={isAdding}
        onClose={() => setIsAdding(false)}
        defaultType="Parcela"
      />
    </div>
  );
}
