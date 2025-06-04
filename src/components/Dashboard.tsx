
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Package, FileText, TrendingUp, DollarSign } from 'lucide-react';

const Dashboard = () => {
  const salesData = [
    { name: 'Lun', ventas: 4000 },
    { name: 'Mar', ventas: 3000 },
    { name: 'Mié', ventas: 5000 },
    { name: 'Jue', ventas: 2780 },
    { name: 'Vie', ventas: 6890 },
    { name: 'Sáb', ventas: 8390 },
    { name: 'Dom', ventas: 3490 },
  ];

  const stats = [
    {
      title: 'Ventas Hoy',
      value: '$24,580',
      change: '+12.5%',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Facturas Emitidas',
      value: '142',
      change: '+8.2%',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Productos Vendidos',
      value: '856',
      change: '+15.3%',
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Crecimiento',
      value: '23.1%',
      change: '+2.4%',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const topProducts = [
    { name: 'Coca Cola 500ml', sold: 85, revenue: '$340' },
    { name: 'Pan Integral', sold: 72, revenue: '$216' },
    { name: 'Leche Descremada', sold: 65, revenue: '$195' },
    { name: 'Arroz Blanco 1kg', sold: 58, revenue: '$174' },
    { name: 'Aceite Vegetal', sold: 45, revenue: '$225' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Resumen de actividad y métricas principales</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className={`text-sm ${stat.color}`}>{stat.change} vs ayer</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Ventas de la Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Ventas']} />
                <Bar dataKey="ventas" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
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
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.sold} unidades vendidas</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{product.revenue}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 text-center bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Nueva Factura</p>
            </button>
            <button className="p-4 text-center bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <Package className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Agregar Producto</p>
            </button>
            <button className="p-4 text-center bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <BarChart className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Ver Reportes</p>
            </button>
            <button className="p-4 text-center bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
              <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Analytics</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
