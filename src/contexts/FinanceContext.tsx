import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

export type Gasto = { id: string; description: string; date: string; value: number; method: string; status: 'Pendente' | 'Pago'; category?: string; };
export type Receita = { id: string; description: string; date: string; value: number; category: string; status: 'Previsto' | 'Recebido'; };
export type Parcela = { id: string; description: string; date: string; value: number; method: string; currentInstallment: number; totalInstallments: number; status: 'Pendente' | 'Pago'; type: 'Parcela' | 'Assinatura' | 'Recorrente'; };

export type Orcamento = { id: string; category: string; limit: number; spent: number; };
export type Meta = { id: string; title: string; target: number; saved: number; deadline: string; };
export type Divida = { id: string; description: string; totalAmount: number; paidAmount: number; interestRate: number; method?: string; };
export type Investimento = { id: string; name: string; type: string; balance: number; yield: number; };
export type Conta = { id: string; name: string; institution: string; balance: number; type: string; expectedBalance: number; };

export type NotificationSettings = {
  enabled: boolean;
  gastos: boolean;
  parcelas: boolean;
  receitas: boolean;
  metas: boolean;
  orcamentos: boolean;
};

export type FinanceContextType = {
  gastos: Gasto[];
  receitas: Receita[];
  parcelas: Parcela[];
  orcamentos: Orcamento[];
  metas: Meta[];
  dividas: Divida[];
  investimentos: Investimento[];
  contas: Conta[];
  notificationSettings: NotificationSettings;
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
  deleteOrcamento: (id: string) => void;
  deleteMeta: (id: string) => void;
  deleteDivida: (id: string) => void;
  deleteInvestimento: (id: string) => void;
  deleteConta: (id: string) => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
};

const defaultGastos: Gasto[] = [];
const defaultReceitas: Receita[] = [];
const defaultParcelas: Parcela[] = [];
const defaultOrcamentos: Orcamento[] = [];
const defaultMetas: Meta[] = [];
const defaultDividas: Divida[] = [];
const defaultInvestimentos: Investimento[] = [];
const defaultContas: Conta[] = [];

const defaultNotificationSettings: NotificationSettings = {
  enabled: true,
  gastos: true,
  parcelas: true,
  receitas: true,
  metas: true,
  orcamentos: true,
};

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
  const [orcamentos, setOrcamentos] = usePersistentState<Orcamento[]>('financa_orcamentos', defaultOrcamentos, 'orcamentos');
  const [metas, setMetas] = usePersistentState<Meta[]>('financa_metas', defaultMetas, 'metas');
  const [dividas, setDividas] = usePersistentState<Divida[]>('financa_dividas', defaultDividas, 'dividas');
  const [investimentos, setInvestimentos] = usePersistentState<Investimento[]>('financa_investimentos', defaultInvestimentos, 'investimentos');
  const [contas, setContas] = usePersistentState<Conta[]>('financa_contas', defaultContas, 'contas');
  const [notificationSettings, setNotificationSettings] = usePersistentState<NotificationSettings>('financa_notification_settings', defaultNotificationSettings, 'notification_settings');

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

  const handleBudgetUpdate = (category: string, amountChange: number) => {
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
    const oldItem = gastos.find(i => i.id === id);
    setGastos(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
    const item = gastos.find(i => i.id === id);
    if (item) syncUpsert('gastos', id, { ...item, ...data });

    // Simplistic approach: if value changes, adjust budget
    if (oldItem && data.value && data.value !== oldItem.value) {
      handleBudgetUpdate((oldItem as any).category, data.value - oldItem.value);
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

  const addMultipleParcelas = (items: Omit<Parcela, 'id'>[]) => {
    const newItemsWithIds = items.map(item => ({ id: generateId(), ...item })) as Parcela[];
    setParcelas(prev => [...prev, ...newItemsWithIds]);
    if (supabase) {
      supabase.from('parcelas').upsert(newItemsWithIds);
    }
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

  const updateNotificationSettings = (settings: Partial<NotificationSettings>) => {
    setNotificationSettings(prev => {
      const newSettings = { ...prev, ...settings };
      syncUpsert('notification_settings', 'default', newSettings);
      return newSettings;
    });
  };

  return (
    <FinanceContext.Provider value={{ 
      gastos, receitas, parcelas, orcamentos, metas, dividas, investimentos, contas,
      notificationSettings,
      addGasto, addReceita, addParcela, addMultipleParcelas, addOrcamento, addMeta, addDivida, addInvestimento, addConta,
      updateGasto, deleteGasto, updateReceita, deleteReceita, updateParcela, deleteParcela,
      updateOrcamento, deleteOrcamento, updateMeta, deleteMeta, updateDivida, deleteDivida, updateInvestimento, deleteInvestimento,
      updateConta, deleteConta, updateNotificationSettings
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

