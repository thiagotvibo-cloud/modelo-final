import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

export type Gasto = { id: string; description: string; date: string; value: number; method: string; account: string; status: 'Pendente' | 'Pago'; };
export type Receita = { id: string; description: string; date: string; value: number; category: string; status: 'Previsto' | 'Recebido'; };
export type Parcela = { id: string; description: string; date: string; value: number; method: string; account: string; currentInstallment: number; totalInstallments: number; status: 'Pendente' | 'Pago'; type: 'Parcela' | 'Assinatura'; };
export type Conta = { id: string; name: string; type: string; balance: number; expectedBalance: number; institution: string; };

export type Orcamento = { id: string; category: string; limit: number; spent: number; };
export type Meta = { id: string; title: string; target: number; saved: number; deadline: string; };
export type Divida = { id: string; description: string; totalAmount: number; paidAmount: number; interestRate: number; };
export type Investimento = { id: string; name: string; type: string; balance: number; yield: number; };

export type FinanceContextType = {
  gastos: Gasto[];
  receitas: Receita[];
  parcelas: Parcela[];
  contas: Conta[];
  orcamentos: Orcamento[];
  metas: Meta[];
  dividas: Divida[];
  investimentos: Investimento[];
  addGasto: (data: Omit<Gasto, 'id'>) => void;
  addReceita: (data: Omit<Receita, 'id'>) => void;
  addParcela: (data: Omit<Parcela, 'id'>) => void;
  addConta: (data: Omit<Conta, 'id'>) => void;
  addOrcamento: (data: Omit<Orcamento, 'id'>) => void;
  addMeta: (data: Omit<Meta, 'id'>) => void;
  addDivida: (data: Omit<Divida, 'id'>) => void;
  addInvestimento: (data: Omit<Investimento, 'id'>) => void;
  updateGasto: (id: string, data: Partial<Gasto>) => void;
  updateReceita: (id: string, data: Partial<Receita>) => void;
  updateParcela: (id: string, data: Partial<Parcela>) => void;
  updateConta: (id: string, data: Partial<Conta>) => void;
  updateOrcamento: (id: string, data: Partial<Orcamento>) => void;
  updateMeta: (id: string, data: Partial<Meta>) => void;
  updateDivida: (id: string, data: Partial<Divida>) => void;
  updateInvestimento: (id: string, data: Partial<Investimento>) => void;
  deleteGasto: (id: string) => void;
  deleteReceita: (id: string) => void;
  deleteParcela: (id: string) => void;
  deleteConta: (id: string) => void;
  deleteOrcamento: (id: string) => void;
  deleteMeta: (id: string) => void;
  deleteDivida: (id: string) => void;
  deleteInvestimento: (id: string) => void;
};

const defaultGastos: Gasto[] = [
  { id: '1', description: 'Internet', date: '09 de mai', value: 120, method: 'DEBITO', account: 'Nubank Kely - 0522', status: 'Pago' },
  { id: '2', description: 'Faculdade Kely', date: '10 de mai', value: 259, method: 'BOLETO', account: '', status: 'Pendente' },
  { id: '3', description: 'Aluguel', date: '10 de mai', value: 1500, method: 'PIX', account: '', status: 'Pago' },
];

const defaultReceitas: Receita[] = [
  { id: '1', description: 'Salário Thiago', date: '05 de mai', value: 5000, category: 'Salário', status: 'Recebido' },
  { id: '2', description: 'Salário Kely', date: '05 de mai', value: 3500, category: 'Salário', status: 'Recebido' },
  { id: '3', description: 'Terreno Parcela 16/60', date: '05 de mai', value: 1000, category: 'Aluguel', status: 'Previsto' },
];

const defaultParcelas: Parcela[] = [
  { id: '1', description: 'Mesa Sinuca', date: 'Vence dia 10', value: 78.88, method: 'CREDITO', account: 'Bradesco Kely', currentInstallment: 3, totalInstallments: 10, status: 'Pendente', type: 'Parcela' },
  { id: '2', description: 'Cortina Sala de Jogos', date: 'Vence dia 10', value: 55.83, method: 'CREDITO', account: 'Bradesco Kely', currentInstallment: 3, totalInstallments: 3, status: 'Pago', type: 'Parcela' }
];

