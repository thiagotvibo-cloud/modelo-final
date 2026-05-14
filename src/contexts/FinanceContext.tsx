import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export type Gasto = { id: string; description: string; date: string; value: number; method: string; status: 'Pendente' | 'Pago'; category?: string; bank?: string; observations?: string; user_id?: string; };
export type Receita = { id: string; description: string; date: string; value: number; category: string; status: 'Previsto' | 'Recebido'; user_id?: string; };
export type Parcela = { id: string; description: string; date: string; value: number; method: string; currentInstallment: number; totalInstallments: number; status: 'Pendente' | 'Pago'; type: 'Parcela' | 'Assinatura' | 'Recorrente'; seriesId?: string; bank?: string; observations?: string; user_id?: string; };

export type Orcamento = { id: string; category: string; limit: number; spent: number; user_id?: string; };
export type Meta = { id: string; title: string; target: number; saved: number; deadline: string; user_id?: string; };
export type Divida = { id: string; description: string; totalAmount: number; paidAmount: number; interestRate: number; method?: string; user_id?: string; };
export type Investimento = { id: string; name: string; type: string; balance: number; yield: number; user_id?: string; };
export type Conta = { id: string; name: string; institution: string; balance: number; type: string; expectedBalance: number; color?: string; user_id?: string; };

export type FinanceContextType = {
  gastos: Gasto[];
  receitas: Receita[];
  parcelas: Parcela[];
  orcamentos: Orcamento[];
  metas: Meta[];
  dividas: Divida[];
  investimentos: Investimento[];
  contas: Conta[];
  addGasto: (data: Omit<Gasto, 'id'>) => void;
  addReceita: (data: Omit<Receita, 'id'>) => void;
  addParcela: (data: Omit<Parcela, 'id'>) => void;
  addMultipleParcelas: (items: Omit<Parcela, 'id'>[]) => void;
  addOrcamento: (data: Omit<Orcamento, 'id'>) => void;
  addMeta: (data: Omit<Meta, 'id'>) => void;
  addDivida: (data: Omit<Divida, 'id'>) => void;
  addInvestimento: (data: Omit<Investimento, 'id'>) => void;
  addConta: (data: Omit<Conta, 'id'>) => void;
  updateGasto: (id: string, data: Partial<Gasto>) => void;
  updateReceita: (id: string, data: Partial<Receita>) => void;
  updateParcela: (id: string, data: Partial<Parcela>) => void;
  updateOrcamento: (id: string, data: Partial<Orcamento>) => void;
  updateMeta: (id: string, data: Partial<Meta>) => void;
  updateDivida: (id: string, data: Partial<Divida>) => void;
  updateInvestimento: (id: string, data: Partial<Investimento>) => void;
  updateConta: (id: string, data: Partial<Conta>) => void;
  deleteGasto: (id: string) => void;
  deleteReceita: (id: string) => void;
  deleteParcela: (id: string) => void;
  deleteParcelaSeries: (seriesId: string) => void;
  deleteOrcamento: (id: string) => void;
  deleteMeta: (id: string) => void;
  deleteDivida: (id: string) => void;
  deleteInvestimento: (id: string) => void;
  deleteConta: (id: string) => void;
};

const defaultGastos: Gasto[] = [];
const defaultReceitas: Receita[] = [];
const defaultParcelas: Parcela[] = [];
const defaultOrcamentos: Orcamento[] = [];
const defaultMetas: Meta[] = [];
const defaultDividas: Divida[] = [];
const defaultInvestimentos: Investimento[] = [];
const defaultContas: Conta[] = [];

