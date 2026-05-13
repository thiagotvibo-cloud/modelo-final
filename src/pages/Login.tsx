import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Wallet } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/resumo');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Cadastro realizado com sucesso! Você já pode fazer login.');
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro durante a autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center flex-col items-center gap-4">
          <div className="dark-gradient w-20 h-20 rounded-[28px] flex items-center justify-center shadow-2xl shadow-black/20">
            <Wallet className="w-10 h-10 text-white" />
          </div>
          <div className="text-center">
            <h2 className="text-[32px] font-bold text-black tracking-tight leading-none">
              Finança+
            </h2>
            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mt-2">{isLogin ? 'Bem-vindo de volta' : 'Comece sua jornada'}</p>
          </div>
        </div>
      </div>

      <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-md px-6">
        <div className="iphone-card py-10 px-8 sm:px-12">
          <form className="space-y-8" onSubmit={handleAuth}>
            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-sm font-bold border border-red-100 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
                E-mail
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-slate-50 border-2 border-transparent px-5 py-4 rounded-2xl text-slate-900 font-bold focus:outline-none focus:border-black focus:bg-white transition-all placeholder:text-slate-200"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
                Senha
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border-2 border-transparent px-5 py-4 rounded-2xl text-slate-900 font-bold focus:outline-none focus:border-black focus:bg-white transition-all placeholder:text-slate-200"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-16 bg-black active:scale-[0.97] text-white font-bold rounded-[22px] transition-all shadow-xl shadow-black/10 text-[17px] tracking-tight disabled:opacity-50"
              >
                {loading ? 'Processando...' : (isLogin ? 'Entrar Agora' : 'Criar Conta')}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="w-full text-center text-[13px] font-bold text-slate-400 hover:text-black uppercase tracking-widest transition-colors"
            >
              {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entrar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
