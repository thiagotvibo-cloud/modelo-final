import { useState, useEffect } from "react";
import { Download, Moon, Shield, CreditCard, HelpCircle, LogOut, ChevronRight, Sun } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useFinance } from "../contexts/FinanceContext";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

export function Perfil() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const { user, role, setRole } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { lastSync } = useFinance();

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert("Seu navegador não suporta a instalação de PWA ou o app já está instalado.");
    }
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      navigate('/login');
    }
  };

  return (
    <div className="w-full pb-8">
      <div className="flex items-center gap-6 iphone-card p-6 mb-10 dark:bg-[#2C2C2E]">
        <div className="w-16 h-16 bg-slate-900 dark:bg-[#1a1a1c] rounded-full flex items-center justify-center text-white font-bold text-2xl uppercase shadow-lg shadow-black/20 border-2 border-slate-100 dark:border-white/10">
          U
        </div>
        <div>
           <h2 className="font-bold text-slate-900 dark:text-slate-100 text-[20px] tracking-tight">Minha Conta</h2>
           <p className="hidden text-[13px] text-slate-400 font-medium mb-2">{user?.email}</p>
        </div>
      </div>

      <div className="mb-10">
        <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4 px-2">Configurações</h3>
        
        <div className="bg-white dark:bg-[#2C2C2E] border border-black/[0.03] dark:border-white/5 rounded-[28px] overflow-hidden shadow-sm mb-4">
          <div className="w-full flex items-center justify-between p-5 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#1F1F1F] flex items-center justify-center text-slate-900 dark:text-slate-100">
                <Shield className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Perfil de Acesso
              </span>
            </div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'Administrador' | 'Membro')}
              className="bg-slate-100 dark:bg-black/20 text-slate-700 dark:text-slate-300 font-bold px-3 py-1.5 rounded-lg text-sm border-none focus:ring-0"
            >
              <option value="Administrador">Administrador</option>
              <option value="Membro">Membro</option>
            </select>
          </div>
        </div>

        <div className="bg-white dark:bg-[#2C2C2E] border border-black/[0.03] dark:border-white/5 rounded-[28px] overflow-hidden shadow-sm mb-6">
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-[#343437] transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#1F1F1F] flex items-center justify-center text-slate-900 dark:text-slate-100">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </div>
              <span className="font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Modo Escuro
              </span>
            </div>
            <div className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${theme === 'dark' ? 'bg-[#3b82f6]' : 'bg-slate-200 dark:bg-[#1F1F1F]'}`}>
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
          </button>
        </div>
      </div>

      <button 
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-3 p-6 bg-white dark:bg-[#2C2C2E] border border-black/[0.03] dark:border-white/5 rounded-[28px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all active:scale-[0.98] shadow-sm tracking-tight"
      >
        <LogOut className="w-5 h-5" strokeWidth={2.5} />
        Sair da Conta
      </button>

      <div className="mt-8 text-center">
        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
          Última atualização: {lastSync || 'Sincronizando...'}
        </p>
      </div>
    </div>
  );
}
