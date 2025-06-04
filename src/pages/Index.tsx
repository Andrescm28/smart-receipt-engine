import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'cashier'>('cashier');
  const [showCashCut, setShowCashCut] = useState(false);

  if (!isAuthenticated) {
    return <Login onLogin={setIsAuthenticated} onRoleChange={setUserRole} />;
  }

  // Layout específico para cajero
  if (userRole === 'cashier') {
    return (
      <>
        <CashierLayout 
          onLogout={() => setIsAuthenticated(false)}
          onCashCut={() => setShowCashCut(true)}
        >
          <Billing />
        </CashierLayout>
        
        {showCashCut && (
          <CashCut onClose={() => setShowCashCut(false)} />
        )}
      </>
    );
  }

  // Layout completo para admin
  return (
    <Layout userRole={userRole} onLogout={() => setIsAuthenticated(false)}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<Products userRole={userRole} />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/reports" element={<Reports />} />
        {userRole === 'admin' && <Route path="/users" element={<Users />} />}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

export default Index;
