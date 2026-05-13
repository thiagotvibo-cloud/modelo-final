import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, CreditCard, Wallet, Calendar, Target, AlertCircle, BarChart3, ChevronRight as ChevronRightIcon } from "lucide-react";
import { useFinance } from "../contexts/FinanceContext";
import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Link } from "react-router-dom";

export function Resumo() {
  const { gastos, receitas, parcelas, metas, dividas } = useFinance();
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  const filterByDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear();
  };

  const currentReceitas = receitas.filter(r => filterByDate(r.date));
  const currentGastos = gastos.filter(g => filterByDate(g.date));
  const currentParcelas = parcelas.filter(p => filterByDate(p.date));

  const totalReceitas = currentReceitas.reduce((a, b) => a + b.value, 0);
  const totalRecebido = currentReceitas.filter(r => r.status === 'Recebido').reduce((a, b) => a + b.value, 0);

  const totalGastos = currentGastos.reduce((a, b) => a + b.value, 0);
  const totalPago = currentGastos.filter(g => g.status === 'Pago').reduce((a, b) => a + b.value, 0);

  const totalParcelas = currentParcelas.reduce((a, b) => a + b.value, 0);
  const pagoParcelas = currentParcelas.filter(p => p.status === 'Pago').reduce((a, b) => a + b.value, 0);

  const totalDespesas = totalGastos + totalParcelas;
  const saldo = totalReceitas - totalDespesas;
  
  const totalPagamentosMes = totalPago + pagoParcelas;
  const pagamentosAberto = totalDespesas - totalPagamentosMes;
  const pagamentosPerc = totalDespesas > 0 ? Math.round((totalPagamentosMes / totalDespesas) * 100) : 0;

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const chartData = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentDate);
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth();
      const y = d.getFullYear();
      
      const r = receitas.filter(rec => {
        const rd = new Date(rec.date);
        return rd.getMonth() === m && rd.getFullYear() === y;
      }).reduce((acc, curr) => acc + curr.value, 0);

      const g = gastos.filter(gas => {
        const gd = new Date(gas.date);
        return gd.getMonth() === m && gd.getFullYear() === y;
      }).reduce((acc, curr) => acc + curr.value, 0) + 
      parcelas.filter(par => {
        const pd = new Date(par.date);
        return pd.getMonth() === m && pd.getFullYear() === y;
      }).reduce((acc, curr) => acc + curr.value, 0);

      data.push({
        name: d.toLocaleDateString('pt-BR', { month: 'short' }),
        receitas: r,
        despesas: g
      });
    }
    return data;
  }, [receitas, gastos, parcelas, currentDate]);

  return (
    <div className="w-full animate-in fade-in duration-500 pb-10">
      <div className="bg-[#007AFF] -mx-4 -mt-4 p-8 pb-32 mb-[-100px] rounded-b-[48px] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-20 -mb-20 blur-2xl opacity-30"></div>
        
        <div className="flex items-center justify-between mb-10 relative z-10">
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
            <button 
              onClick={() => changeMonth(-1)}
              className="p-1 text-white/60 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-[15px] font-bold text-white tracking-tight">{capitalizedMonth}</h2>
            <button 
              onClick={() => changeMonth(1)}
              className="p-1 text-white/60 hover:text-white transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-[14px] flex items-center justify-center border border-white/20">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="text-center relative z-10">
          <p className="text-[12px] font-bold text-white/60 uppercase tracking-[0.2em] mb-3">Saldo Disponível</p>
          <p className="text-[48px] font-bold tracking-tighter text-white mb-2 leading-none">{(saldo).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
          <div className="flex justify-center">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold backdrop-blur-md border ${saldo >= 0 ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${saldo >= 0 ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
              {saldo >= 0 ? 'Balanço Positivo' : 'Atenção ao Saldo'}
            </div>
          </div>
        </div>
      </div>

      <div className="px-1 relative z-20">
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="iphone-card p-6 shadow-xl shadow-black/5 active:scale-[0.98] transition-all">
            <div className="w-10 h-10 bg-green-50 rounded-2xl flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Receitas</h3>
            <p className="text-[20px] font-bold text-slate-900 tracking-tight font-sans">{totalReceitas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
          </div>

          <div className="iphone-card p-6 shadow-xl shadow-black/5 active:scale-[0.98] transition-all">
            <div className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
              <TrendingDown className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Despesas</h3>
            <p className="text-[20px] font-bold text-slate-900 tracking-tight font-sans">{totalDespesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
          </div>
        </div>
      </div>

      <div className="mb-10">
        <h3 className="text-[14px] font-bold text-slate-400 uppercase tracking-widest mb-5 px-1">Atalhos rápidos</h3>
        <div className="grid grid-cols-2 gap-4">
          <Link to="/metas" className="bg-white p-5 rounded-[26px] border border-black/[0.03] shadow-sm flex items-center gap-4 iphone-button hover:bg-slate-50">
            <div className="w-11 h-11 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-black/10">
              <Target className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-800 text-[15px] tracking-tight">Objetivos</span>
          </Link>
          <Link to="/planejamento" className="bg-white p-5 rounded-[26px] border border-black/[0.03] shadow-sm flex items-center gap-4 iphone-button hover:bg-slate-50">
            <div className="w-11 h-11 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/10">
              <BarChart3 className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-800 text-[15px] tracking-tight">Orçamento</span>
          </Link>
          <Link to="/dividas" className="bg-white p-5 rounded-[26px] border border-black/[0.03] shadow-sm flex items-center gap-4 iphone-button hover:bg-slate-50">
            <div className="w-11 h-11 bg-red-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-500/10">
              <AlertCircle className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-800 text-[15px] tracking-tight">Dívidas</span>
          </Link>
          <Link to="/investimentos" className="bg-white p-5 rounded-[26px] border border-black/[0.03] shadow-sm flex items-center gap-4 iphone-button hover:bg-slate-50">
            <div className="w-11 h-11 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-500/10">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-800 text-[15px] tracking-tight">Investir</span>
          </Link>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[32px] border border-black/[0.03] shadow-sm mb-8">
        <h3 className="font-bold text-slate-900 text-[17px] tracking-tight mb-8">Atividade Semestral</h3>
        <div className="w-full h-64 -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FB7185" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#FB7185" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94A3B8', fontWeight: 'bold'}} dy={10} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                labelStyle={{ fontSize: '10px', color: '#94A3B8', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}
                formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              />
              <Area type="monotone" dataKey="receitas" stroke="#22C55E" strokeWidth={4} fillOpacity={1} fill="url(#colorReceitas)" />
              <Area type="monotone" dataKey="despesas" stroke="#FB7185" strokeWidth={4} fillOpacity={1} fill="url(#colorDespesas)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