const defaultContas: Conta[] = [
  { id: '1', name: 'Bradesco JThiago', type: 'Conta Corrente', balance: 17822.42, expectedBalance: 17534.50, institution: 'Bradesco' },
  { id: '2', name: 'Nubank Thiago', type: 'Conta Corrente', balance: 0.12, expectedBalance: 0.12, institution: 'Nubank' }
];

const defaultOrcamentos: Orcamento[] = [
  { id: '1', category: 'Alimentação', limit: 1200, spent: 850 },
  { id: '2', category: 'Lazer', limit: 500, spent: 480 },
];

const defaultMetas: Meta[] = [
  { id: '1', title: 'Reserva de Emergência', target: 20000, saved: 15000, deadline: 'Dez/2026' },
  { id: '2', title: 'Trocar Carro', target: 50000, saved: 8000, deadline: 'Jan/2027' },
];

const defaultDividas: Divida[] = [
  { id: '1', description: 'Empréstimo Caixa', totalAmount: 15000, paidAmount: 3000, interestRate: 1.5 },
];

const defaultInvestimentos: Investimento[] = [
  { id: '1', name: 'CDB Liquidez Diária', type: 'Renda Fixa', balance: 15000, yield: 105 },
  { id: '2', name: 'Tesouro IPCA+', type: 'Tesouro Direto', balance: 5000, yield: 45 },
];