function usePersistentState<T>(key: string, defaultValue: T, tableName: string, user: any): [T, React.Dispatch<React.SetStateAction<T>>] {
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

  // Sync with Supabase on mount and Subscribe to changes
  useEffect(() => {
    if (!supabase || !user) {
      // If user logs out, we might want to clear local state to default
      if (!user && supabase) {
        setState(defaultValue);
      }
      return;
    }
    
    let isSubscribed = true;

    const fetchFromSupabase = async () => {
      const { data, error } = await supabase.from(tableName).select('*').eq('user_id', user.id);
      if (error) {
        console.error(`Error fetching ${tableName} from Supabase:`, error);
      } else if (data && isSubscribed) {
        setState(data as any);
      }
    };
    fetchFromSupabase();

    // Subscribe to real-time changes
    const channel = supabase
      .channel(`rt-${tableName}-${user.id}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: tableName, 
          filter: `user_id=eq.${user.id}` 
        },
        (payload) => {
          if (!isSubscribed) return;

          setState((prev: any) => {
            if (Array.isArray(prev)) {
              if (payload.eventType === 'INSERT') {
                const alreadyExists = prev.some(item => item.id === payload.new.id);
                if (alreadyExists) return prev;
                return [...prev, payload.new];
              }
              if (payload.eventType === 'UPDATE') {
                return prev.map(item => item.id === payload.new.id ? payload.new : item);
              }
              if (payload.eventType === 'DELETE') {
                return prev.filter(item => item.id !== payload.old.id);
              }
            } else {
              // Non-array state (like notification_settings)
              if (payload.eventType === 'DELETE') return defaultValue;
              return payload.new;
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      isSubscribed = false;
      supabase.removeChannel(channel);
    };
  }, [tableName, user]);

  return [state, setState];
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [gastos, setGastos] = usePersistentState<Gasto[]>('financa_gastos', defaultGastos, 'gastos', user);
  const [receitas, setReceitas] = usePersistentState<Receita[]>('financa_receitas', defaultReceitas, 'receitas', user);
  const [parcelas, setParcelas] = usePersistentState<Parcela[]>('financa_parcelas', defaultParcelas, 'parcelas', user);
  const [orcamentos, setOrcamentos] = usePersistentState<Orcamento[]>('financa_orcamentos', defaultOrcamentos, 'orcamentos', user);
  const [metas, setMetas] = usePersistentState<Meta[]>('financa_metas', defaultMetas, 'metas', user);
  const [dividas, setDividas] = usePersistentState<Divida[]>('financa_dividas', defaultDividas, 'dividas', user);
  const [investimentos, setInvestimentos] = usePersistentState<Investimento[]>('financa_investimentos', defaultInvestimentos, 'investimentos', user);
  const [contas, setContas] = usePersistentState<Conta[]>('financa_contas', defaultContas, 'contas', user);

  const syncUpsert = async (table: string, id: string, data: any) => {
    if (supabase && user) {
      const { error } = await supabase.from(table).upsert({ id, ...data, user_id: user.id });
      if (error) console.error(`Error syncing upsert to ${table}:`, error);
    }
  };

  const syncDelete = async (table: string, id: string) => {
    if (supabase && user) {
      const { error } = await supabase.from(table).delete().eq('id', id).eq('user_id', user.id);
      if (error) console.error(`Error syncing delete from ${table}:`, error);
    }
  };

  const generateId = () => crypto.randomUUID();

  const handleBudgetUpdate = async (category: string, amountChange: number) => {
    if (!category) return;
    setOrcamentos(prev => {
      const updated = prev.map(orc => 
        orc.category === category ? { ...orc, spent: orc.spent + amountChange } : orc
      );
      const updatedOrc = updated.find(c => c.category === category);
      if (updatedOrc) syncUpsert('orcamentos', updatedOrc.id, updatedOrc);
      return updated;
    });
  };

  const addGasto = (data: Omit<Gasto, 'id'>) => {
    const id = generateId();
    const newItem = { id, ...data } as Gasto;
    setGastos(prev => [...prev, newItem]);
    syncUpsert('gastos', id, newItem);
    // Update budget if possible
    handleBudgetUpdate((data as any).category, data.value);
  };
  const updateGasto = (id: string, data: Partial<Gasto>) => {
    const item = gastos.find(i => i.id === id);
    if (item) {
      const newItem = { ...item, ...data };
      setGastos(prev => prev.map(i => i.id === id ? newItem : i));
      syncUpsert('gastos', id, newItem);
      
      if (data.value && data.value !== item.value) {
        handleBudgetUpdate((item as any).category, data.value - item.value);
      }
    }
  };
  const deleteGasto = (id: string) => {
    const item = gastos.find(i => i.id === id);
    setGastos(prev => prev.filter(i => i.id !== id));
    syncDelete('gastos', id);
    if (item) {
      handleBudgetUpdate((item as any).category, -(item.value));
    }
  };

  const addReceita = (data: Omit<Receita, 'id'>) => {
    const id = generateId();
    const newItem = { id, ...data } as Receita;
    setReceitas(prev => [...prev, newItem]);
    syncUpsert('receitas', id, newItem);
  };
  const updateReceita = (id: string, data: Partial<Receita>) => {
    const item = receitas.find(i => i.id === id);
    if (item) {
      const newItem = { ...item, ...data };
      setReceitas(prev => prev.map(i => i.id === id ? newItem : i));
      syncUpsert('receitas', id, newItem);
    }
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

  const addMultipleParcelas = async (items: Omit<Parcela, 'id'>[]) => {
    const newItemsWithIds = items.map(item => ({ id: generateId(), ...item, user_id: user?.id })) as Parcela[];
    setParcelas(prev => [...prev, ...newItemsWithIds]);
    if (supabase) {
      const { error } = await supabase.from('parcelas').upsert(newItemsWithIds);
      if (error) console.error('Error syncing multiple parcelas:', error);
    }
  };

  const updateParcela = (id: string, data: Partial<Parcela>) => {
    const item = parcelas.find(i => i.id === id);
    if (item) {
      const newItem = { ...item, ...data };
      setParcelas(prev => prev.map(i => i.id === id ? newItem : i));
      syncUpsert('parcelas', id, newItem);
    }
  };
  const deleteParcela = (id: string) => {
    setParcelas(prev => prev.filter(i => i.id !== id));
    syncDelete('parcelas', id);
  };

  const deleteParcelaSeries = (seriesId: string) => {
    const toDelete = parcelas.filter(p => p.seriesId === seriesId);
    setParcelas(prev => prev.filter(p => p.seriesId !== seriesId));
    if (supabase) {
      toDelete.forEach(p => syncDelete('parcelas', p.id));
    }
  };

  const addOrcamento = (data: Omit<Orcamento, 'id'>) => {
    const id = generateId();
    const newItem = { id, ...data } as Orcamento;
    setOrcamentos(prev => [...prev, newItem]);
    syncUpsert('orcamentos', id, newItem);
  };
  const updateOrcamento = (id: string, data: Partial<Orcamento>) => {
    const item = orcamentos.find(i => i.id === id);
    if (item) {
      const newItem = { ...item, ...data };
      setOrcamentos(prev => prev.map(i => i.id === id ? newItem : i));
      syncUpsert('orcamentos', id, newItem);
    }
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
    const item = metas.find(i => i.id === id);
    if (item) {
      const newItem = { ...item, ...data };
      setMetas(prev => prev.map(i => i.id === id ? newItem : i));
      syncUpsert('metas', id, newItem);
    }
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
    const item = dividas.find(i => i.id === id);
    if (item) {
      const newItem = { ...item, ...data };
      setDividas(prev => prev.map(i => i.id === id ? newItem : i));
      syncUpsert('dividas', id, newItem);
    }
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
    const item = investimentos.find(i => i.id === id);
    if (item) {
      const newItem = { ...item, ...data };
      setInvestimentos(prev => prev.map(i => i.id === id ? newItem : i));
      syncUpsert('investimentos', id, newItem);
    }
  };
  const deleteInvestimento = (id: string) => {
    setInvestimentos(prev => prev.filter(i => i.id !== id));
    syncDelete('investimentos', id);
  };

  const addConta = (data: Omit<Conta, 'id'>) => {
    const id = generateId();
    const newItem = { id, ...data } as Conta;
    setContas(prev => [...prev, newItem]);
    syncUpsert('contas', id, newItem);
  };
  const updateConta = (id: string, data: Partial<Conta>) => {
    const item = contas.find(i => i.id === id);
    if (item) {
      const newItem = { ...item, ...data };
      setContas(prev => prev.map(i => i.id === id ? newItem : i));
      syncUpsert('contas', id, newItem);
    }
  };
  const deleteConta = (id: string) => {
    setContas(prev => prev.filter(i => i.id !== id));
    syncDelete('contas', id);
  };

  return (
    <FinanceContext.Provider value={{ 
      gastos, receitas, parcelas, orcamentos, metas, dividas, investimentos, contas,
      addGasto, addReceita, addParcela, addMultipleParcelas, addOrcamento, addMeta, addDivida, addInvestimento, addConta,
      updateGasto, deleteGasto, updateReceita, deleteReceita, updateParcela, deleteParcela, deleteParcelaSeries,
      updateOrcamento, deleteOrcamento, updateMeta, deleteMeta, updateDivida, deleteDivida, updateInvestimento, deleteInvestimento,
      updateConta, deleteConta
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

