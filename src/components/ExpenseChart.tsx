import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Transaction } from "../types";
import { formatCurrency } from "../lib/utils";

interface ExpenseChartProps {
  transactions: Transaction[];
}

const COLORS = ['#2563eb', '#475569', '#059669', '#ea580c', '#8b5cf6', '#ec4899', '#64748b'];

export function ExpenseChart({ transactions }: ExpenseChartProps) {
  const expenses = transactions.filter((t) => t.type === "expense");
  
  if (expenses.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center h-full min-h-[300px]">
        <p className="text-slate-500 text-sm">Sem despesas para exibir no gráfico.</p>
      </div>
    );
  }

  // Aggregate by category
  const dataMap = expenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(dataMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col">
      <h3 className="font-bold text-slate-800 mb-6">Despesas por Categoria</h3>
      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
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
            <Tooltip 
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
