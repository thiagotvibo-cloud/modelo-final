import { useState, useEffect } from "react";
import { Download, Bell, Moon, Shield, CreditCard, HelpCircle, LogOut, ChevronRight } from "lucide-react";

export function Perfil() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

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

  return (
    <div className="w-full pb-8">
      <div className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6">
        <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center text-white font-bold text-xl">
          MR
        </div>
        <div>
           <h2 className="font-bold text-slate-800 text-[17px]">Maria Ribeiro</h2>
           <p className="text-sm text-slate-500 mb-1">maria.ribeiro@email.com</p>
           <span className="inline-block px-2.5 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold tracking-wide uppercase rounded-md border border-green-200">Plano Premium</span>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Aplicativo</h3>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
           <div 
             className="flex items-center justify-between p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors active:bg-slate-100"
             onClick={handleInstallClick}
           >
             <div className="flex items-center gap-3">
               <div className="p-2 bg-slate-50 rounded-lg">
                 <Download className="w-5 h-5 text-slate-600" />
               </div>
               <div>
                  <h4 className="font-bold text-slate-800 text-[15px]">Instalar app (PWA)</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Adicione à tela inicial</p>
               </div>
             </div>
             <ChevronRight className="w-5 h-5 text-slate-400" />
           </div>
           
           <div className="flex items-center justify-between p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors">
             <div className="flex items-center gap-3">
               <div className="p-2 bg-slate-50 rounded-lg">
                 <Bell className="w-5 h-5 text-slate-600" />
               </div>
               <h4 className="font-bold text-slate-800 text-[15px]">Notificações</h4>
             </div>
             <ChevronRight className="w-5 h-5 text-slate-400" />
           </div>

           <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors">
             <div className="flex items-center gap-3">
               <div className="p-2 bg-slate-50 rounded-lg">
                 <Moon className="w-5 h-5 text-slate-600" />
               </div>
               <h4 className="font-bold text-slate-800 text-[15px]">Tema escuro</h4>
             </div>
             <ChevronRight className="w-5 h-5 text-slate-400" />
           </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Conta</h3>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
           <div className="flex items-center justify-between p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors">
             <div className="flex items-center gap-3">
               <div className="p-2 bg-slate-50 rounded-lg">
                 <Shield className="w-5 h-5 text-slate-600" />
               </div>
               <h4 className="font-bold text-slate-800 text-[15px]">Segurança e senha</h4>
             </div>
             <ChevronRight className="w-5 h-5 text-slate-400" />
           </div>
           
           <div className="flex items-center justify-between p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors">
             <div className="flex items-center gap-3">
               <div className="p-2 bg-slate-50 rounded-lg">
                 <CreditCard className="w-5 h-5 text-slate-600" />
               </div>
               <h4 className="font-bold text-slate-800 text-[15px]">Cartões cadastrados</h4>
             </div>
             <ChevronRight className="w-5 h-5 text-slate-400" />
           </div>

           <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors">
             <div className="flex items-center gap-3">
               <div className="p-2 bg-slate-50 rounded-lg">
                 <HelpCircle className="w-5 h-5 text-slate-600" />
               </div>
               <h4 className="font-bold text-slate-800 text-[15px]">Ajuda e suporte</h4>
             </div>
             <ChevronRight className="w-5 h-5 text-slate-400" />
           </div>
        </div>
      </div>

      <button className="w-full flex items-center justify-center gap-2 p-4 bg-white border border-slate-200 rounded-2xl font-bold text-red-500 hover:bg-red-50 transition-colors active:bg-red-100">
        <LogOut className="w-5 h-5" />
        Sair da conta
      </button>
    </div>
  );
}
