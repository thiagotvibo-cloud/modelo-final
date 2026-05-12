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

export default function App() {
  return (
    <FinanceProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
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
  );
}
