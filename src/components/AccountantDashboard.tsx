import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Receipt, FileCheck, Clock, AlertCircle, DollarSign } from 'lucide-react';

interface Comprobante {
  id: string;
  consecutivo: string | null;
  clave_numerica: string | null;
  tipo_comprobante: string | null;
  estado: string | null;
  total: number | null;
  fecha_emision: string | null;
  receptor_nombre: string | null;
  hacienda_mensaje: string | null;
}

const estadoBadge = (e: string | null) => {
  const map: Record<string, string> = {
    aceptado: 'bg-green-100 text-green-800',
    pendiente: 'bg-yellow-100 text-yellow-800',
    rechazado: 'bg-red-100 text-red-800',
    enviado: 'bg-blue-100 text-blue-800',
    error: 'bg-red-100 text-red-800',
  };
  return map[e?.toLowerCase() ?? ''] ?? 'bg-gray-100 text-gray-800';
};

const AccountantDashboard = () => {
  const [comprobantes, setComprobantes] = useState<Comprobante[]>([]);
  const [loading, setLoading] = useState(true);
  const [invoiceTotals, setInvoiceTotals] = useState({ total: 0, count: 0, today: 0 });

  const load = async () => {
    setLoading(true);
    const [{ data: comps }, { data: invs }] = await Promise.all([
      supabase.from('comprobantes_electronicos').select('*').order('fecha_emision', { ascending: false }).limit(100),
      supabase.from('invoices').select('total, created_at'),
    ]);
    setComprobantes((comps as Comprobante[]) ?? []);

    const today = new Date().toISOString().slice(0, 10);
    const totals = (invs ?? []).reduce(
      (acc: any, i: any) => {
        const t = Number(i.total) || 0;
        acc.total += t;
        acc.count += 1;
        if (i.created_at?.slice(0, 10) === today) acc.today += t;
        return acc;
      },
      { total: 0, count: 0, today: 0 }
    );
    setInvoiceTotals(totals);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const stats = {
    total: comprobantes.length,
    aceptados: comprobantes.filter((c) => c.estado?.toLowerCase() === 'aceptado').length,
    pendientes: comprobantes.filter((c) => ['pendiente', 'enviado'].includes(c.estado?.toLowerCase() ?? '')).length,
    rechazados: comprobantes.filter((c) => ['rechazado', 'error'].includes(c.estado?.toLowerCase() ?? '')).length,
    totalFacturado: comprobantes.reduce((s, c) => s + (Number(c.total) || 0), 0),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard de Contaduría</h1>
        <p className="text-gray-600">Monitoreo de facturación electrónica ante Hacienda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Receipt className="h-6 w-6 text-blue-600" />} label="Comprobantes" value={stats.total} />
        <StatCard icon={<FileCheck className="h-6 w-6 text-green-600" />} label="Aceptados" value={stats.aceptados} />
        <StatCard icon={<Clock className="h-6 w-6 text-yellow-600" />} label="Pendientes" value={stats.pendientes} />
        <StatCard icon={<AlertCircle className="h-6 w-6 text-red-600" />} label="Rechazados / Error" value={stats.rechazados} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={<DollarSign className="h-6 w-6 text-green-600" />} label="Total facturado (electrónico)" value={`₡${stats.totalFacturado.toFixed(2)}`} />
        <StatCard icon={<DollarSign className="h-6 w-6 text-blue-600" />} label="Ventas del día" value={`₡${invoiceTotals.today.toFixed(2)}`} />
        <StatCard icon={<DollarSign className="h-6 w-6 text-purple-600" />} label="Total acumulado en ventas" value={`₡${invoiceTotals.total.toFixed(2)}`} />
      </div>

      <Card>
        <CardHeader><CardTitle>Últimos comprobantes electrónicos</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-gray-500 py-6">Cargando...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-gray-600">
                    <th className="p-3">Fecha</th>
                    <th className="p-3">Consecutivo</th>
                    <th className="p-3">Tipo</th>
                    <th className="p-3">Receptor</th>
                    <th className="p-3">Total</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3">Mensaje Hacienda</th>
                  </tr>
                </thead>
                <tbody>
                  {comprobantes.map((c) => (
                    <tr key={c.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-sm">{c.fecha_emision ? new Date(c.fecha_emision).toLocaleString() : '—'}</td>
                      <td className="p-3 text-sm font-mono">{c.consecutivo || '—'}</td>
                      <td className="p-3 text-sm">{c.tipo_comprobante || '—'}</td>
                      <td className="p-3 text-sm">{c.receptor_nombre || '—'}</td>
                      <td className="p-3 text-sm">₡{Number(c.total ?? 0).toFixed(2)}</td>
                      <td className="p-3"><Badge className={estadoBadge(c.estado)}>{c.estado ?? 'sin estado'}</Badge></td>
                      <td className="p-3 text-xs text-gray-600 max-w-xs truncate">{c.hacienda_mensaje || '—'}</td>
                    </tr>
                  ))}
                  {comprobantes.length === 0 && (
                    <tr><td colSpan={7} className="text-center text-gray-500 py-8">
                      Aún no hay comprobantes electrónicos. Configura la facturación electrónica en el módulo de Emisor.
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) => (
  <Card>
    <CardContent className="p-6 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
      {icon}
    </CardContent>
  </Card>
);

export default AccountantDashboard;
