
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Download, TrendingUp, DollarSign, Package, Users } from 'lucide-react';

const Reports = () => {
  const [dateRange, setDateRange] = useState('week');
  const [reportType, setReportType] = useState('sales');

  // Demo data
  const salesData = [
    { name: 'Lun', ventas: 4000, facturas: 45 },
    { name: 'Mar', ventas: 3000, facturas: 38 },
    { name: 'Mié', ventas: 5000, facturas: 62 },
    { name: 'Jue', ventas: 2780, facturas: 35 },
    { name: 'Vie', ventas: 6890, facturas: 78 },
    { name: 'Sáb', ventas: 8390, facturas: 95 },
    { name: 'Dom', ventas: 3490, facturas: 42 },
  ];

  const productSalesData = [
    { name: 'Coca Cola', value: 30, color: '#3B82F6' },
    { name: 'Pan Integral', value: 25, color: '#10B981' },
    { name: 'Leche', value: 20, color: '#F59E0B' },
    { name: 'Arroz', value: 15, color: '#EF4444' },
    { name: 'Otros', value: 10, color: '#8B5CF6' },
  ];

  const topProducts = [
    { name: 'Coca Cola 500ml', sold: 285, revenue: 1140 },
    { name: 'Pan Integral', sold: 247, revenue: 741 },
    { name: 'Leche Descremada', sold: 198, revenue: 693 },
    { name: 'Arroz Blanco 1kg', sold: 156, revenue: 437 },
    { name: 'Aceite Vegetal', sold: 134, revenue: 737 },
  ];

  const userSales = [
    { user: 'Ana García', sales: 25780, invoices: 89 },
    { user: 'Carlos López', sales: 19650, invoices: 67 },
    { user: 'María Rodríguez', sales: 15430, invoices: 52 },
    { user: 'Juan Pérez', sales: 12340, invoices: 41 },
  ];

  const monthlyGrowth = [
    { month: 'Ene', sales: 45000, growth: 5.2 },
    { month: 'Feb', sales: 52000, growth: 15.6 },
    { month: 'Mar', sales: 48000, growth: -7.7 },
    { month: 'Abr', sales: 61000, growth: 27.1 },
    { month: 'May', sales: 55000, growth: -9.8 },
    { month: 'Jun', sales: 67000, growth: 21.8 },
  ];

  const exportReport = (format: 'pdf' | 'excel') => {
    console.log(`Exportando reporte en formato ${format}`);
    // Aquí se implementaría la lógica de exportación
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes e Insights</h1>
          <p className="text-gray-600">Análisis detallado de ventas y rendimiento</p>
        </div>
        
        <div className="flex gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Hoy</SelectItem>
              <SelectItem value="week">Esta Semana</SelectItem>
              <SelectItem value="month">Este Mes</SelectItem>
              <SelectItem value="year">Este Año</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={() => exportReport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          
          <Button variant="outline" onClick={() => exportReport('excel')}>
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ventas Totales</p>
                <p className="text-2xl font-bold text-gray-900">$67,420</p>
                <p className="text-sm text-green-600">+12.5% vs período anterior</p>
              </div>
              <div className="p-3 rounded-full bg-green-50">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Facturas Emitidas</p>
                <p className="text-2xl font-bold text-gray-900">395</p>
                <p className="text-sm text-blue-600">+8.2% vs período anterior</p>
              </div>
              <div className="p-3 rounded-full bg-blue-50">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Productos Vendidos</p>
                <p className="text-2xl font-bold text-gray-900">1,284</p>
                <p className="text-sm text-purple-600">+15.3% vs período anterior</p>
              </div>
              <div className="p-3 rounded-full bg-purple-50">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ticket Promedio</p>
                <p className="text-2xl font-bold text-gray-900">$170.68</p>
                <p className="text-sm text-orange-600">+3.8% vs período anterior</p>
              </div>
              <div className="p-3 rounded-full bg-orange-50">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Ventas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Ventas']} />
                <Line 
                  type="monotone" 
                  dataKey="ventas" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Product Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Productos Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={productSalesData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {productSalesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Productos Más Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.sold} unidades vendidas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">${product.revenue}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Rendimiento por Usuario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userSales.map((user, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.user}</p>
                      <p className="text-sm text-gray-600">{user.invoices} facturas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">${user.sales.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Growth */}
      <Card>
        <CardHeader>
          <CardTitle>Crecimiento Mensual</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'sales' ? `$${value?.toLocaleString()}` : `${value}%`,
                  name === 'sales' ? 'Ventas' : 'Crecimiento'
                ]} 
              />
              <Bar dataKey="sales" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
