
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LogOut, FileText, Calculator } from 'lucide-react';

interface CashierLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
  onCashCut: () => void;
}

const CashierLayout = ({ children, onLogout, onCashCut }: CashierLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <Card className="w-full rounded-none border-b shadow-sm">
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-800">Terminal de Venta</h1>
            </div>
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              Cajero/a
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={onCashCut}
              variant="outline"
              className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Corte de Caja
            </Button>
            
            <Button
              variant="outline"
              onClick={onLogout}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Content */}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default CashierLayout;
