import { X } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useFinance } from "../contexts/FinanceContext";

type AddModalProps = {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'Gasto' | 'Receita' | 'Parcela' | 'Dívida' | 'Meta' | 'Orcamento' | 'Investimento' | 'Conta';
};

export function AddModal({ isOpen, onClose, defaultType = 'Gasto' }: AddModalProps) {
  const { addGasto, addReceita, addParcela, addDivida, addMeta, addOrcamento, addInvestimento, addConta } = useFinance();
  
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState(defaultType);
  const [category, setCategory] = useState("Outros");
  const [method, setMethod] = useState("Pix");
  const [isPaid, setIsPaid] = useState(false);

  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [limit, setLimit] = useState("");

  const [totalInstallments, setTotalInstallments] = useState("1");
  const [parcelaType, setParcelaType] = useState<'Parcela' | 'Assinatura' | 'Recorrente'>('Parcela');

  useEffect(() => {
    if (isOpen) {
      setType(defaultType);
      setDescription("");
      setValue("");
      setDate(new Date().toISOString().split('T')[0]);
      setIsPaid(false);
      setCategory("Outros");
      setMethod("Pix");
      setTotalInstallments("1");
      setTarget("");
      setDeadline("");
      setLimit("");
      setParcelaType(defaultType === 'Parcela' ? 'Parcela' : 'Parcela');
    }
  }, [isOpen, defaultType]);

  if (!isOpen) return null;

  const handleSave = () => {
    const numValue = Number(value.replace(/,/g, '.'));
    const numTarget = Number(target.replace(/,/g, '.'));
    const numLimit = Number(limit.replace(/,/g, '.'));

    if (type === 'Gasto') {
      if (!description || isNaN(numValue)) return;
      addGasto({
        description,
        value: numValue,
        date: new Date(date).toISOString(),
        method,
        status: isPaid ? 'Pago' : 'Pendente'
      });
    } else if (type === 'Receita') {
      if (!description || isNaN(numValue)) return;
      addReceita({
        description,
        value: numValue,
        date: new Date(date).toISOString(),
        category,
        status: isPaid ? 'Recebido' : 'Previsto'
      });
    } else if (type === 'Parcela') {
      if (!description || isNaN(numValue)) return;
      addParcela({
        description,
        value: numValue,
        date: new Date(date).toISOString(),
        method,
        currentInstallment: 1,
        totalInstallments: parcelaType === 'Parcela' ? Number(totalInstallments) : 1,
        status: isPaid ? 'Pago' : 'Pendente',
        type: parcelaType
      });
    } else if (type === 'Dívida') {
      if (!description || isNaN(numValue)) return;
      addDivida({
        description,
        totalAmount: numValue,
        paidAmount: isPaid ? numValue : 0,
        interestRate: 0,
        method
      });
    } else if (type === 'Meta') {
      if (!description || isNaN(numTarget)) return;
      addMeta({
        title: description,
        target: numTarget,
        saved: numValue || 0,
        deadline: deadline || date
      });
    } else if (type === 'Orcamento') {
      if (!category || isNaN(numLimit)) return;
      addOrcamento({
        category,
        limit: numLimit,
        spent: 0
      });
    } else if (type === 'Investimento') {
      if (!description || isNaN(numValue)) return;
      addInvestimento({
        name: description,
        type: category, // Using category as the investment type (CDB, Ações, etc)
        balance: numValue,
        yield: 0
      });
    } else if (type === 'Conta') {
      if (!description || isNaN(numValue)) return;
      addConta({
        name: description,
        institution: category, // Using category as institution
        balance: numValue,
        type: method, // Using method as account type (Corrente, Poupança, etc)
        expectedBalance: numValue
      });
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-[100] flex flex-col justify-end sm:justify-center items-center backdrop-blur-md px-0 sm:px-4">
      <div className="bg-white w-full max-w-lg rounded-t-[42px] sm:rounded-[32px] p-6 sm:p-9 shadow-2xl relative animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 duration-500 max-h-[94vh] flex flex-col">
        <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-8 sm:hidden pointer-events-none"></div>
        
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-[22px] font-bold text-black tracking-tight">Novo Lançamento</h2>
          <button onClick={onClose} className="p-2.5 text-slate-300 hover:text-black hover:bg-slate-50 rounded-full transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-7 flex-1 overflow-y-auto hide-scrollbar pb-8">
          {type !== 'Orcamento' && (
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] px-1">
                {type === 'Meta' ? 'Título do Objetivo' : type === 'Investimento' ? 'Nome da Aplicação' : type === 'Conta' ? 'Nome da Conta (Apelido)' : 'O que foi?'}
              </label>
              <input 
                type="text"
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  type === 'Meta' ? 'Ex: Viagem para Europa' : 
                  type === 'Investimento' ? 'Ex: Tesouro Selic 2029' :
                  type === 'Conta' ? 'Ex: Conta Corrente Itaú' :
                  'Ex: Compra no mercado'
                }
                className="w-full border-2 border-slate-50 rounded-2xl px-6 py-4.5 text-slate-900 font-bold focus:outline-none focus:border-black bg-slate-50/50 transition-all placeholder:text-slate-300 text-[16px]"
              />
            </div>
          )}

          {type === 'Meta' ? (
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] px-1">Meta final</label>
                <input 
                  type="number"
                  value={target} 
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="0,00"
                  className="w-full border-2 border-slate-50 rounded-2xl px-6 py-4.5 text-slate-900 font-bold focus:outline-none focus:border-black bg-slate-50/50 transition-all text-[16px]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] px-1">Já tenho</label>
                <input 
                  type="number"
                  value={value} 
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="0,00"
                  className="w-full border-2 border-slate-50 rounded-2xl px-6 py-4.5 text-slate-900 font-bold focus:outline-none focus:border-black bg-slate-50/50 transition-all text-[16px]"
                />
              </div>
            </div>
          ) : type === 'Orcamento' ? (
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] px-1">Categoria</label>
                <input 
                  type="text"
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border-2 border-slate-50 rounded-2xl px-6 py-4.5 text-slate-900 font-bold focus:outline-none focus:border-black bg-slate-50/50 transition-all text-[16px]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] px-1">Limite mensal</label>
                <input 
                  type="number"
                  value={limit} 
                  onChange={(e) => setLimit(e.target.value)}
                  className="w-full border-2 border-slate-50 rounded-2xl px-6 py-4.5 text-slate-900 font-bold focus:outline-none focus:border-black bg-slate-50/50 transition-all text-[16px]"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] px-1">
                {['Investimento', 'Conta'].includes(type) ? 'Valor Atual' : 'Quanto sumiu?'}
              </label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-slate-300">R$</span>
                <input 
                  type="number"
                  step="0.01"
                  value={value} 
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="0,00"
                  className="w-full border-2 border-slate-50 rounded-[28px] pl-14 pr-6 py-7 text-black text-4xl font-bold focus:outline-none focus:border-black bg-slate-50/50 transition-all placeholder:text-slate-100"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-5">
            {type !== 'Orcamento' && (
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] px-1">{type === 'Meta' ? 'Prazo' : 'Quando?'}</label>
                <input 
                  type={type === 'Meta' ? 'text' : 'date'}
                  value={type === 'Meta' ? deadline : date} 
                  onChange={(e) => type === 'Meta' ? setDeadline(e.target.value) : setDate(e.target.value)}
                  placeholder={type === 'Meta' ? 'Ex: Dez 2026' : ''}
                  className="w-full border-2 border-slate-50 rounded-2xl px-6 py-4.5 text-slate-900 font-bold focus:outline-none focus:border-black bg-slate-50/50 transition-all text-[16px]"
                />
              </div>
            )}
            
            {['Gasto', 'Receita', 'Parcela', 'Dívida', 'Investimento', 'Conta'].includes(type) && (
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] px-1">Tipo principal</label>
                <div className="relative">
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full border-2 border-slate-50 rounded-2xl px-6 py-4.5 text-slate-900 font-bold focus:outline-none focus:border-black bg-slate-50/50 transition-all appearance-none text-[16px]"
                  >
                    <option value="Gasto">💵 Gasto único</option>
                    <option value="Receita">💰 Receita</option>
                    <option value="Parcela">💳 Parcelado</option>
                    <option value="Dívida">📉 Dívida</option>
                    <option value="Investimento">📈 Investimento</option>
                    <option value="Conta">🏦 Conta/Cartão</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {['Gasto', 'Receita', 'Parcela', 'Dívida', 'Investimento', 'Conta'].includes(type) && (
            <div className="grid grid-cols-2 gap-5">
              {type === 'Parcela' ? (
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] px-1">Frequência</label>
                  <select
                    value={parcelaType}
                    onChange={(e) => setParcelaType(e.target.value as any)}
                    className="w-full border-2 border-slate-50 rounded-2xl px-6 py-4.5 text-slate-900 font-bold focus:outline-none focus:border-black bg-slate-50/50 transition-all appearance-none text-[16px]"
                  >
                    <option value="Parcela">Várias parcelas</option>
                    <option value="Assinatura">Mensal fixo</option>
                    <option value="Recorrente">Sem data fim</option>
                  </select>
                </div>
              ) : type === 'Receita' ? (
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] px-1">De onde?</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border-2 border-slate-50 rounded-2xl px-6 py-4.5 text-slate-900 font-bold focus:outline-none focus:border-black bg-slate-50/50 transition-all appearance-none text-[16px]"
                  >
                    <option value="Salário">Salário</option>
                    <option value="Freelance">Trabalho extra</option>
                    <option value="Investimentos">Rendimentos</option>
                    <option value="Outros">Outros ativos</option>
                  </select>
                </div>
              ) : type === 'Investimento' ? (
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] px-1">Classe de Ativo</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border-2 border-slate-50 rounded-2xl px-6 py-4.5 text-slate-900 font-bold focus:outline-none focus:border-black bg-slate-50/50 transition-all appearance-none text-[16px]"
                  >
                    <option value="CDB">CDB / Renda Fixa</option>
                    <option value="Tesouro">Tesouro Direto</option>
                    <option value="Ações">Ações / FIIs</option>
                    <option value="Cripto">Criptoativos</option>
                  </select>
                </div>
              ) : type === 'Conta' ? (
                 <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] px-1">Instituição</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border-2 border-slate-50 rounded-2xl px-6 py-4.5 text-slate-900 font-bold focus:outline-none focus:border-black bg-slate-50/50 transition-all appearance-none text-[16px]"
                  >
                    <option value="Nubank">Nubank</option>
                    <option value="Bradesco">Bradesco</option>
                    <option value="Itaú">Itaú</option>
                    <option value="Inter">Inter</option>
                    <option value="Outro">Outro Banco</option>
                  </select>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] px-1">Forma de pagamento</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full border-2 border-slate-50 rounded-2xl px-6 py-4.5 text-slate-900 font-bold focus:outline-none focus:border-black bg-slate-50/50 transition-all appearance-none text-[16px]"
                  >
                    <option value="Pix">⚡ Pix</option>
                    <option value="Crédito">💳 Crédito</option>
                    <option value="Débito">🏦 Débito</option>
                    <option value="Dinheiro">💵 Dinheiro</option>
                  </select>
                </div>
              )}

              {type === 'Conta' && (
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] px-1">Tipo de Conta</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full border-2 border-slate-50 rounded-2xl px-6 py-4.5 text-slate-900 font-bold focus:outline-none focus:border-black bg-slate-50/50 transition-all appearance-none text-[16px]"
                  >
                    <option value="Corrente">Corrente</option>
                    <option value="Poupança">Poupança</option>
                    <option value="Crédito">Cartão de Crédito</option>
                    <option value="Investimentos">Conta Corretora</option>
                  </select>
                </div>
              )}

              {type === 'Parcela' && parcelaType === 'Parcela' && (
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] px-1">Quantidade</label>
                  <input 
                    type="number"
                    value={totalInstallments} 
                    onChange={(e) => setTotalInstallments(e.target.value)}
                    placeholder="12"
                    className="w-full border-2 border-slate-50 rounded-2xl px-6 py-4.5 text-slate-900 font-bold focus:outline-none focus:border-black bg-slate-50/50 transition-all text-[16px]"
                  />
                </div>
              )}
            </div>
          )}

          {['Gasto', 'Receita', 'Parcela', 'Dívida'].includes(type) && (
            <div 
              className="bg-black/5 rounded-[32px] p-7 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all border-2 border-transparent hover:border-black/5"
              onClick={() => setIsPaid(!isPaid)}
            >
              <div>
                <h4 className="text-[16px] font-bold text-black tracking-tight">
                  {type === 'Receita' ? 'Já caiu na conta?' : 'Confirmar pagamento?'}
                </h4>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Marcar como finalizado</p>
              </div>
              <div className={`w-14 h-8 rounded-full transition-all relative ${isPaid ? 'bg-black' : 'bg-slate-200'}`}>
                <div className={`w-6 h-6 rounded-full bg-white absolute top-1 transition-all shadow-lg ${isPaid ? 'left-7' : 'left-1'}`}></div>
              </div>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-slate-50 mt-auto">
          <button 
            onClick={handleSave}
            className="w-full bg-black hover:bg-zinc-900 active:scale-[0.97] text-white font-bold py-6 rounded-3xl transition-all shadow-xl shadow-black/10 text-[18px] tracking-tight"
          >
            Confirmar e Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
