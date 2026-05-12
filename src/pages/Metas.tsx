import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFinance, Meta } from "../contexts/FinanceContext";
import { EditModal } from "../components/EditModal";

export function Metas() {
  const { metas, updateMeta, deleteMeta } = useFinance();
  const [editingItem, setEditingItem] = useState<Meta | null>(null);

  const handleEdit = (meta: Meta) => {
    setEditingItem(meta);
  };

  const handleSaveEdit = (data: Partial<Meta>) => {
    if (editingItem) {
      updateMeta(editingItem.id, data);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-slate-800">Metas</h1>
          <p className="text-sm text-slate-500 mt-1">Acompanhe seus objetivos</p>
        </div>
        <div>
          <button className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-3 rounded-xl text-sm font-bold transition-colors">
            <Plus className="w-5 h-5" />
            Nova
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {metas.map((meta) => {
          const perc = Math.min(100, Math.round((meta.saved / meta.target) * 100));
          return (
            <div 
              key={meta.id} 
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm cursor-pointer active:scale-[0.98] transition-transform"
              onClick={() => handleEdit(meta)}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                   <h3 className="font-bold text-slate-800 text-[15px] mb-1">{meta.title}</h3>
                   <span className="text-[11px] font-medium text-slate-500">Prazo: {meta.deadline}</span>
                </div>
                 <button 
                  onClick={(e) => { e.stopPropagation(); deleteMeta(meta.id); }}
                  className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex justify-between items-end mb-2">
                 <p className="font-bold text-green-600">{perc}%</p>
                 <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
                    {meta.saved.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} / {meta.target.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                 </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-green-500" 
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
        title="Editar Meta"
        initialData={editingItem || {}}
        onSave={handleSaveEdit}
        onDelete={() => { if(editingItem) deleteMeta(editingItem.id) }}
      />
    </div>
  );
}
