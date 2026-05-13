import { Outlet, Link, useLocation } from "react-router-dom";
import { LogOut, LayoutDashboard, Receipt, CreditCard, ArrowDownUp, Wallet, Target, Calendar, AlertCircle, TrendingUp, BarChart3, User } from "lucide-react";

const navItems = [
  { name: "Resumo", href: "/resumo", icon: LayoutDashboard },
  { name: "Gastos", href: "/gastos", icon: Receipt },
  { name: "Parcelas", href: "/parcelas", icon: CreditCard },
  { name: "Receitas", href: "/receitas", icon: ArrowDownUp },
  { name: "Perfil", href: "/perfil", icon: User },
];

export function Layout() {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-[#F2F2F7] text-slate-900 font-sans relative overflow-x-hidden">
      <div className="w-full max-w-2xl mx-auto flex flex-col min-h-screen bg-white shadow-sm sm:shadow-xl relative">
        <header className="bg-white/80 backdrop-blur-xl sticky top-0 border-b border-black/[0.05] px-6 h-[72px] flex items-center justify-between shrink-0 z-40">
          <div>
            <h1 className="text-[19px] font-bold text-slate-900 tracking-tight">Finanças</h1>
            <p className="text-[11px] font-bold text-slate-400 -mt-0.5 tracking-wide uppercase">Controle Pessoal</p>
          </div>
          <div className="w-10 h-10 bg-[#1C1C1E] rounded-full flex items-center justify-center text-white">
            <Wallet className="w-5 h-5" />
          </div>
        </header>

        <main className="flex-1 w-full bg-[#F2F2F7] relative pb-28 p-4 sm:p-6 overflow-y-auto hide-scrollbar">
          <Outlet />
        </main>

        <nav className="bg-white/80 backdrop-blur-xl border-t border-black/[0.05] fixed bottom-0 w-full max-w-2xl z-50 pb-[env(safe-area-inset-bottom)]">
          <div className="flex px-4 py-3 justify-around items-center h-[76px]">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href || (item.href !== "/resumo" && location.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 iphone-button ${
                    isActive ? "text-primary" : "text-slate-400"
                  }`}
                >
                  <div className={`p-1.5 rounded-2xl transition-all ${isActive ? "bg-black/5" : ""}`}>
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
