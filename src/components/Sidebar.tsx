import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Receipt, CreditCard, ArrowDownUp, Wallet, X } from "lucide-react";

const navigation = [
  { name: "Resumo", href: "/resumo", icon: LayoutDashboard },
  { name: "Gastos", href: "/gastos", icon: Receipt },
  { name: "Parcelas", href: "/parcelas", icon: CreditCard },
  { name: "Receitas", href: "/receitas", icon: ArrowDownUp },
  { name: "Contas", href: "/contas", icon: Wallet },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const location = useLocation();

  return (
    <aside className="w-64 h-full min-h-screen lg:min-h-0 bg-white border-r border-slate-200 flex flex-col pt-6 flex-shrink-0">
      <div className="px-6 mb-8 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">Financeiro</h1>
        {onClose && (
          <button onClick={onClose} className="p-1 lg:hidden text-slate-400 hover:text-slate-600 rounded">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      <nav className="flex-1 flex flex-col gap-1 px-3">
        {navigation.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-slate-100 text-slate-800"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-slate-700" : "text-slate-400"}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
