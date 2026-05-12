import { useTransactions } from "../hooks/useTransactions";
import { OverviewCards } from "./OverviewCards";
import { TransactionForm } from "./TransactionForm";
import { TransactionTable } from "./TransactionTable";
import { ExpenseChart } from "./ExpenseChart";
import { Wallet } from "lucide-react";

export function Dashboard() {
  const { transactions, addTransaction, removeTransaction, summary } = useTransactions();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800">
                FinanceManager
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-500">
                Resumo Geral
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-8">
        
        {/* Mobile Header */}
        <div className="sm:hidden flex items-center gap-2 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            FinanceManager
          </h1>
        </div>

        <OverviewCards summary={summary} />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <TransactionForm onAdd={addTransaction} />
            
            <div>
              <h2 className="text-xl font-bold mb-4 text-slate-800">Histórico de Transações</h2>
              <TransactionTable transactions={transactions} onRemove={removeTransaction} />
            </div>
          </div>
          
          <div className="xl:col-span-1">
            <div className="sticky top-24">
              <ExpenseChart transactions={transactions} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
