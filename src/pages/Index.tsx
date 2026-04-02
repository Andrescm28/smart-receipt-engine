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

export interface Product {
  id: string;
  code: string;
  name: string;
  price: number;
  category: string;
  unit: string;
  stock: number;
}

const initialProducts: Product[] = [
  { id: '1', code: 'BEB001', name: 'Coca Cola 500ml', price: 1.25, category: 'Bebidas', unit: 'Unidad', stock: 120 },
  { id: '2', code: 'BEB002', name: 'Agua Purificada 1L', price: 0.75, category: 'Bebidas', unit: 'Unidad', stock: 200 },
  { id: '3', code: 'PAN001', name: 'Pan Blanco Molde', price: 2.50, category: 'Panadería', unit: 'Unidad', stock: 45 },
  { id: '4', code: 'LAC001', name: 'Leche Entera 1L', price: 3.20, category: 'Lácteos', unit: 'Unidad', stock: 60 },
  { id: '5', code: 'LAC002', name: 'Yogurt Natural 500g', price: 2.80, category: 'Lácteos', unit: 'Unidad', stock: 40 },
  { id: '6', code: 'GRA001', name: 'Arroz Blanco 1kg', price: 1.90, category: 'Granos y Cereales', unit: 'Kilogramo', stock: 85 },
  { id: '7', code: 'GRA002', name: 'Frijoles Rojos 1kg', price: 2.40, category: 'Granos y Cereales', unit: 'Kilogramo', stock: 70 },
  { id: '8', code: 'CAR001', name: 'Pechuga de Pollo 1kg', price: 5.50, category: 'Carnes', unit: 'Kilogramo', stock: 30 },
  { id: '9', code: 'FRU001', name: 'Banano (Libra)', price: 0.60, category: 'Frutas y Verduras', unit: 'Libra', stock: 150 },
  { id: '10', code: 'LIM001', name: 'Detergente Líquido 1L', price: 4.50, category: 'Limpieza', unit: 'Unidad', stock: 35 },
  { id: '11', code: 'SNK001', name: 'Galletas Surtidas 400g', price: 3.10, category: 'Snacks', unit: 'Paquete', stock: 55 },
  { id: '12', code: 'ACE001', name: 'Aceite Vegetal 1L', price: 3.75, category: 'Abarrotes', unit: 'Unidad', stock: 48 },
];

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'cashier'>('cashier');
  const [showCashCut, setShowCashCut] = useState(false);
  const [products, setProducts] = useState<Product[]>(initialProducts);

  if (!isAuthenticated) {
    return <Login onLogin={setIsAuthenticated} onRoleChange={setUserRole} />;
  }

  if (userRole === 'cashier') {
    return (
      <>
        <CashierLayout 
          onLogout={() => setIsAuthenticated(false)}
          onCashCut={() => setShowCashCut(true)}
        >
          <Billing products={products} />
        </CashierLayout>
        
        {showCashCut && (
          <CashCut onClose={() => setShowCashCut(false)} />
        )}
      </>
    );
  }

  return (
    <Layout userRole={userRole} onLogout={() => setIsAuthenticated(false)}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<Products userRole={userRole} products={products} onProductsChange={setProducts} />} />
        <Route path="/billing" element={<Billing products={products} />} />
        <Route path="/reports" element={<Reports />} />
        {userRole === 'admin' && <Route path="/users" element={<Users />} />}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

export default Index;
