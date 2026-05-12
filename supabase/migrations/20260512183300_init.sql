-- Create tables for Finança+ App

CREATE TABLE IF NOT EXISTS public.gastos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
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
  user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  date TEXT NOT NULL,
  value NUMERIC NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.parcelas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
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
  user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  balance NUMERIC NOT NULL,
  "expectedBalance" NUMERIC NOT NULL,
  institution TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.orcamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  "limit" NUMERIC NOT NULL,
  spent NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.metas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target NUMERIC NOT NULL,
  saved NUMERIC NOT NULL,
  deadline TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.dividas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  "totalAmount" NUMERIC NOT NULL,
  "paidAmount" NUMERIC NOT NULL,
  "interestRate" NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.investimentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  balance NUMERIC NOT NULL,
  yield NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parcelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orcamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dividas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investimentos ENABLE ROW LEVEL SECURITY;

-- Creating Policies for Gastos
CREATE POLICY "Users can only select their own gastos" ON public.gastos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can only insert their own gastos" ON public.gastos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can only update their own gastos" ON public.gastos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can only delete their own gastos" ON public.gastos FOR DELETE USING (auth.uid() = user_id);

-- Creating Policies for Receitas
CREATE POLICY "Users can only select their own receitas" ON public.receitas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can only insert their own receitas" ON public.receitas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can only update their own receitas" ON public.receitas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can only delete their own receitas" ON public.receitas FOR DELETE USING (auth.uid() = user_id);

-- Creating Policies for Parcelas
CREATE POLICY "Users can only select their own parcelas" ON public.parcelas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can only insert their own parcelas" ON public.parcelas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can only update their own parcelas" ON public.parcelas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can only delete their own parcelas" ON public.parcelas FOR DELETE USING (auth.uid() = user_id);

-- Creating Policies for Contas
CREATE POLICY "Users can only select their own contas" ON public.contas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can only insert their own contas" ON public.contas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can only update their own contas" ON public.contas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can only delete their own contas" ON public.contas FOR DELETE USING (auth.uid() = user_id);

-- Creating Policies for Orcamentos
CREATE POLICY "Users can only select their own orcamentos" ON public.orcamentos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can only insert their own orcamentos" ON public.orcamentos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can only update their own orcamentos" ON public.orcamentos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can only delete their own orcamentos" ON public.orcamentos FOR DELETE USING (auth.uid() = user_id);

-- Creating Policies for Metas
CREATE POLICY "Users can only select their own metas" ON public.metas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can only insert their own metas" ON public.metas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can only update their own metas" ON public.metas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can only delete their own metas" ON public.metas FOR DELETE USING (auth.uid() = user_id);

-- Creating Policies for Dividas
CREATE POLICY "Users can only select their own dividas" ON public.dividas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can only insert their own dividas" ON public.dividas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can only update their own dividas" ON public.dividas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can only delete their own dividas" ON public.dividas FOR DELETE USING (auth.uid() = user_id);

-- Creating Policies for Investimentos
CREATE POLICY "Users can only select their own investimentos" ON public.investimentos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can only insert their own investimentos" ON public.investimentos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can only update their own investimentos" ON public.investimentos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can only delete their own investimentos" ON public.investimentos FOR DELETE USING (auth.uid() = user_id);
