import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

const Reports = () => {
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('week');
  const [byDay, setByDay] = useState<{ name: string; ventas: number; facturas: number }[]>([]);
  const [byCategory, setByCategory] = useState<{ name: string; value: number }[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; sold: number; revenue: number }[]>([]);
  const [byCashier, setByCashier] = useState<{ name: string; total: number; count: number }[]>([]);

  useEffect(() => {
    const load = async () => {
      const since = new Date();
      if (dateRange === 'today') since.setHours(0, 0, 0, 0);
      else if (dateRange === 'week') since.setDate(since.getDate() - 7);
      else since.setMonth(since.getMonth() - 1);

      const [{ data: invoices }, { data: items }, { data: profiles }] = await Promise.all([
        supabase.from('invoices').select('id, total, created_at, cashier_id').eq('status', 'paid').gte('created_at', since.toISOString()),
        supabase.from('invoice_items').select('product_name, quantity, line_total, created_at').gte('created_at', since.toISOString()),
        supabase.from('profiles').select('id, full_name, email'),
      ]);

      // By day
      const dayMap: Record<string, { ventas: number; facturas: number }> = {};
      (invoices ?? []).forEach((i: any) => {
        const k = new Date(i.created_at).toLocaleDateString();
        if (!dayMap[k]) dayMap[k] = { ventas: 0, facturas: 0 };
        dayMap[k].ventas += Number(i.total);
        dayMap[k].facturas += 1;
      });
      setByDay(Object.entries(dayMap).map(([name, v]) => ({ name, ...v })));

      // Top products + by name aggregated
      const prodMap: Record<string, { sold: number; revenue: number }> = {};
      (items ?? []).forEach((it: any) => {
        if (!prodMap[it.product_name]) prodMap[it.product_name] = { sold: 0, revenue: 0 };
        prodMap[it.product_name].sold += Number(it.quantity);
        prodMap[it.product_name].revenue += Number(it.line_total);
      });
      const top = Object.entries(prodMap)
        .map(([name, v]) => ({ name, ...v }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);
      setTopProducts(top);

      // By category — need category from products
      const { data: prods } = await supabase.from('products').select('name, category');
      const catByName: Record<string, string> = {};
      (prods ?? []).forEach((p: any) => { catByName[p.name] = p.category ?? 'Otros'; });
      const catMap: Record<string, number> = {};
      (items ?? []).forEach((it: any) => {
        const c = catByName[it.product_name] ?? 'Otros';
        catMap[c] = (catMap[c] ?? 0) + Number(it.line_total);
      });
      setByCategory(Object.entries(catMap).map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 })));

      // By cashier
      const profMap: Record<string, string> = {};
      (profiles ?? []).forEach((p: any) => { profMap[p.id] = p.full_name || p.email || p.id.slice(0, 8); });
      const cashMap: Record<string, { total: number; count: number }> = {};
      (invoices ?? []).forEach((i: any) => {
        const n = profMap[i.cashier_id] ?? 'Desconocido';
        if (!cashMap[n]) cashMap[n] = { total: 0, count: 0 };
        cashMap[n].total += Number(i.total);
        cashMap[n].count += 1;
      });
      setByCashier(Object.entries(cashMap).map(([name, v]) => ({ name, ...v })));
    };
    load();
  }, [dateRange]);

  const totalRevenue = byDay.reduce((s, d) => s + d.ventas, 0);
  const totalInvoices = byDay.reduce((s, d) => s + d.facturas, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-600">Análisis de ventas y rendimiento</p>
        </div>
        <Select value={dateRange} onValueChange={(v: any) => setDateRange(v)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Hoy</SelectItem>
            <SelectItem value="week">Última semana</SelectItem>
            <SelectItem value="month">Último mes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-6"><p className="text-sm text-gray-600">Ingresos totales</p><p className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-sm text-gray-600">Facturas</p><p className="text-2xl font-bold text-blue-600">{totalInvoices}</p></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-sm text-gray-600">Ticket promedio</p><p className="text-2xl font-bold text-purple-600">${totalInvoices ? (totalRevenue / totalInvoices).toFixed(2) : '0.00'}</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Ventas por Día</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="ventas" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Ventas por Categoría</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Top Productos</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{i + 1}</Badge>
                  <span className="font-medium">{p.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{p.sold} unidades</p>
                  <p className="font-semibold text-green-600">${p.revenue.toFixed(2)}</p>
                </div>
              </div>
            ))}
            {topProducts.length === 0 && <p className="text-center text-gray-500 py-4">Sin datos</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Rendimiento por Cajero</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {byCashier.map((c) => (
              <div key={c.name} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="font-medium">{c.name}</span>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{c.count} facturas</p>
                  <p className="font-semibold text-green-600">${c.total.toFixed(2)}</p>
                </div>
              </div>
            ))}
            {byCashier.length === 0 && <p className="text-center text-gray-500 py-4">Sin datos</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
