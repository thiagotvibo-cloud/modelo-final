import React, { useState } from 'react';
import { useFinance } from "../contexts/FinanceContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, PieChart as PieChartIcon, BarChart3, ChevronLeft, ChevronRight } from "lucide-react";
import { getBaseDescription } from "../lib/utils";

export function Relatorios() {
  const { gastos, receitas, parcelas, contas } = useFinance();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const changeMonth = (delta: number) => {
    const d = new Date(year, month + delta, 1);
    setCurrentDate(d);
  };

  const monthName = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  const getSafeDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    const datePart = dateStr.split('T')[0];
    const [y, m, d] = datePart.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  // Helper to format currency
  const formatCurrency = (val: number) => 
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // --- MONTHLY FILTERING LOGIC ---
  
  // Deduplicate helper for recurring items in calculations
  const deduplicateMonthSeries = (items: any[]) => {
    const seen = new Map();
    return items.filter(item => {
      if (item.type === 'Assinatura' || item.type === 'Recorrente') {
        const key = item.seriesId || getBaseDescription(item.description);
        if (seen.has(key)) return false;
        seen.set(key, true);
      }
      return true;
    });
  };

  // Filter items for the selected month
  const monthGastos = gastos.filter(g => {
    const d = getSafeDate(g.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const monthReceitas = receitas.filter(r => {
    const d = getSafeDate(r.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  // For parcelas, we handle them carefully. 
  const rawMonthParcelas = parcelas.filter(p => {
    const d = getSafeDate(p.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });
  
  const monthParcelas = deduplicateMonthSeries(rawMonthParcelas);

  // Calculate Monthly Totals
  const monthlyExpenses = monthGastos.reduce((acc, curr) => acc + curr.value, 0) + 
                          monthParcelas.reduce((acc, curr) => acc + curr.value, 0);
  const monthlyIncome = monthReceitas.reduce((acc, curr) => acc + curr.value, 0);
  
  const monthlySummaryData = [
    { name: 'Receitas', value: Number(monthlyIncome.toFixed(2)), color: '#10B981' },
    { name: 'Gastos', value: Number(monthlyExpenses.toFixed(2)), color: '#EF4444' }
  ];

  // Expenses for charts (grouped by category/method)
  const allMonthlyExpenseItems = [
    ...monthGastos.map(g => ({ ...g, type: 'gasto' })),
    ...monthParcelas.map(p => ({ ...p, type: 'parcela' }))
  ];

  // 1. Monthly Gastos por Método
  const methods = Array.from(new Set(allMonthlyExpenseItems.map(g => g.method || 'Outros')));
  const monthlyMethodData = methods.map(method => {
    const spent = allMonthlyExpenseItems
      .filter(g => (g.method || 'Outros') === method)
      .reduce((acc, curr) => acc + curr.value, 0);
    return { name: method, value: Number(spent.toFixed(2)) };
  }).filter(item => item.value > 0);

  monthlyMethodData.sort((a, b) => b.value - a.value);

  // 2. Monthly Gastos por Categoria (using account/bank)
  const monthlyCategoryMap: Record<string, number> = {};
  allMonthlyExpenseItems.forEach(item => {
    let cat = (item as any).account || (item as any).bank || 'Geral';
    monthlyCategoryMap[cat] = (monthlyCategoryMap[cat] || 0) + item.value;
  });

  const monthlyCategoryData = Object.entries(monthlyCategoryMap)
    .map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }))
    .sort((a, b) => b.value - a.value);

  // --- GENERAL / ACCUMULATED LOGIC (UP TO NOW) ---
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const getDeduplicatedTotal = (items: any[]) => {
    return items.reduce((sum, p) => {
      // For recurring types or rent, only count up to current month if we are looking at "Summary/Balance"
      // to avoid future projections inflating the total.
      const isRecurring = p.type === 'Assinatura' || p.type === 'Recorrente' || p.description?.toLowerCase().includes('aluguel');
      if (isRecurring) {
        const itemDate = getSafeDate(p.date);
        if (itemDate.getFullYear() > currentYear || (itemDate.getFullYear() === currentYear && itemDate.getMonth() > currentMonth)) {
          return sum; // Skip future recurring items
        }
      }
      return sum + p.value;
    }, 0);
  };

  const totalAccumulatedExpenses = gastos.reduce((acc, curr) => acc + curr.value, 0) + 
                                  getDeduplicatedTotal(parcelas);
  const totalAccumulatedIncome = receitas.reduce((acc, curr) => acc + curr.value, 0);

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#14b8a6'];

  return (
    <div className="w-full space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-black text-slate-900 dark:text-white tracking-tight">Relatórios</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Análise do mês de {capitalizedMonth}</p>
        </div>
      </div>

      {/* Month Selector */}
      <div className="flex items-center justify-between bg-white dark:bg-[#2C2C2E] border border-black/[0.03] dark:border-white/5 rounded-[24px] p-2 shadow-sm">
        <button onClick={() => changeMonth(-1)} className="p-3 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-all">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Mês de Referência</span>
          <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">{capitalizedMonth}</span>
        </div>
        <button onClick={() => changeMonth(1)} className="p-3 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-all">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Monthly Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="iphone-card p-6 bg-green-500/5 border-green-500/10">
          <div className="flex items-center gap-3 mb-4 text-green-600 dark:text-green-400">
            <div className="p-2 bg-green-500/10 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="font-black text-[10px] uppercase tracking-[0.2em]">Receitas no Mês</span>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{formatCurrency(monthlyIncome)}</p>
        </div>
        <div className="iphone-card p-6 bg-red-500/5 border-red-500/10">
          <div className="flex items-center gap-3 mb-4 text-red-600 dark:text-red-400">
            <div className="p-2 bg-red-500/10 rounded-xl">
              <TrendingDown className="w-5 h-5" />
            </div>
            <span className="font-black text-[10px] uppercase tracking-[0.2em]">Gastos no Mês</span>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{formatCurrency(monthlyExpenses)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Bar Chart */}
        <div className="iphone-card p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white tracking-tight">Comparativo Mensal</h3>
            </div>
          </div>
          <div className="w-full h-64">
            {monthlySummaryData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySummaryData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.3} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 'bold' }} 
                  />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', background: 'rgba(255, 255, 255, 0.98)' }}
                    formatter={(value: number) => [formatCurrency(value), '']}
                    labelStyle={{ display: 'none' }}
                    itemStyle={{ padding: '0', color: '#1E293B', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={60}>
                    {monthlySummaryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                <BarChart3 className="w-8 h-8 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest">Sem dados no mês</p>
              </div>
            )}
          </div>
        </div>

        {/* Expenses by Category Pie Chart */}
        <div className="iphone-card p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-purple-500/10 rounded-xl text-purple-500">
              <PieChartIcon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white tracking-tight">Gastos por Etiqueta</h3>
          </div>
          <div className="w-full h-64 flex flex-col sm:flex-row items-center gap-6">
            {monthlyCategoryData.length > 0 ? (
              <>
                <div className="flex-1 w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={monthlyCategoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius="65%"
                        outerRadius="90%"
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {monthlyCategoryData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', background: 'rgba(255, 255, 255, 0.98)' }}
                        formatter={(value: number) => [formatCurrency(value), '']}
                        itemStyle={{ padding: '0', color: '#1E293B', fontWeight: 'bold' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full sm:w-1/2 space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {monthlyCategoryData.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 truncate tracking-tight">{item.name}</p>
                      </div>
                      <p className="text-[11px] font-black text-slate-900 dark:text-white">
                        {Math.round((item.value / monthlyExpenses) * 100)}%
                      </p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full text-slate-400 gap-2">
                <PieChartIcon className="w-8 h-8 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest">Sem lançamentos no mês</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gastos por Método Bar Chart */}
      <div className="iphone-card p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
            <DollarSign className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-white tracking-tight">Métodos de Pagamento (Mês)</h3>
        </div>
        <div className="w-full h-72">
          {monthlyMethodData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyMethodData} layout="vertical" margin={{ left: 20, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" opacity={0.3} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  width={100}
                  tick={{ fontSize: 11, fill: '#64748B', fontWeight: 'bold' }} 
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', background: 'rgba(255, 255, 255, 0.98)' }}
                  formatter={(value: number) => [formatCurrency(value), '']}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                  itemStyle={{ padding: '0', color: '#1E293B', fontWeight: 'bold' }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#3b82f6" 
                  radius={[0, 8, 8, 0]} 
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 bg-slate-50 dark:bg-white/5 rounded-3xl">
              <DollarSign className="w-8 h-8 opacity-20" />
              <p className="text-xs font-bold uppercase tracking-widest">Nenhum gasto neste mês</p>
            </div>
          )}
        </div>
      </div>

      {/* General Accumulated Summary (Footer) */}
      <div className="mt-8 p-8 rounded-[32px] bg-slate-900 text-white shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <PieChartIcon className="w-32 h-32" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-white/10 rounded-xl">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="font-bold text-[14px] uppercase tracking-[0.2em]">Acumulado Geral (Até Hoje)</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Total Recebido</p>
              <p className="text-3xl font-black tracking-tight text-green-400">
                {formatCurrency(totalAccumulatedIncome)}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Total Gasto</p>
              <p className="text-3xl font-black tracking-tight text-red-400">
                {formatCurrency(totalAccumulatedExpenses)}
              </p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Saldo Líquido Acumulado</p>
              <p className={`text-xl font-black ${(totalAccumulatedIncome - totalAccumulatedExpenses) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(totalAccumulatedIncome - totalAccumulatedExpenses)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

