import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Resumo } from "./pages/Resumo";
import { Gastos } from "./pages/Gastos";
import { Parcelas } from "./pages/Parcelas";
import { Receitas } from "./pages/Receitas";
import { Contas } from "./pages/Contas";
import { Metas } from "./pages/Metas";
import { Planejamento } from "./pages/Planejamento";
import { Dividas } from "./pages/Dividas";
import { Investimentos } from "./pages/Investimentos";
import { Relatorios } from "./pages/Relatorios";
import { Perfil } from "./pages/Perfil";
import { FinanceProvider } from "./contexts/FinanceContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Login } from "./pages/Login";

import { ThemeProvider } from "./contexts/ThemeContext";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#1F1F1F] text-slate-500">Carregando...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FinanceProvider>
          <BrowserRouter>
            <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/resumo" replace />} />
              <Route path="resumo" element={<Resumo />} />
              <Route path="gastos" element={<Gastos />} />
              <Route path="parcelas" element={<Parcelas />} />
              <Route path="receitas" element={<Receitas />} />
              <Route path="contas" element={<Contas />} />
              <Route path="metas" element={<Metas />} />
              <Route path="planejamento" element={<Planejamento />} />
              <Route path="dividas" element={<Dividas />} />
              <Route path="investimentos" element={<Investimentos />} />
              <Route path="relatorios" element={<Relatorios />} />
              <Route path="perfil" element={<Perfil />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </FinanceProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}

