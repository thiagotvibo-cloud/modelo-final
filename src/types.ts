export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  type: TransactionType;
}

export const EXPENSE_CATEGORIES = [
  "Alimentação",
  "Moradia",
  "Transporte",
  "Saúde",
  "Educação",
  "Lazer",
  "Outros",
];

export const INCOME_CATEGORIES = [
  "Salário",
  "Investimentos",
  "Freelance",
  "Outros",
];
