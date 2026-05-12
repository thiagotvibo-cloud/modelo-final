import { ArrowDownCircle, ArrowUpCircle, DollarSign } from "lucide-react";
import { formatCurrency } from "../lib/utils";

interface Summary {
  income: number;
  expense: number;
  balance: number;
}

export function OverviewCards({ summary }: { summary: Summary }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-green-50 rounded-lg">
            <ArrowUpCircle className="text-green-600 w-6 h-6" />
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Entradas</h3>
        </div>
        <p className="text-3xl font-bold text-slate-800">
          {formatCurrency(summary.income)}
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-red-50 rounded-lg">
            <ArrowDownCircle className="text-red-600 w-6 h-6" />
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Saídas</h3>
        </div>
        <p className="text-3xl font-bold text-slate-800">
          {formatCurrency(summary.expense)}
        </p>
      </div>

      <div className="bg-blue-600 p-6 rounded-2xl shadow-lg shadow-blue-200 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-blue-500 rounded-lg">
            <DollarSign className="text-white w-6 h-6" />
          </div>
          <h3 className="text-blue-100 text-sm font-medium">Saldo Total</h3>
        </div>
        <p className="text-3xl font-bold text-white">
          {formatCurrency(summary.balance)}
        </p>
      </div>
    </div>
  );
}
