import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFinance, Divida } from "../contexts/FinanceContext";
import { EditModal } from "../components/EditModal";
import { AddModal } from "../components/AddModal";

export function Dividas() {
  const { dividas, updateDivida, deleteDivida } = useFinance();
  const [editingItem, setEditingItem] = useState<Divida | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleEdit = (divida: Divida) => {
    setEditingItem(divida);
  };

  const handleSaveEdit = (data: Partial<Divida>) => {
    if (editingItem) {
      updateDivida(editingItem.id, data);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-slate-800">Dívidas</h1>
          <p className="text-sm text-slate-500 mt-1">Acompanhe e quite suas dívidas</p>
        </div>
        <div>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-3 rounded-xl text-sm font-bold transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nova
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {dividas.map((divida) => {
          const perc = Math.min(100, Math.round((divida.paidAmount / divida.totalAmount) * 100));
          return (
            <div 
              key={divida.id} 
              className="bg-white p-5 rounded-2xl border-t-4 shadow-sm border border-slate-200 cursor-pointer active:scale-[0.98] transition-transform"
              style={{ borderTopColor: '#ef4444' }}
              onClick={() => handleEdit(divida)}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                   <h3 className="font-bold text-slate-800 text-[15px] mb-1">{divida.description}</h3>
                   <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Taxa: {divida.interestRate}% am</span>
                </div>
                 <button 
                  onClick={(e) => { e.stopPropagation(); deleteDivida(divida.id); }}
                  className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex justify-between items-end mb-2">
                 <p className="font-bold text-slate-700">{perc}% pago</p>
                 <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
                    Resta {(divida.totalAmount - divida.paidAmount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                 </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-slate-800" 
                  style={{ width: `${perc}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      <EditModal 
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        title="Editar Dívida"
        initialData={editingItem || {}}
        onSave={handleSaveEdit}
        onDelete={() => { if(editingItem) deleteDivida(editingItem.id) }}
      />
      
      <AddModal 
        isOpen={isAdding}
        onClose={() => setIsAdding(false)}
        defaultType="Dívida"
      />
    </div>
  );
}
