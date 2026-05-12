-- Create tables for Finança+ App

CREATE TABLE IF NOT EXISTS public.gastos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  date TEXT NOT NULL,
  value NUMERIC NOT NULL,
  method TEXT NOT NULL,
  account TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.receitas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  date TEXT NOT NULL,
  value NUMERIC NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.parcelas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  date TEXT NOT NULL,
  value NUMERIC NOT NULL,
  method TEXT NOT NULL,
  account TEXT NOT NULL,
  "currentInstallment" INTEGER NOT NULL,
  "totalInstallments" INTEGER NOT NULL,
  status TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.contas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  balance NUMERIC NOT NULL,
  "expectedBalance" NUMERIC NOT NULL,
  institution TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.orcamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  "limit" NUMERIC NOT NULL,
  spent NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.metas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  target NUMERIC NOT NULL,
  saved NUMERIC NOT NULL,
  deadline TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.dividas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  "totalAmount" NUMERIC NOT NULL,
  "paidAmount" NUMERIC NOT NULL,
  "interestRate" NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.investimentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  balance NUMERIC NOT NULL,
  yield NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: RLS (Row Level Security) and Policies could be added here
-- For simplicity and local-first parity, assuming authenticated or public service keys.
-- Using auth.uid() is recommended for a production, multi-user environment.
