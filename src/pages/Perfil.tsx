import { useState, useEffect } from "react";
import { Download, Bell, Moon, Shield, CreditCard, HelpCircle, LogOut, ChevronRight, Sun } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useFinance } from "../contexts/FinanceContext";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

export function Perfil() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const { user } = useAuth();
  const { notificationSettings, updateNotificationSettings } = useFinance();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

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
        <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-2xl uppercase shadow-lg shadow-black/20 border-2 border-white">
          {user?.email?.substring(0, 2) || 'US'}
        </div>
        <div>
           <h2 className="font-bold text-slate-900 dark:text-slate-100 text-[20px] tracking-tight">{user?.email?.split('@')[0]}</h2>
           <p className="text-[13px] text-slate-400 font-medium mb-2">{user?.email}</p>
        </div>
      </div>

      <div className="mb-10">
        <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4 px-2">Configurações</h3>
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

        <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4 px-2 flex items-center gap-2">
          <Bell className="w-5 h-5" /> Notificações e Avisos
        </h3>
        <div className="bg-white dark:bg-[#2C2C2E] border border-black/[0.03] dark:border-white/5 rounded-[28px] overflow-hidden shadow-sm flex flex-col">
          <div className="p-5 flex items-center justify-between border-b border-black/[0.03] dark:border-white/5 bg-slate-50 dark:bg-[#1F1F1F]/30">
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Alerta Global</p>
              <p className="text-[12px] text-slate-500 font-medium">Ligar/Desligar todas notificações</p>
            </div>
            <button 
              onClick={() => updateNotificationSettings({ enabled: !notificationSettings.enabled })}
              className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${notificationSettings.enabled ? 'bg-[#3b82f6]' : 'bg-slate-200 dark:bg-[#1F1F1F]'}`}>
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${notificationSettings.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
          
          <div className={`transition-all duration-300 ${!notificationSettings.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
            {[
              { id: 'gastos', label: 'Lembretes de Gastos', desc: 'Avisos de gastos próximos ao vencimento' },
              { id: 'parcelas', label: 'Lembretes de Parcelas', desc: 'Avisos de parcelas próximas ao vencimento' },
              { id: 'receitas', label: 'Avisos de Receitas', desc: 'Receitas previstas para os próximos dias' },
              { id: 'metas', label: 'Alertas de Metas', desc: 'Metas se aproximando do prazo final' },
              { id: 'orcamentos', label: 'Avisos de Orçamentos', desc: 'Orçamentos perto ou acima do limite' },
            ].map((item, idx, arr) => (
              <div key={item.id} className={`p-5 flex flex-col gap-2 ${idx !== arr.length - 1 ? 'border-b border-black/[0.03] dark:border-white/5' : ''}`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{item.label}</span>
                  <button 
                    onClick={() => updateNotificationSettings({ [item.id]: !notificationSettings[item.id as keyof typeof notificationSettings] })}
                    className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${notificationSettings[item.id as keyof typeof notificationSettings] ? 'bg-green-500' : 'bg-slate-200 dark:bg-[#1F1F1F]'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${notificationSettings[item.id as keyof typeof notificationSettings] ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
                <p className="text-[12px] text-slate-400 dark:text-slate-500 font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Removido seção de instalação por solicitação do usuário */}

      <button 
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-3 p-6 bg-white dark:bg-[#2C2C2E] border border-black/[0.03] dark:border-white/5 rounded-[28px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all active:scale-[0.98] shadow-sm tracking-tight"
      >
        <LogOut className="w-5 h-5" strokeWidth={2.5} />
        Sair da Conta
      </button>
    </div>
  );
}
