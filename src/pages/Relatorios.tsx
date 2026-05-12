import { useFinance } from "../contexts/FinanceContext";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export function Relatorios() {
  const { gastos, orcamentos } = useFinance();

  const data = orcamentos.map(orc => {
    // Or we could calculate directly from gastos
    const spent = gastos.filter(g => (g as any).category === orc.category).reduce((acc, curr) => acc + curr.value, 0);
    return { name: orc.category, value: spent || orc.spent || 0 };
  }).filter(item => item.value > 0);

  const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef'];

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-slate-800">Relatórios</h1>
        <p className="text-sm text-slate-500 mt-1">Análise completas das suas finanças</p>
      </div>
      
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6">
        <h3 className="font-bold text-slate-800 mb-4">Gastos por Categoria</h3>
        <div className="w-full h-64">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-slate-400">
              Nenhum dado para exibir
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
