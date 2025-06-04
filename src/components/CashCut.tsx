
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Calculator, Printer, DollarSign, Clock } from 'lucide-react';

interface CashCutProps {
  onClose: () => void;
}

const CashCut = ({ onClose }: CashCutProps) => {
  const { toast } = useToast();
  const [cashCount, setCashCount] = useState({
    bills1000: 0,
    bills500: 0,
    bills200: 0,
    bills100: 0,
    bills50: 0,
    bills20: 0,
    bills10: 0,
    coins5: 0,
    coins1: 0,
    coins050: 0,
    coins025: 0
  });

  // Datos simulados de ventas del día
  const salesData = {
    totalSales: 15450.75,
    totalTransactions: 87,
    cashSales: 8320.50,
    cardSales: 7130.25,
    startingCash: 1000.00
  };

  const denominations = [
    { key: 'bills1000', label: '$1,000', value: 1000 },
    { key: 'bills500', label: '$500', value: 500 },
    { key: 'bills200', label: '$200', value: 200 },
    { key: 'bills100', label: '$100', value: 100 },
    { key: 'bills50', label: '$50', value: 50 },
    { key: 'bills20', label: '$20', value: 20 },
    { key: 'bills10', label: '$10', value: 10 },
    { key: 'coins5', label: '$5', value: 5 },
    { key: 'coins1', label: '$1', value: 1 },
    { key: 'coins050', label: '$0.50', value: 0.50 },
    { key: 'coins025', label: '$0.25', value: 0.25 }
  ];

  const calculateTotal = () => {
    return denominations.reduce((total, denom) => {
      return total + (cashCount[denom.key as keyof typeof cashCount] * denom.value);
    }, 0);
  };

  const expectedCash = salesData.startingCash + salesData.cashSales;
  const actualCash = calculateTotal();
  const difference = actualCash - expectedCash;

  const handleCashCountChange = (key: string, value: string) => {
    setCashCount(prev => ({
      ...prev,
      [key]: parseInt(value) || 0
    }));
  };

  const generateCashCut = () => {
    const cutNumber = `CORTE-${Date.now()}`;
    
    toast({
      title: "Corte de caja generado",
      description: `Corte ${cutNumber} registrado exitosamente`,
    });

    console.log('Corte de caja:', {
      number: cutNumber,
      date: new Date().toISOString(),
      salesData,
      cashCount,
      expectedCash,
      actualCash,
      difference
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calculator className="h-6 w-6" />
              Corte de Caja
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              {new Date().toLocaleString()}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Conteo de Efectivo */}
            <Card>
              <CardHeader>
                <CardTitle>Conteo de Efectivo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {denominations.map((denom) => (
                    <div key={denom.key} className="flex items-center justify-between">
                      <Label className="w-16">{denom.label}</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          value={cashCount[denom.key as keyof typeof cashCount]}
                          onChange={(e) => handleCashCountChange(denom.key, e.target.value)}
                          className="w-20 text-center"
                        />
                        <span className="w-20 text-right text-sm text-gray-600">
                          ${(cashCount[denom.key as keyof typeof cashCount] * denom.value).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Contado:</span>
                  <span>${actualCash.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Resumen de Ventas */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resumen de Ventas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total de Ventas:</span>
                    <span className="font-semibold">${salesData.totalSales.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transacciones:</span>
                    <span className="font-semibold">{salesData.totalTransactions}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span>Ventas en Efectivo:</span>
                    <span className="font-semibold">${salesData.cashSales.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ventas con Tarjeta:</span>
                    <span className="font-semibold">${salesData.cardSales.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Efectivo Inicial:</span>
                    <span className="font-semibold">${salesData.startingCash.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Comparación</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Efectivo Esperado:</span>
                    <span className="font-semibold">${expectedCash.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Efectivo Contado:</span>
                    <span className="font-semibold">${actualCash.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className={`flex justify-between text-lg font-bold ${
                    difference === 0 ? 'text-green-600' : 
                    difference > 0 ? 'text-blue-600' : 'text-red-600'
                  }`}>
                    <span>Diferencia:</span>
                    <span>
                      {difference > 0 ? '+' : ''}${difference.toFixed(2)}
                    </span>
                  </div>
                  {difference !== 0 && (
                    <p className="text-sm text-gray-600">
                      {difference > 0 ? 'Sobrante en caja' : 'Faltante en caja'}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={generateCashCut} className="bg-orange-600 hover:bg-orange-700">
              <DollarSign className="h-4 w-4 mr-2" />
              Generar Corte
            </Button>
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashCut;