function usePersistentState<T>(key: string, defaultValue: T, tableName: string): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, state]);

  // Sync with Supabase on mount
  useEffect(() => {
    if (!supabase) return;
    
    const fetchFromSupabase = async () => {
      const { data, error } = await supabase.from(tableName).select('*');
      if (error) {
        console.error(`Error fetching ${tableName} from Supabase:`, error);
      } else if (data && data.length > 0) {
        setState(data as any);
      }
    };
    fetchFromSupabase();
  }, [tableName]);

  return [state, setState];
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [gastos, setGastos] = usePersistentState<Gasto[]>('financa_gastos', defaultGastos, 'gastos');
  const [receitas, setReceitas] = usePersistentState<Receita[]>('financa_receitas', defaultReceitas, 'receitas');
  const [parcelas, setParcelas] = usePersistentState<Parcela[]>('financa_parcelas', defaultParcelas, 'parcelas');
  const [contas, setContas] = usePersistentState<Conta[]>('financa_contas', defaultContas, 'contas');
  const [orcamentos, setOrcamentos] = usePersistentState<Orcamento[]>('financa_orcamentos', defaultOrcamentos, 'orcamentos');
  const [metas, setMetas] = usePersistentState<Meta[]>('financa_metas', defaultMetas, 'metas');
  const [dividas, setDividas] = usePersistentState<Divida[]>('financa_dividas', defaultDividas, 'dividas');
  const [investimentos, setInvestimentos] = usePersistentState<Investimento[]>('financa_investimentos', defaultInvestimentos, 'investimentos');

  const syncUpsert = async (table: string, id: string, data: any) => {
    if (supabase) {
      await supabase.from(table).upsert({ id, ...data });
    }
  };

  const syncDelete = async (table: string, id: string) => {
    if (supabase) {
      await supabase.from(table).delete().eq('id', id);
    }
  };

  const generateId = () => crypto.randomUUID();

  const addGasto = (data: Omit<Gasto, 'id'>) => {
    const id = generateId();
    const newItem = { id, ...data } as Gasto;
    setGastos(prev => [...prev, newItem]);
    syncUpsert('gastos', id, newItem);
  };
  const updateGasto = (id: string, data: Partial<Gasto>) => {
    setGastos(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
    const item = gastos.find(i => i.id === id);
    if (item) syncUpsert('gastos', id, { ...item, ...data });
  };
  const deleteGasto = (id: string) => {
    setGastos(prev => prev.filter(i => i.id !== id));
    syncDelete('gastos', id);
  };

  const addReceita = (data: Omit<Receita, 'id'>) => {
    const id = generateId();
    const newItem = { id, ...data } as Receita;
    setReceitas(prev => [...prev, newItem]);
    syncUpsert('receitas', id, newItem);
  };
  const updateReceita = (id: string, data: Partial<Receita>) => {
    setReceitas(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
    const item = receitas.find(i => i.id === id);
    if (item) syncUpsert('receitas', id, { ...item, ...data });
  };
  const deleteReceita = (id: string) => {
    setReceitas(prev => prev.filter(i => i.id !== id));
    syncDelete('receitas', id);
  };

  const addParcela = (data: Omit<Parcela, 'id'>) => {
    const id = generateId();
    const newItem = { id, ...data } as Parcela;
    setParcelas(prev => [...prev, newItem]);
    syncUpsert('parcelas', id, newItem);
  };
  const updateParcela = (id: string, data: Partial<Parcela>) => {
    setParcelas(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
    const item = parcelas.find(i => i.id === id);
    if (item) syncUpsert('parcelas', id, { ...item, ...data });
  };
  const deleteParcela = (id: string) => {
    setParcelas(prev => prev.filter(i => i.id !== id));
    syncDelete('parcelas', id);
  };

  const addConta = (data: Omit<Conta, 'id'>) => {
    const id = generateId();
    const newItem = { id, ...data } as Conta;
    setContas(prev => [...prev, newItem]);
    syncUpsert('contas', id, newItem);
  };
  const updateConta = (id: string, data: Partial<Conta>) => {
    setContas(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
    const item = contas.find(i => i.id === id);
    if (item) syncUpsert('contas', id, { ...item, ...data });
  };
  const deleteConta = (id: string) => {
    setContas(prev => prev.filter(i => i.id !== id));
    syncDelete('contas', id);
  };

  const addOrcamento = (data: Omit<Orcamento, 'id'>) => {
    const id = generateId();
    const newItem = { id, ...data } as Orcamento;
    setOrcamentos(prev => [...prev, newItem]);
    syncUpsert('orcamentos', id, newItem);
  };
  const updateOrcamento = (id: string, data: Partial<Orcamento>) => {
    setOrcamentos(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
    const item = orcamentos.find(i => i.id === id);
    if (item) syncUpsert('orcamentos', id, { ...item, ...data });
  };
  const deleteOrcamento = (id: string) => {
    setOrcamentos(prev => prev.filter(i => i.id !== id));
    syncDelete('orcamentos', id);
  };

  const addMeta = (data: Omit<Meta, 'id'>) => {
    const id = generateId();
    const newItem = { id, ...data } as Meta;
    setMetas(prev => [...prev, newItem]);
    syncUpsert('metas', id, newItem);
  };
  const updateMeta = (id: string, data: Partial<Meta>) => {
    setMetas(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
    const item = metas.find(i => i.id === id);
    if (item) syncUpsert('metas', id, { ...item, ...data });
  };
  const deleteMeta = (id: string) => {
    setMetas(prev => prev.filter(i => i.id !== id));
    syncDelete('metas', id);
  };

  const addDivida = (data: Omit<Divida, 'id'>) => {
    const id = generateId();
    const newItem = { id, ...data } as Divida;
    setDividas(prev => [...prev, newItem]);
    syncUpsert('dividas', id, newItem);
  };
  const updateDivida = (id: string, data: Partial<Divida>) => {
    setDividas(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
    const item = dividas.find(i => i.id === id);
    if (item) syncUpsert('dividas', id, { ...item, ...data });
  };
  const deleteDivida = (id: string) => {
    setDividas(prev => prev.filter(i => i.id !== id));
    syncDelete('dividas', id);
  };

  const addInvestimento = (data: Omit<Investimento, 'id'>) => {
    const id = generateId();
    const newItem = { id, ...data } as Investimento;
    setInvestimentos(prev => [...prev, newItem]);
    syncUpsert('investimentos', id, newItem);
  };
  const updateInvestimento = (id: string, data: Partial<Investimento>) => {
    setInvestimentos(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
    const item = investimentos.find(i => i.id === id);
    if (item) syncUpsert('investimentos', id, { ...item, ...data });
  };
  const deleteInvestimento = (id: string) => {
    setInvestimentos(prev => prev.filter(i => i.id !== id));
    syncDelete('investimentos', id);
  };

  return (
    <FinanceContext.Provider value={{ 
      gastos, receitas, parcelas, contas, orcamentos, metas, dividas, investimentos, 
      updateGasto, deleteGasto, updateReceita, deleteReceita, updateParcela, deleteParcela, updateConta, deleteConta,
      updateOrcamento, deleteOrcamento, updateMeta, deleteMeta, updateDivida, deleteDivida, updateInvestimento, deleteInvestimento
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}

