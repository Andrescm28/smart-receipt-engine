import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Layout from "@/components/Layout";
import Dashboard from "@/components/Dashboard";
import Products from "@/components/Products";
import Billing from "@/components/Billing";
import Reports from "@/components/Reports";
import Users from "@/components/Users";
import Login from "@/components/Login";
import CashierLayout from "@/components/CashierLayout";
import CashCut from "@/components/CashCut";
import EmisorConfig from "@/components/EmisorConfig";
import Supermarkets from "@/components/Supermarkets";
import { useAuth } from "@/hooks/useAuth";

export interface Product {
  id: string;
  code: string;
  name: string;
  price: number;
  category: string;
  unit: string;
  stock: number;
}

const Index = () => {
  const { user, role, loading, signOut } = useAuth();
  const [showCashCut, setShowCashCut] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

  if (!user) return <Login />;
  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Asignando permisos...</p>
      </div>
    );
  }

  if (role === 'cashier') {
    return (
      <>
        <CashierLayout onLogout={signOut} onCashCut={() => setShowCashCut(true)}>
          <Billing />
        </CashierLayout>
        {showCashCut && <CashCut onClose={() => setShowCashCut(false)} />}
      </>
    );
  }

  return (
    <Layout userRole={role} onLogout={signOut}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<Products userRole={role} />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/users" element={<Users />} />
        <Route path="/supermarkets" element={<Supermarkets />} />
        <Route path="/emisor" element={<EmisorConfig />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

export default Index;
