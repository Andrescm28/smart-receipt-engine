
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LogOut, Home, Package, FileText, BarChart3, Users } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  userRole: 'admin' | 'cashier';
  onLogout: () => void;
}

const Layout = ({ children, userRole, onLogout }: LayoutProps) => {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: Home, roles: ['admin', 'cashier'] },
    { path: '/products', label: 'Productos', icon: Package, roles: ['admin', 'cashier'] },
    { path: '/billing', label: 'Facturación', icon: FileText, roles: ['admin', 'cashier'] },
    { path: '/reports', label: 'Reportes', icon: BarChart3, roles: ['admin'] },
    { path: '/users', label: 'Usuarios', icon: Users, roles: ['admin'] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Card className="w-64 h-screen rounded-none border-r shadow-lg">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-800">POS Facturación</h1>
          <p className="text-sm text-gray-600 capitalize">{userRole === 'admin' ? 'Administrador' : 'Cajero'}</p>
        </div>
        
        <nav className="p-4 space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? "default" : "ghost"}
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

      {/* Main Content */}
      <div className="flex-1 p-6">
        {children}
      </div>
    </div>
  );
};

export default Layout;
