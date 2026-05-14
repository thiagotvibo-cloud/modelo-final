import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export type Gasto = { id: string; description: string; date: string; value: number; method: string; status: 'Pendente' | 'Pago'; category?: string; bank?: string; account?: string; observations?: string; user_id?: string; };
export type Receita = { id: string; description: string; date: string; value: number; category: string; status: 'Previsto' | 'Recebido'; user_id?: string; bank?: string; account?: string; observations?: string; };
export type Parcela = { id: string; description: string; date: string; value: number; method: string; currentInstallment: number; totalInstallments: number; status: 'Pendente' | 'Pago'; type: 'Parcela' | 'Assinatura' | 'Recorrente'; seriesId?: string; bank?: string; account?: string; observations?: string; user_id?: string; };

export type Orcamento = { id: string; category: string; limit: number; spent: number; user_id?: string; };
export type Meta = { id: string; title: string; target: number; saved: number; deadline: string; user_id?: string; };
export type Divida = { id: string; description: string; totalAmount: number; paidAmount: number; interestRate: number; method?: string; user_id?: string; };
export type Investimento = { id: string; name: string; type: string; balance: number; yield: number; user_id?: string; };
export type Conta = { id: string; name: string; institution: string; balance: number; type: string; expectedBalance: number; user_id?: string; };

