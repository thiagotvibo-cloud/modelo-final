import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
  const payload = {
    description: 'Teste',
    date: '2023-01-01',
    value: 10,
    method: 'Outros',
    account: 'Outros',
    currentInstallment: 1,
    totalInstallments: 1,
    status: 'Pendente',
    type: 'Parcela',
    series_id: '123'
  };
  
  const { data: d2, error: e2 } = await supabase.from('parcelas').insert(payload);
  console.log("With series_id ERROR:", e2);
}
testInsert();
