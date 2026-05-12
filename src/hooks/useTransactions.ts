import { useState, useEffect } from "react";
import { Transaction } from "../types";

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const stored = localStorage.getItem("finances_transactions");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error reading from local storage", error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("finances_transactions", JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction = {
      ...transaction,
      id: crypto.randomUUID(),
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const removeTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const getSummary = () => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + t.amount, 0);

    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0);

    return {
      income,
      expense,
      balance: income - expense,
    };
  };

  return {
    transactions,
    addTransaction,
    removeTransaction,
    summary: getSummary(),
  };
}
