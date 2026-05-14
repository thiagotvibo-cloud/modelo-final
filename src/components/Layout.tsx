import { useLocation, Link, useOutlet } from "react-router-dom";
import { LogOut, LayoutDashboard, Receipt, CreditCard, ArrowDownUp, Wallet, Target, Calendar, AlertCircle, TrendingUp, BarChart3, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";

const navItems = [
  { name: "Resumo", href: "/resumo", icon: LayoutDashboard },
  { name: "Gastos", href: "/gastos", icon: Receipt },
  { name: "Parcelas", href: "/parcelas", icon: CreditCard },
  { name: "Receitas", href: "/receitas", icon: ArrowDownUp },
  { name: "Organização", href: "/organizacao", icon: Calendar },
  { name: "Perfil", href: "/perfil", icon: User },
];

export function Layout() {
  const location = useLocation();
  const outlet = useOutlet();
  const isResumo = location.pathname === "/resumo" || location.pathname === "/";

  return (
    <div className="flex flex-col min-h-screen bg-[#F2F2F7] dark:bg-[#1F1F1F] text-slate-900 dark:text-slate-100 font-sans relative overflow-x-hidden transition-colors duration-300">
      <div className="w-full max-w-2xl mx-auto flex flex-col min-h-screen bg-white dark:bg-[#2C2C2E] shadow-sm sm:shadow-xl relative transition-colors duration-300">
        <header className={`${isResumo ? 'absolute bg-transparent border-none w-full pointer-events-none' : 'bg-[#0b1b42] dark:bg-[#1C1C1E] sticky border-b border-black/10 dark:border-white/5 overflow-hidden transition-colors duration-300'} top-0 px-6 h-[72px] flex items-center justify-between shrink-0 z-40`}>
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

        <main className={`flex-1 w-full bg-[#F2F2F7] dark:bg-[#1F1F1F] transition-colors duration-300 relative pb-28 ${isResumo ? 'p-0 sm:p-0' : 'p-4 sm:p-6'} overflow-x-hidden overflow-y-auto hide-scrollbar`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.995 }}
              transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
              className="h-full w-full"
            >
              {outlet && React.cloneElement(outlet as React.ReactElement, { key: location.pathname })}
            </motion.div>
          </AnimatePresence>
        </main>

        <nav className="bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-xl border-t border-black/[0.05] dark:border-white/[0.05] fixed bottom-0 w-full max-w-2xl z-50 pb-[env(safe-area-inset-bottom)] transition-colors duration-300">
          <div className="flex px-1.5 py-3 justify-around items-center h-[76px]">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href || (item.href !== "/resumo" && location.pathname.startsWith(item.href));
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
  );
}
