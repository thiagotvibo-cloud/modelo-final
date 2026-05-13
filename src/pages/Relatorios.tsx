import { useFinance } from "../contexts/FinanceContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

export function Relatorios() {
  const { gastos } = useFinance();

  const methods = Array.from(new Set(gastos.map(g => g.method)));
  const data = methods.map(method => {
    const spent = gastos.filter(g => g.method === method).reduce((acc, curr) => acc + curr.value, 0);
    return { name: method, value: spent };
  }).filter(item => item.value > 0);

  // Sorting descending by value so the highest bar is first
  data.sort((a, b) => b.value - a.value);

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-slate-800">Relatórios</h1>
        <p className="text-sm text-slate-500 mt-1">Análise completas das suas finanças</p>
      </div>
      
      <div className="bg-white p-6 rounded-3xl border border-black/[0.03] shadow-sm mb-6">
        <h3 className="font-bold text-slate-800 mb-6 tracking-tight">Gastos por Método</h3>
        <div className="w-full h-72">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 'bold' }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  width={80}
                  tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 'bold' }}
                  tickFormatter={(value) => `R$ ${value}`}
                />
                <Tooltip 
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  itemStyle={{ fontSize: '14px', fontWeight: 'bold', color: '#0F172A' }}
                  labelStyle={{ fontSize: '11px', color: '#64748B', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}
                  formatter={(value: number) => [value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), 'Gasto']}
                />
                <Bar 
                  dataKey="value" 
                  fill="#3b82f6" 
                  radius={[6, 6, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-sm font-medium text-slate-400 bg-slate-50 rounded-2xl">
              Nenhum dado para exibir
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
