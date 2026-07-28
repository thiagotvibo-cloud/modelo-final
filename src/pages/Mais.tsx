import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownUp, Wallet, Target, CreditCard, PieChart, Users, Settings, Receipt } from 'lucide-react';
import { motion } from 'framer-motion';

const menuItems = [
  { name: 'Receitas', href: '/receitas', icon: ArrowDownUp, color: 'text-green-500', bg: 'bg-green-500/10' },
  { name: 'Contas & Cartões', href: '/contas', icon: Wallet, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { name: 'Orçamentos', href: '/planejamento', icon: Target, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { name: 'Fixas & Parceladas', href: '/parcelas', icon: Receipt, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  { name: 'Cofres / Metas', href: '/metas', icon: Target, color: 'text-pink-500', bg: 'bg-pink-500/10' },
  { name: 'Relatórios', href: '/relatorios', icon: PieChart, color: 'text-sky-500', bg: 'bg-sky-500/10' },
  { name: 'Configurações', href: '/perfil', icon: Settings, color: 'text-slate-500', bg: 'bg-slate-500/10' },
];

export function Mais() {
  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[28px] font-bold text-slate-900 dark:text-white tracking-tight">Mais Opções</h2>
          <p className="text-[15px] text-slate-500 dark:text-slate-400 mt-1 font-medium">Explore todas as ferramentas</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {menuItems.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link
              to={item.href}
              className="bg-white dark:bg-[#1C1C1E] p-4 rounded-3xl flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-md transition-all active:scale-95 border border-slate-100 dark:border-white/5"
            >
              <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center`}>
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <span className="font-semibold text-slate-700 dark:text-slate-200 text-[13px]">{item.name}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
