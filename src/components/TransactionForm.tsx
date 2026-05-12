import React, { useState } from "react";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, TransactionType, Transaction } from "../types";
import { PlusCircle } from "lucide-react";

interface TransactionFormProps {
  onAdd: (transaction: Omit<Transaction, "id">) => void;
}

export function TransactionForm({ onAdd }: TransactionFormProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [type, setType] = useState<TransactionType>("expense");
  
  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const [category, setCategory] = useState(categories[0]);

  // Update category if type changes
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategory(newType === "income" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !date || !category) return;

    onAdd({
      description,
      amount: parseFloat(amount),
      date,
      category,
      type,
    });

    setDescription("");
    setAmount("");
    // keep date and type the same for convenience
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
      <h3 className="font-bold text-slate-800 mb-4">Nova Transação</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-500 mb-1">Descrição</label>
          <input
            type="text"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-800"
            placeholder="Ex: Conta de luz"
          />
        </div>

        <div>
           <label className="block text-sm font-medium text-slate-500 mb-1">Valor</label>
           <input
            type="number"
            step="0.01"
            min="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-800"
            placeholder="0,00"
          />
        </div>

        <div>
           <label className="block text-sm font-medium text-slate-500 mb-1">Tipo</label>
           <select
             value={type}
             onChange={(e) => handleTypeChange(e.target.value as TransactionType)}
             className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-800"
           >
             <option value="expense">Despesa</option>
             <option value="income">Receita</option>
           </select>
        </div>
        
        <div>
           <label className="block text-sm font-medium text-slate-500 mb-1">Categoria</label>
           <select
             value={category}
             onChange={(e) => setCategory(e.target.value)}
             className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-800"
           >
             {categories.map(cat => (
               <option key={cat} value={cat}>{cat}</option>
             ))}
           </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4 items-end">
        <div className="md:col-span-2">
           <label className="block text-sm font-medium text-slate-500 mb-1">Data</label>
           <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-800"
          />
        </div>

        <div className="md:col-span-3 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-2 px-6 rounded-lg transition-colors w-full md:w-auto justify-center"
          >
            <PlusCircle className="w-5 h-5" />
            Adicionar
          </button>
        </div>
      </div>
    </form>
  );
}