export type FinanceContextType = {
  gastos: Gasto[];
  receitas: Receita[];
  parcelas: Parcela[];
  orcamentos: Orcamento[];
  metas: Meta[];
  dividas: Divida[];
  investimentos: Investimento[];
  contas: Conta[];
  addGasto: (data: Omit<Gasto, 'id'>) => Promise<void>;
  addReceita: (data: Omit<Receita, 'id'>) => Promise<void>;
  addParcela: (data: Omit<Parcela, 'id'>) => Promise<void>;
  addMultipleParcelas: (items: Omit<Parcela, 'id'>[]) => Promise<void>;
  addOrcamento: (data: Omit<Orcamento, 'id'>) => Promise<void>;
  addMeta: (data: Omit<Meta, 'id'>) => Promise<void>;
  addDivida: (data: Omit<Divida, 'id'>) => Promise<void>;
  addInvestimento: (data: Omit<Investimento, 'id'>) => Promise<void>;
  addConta: (data: Omit<Conta, 'id'>) => Promise<void>;
  updateGasto: (id: string, data: Partial<Gasto>) => Promise<void>;
  updateReceita: (id: string, data: Partial<Receita>) => Promise<void>;
  updateParcela: (id: string, data: Partial<Parcela>) => Promise<void>;
  updateOrcamento: (id: string, data: Partial<Orcamento>) => Promise<void>;
  updateMeta: (id: string, data: Partial<Meta>) => Promise<void>;
  updateDivida: (id: string, data: Partial<Divida>) => Promise<void>;
  updateInvestimento: (id: string, data: Partial<Investimento>) => Promise<void>;
  updateConta: (id: string, data: Partial<Conta>) => Promise<void>;
  deleteGasto: (id: string) => Promise<void>;
  deleteReceita: (id: string) => Promise<void>;
  deleteParcela: (id: string) => Promise<void>;
  deleteParcelaSeries: (seriesId: string) => Promise<void>;
  deleteOrcamento: (id: string) => Promise<void>;
  deleteMeta: (id: string) => Promise<void>;
  deleteDivida: (id: string) => Promise<void>;
  deleteInvestimento: (id: string) => Promise<void>;
  deleteConta: (id: string) => Promise<void>;
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

  const sanitizePayload = (table: string, payload: any) => {
    // 1. Injeção Absoluta de user_id
    const base = {
      id: payload.id,
      user_id: user?.id,
    };

    let clean: any = { ...base };

    // 2. Extrair Apenas Colunas Válidas por Tabela + Fallbacks
    switch (table) {
      case 'gastos':
        clean = {
          ...clean,
          description: payload.description || 'Gasto sem nome',
          date: payload.date || new Date().toISOString().split('T')[0],
          value: Number(payload.value) || 0,
          method: payload.method || 'Outros',
          account: payload.account || payload.bank || 'Outros',
          status: payload.status || 'Pendente',
          category: payload.category || 'Outros',
          observations: payload.observations || '',
        };
        break;
      case 'receitas':
        clean = {
          ...clean,
          description: payload.description || 'Receita sem nome',
          date: payload.date || new Date().toISOString().split('T')[0],
          value: Number(payload.value) || 0,
          category: payload.category || 'Outras',
          status: payload.status || 'Previsto',
          account: payload.account || payload.bank || 'Outros',
          observations: payload.observations || '',
        };
        break;
      case 'parcelas':
        clean = {
          ...clean,
          description: payload.description || 'Parcela sem nome',
          date: payload.date || new Date().toISOString().split('T')[0],
          value: Number(payload.value) || 0,
          method: payload.method || 'Outros',
          account: payload.account || payload.bank || 'Outros',
          currentInstallment: Number(payload.currentInstallment) || 1,
          totalInstallments: Number(payload.totalInstallments) || 1,
          status: payload.status || 'Pendente',
          type: payload.type || 'Parcela',
          observations: payload.observations || '',
        };
        break;
      case 'contas':
        clean = {
          ...clean,
          name: payload.name || 'Nova Conta',
          type: payload.type || 'Corrente',
          balance: Number(payload.balance) || 0,
          expectedBalance: Number(payload.expectedBalance) || 0,
          institution: payload.institution || 'Geral',
        };
        break;
      case 'orcamentos':
        clean = {
          ...clean,
          category: payload.category || 'Geral',
          limit: Number(payload.limit) || 0,
          spent: Number(payload.spent) || 0,
        };
        break;
      case 'metas':
        clean = {
          ...clean,
          title: payload.title || 'Nova Meta',
          target: Number(payload.target) || 0,
          saved: Number(payload.saved) || 0,
          deadline: payload.deadline || new Date().toISOString().split('T')[0],
        };
        break;
      case 'dividas':
        clean = {
          ...clean,
          description: payload.description || 'Nova Dívida',
          totalAmount: Number(payload.totalAmount) || 0,
          paidAmount: Number(payload.paidAmount) || 0,
          interestRate: Number(payload.interestRate) || 0,
        };
        break;
      case 'investimentos':
        clean = {
          ...clean,
          name: payload.name || 'Novo Investimento',
          type: payload.type || 'Renda Fixa',
          balance: Number(payload.balance) || 0,
          yield: Number(payload.yield) || 0,
        };
        break;
      default:
        console.warn(`Table ${table} not explicitly mapped for sanitization.`);
        clean = { ...payload, user_id: user?.id };
        break;
    }

    return clean;
  };

  const syncUpsert = async (table: string, id: string, data: any) => {
    if (!supabase || !user) {
      alert("Usuário não autenticado.");
      return false;
    }
    
    const payload = sanitizePayload(table, { id, ...data, user_id: user.id });

    const { error } = await supabase.from(table).upsert(payload);
    if (error) {
      console.error(`Error syncing upsert to ${table}:`, error);
      alert(`Erro ao salvar (${table}): ${error.message}`);
      return false;
    }
    return true;
  };

  const syncDelete = async (table: string, id: string) => {
    if (!supabase || !user) {
      alert("Usuário não autenticado.");
      return false;
    }
    const { error } = await supabase.from(table).delete().eq('id', id).eq('user_id', user.id);
    if (error) {
      console.error(`Error syncing delete from ${table}:`, error);
      alert(`Erro ao excluir (${table}): ${error.message}`);
      return false;
    }
    return true;
  };

  const generateId = () => crypto.randomUUID();

  const handleBudgetUpdate = async (category: string, amountChange: number) => {
    if (!category || !user) return;
    const orc = orcamentos.find(o => o.category === category);
    if (!orc) return;
    
    const updatedOrc = { ...orc, spent: orc.spent + amountChange };
    const success = await syncUpsert('orcamentos', updatedOrc.id, updatedOrc);
    if (success) {
      setOrcamentos(prev => prev.map(o => o.id === updatedOrc.id ? updatedOrc : o));
    }
  };

  const addGasto = async (data: Omit<Gasto, 'id'>) => {
    const id = generateId();
    const newItem = { id, ...data, user_id: user?.id } as Gasto;
    const success = await syncUpsert('gastos', id, newItem);
    if (success) {
      setGastos(prev => [...prev, newItem]);
      // Update budget if possible
      handleBudgetUpdate((data as any).category, data.value);
    }
  };
  const updateGasto = async (id: string, data: Partial<Gasto>) => {
    const item = gastos.find(i => i.id === id);
    if (item) {
      const newItem = { ...item, ...data };
      const success = await syncUpsert('gastos', id, newItem);
      if (success) {
        setGastos(prev => prev.map(i => i.id === id ? newItem : i));
        
        if (data.value && data.value !== item.value) {
          handleBudgetUpdate((item as any).category, data.value - item.value);
        }
      }
    }
  };
  const deleteGasto = async (id: string) => {
    const item = gastos.find(i => i.id === id);
    if (!item) return;
    const success = await syncDelete('gastos', id);
    if (success) {
      setGastos(prev => prev.filter(i => i.id !== id));
      handleBudgetUpdate((item as any).category, -(item.value));
    }
  };

  const addReceita = async (data: Omit<Receita, 'id'>) => {
    const id = generateId();
    const newItem = { id, ...data, user_id: user?.id } as Receita;
    const success = await syncUpsert('receitas', id, newItem);
    if (success) {
      setReceitas(prev => [...prev, newItem]);
    }
  };
  const updateReceita = async (id: string, data: Partial<Receita>) => {
    const item = receitas.find(i => i.id === id);
    if (item) {
      const newItem = { ...item, ...data };
      const success = await syncUpsert('receitas', id, newItem);
      if (success) {
        setReceitas(prev => prev.map(i => i.id === id ? newItem : i));
      }
    }
  };
  const deleteReceita = async (id: string) => {
    const success = await syncDelete('receitas', id);
    if (success) {
      setReceitas(prev => prev.filter(i => i.id !== id));
    }
  };

  const addParcela = async (data: Omit<Parcela, 'id'>) => {
    const id = generateId();
    const newItem = { id, ...data, user_id: user?.id } as Parcela;
    const success = await syncUpsert('parcelas', id, newItem);
    if (success) {
      setParcelas(prev => [...prev, newItem]);
    }
  };

  const addMultipleParcelas = async (items: Omit<Parcela, 'id'>[]) => {
    if (!user) {
      alert("Usuário não autenticado.");
      return;
    }
    const newItemsWithIds = items.map(item => ({ id: generateId(), ...item, user_id: user.id })) as Parcela[];
    if (supabase) {
      const sanitizedItems = newItemsWithIds.map(item => sanitizePayload('parcelas', item));
      const { error } = await supabase.from('parcelas').upsert(sanitizedItems);
      if (error) {
        console.error('Error syncing multiple parcelas:', error);
        alert(`Erro ao salvar parcelas: ${error.message}`);
      } else {
        setParcelas(prev => [...prev, ...newItemsWithIds]);
      }
    }
  };

  const updateParcela = async (id: string, data: Partial<Parcela>) => {
    const item = parcelas.find(i => i.id === id);
    if (item) {
      const newItem = { ...item, ...data };
      const success = await syncUpsert('parcelas', id, newItem);
      if (success) {
        setParcelas(prev => prev.map(i => i.id === id ? newItem : i));
      }
    }
  };
  const deleteParcela = async (id: string) => {
    const success = await syncDelete('parcelas', id);
    if (success) {
      setParcelas(prev => prev.filter(i => i.id !== id));
    }
  };

  const deleteParcelaSeries = async (seriesId: string) => {
    const toDelete = parcelas.filter(p => p.seriesId === seriesId);
    if (toDelete.length === 0) return;
    
    if (!supabase || !user) {
      alert("Usuário não autenticado.");
      return;
    }
    
    // Delete in a single query via eq('seriesId', seriesId), wait.. actually we don't have a seriesId on table directly perhaps, let's look:
    // We can delete by matching the array of IDs to be safe
    const ids = toDelete.map(p => p.id);
    const { error } = await supabase.from('parcelas').delete().in('id', ids).eq('user_id', user.id);
    if (error) {
       console.error(`Error syncing delete series from parcelas:`, error);
       alert(`Erro ao excluir série de parcelas: ${error.message}`);
    } else {
       setParcelas(prev => prev.filter(p => p.seriesId !== seriesId));
    }
  };

  const addOrcamento = async (data: Omit<Orcamento, 'id'>) => {
    const id = generateId();
    const newItem = { id, ...data, user_id: user?.id } as Orcamento;
    const success = await syncUpsert('orcamentos', id, newItem);
    if (success) {
      setOrcamentos(prev => [...prev, newItem]);
    }
  };
  const updateOrcamento = async (id: string, data: Partial<Orcamento>) => {
    const item = orcamentos.find(i => i.id === id);
    if (item) {
      const newItem = { ...item, ...data };
      const success = await syncUpsert('orcamentos', id, newItem);
      if (success) {
        setOrcamentos(prev => prev.map(i => i.id === id ? newItem : i));
      }
    }
  };
  const deleteOrcamento = async (id: string) => {
    const success = await syncDelete('orcamentos', id);
    if (success) {
      setOrcamentos(prev => prev.filter(i => i.id !== id));
    }
  };

  const addMeta = async (data: Omit<Meta, 'id'>) => {
    const id = generateId();
    const newItem = { id, ...data, user_id: user?.id } as Meta;
    const success = await syncUpsert('metas', id, newItem);
    if (success) {
      setMetas(prev => [...prev, newItem]);
    }
  };
  const updateMeta = async (id: string, data: Partial<Meta>) => {
    const item = metas.find(i => i.id === id);
    if (item) {
      const newItem = { ...item, ...data };
      const success = await syncUpsert('metas', id, newItem);
      if (success) {
        setMetas(prev => prev.map(i => i.id === id ? newItem : i));
      }
    }
  };
  const deleteMeta = async (id: string) => {
    const success = await syncDelete('metas', id);
    if (success) {
      setMetas(prev => prev.filter(i => i.id !== id));
    }
  };

  const addDivida = async (data: Omit<Divida, 'id'>) => {
    const id = generateId();
    const newItem = { id, ...data, user_id: user?.id } as Divida;
    const success = await syncUpsert('dividas', id, newItem);
    if (success) {
      setDividas(prev => [...prev, newItem]);
    }
  };
  const updateDivida = async (id: string, data: Partial<Divida>) => {
    const item = dividas.find(i => i.id === id);
    if (item) {
      const newItem = { ...item, ...data };
      const success = await syncUpsert('dividas', id, newItem);
      if (success) {
        setDividas(prev => prev.map(i => i.id === id ? newItem : i));
      }
    }
  };
  const deleteDivida = async (id: string) => {
    const success = await syncDelete('dividas', id);
    if (success) {
      setDividas(prev => prev.filter(i => i.id !== id));
    }
  };

  const addInvestimento = async (data: Omit<Investimento, 'id'>) => {
    const id = generateId();
    const newItem = { id, ...data, user_id: user?.id } as Investimento;
    const success = await syncUpsert('investimentos', id, newItem);
    if (success) {
      setInvestimentos(prev => [...prev, newItem]);
    }
  };
  const updateInvestimento = async (id: string, data: Partial<Investimento>) => {
    const item = investimentos.find(i => i.id === id);
    if (item) {
      const newItem = { ...item, ...data };
      const success = await syncUpsert('investimentos', id, newItem);
      if (success) {
        setInvestimentos(prev => prev.map(i => i.id === id ? newItem : i));
      }
    }
  };
  const deleteInvestimento = async (id: string) => {
    const success = await syncDelete('investimentos', id);
    if (success) {
      setInvestimentos(prev => prev.filter(i => i.id !== id));
    }
  };

  const addConta = async (data: Omit<Conta, 'id'>) => {
    const id = generateId();
    const newItem = { id, ...data, user_id: user?.id } as Conta;
    const success = await syncUpsert('contas', id, newItem);
    if (success) {
      setContas(prev => [...prev, newItem]);
    }
  };
  const updateConta = async (id: string, data: Partial<Conta>) => {
    const item = contas.find(i => i.id === id);
    if (item) {
      const newItem = { ...item, ...data };
      const success = await syncUpsert('contas', id, newItem);
      if (success) {
        setContas(prev => prev.map(i => i.id === id ? newItem : i));
      }
    }
  };
  const deleteConta = async (id: string) => {
    const success = await syncDelete('contas', id);
    if (success) {
      setContas(prev => prev.filter(i => i.id !== id));
    }
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

