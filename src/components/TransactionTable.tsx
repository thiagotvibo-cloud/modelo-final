import { Transaction } from "../types";
import { formatCurrency, formatDate } from "../lib/utils";
import { Trash2, TrendingDown, TrendingUp } from "lucide-react";

interface TransactionTableProps {
  transactions: Transaction[];
  onRemove: (id: string) => void;
}

export function TransactionTable({ transactions, onRemove }: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center text-slate-500">
        Nenhuma transação encontrada.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Descrição</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Valor</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Categoria</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Data</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                <td className="py-4 px-6">
                  <div className="text-sm font-bold text-slate-800">{t.description}</div>
                </td>
                <td className="py-4 px-6">
                  <span
                    className={`inline-flex items-center gap-1 font-bold text-sm ${
                      t.type === "income" ? "text-green-600" : "text-slate-800"
                    }`}
                  >
                    {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-xs font-medium text-slate-500">
                    {t.category}
                  </span>
                </td>
                <td className="py-4 px-6 text-slate-500 text-sm">{formatDate(t.date)}</td>
                <td className="py-4 px-6 text-right">
                  <button
                    onClick={() => onRemove(t.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-2"
                    title="Remover transação"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
