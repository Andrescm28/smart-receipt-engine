import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LogOut, Home, Package, FileText, BarChart3, Users, Receipt, Store, ClipboardList, CheckSquare, Calculator } from 'lucide-react';
import type { AppRole } from '@/hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
  userRole: AppRole;
  onLogout: () => void;
}

const ROLE_LABEL: Record<AppRole, string> = {
  admin: 'Administrador',
  inventory: 'Inventario',
  accountant: 'Contador',
  cashier: 'Cajero',
};

const Layout = ({ children, userRole, onLogout }: LayoutProps) => {
  const location = useLocation();

  const menuItems: { path: string; label: string; icon: any; roles: AppRole[] }[] = [
    { path: '/', label: 'Dashboard', icon: Home, roles: ['admin'] },
    { path: '/accounting', label: 'Contaduría', icon: Calculator, roles: ['accountant'] },
    { path: '/products', label: 'Productos', icon: Package, roles: ['admin', 'inventory'] },
    { path: '/inventory-requests', label: 'Mis solicitudes', icon: ClipboardList, roles: ['inventory'] },
    { path: '/inventory-approvals', label: 'Aprobaciones', icon: CheckSquare, roles: ['admin'] },
    { path: '/billing', label: 'Facturación', icon: FileText, roles: ['admin'] },
    { path: '/reports', label: 'Reportes', icon: BarChart3, roles: ['admin'] },
    { path: '/supermarkets', label: 'Supermercados', icon: Store, roles: ['admin'] },
    { path: '/users', label: 'Usuarios', icon: Users, roles: ['admin'] },
    { path: '/emisor', label: 'Facturación Electrónica', icon: Receipt, roles: ['admin', 'accountant'] },
  ];

  const filteredMenuItems = menuItems.filter((item) => item.roles.includes(userRole));

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Card className="w-64 h-screen rounded-none border-r shadow-lg">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-800">🛒 SuperMarket POS</h1>
          <p className="text-sm text-gray-600">{ROLE_LABEL[userRole]}</p>
        </div>

        <nav className="p-4 space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className={`w-full justify-start gap-3 ${
                    isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Button
            variant="outline"
            onClick={onLogout}
            className="w-full justify-start gap-3 text-red-600 border-red-200 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </Card>

      <div className="flex-1 p-6 overflow-auto">{children}</div>
    </div>
  );
};

export default Layout;
