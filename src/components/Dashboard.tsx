import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, FileText, TrendingUp, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const [stats, setStats] = useState({ todaySales: 0, todayInvoices: 0, todayItems: 0, lowStock: 0 });
  const [weekly, setWeekly] = useState<{ name: string; ventas: number }[]>([]);

  useEffect(() => {
    const load = async () => {
      const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
      const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); sevenDaysAgo.setHours(0, 0, 0, 0);

      const [{ data: today }, { data: weekInv }, { data: items }, { data: low }] = await Promise.all([
        supabase.from('invoices').select('total').eq('status', 'paid').gte('created_at', startOfToday.toISOString()),
        supabase.from('invoices').select('total, created_at').eq('status', 'paid').gte('created_at', sevenDaysAgo.toISOString()),
        supabase.from('invoice_items').select('quantity, created_at').gte('created_at', startOfToday.toISOString()),
        supabase.from('products').select('id, stock, min_stock').eq('active', true),
      ]);

      const todaySales = (today ?? []).reduce((s: number, r: any) => s + Number(r.total), 0);
      const todayItems = (items ?? []).reduce((s: number, r: any) => s + Number(r.quantity), 0);
      const lowStock = (low ?? []).filter((p: any) => Number(p.stock) <= Number(p.min_stock)).length;
      setStats({ todaySales, todayInvoices: today?.length ?? 0, todayItems, lowStock });

      const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const buckets: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        buckets[d.toDateString()] = 0;
      }
      (weekInv ?? []).forEach((r: any) => {
        const k = new Date(r.created_at).toDateString();
        if (k in buckets) buckets[k] += Number(r.total);
      });
      setWeekly(Object.entries(buckets).map(([k, v]) => ({ name: days[new Date(k).getDay()], ventas: Math.round(v * 100) / 100 })));
    };
    load();
  }, []);

  const cards = [
    { title: 'Ventas Hoy', value: `₡${stats.todaySales.toFixed(2)}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Facturas Hoy', value: String(stats.todayInvoices), icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Productos Vendidos', value: String(stats.todayItems), icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Stock Bajo', value: String(stats.lowStock), icon: TrendingUp, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Resumen de tu supermercado</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{c.title}</p>
                  <p className="text-2xl font-bold mt-1">{c.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${c.bg}`}>
                  <c.icon className={`h-6 w-6 ${c.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Ventas Últimos 7 Días</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weekly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="ventas" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
