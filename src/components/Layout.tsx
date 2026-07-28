import { useLocation, Link, useOutlet } from "react-router-dom";
import { LogOut, LayoutDashboard, Receipt, CreditCard, ArrowDownUp, Wallet, Target, Calendar, AlertCircle, TrendingUp, BarChart3, User, Menu, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState } from "react";
import { AddModal } from "./AddModal";

const navItems = [
  { name: "Início", href: "/resumo", icon: LayoutDashboard },
  { name: "Gastos", href: "/gastos", icon: Receipt },
  { name: "Calendário", href: "/calendario", icon: Calendar },
  { name: "Mais", href: "/mais", icon: Menu },
];

export function Layout() {
  const location = useLocation();
  const outlet = useOutlet();
  const isResumo = location.pathname === "/resumo" || location.pathname === "/";
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F2F2F7] dark:bg-[#1F1F1F] text-slate-900 dark:text-slate-100 font-sans relative overflow-x-hidden transition-colors duration-300">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-72 flex-col bg-white dark:bg-[#2C2C2E] border-r border-black/5 dark:border-white/5 shrink-0 z-50 transition-colors duration-300 fixed h-full left-0">
        <div className="h-[72px] flex flex-col justify-center px-6 shrink-0 bg-[#0b1b42] dark:bg-[#1C1C1E] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f2863] to-[#0b1b42] dark:from-[#2C2C2E] dark:to-[#1C1C1E] opacity-100 transition-colors duration-300"></div>
          <div className="absolute inset-0 opacity-[0.25] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-[19px] font-bold text-white tracking-tight">Finança+</h1>
              <p className="text-[11px] font-bold text-white/60 -mt-0.5 tracking-wide uppercase">Controle Pessoal</p>
            </div>
            <Link to="/contas" className="w-9 h-9 bg-white/10 dark:bg-white/5 rounded-full flex items-center justify-center text-white active:scale-95 transition-all hover:bg-white/20 dark:hover:bg-white/10">
              <Wallet className="w-4 h-4" />
            </Link>
          </div>
        </div>
        
        <nav className="flex-1 py-8 px-5 space-y-3 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || (item.href !== "/resumo" && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                  isActive 
                    ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold shadow-sm" 
                    : "text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 font-semibold"
                }`}
              >
                <div className={`${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform duration-300`}>
                  <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="tracking-tight text-[15px]">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-6 border-t border-black/5 dark:border-white/5">
          <button
            onClick={() => setIsAdding(true)}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/30 active:scale-95"
          >
            <Plus className="w-5 h-5" strokeWidth={2.5} />
            Novo Lançamento
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col relative md:ml-72 min-h-screen w-full transition-all">
        <div className="w-full max-w-2xl md:max-w-5xl mx-auto flex flex-col min-h-screen md:min-h-0 md:h-full bg-white dark:bg-[#2C2C2E] shadow-sm sm:shadow-xl relative transition-colors duration-300 md:my-0 lg:my-0">
          
          {/* MOBILE HEADER */}
          <header className={`md:hidden ${isResumo ? 'absolute bg-transparent border-none w-full pointer-events-none' : 'bg-[#0b1b42] dark:bg-[#1C1C1E] sticky border-b border-black/10 dark:border-white/5 overflow-hidden transition-colors duration-300'} top-0 px-6 h-[72px] flex items-center justify-between shrink-0 z-40`}>
            {!isResumo && (
              <>
                <div className="absolute inset-0 bg-gradient-to-b from-[#0f2863] to-[#0b1b42] dark:from-[#2C2C2E] dark:to-[#1C1C1E] opacity-100 transition-colors duration-300"></div>
                <div className="absolute inset-0 opacity-[0.25] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
              </>
            )}
            <div className="relative z-10 flex items-center justify-between w-full pointer-events-auto">
              <div>
                <h1 className="text-[19px] font-bold text-white tracking-tight">Finança+</h1>
                <p className="text-[11px] font-bold text-white/60 -mt-0.5 tracking-wide uppercase">Controle Pessoal</p>
              </div>
              <Link to="/contas" className="w-10 h-10 bg-white/10 dark:bg-white/5 rounded-full flex items-center justify-center text-white active:scale-95 transition-all hover:bg-white/20 dark:hover:bg-white/10">
                <Wallet className="w-5 h-5" />
              </Link>
            </div>
          </header>

          <main className={`flex-1 w-full bg-[#F2F2F7] dark:bg-[#1F1F1F] md:bg-white md:dark:bg-[#2C2C2E] transition-colors duration-300 relative pb-28 md:pb-8 ${isResumo ? 'p-0 sm:p-0 md:p-8 lg:p-10' : 'p-4 sm:p-6 md:p-8 lg:p-10'} overflow-x-hidden overflow-y-auto hide-scrollbar`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1, ease: "linear" }}
                className="h-full w-full"
              >
                {outlet && React.cloneElement(outlet as React.ReactElement, { key: location.pathname })}
              </motion.div>
            </AnimatePresence>
          </main>
          
          {/* MOBILE BOTTOM NAV */}
          <nav className="md:hidden bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-xl border-t border-black/[0.05] dark:border-white/[0.05] fixed bottom-0 w-full max-w-2xl z-50 pb-[env(safe-area-inset-bottom)] transition-colors duration-300">
            <div className="flex px-1.5 py-3 justify-around items-center h-[76px]">
              {navItems.map((item, index) => {
                const isActive = location.pathname === item.href || (item.href !== "/resumo" && location.pathname.startsWith(item.href));
                
                if (index === 2) {
                  // Insert center Add button before the third item
                  return (
                    <React.Fragment key="add-button-group">
                      <button
                        onClick={() => setIsAdding(true)}
                        className="relative -top-5 flex flex-col items-center justify-center gap-1 transition-all duration-300 iphone-button mx-2"
                      >
                        <div className="w-14 h-14 rounded-full bg-blue-600 shadow-lg shadow-blue-500/30 text-white flex items-center justify-center active:scale-95 transition-all">
                          <Plus className="w-7 h-7" strokeWidth={2.5} />
                        </div>
                        <span className="text-[10px] tracking-tight font-bold text-slate-500 mt-1">Adicionar</span>
                      </button>
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 iphone-button ${
                          isActive ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"
                        }`}
                      >
                        <div className={`p-1.5 rounded-2xl transition-all ${isActive ? "bg-black/5 dark:bg-white/10" : ""}`}>
                          <item.icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                        </div>
                        <span className={`text-[10px] tracking-tight font-bold ${isActive ? "opacity-100" : "opacity-60"}`}>{item.name}</span>
                      </Link>
                    </React.Fragment>
                  );
                }
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 iphone-button ${
                      isActive ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    <div className={`p-1.5 rounded-2xl transition-all ${isActive ? "bg-black/5 dark:bg-white/10" : ""}`}>
                      <item.icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                    </div>
                    <span className={`text-[10px] tracking-tight font-bold ${isActive ? "opacity-100" : "opacity-60"}`}>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

        </div>
      </div>
      <AddModal isOpen={isAdding} onClose={() => setIsAdding(false)} defaultType="Gasto" />
    </div>
  );
}
