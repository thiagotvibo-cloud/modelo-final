import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, CreditCard, Wallet } from "lucide-react";
import { useFinance } from "../contexts/FinanceContext";

export function Resumo() {
  const { gastos, receitas, parcelas } = useFinance();

  const totalRecebido = receitas.filter(r => r.status === 'Recebido').reduce((a, b) => a + b.value, 0);
  const totalReceitas = receitas.reduce((a, b) => a + b.value, 0);

  const totalPago = gastos.filter(g => g.status === 'Pago').reduce((a, b) => a + b.value, 0);
  const totalGastos = gastos.reduce((a, b) => a + b.value, 0);

  const totalParcelas = parcelas.reduce((a, b) => a + b.value, 0);
  const pagoParcelas = parcelas.filter(p => p.status === 'Pago').reduce((a, b) => a + b.value, 0);

  const totalDespesas = totalGastos + totalParcelas;
  const saldo = totalReceitas - totalDespesas;
  
  const totalPagamentosMes = totalPago + pagoParcelas;
  const pagamentosAberto = totalDespesas - totalPagamentosMes;
  const pagamentosPerc = totalDespesas > 0 ? Math.round((totalPagamentosMes / totalDespesas) * 100) : 0;

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Resumo financeiro mensal</p>
      </div>

      <div className="flex items-center justify-between mb-6 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
        <button className="text-slate-400 hover:text-slate-600 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-semibold text-slate-700">Maio 2026</span>
        <button className="text-slate-400 hover:text-slate-600 transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-green-50 rounded-lg">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Receitas</h3>
          <p className="text-lg font-bold text-green-600 mb-0.5">{totalReceitas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
          <p className="text-[10px] text-slate-500">Recebido: {totalRecebido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-red-50 rounded-lg">
              <TrendingDown className="w-4 h-4 text-red-600" />
            </div>
          </div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Gastos</h3>
          <p className="text-lg font-bold text-red-600 mb-0.5">{totalGastos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
          <p className="text-[10px] text-slate-500">Pago: {totalPago.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-red-50 rounded-lg">
              <CreditCard className="w-4 h-4 text-red-600" />
            </div>
          </div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Parcelas</h3>
          <p className="text-lg font-bold text-red-600 mb-0.5">{totalParcelas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
          <p className="text-[10px] text-slate-500">Assin.: {pagoParcelas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-green-50 rounded-lg">
              <Wallet className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Saldo</h3>
          <p className="text-lg font-bold text-green-600 mb-0.5">{saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
          <p className="text-[10px] text-slate-500 truncate">Total despesas: {totalDespesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6">
        <div className="flex justify-between items-end mb-3">
          <h3 className="font-bold text-slate-800 text-sm">Pagamentos do mês</h3>
          <span className="font-bold text-slate-800">{pagamentosPerc}%</span>
        </div>
        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-slate-800 rounded-full transition-all duration-500" style={{ width: `${pagamentosPerc}%` }}></div>
        </div>
        <div className="flex justify-between text-[11px] text-slate-500 font-medium">
          <span>Pago: {totalPagamentosMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
          <span>Em aberto: {pagamentosAberto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6">
        <h3 className="font-bold text-slate-800 text-sm mb-5">Gastos por Conta</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-400"></div>
                <span className="text-[13px] font-medium text-slate-700">Sem conta</span>
              </div>
              <span className="text-[13px] font-bold text-slate-800">R$ 1.759,00</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                <span className="text-[13px] font-medium text-slate-700">Nubank Thiago - 7995</span>
              </div>
              <span className="text-[13px] font-bold text-slate-800">R$ 737,79</span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium flex gap-2">
              <span>Gastos: R$ 228,89</span>
              <span>Parcelas: R$ 380,00</span>
              <span>Assin.: R$ 128,90</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                <span className="text-[13px] font-medium text-slate-700">Nubank Kely - 0522</span>
              </div>
              <span className="text-[13px] font-bold text-slate-800">R$ 473,69</span>
            </div>
             <div className="text-[10px] text-slate-500 font-medium flex gap-2">
              <span>Gastos: R$ 187,89</span>
              <span>Parcelas: R$ 220,00</span>
              <span>Assin.: R$ 65,80</span>
            </div>
          </div>
           <div>
            <div className="flex justify-between items-center mb-1">
               <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                <span className="text-[13px] font-medium text-slate-700">Bradesco Kely - 6363</span>
              </div>
              <span className="text-[13px] font-bold text-slate-800">R$ 258,68</span>
            </div>
          </div>
        </div>
      </div>

       <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col mb-4">
        <h3 className="font-bold text-slate-800 text-sm mb-4">Próximos Vencimentos (7 dias)</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[13px] font-bold text-slate-800">Empréstimo Shoppe Thiago</p>
              <p className="text-[11px] text-slate-500">Vence dia 14</p>
            </div>
            <span className="text-sm font-bold text-red-600">R$ 97,32</span>
          </div>
          
           <div className="flex justify-between items-center">
            <div>
              <p className="text-[13px] font-bold text-slate-800">Geladeira</p>
              <p className="text-[11px] text-slate-500">Vence dia 15</p>
            </div>
            <span className="text-sm font-bold text-red-600">R$ 220,00</span>
          </div>

           <div className="flex justify-between items-center">
            <div>
              <p className="text-[13px] font-bold text-slate-800">iCloud</p>
              <p className="text-[11px] text-slate-500">Vence dia 15</p>
            </div>
            <span className="text-sm font-bold text-red-600">R$ 9,90</span>
          </div>
        </div>
      </div>

    </div>
  );
}
