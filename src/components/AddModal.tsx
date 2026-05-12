import { X } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useFinance } from "../contexts/FinanceContext";

type AddModalProps = {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'Gasto' | 'Receita' | 'Parcela' | 'Dívida';
};

export function AddModal({ isOpen, onClose, defaultType = 'Gasto' }: AddModalProps) {
  const { addGasto, addReceita, addParcela, addDivida, contas, orcamentos } = useFinance();
  
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState(defaultType);
  const [category, setCategory] = useState("Outros");
  const [account, setAccount] = useState("");
  const [method, setMethod] = useState("Pix");
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setType(defaultType);
      setDescription("");
      setValue("");
      setDate(new Date().toISOString().split('T')[0]);
      setIsPaid(false);
      setCategory("Outros");
      setMethod("Pix");
      if (contas.length > 0) setAccount(contas[0].name);
    }
  }, [isOpen, defaultType, contas]);

  if (!isOpen) return null;

  const handleSave = () => {
    const numValue = Number(value.replace(/,/g, '.'));
    if (!description || isNaN(numValue)) return;

    if (type === 'Gasto') {
      addGasto({
        description,
        value: numValue,
        date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', ''),
        method,
        account,
        status: isPaid ? 'Pago' : 'Pendente'
      });
    } else if (type === 'Receita') {
      addReceita({
        description,
        value: numValue,
        date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', ''),
        category,
        status: isPaid ? 'Recebido' : 'Previsto'
      });
    } else if (type === 'Parcela') {
      addParcela({
        description,
        value: numValue,
        date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', ''),
        method,
        account,
        currentInstallment: 1,
        totalInstallments: 1, // Need to improve for installments
        status: isPaid ? 'Pago' : 'Pendente',
        type: 'Parcela'
      });
    } else if (type === 'Dívida') {
      addDivida({
        description,
        totalAmount: numValue,
        paidAmount: isPaid ? numValue : 0,
        interestRate: 0, // Optional for now
        account,
        method
      });
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-[100] flex flex-col justify-end sm:justify-center items-center backdrop-blur-sm">
      <div className="bg-white w-full max-w-3xl rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl relative animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 min-h-[70vh] sm:min-h-0 flex flex-col">
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 sm:hidden pointer-events-none"></div>
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">Nova {type === 'Dívida' ? 'Dívida' : type}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 flex-1 overflow-y-auto pr-2 pb-2">
          <div>
            <label className="block text-[13px] font-medium text-slate-500 mb-1.5">Descrição</label>
            <input 
              type="text"
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Supermercado"
              className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 bg-slate-50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-slate-500 mb-1.5">Valor (R$)</label>
            <input 
              type="number"
              step="0.01"
              value={value} 
              onChange={(e) => setValue(e.target.value)}
              placeholder="0,00"
              className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 bg-slate-50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-slate-500 mb-1.5">Data</label>
            <input 
              type="date"
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 bg-slate-50 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-slate-500 mb-1.5">Tipo</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 bg-slate-50 transition-colors appearance-none"
              >
                <option value="Gasto">Gasto</option>
                <option value="Receita">Receita</option>
                <option value="Parcela">Parcela</option>
                <option value="Dívida">Dívida</option>
              </select>
            </div>
            
            <div>
              <label className="block text-[13px] font-medium text-slate-500 mb-1.5">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 bg-slate-50 transition-colors appearance-none"
              >
                {orcamentos.map(o => (
                  <option key={o.id} value={o.category}>{o.category}</option>
                ))}
                <option value="Salário">Salário</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-slate-500 mb-1.5">Conta</label>
              <select
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 bg-slate-50 transition-colors appearance-none"
              >
                {contas.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
                <option value="">Sem conta</option>
              </select>
            </div>
            
            <div>
              <label className="block text-[13px] font-medium text-slate-500 mb-1.5">Método</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 bg-slate-50 transition-colors appearance-none"
              >
                <option value="Pix">Pix</option>
                <option value="Crédito">Crédito</option>
                <option value="Débito">Débito</option>
                <option value="Boleto">Boleto</option>
                <option value="Dinheiro">Dinheiro</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between mt-6">
            <div>
              <h4 className="text-sm font-bold text-slate-800">Marcar como pago</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Define o status desta transação</p>
            </div>
            <button 
              onClick={() => setIsPaid(!isPaid)}
              className={`w-12 h-6 rounded-full transition-colors relative ${isPaid ? 'bg-slate-800' : 'bg-slate-300'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${isPaid ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>
        </div>

        <div className="mt-4 pt-4 shrink-0">
          <button 
            onClick={handleSave}
            className="w-full bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold py-4 rounded-xl transition-colors shadow-sm"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
