import { Outlet, Link, useLocation } from "react-router-dom";
import { LogOut, LayoutDashboard, Receipt, CreditCard, ArrowDownUp, Wallet, Target, Calendar, AlertCircle, TrendingUp, BarChart3, User } from "lucide-react";

const navItems = [
  { name: "Resumo", href: "/resumo", icon: LayoutDashboard },
  { name: "Gastos", href: "/gastos", icon: Receipt },
  { name: "Parcelas", href: "/parcelas", icon: CreditCard },
  { name: "Receitas", href: "/receitas", icon: ArrowDownUp },
  { name: "Contas", href: "/contas", icon: Wallet },
  { name: "Metas", href: "/metas", icon: Target },
  { name: "Planejamento", href: "/planejamento", icon: Calendar },
  { name: "Dívidas", href: "/dividas", icon: AlertCircle },
  { name: "Investimentos", href: "/investimentos", icon: TrendingUp },
  { name: "Relatórios", href: "/relatorios", icon: BarChart3 },
  { name: "Perfil", href: "/perfil", icon: User },
];

export function Layout() {
  const location = useLocation();

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden max-w-md mx-auto shadow-2xl relative w-full border-x border-slate-200">
      <header className="bg-white border-b border-slate-200 px-5 h-16 flex items-center justify-between shrink-0">
        <h1 className="text-[17px] font-bold text-slate-800">Controle Financeiro</h1>
        <button className="flex items-center gap-1.5 text-slate-600 hover:text-slate-800 text-sm font-medium">
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </header>

      <main className="flex-1 overflow-y-auto w-full bg-slate-50 relative pb-20 p-4">
        <Outlet />
      </main>

      <nav className="bg-white border-t border-slate-200 shrink-0 overflow-x-auto hide-scrollbar absolute bottom-0 w-full z-50">
        <div className="flex px-3 py-2 w-max min-w-full justify-between items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center justify-center min-w-[72px] h-[52px] gap-1 rounded-xl transition-colors ${
                  isActive ? "bg-[#1A252F] text-white font-bold" : "text-slate-500 font-medium hover:bg-slate-50"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-500"}`} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] tracking-wide">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
