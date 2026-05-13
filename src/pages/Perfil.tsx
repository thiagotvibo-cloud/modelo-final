import { useState, useEffect } from "react";
import { Download, Bell, Moon, Shield, CreditCard, HelpCircle, LogOut, ChevronRight } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export function Perfil() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

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
      <div className="flex items-center gap-6 iphone-card p-6 mb-10">
        <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-2xl uppercase shadow-lg shadow-black/20 border-2 border-white">
          {user?.email?.substring(0, 2) || 'US'}
        </div>
        <div>
           <h2 className="font-bold text-slate-900 text-[20px] tracking-tight">{user?.email?.split('@')[0]}</h2>
           <p className="text-[13px] text-slate-400 font-medium mb-2">{user?.email}</p>
        </div>
      </div>

      {/* Removido seção de instalação por solicitação do usuário */}

      <button 
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-3 p-6 bg-white border border-black/[0.03] rounded-[28px] font-bold text-red-500 hover:bg-red-50 transition-all active:scale-[0.98] shadow-sm tracking-tight"
      >
        <LogOut className="w-5 h-5" strokeWidth={2.5} />
        Sair da Conta
      </button>
    </div>
  );
}
