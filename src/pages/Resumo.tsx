import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, CreditCard, Wallet, Calendar, Target, AlertCircle, BarChart3, ChevronRight as ChevronRightIcon, Plus } from "lucide-react";
import { useFinance } from "../contexts/FinanceContext";
import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Link, useNavigate } from "react-router-dom";
import { AddModal } from "../components/AddModal";
import { motion } from "framer-motion";

export function Resumo() {
  const { gastos, receitas, parcelas, metas, dividas } = useFinance();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAdding, setIsAdding] = useState<'Gasto' | 'Receita' | 'Parcela' | 'Dívida' | 'Meta' | 'Orcamento' | 'Investimento' | 'Conta' | null>(null);
  const navigate = useNavigate();

  const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  const getSafeDate = (dateStr: string) => {
    const datePart = dateStr.split('T')[0];
    const [y, m, d] = datePart.split('-');
    return new Date(Number(y), Number(m) - 1, Number(d), 12, 0, 0);
  };

  const filterByDate = (dateStr: string) => {
    const date = getSafeDate(dateStr);
    return date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear();
  };

  const filterParcelaByDate = (p: { date: string }) => {
    const d = getSafeDate(p.date);
    return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
  };

  const currentReceitas = receitas.filter(r => filterByDate(r.date));
  const currentGastos = gastos.filter(g => filterByDate(g.date));
  const currentParcelas = parcelas.filter(p => filterParcelaByDate(p));

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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getMappedDate = (dateStr: string) => {
    const d = getSafeDate(dateStr);
    // Mapeia para o mês que está sendo visualizado (currentDate)
    const mappedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), d.getDate(), 12, 0, 0);
    mappedDate.setHours(0, 0, 0, 0);
    return mappedDate;
  };

  const isOverdue = (dateStr: string, isRecurringOrInstallment: boolean = false) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isRecurringOrInstallment) {
      // Para itens recorrentes, mapeia o dia de vencimento para o mês visualizado
      const mappedDate = getMappedDate(dateStr);
      // Avalia overdue baseado na data mapeada
      return mappedDate < today;
    } else {
      const d = getSafeDate(dateStr);
      d.setHours(0, 0, 0, 0);
      return d < today;
    }
  };

  const overdueAmount = 
    currentGastos.filter(g => g.status === 'Pendente' && isOverdue(g.date, false)).reduce((a, b) => a + b.value, 0) +
    currentParcelas.filter(p => p.status === 'Pendente' && isOverdue(p.date, true)).reduce((a, b) => a + b.value, 0);

  const upcomingAmount = pagamentosAberto - overdueAmount;

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
        const rd = getSafeDate(rec.date);
        return rd.getMonth() === m && rd.getFullYear() === y;
      }).reduce((acc, curr) => acc + curr.value, 0);

      const filterParcelaByDateForChart = (p: { date: string; type: string; totalInstallments: number }) => {
        const pd = getSafeDate(p.date);
        const startY = pd.getFullYear();
        const startM = pd.getMonth();
        const monthDiff = (y - startY) * 12 + (m - startM);
        if (p.type === 'Assinatura' || p.type === 'Recorrente') return monthDiff >= 0;
        return monthDiff >= 0 && monthDiff < p.totalInstallments;
      };

      const g = gastos.filter(gas => {
        const gd = getSafeDate(gas.date);
        return gd.getMonth() === m && gd.getFullYear() === y;
      }).reduce((acc, curr) => acc + curr.value, 0) + 
      parcelas.filter(p => {
        const pd = getSafeDate(p.date);
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.1 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full pb-10"
    >
      <motion.div variants={itemVariants} className="bg-[#0b1b42] bg-gradient-to-b from-[#0f2863] via-[#0b1b42] to-[#060e24] pt-[88px] px-4 sm:px-6 pb-32 mb-[-100px] rounded-b-[48px] relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 opacity-[0.25] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#3b82f6] rounded-full blur-[120px] opacity-[0.15] pointer-events-none"></div>
        
        <div className="flex items-center justify-between mb-10 relative z-10">
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 shadow-sm">
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
          <Link to="/relatorios" className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-[14px] flex items-center justify-center border border-white/20 shadow-sm active:scale-95 transition-transform">
            <BarChart3 className="w-5 h-5 text-white" />
          </Link>
        </div>

        <div className="flex flex-col items-center justify-center relative z-10 w-full mb-8 pt-4">
          <motion.div variants={itemVariants} className="w-full max-w-sm">
            {overdueAmount > 0 ? (
              <Link to="/contas" className="block bg-red-500/10 backdrop-blur-md rounded-[32px] p-6 border border-red-500/20 hover:bg-red-500/20 transition-all text-center group">
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30 group-hover:scale-110 transition-transform">
                  <AlertCircle className="w-6 h-6 text-red-300" />
                </div>
                <h3 className="text-red-100 font-bold text-[16px] tracking-tight mb-2">Contas em Atraso</h3>
                <p className="text-[36px] font-bold tracking-tighter text-white leading-none mb-3">
                  {overdueAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <div className="flex items-center justify-center gap-2 text-red-200">
                  <span className="text-[13px] font-medium opacity-80 group-hover:opacity-100 transition-opacity">Verifique suas pendências</span>
                  <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ) : upcomingAmount > 0 ? (
              <Link to="/contas" className="block bg-white/5 backdrop-blur-md rounded-[32px] p-6 border border-white/10 hover:bg-white/10 transition-all text-center group">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10 group-hover:scale-110 transition-transform">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white/80 font-bold text-[16px] tracking-tight mb-2">Próximos Vencimentos</h3>
                <p className="text-[36px] font-bold tracking-tighter text-white leading-none mb-3">
                  {upcomingAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <div className="flex items-center justify-center gap-2 text-white/50">
                  <span className="text-[13px] font-medium group-hover:text-white/80 transition-colors">Ver detalhes das contas</span>
                  <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ) : (
              <div className="block bg-green-500/10 backdrop-blur-md rounded-[32px] p-6 border border-green-500/20 text-center">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.1 }}
                  className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30"
                >
                  <Target className="w-6 h-6 text-green-300" />
                </motion.div>
                <h3 className="text-green-100 font-bold text-[18px] tracking-tight mb-2">Tudo em Dia!</h3>
                <p className="text-[14px] text-green-200/80 mb-2 font-medium">Nenhuma conta pendente para este mês.</p>
                <div className="flex items-center justify-center gap-2 text-green-200">
                  <span className="text-[13px] font-bold uppercase tracking-widest opacity-80">Parabéns</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="px-4 sm:px-6 relative z-20">
        <div className="bg-white dark:bg-[#2C2C2E] rounded-[32px] p-2 shadow-xl shadow-black/5 dark:shadow-black/20 flex items-center justify-evenly mb-10 border border-black/[0.03] dark:border-white/5 transition-colors duration-300">
          <button 
            onClick={() => setIsAdding('Gasto')}
            className="flex flex-col items-center gap-2 p-4 flex-1 hover:bg-slate-50 dark:hover:bg-white/5 transition-all rounded-[24px]">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-1">
              <TrendingUp className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300 tracking-tight">Enviar</span>
          </button>
          <div className="w-[1px] h-12 bg-slate-100 dark:bg-white/5"></div>
          <button 
            onClick={() => setIsAdding('Receita')}
            className="flex flex-col items-center gap-2 p-4 flex-1 hover:bg-slate-50 dark:hover:bg-white/5 transition-all rounded-[24px]">
            <div className="w-12 h-12 bg-orange-50 dark:bg-orange-500/10 text-orange-500 dark:text-orange-400 rounded-full flex items-center justify-center mb-1">
              <TrendingDown className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300 tracking-tight">Solicitar</span>
          </button>
          <div className="w-[1px] h-12 bg-slate-100 dark:bg-white/5"></div>
          <button 
            onClick={() => navigate('/contas')}
            className="flex flex-col items-center gap-2 p-4 flex-1 hover:bg-slate-50 dark:hover:bg-white/5 transition-all rounded-[24px]">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-300 rounded-full flex items-center justify-center mb-1">
              <Wallet className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300 tracking-tight">Banco</span>
          </button>
        </div>
      </motion.div>

      <div className="px-4 sm:px-6 mb-10">
        <motion.h3 variants={itemVariants} className="text-[14px] font-bold text-slate-400 uppercase tracking-widest mb-5 px-1">Atalhos rápidos</motion.h3>
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
          <Link to="/metas" className="bg-white dark:bg-[#2C2C2E] p-5 rounded-[26px] border border-black/[0.03] dark:border-white/5 shadow-sm flex items-center gap-4 iphone-button hover:bg-slate-50 dark:hover:bg-white/5 transition-colors duration-300">
            <div className="w-11 h-11 bg-slate-900 border border-slate-700 dark:border-transparent rounded-2xl flex items-center justify-center text-white shadow-lg shadow-black/10">
              <Target className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-800 dark:text-white text-[15px] tracking-tight">Objetivos</span>
          </Link>
          <Link to="/planejamento" className="bg-white dark:bg-[#2C2C2E] p-5 rounded-[26px] border border-black/[0.03] dark:border-white/5 shadow-sm flex items-center gap-4 iphone-button hover:bg-slate-50 dark:hover:bg-white/5 transition-colors duration-300">
            <div className="w-11 h-11 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/10">
              <BarChart3 className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-800 dark:text-white text-[15px] tracking-tight">Orçamento</span>
          </Link>
          <Link to="/dividas" className="bg-white dark:bg-[#2C2C2E] p-5 rounded-[26px] border border-black/[0.03] dark:border-white/5 shadow-sm flex items-center gap-4 iphone-button hover:bg-slate-50 dark:hover:bg-white/5 transition-colors duration-300">
            <div className="w-11 h-11 bg-red-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-500/10">
              <AlertCircle className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-800 dark:text-white text-[15px] tracking-tight">Dívidas</span>
          </Link>
          <Link to="/investimentos" className="bg-white dark:bg-[#2C2C2E] p-5 rounded-[26px] border border-black/[0.03] dark:border-white/5 shadow-sm flex items-center gap-4 iphone-button hover:bg-slate-50 dark:hover:bg-white/5 transition-colors duration-300">
            <div className="w-11 h-11 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-500/10">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-800 dark:text-white text-[15px] tracking-tight">Investir</span>
          </Link>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="px-4 sm:px-6">
        <div className="bg-white dark:bg-[#2C2C2E] p-8 rounded-[32px] border border-black/[0.03] dark:border-white/5 shadow-sm mb-8 transition-colors duration-300">
          <h3 className="font-bold text-slate-900 dark:text-white text-[17px] tracking-tight mb-8">Atividade Semestral</h3>
          <div className="w-full h-64 -ml-4">
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
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
      </motion.div>

      <AddModal 
        isOpen={isAdding !== null}
        onClose={() => setIsAdding(null)}
        defaultType={isAdding || 'Receita'}
      />
    </motion.div>
  );
}
