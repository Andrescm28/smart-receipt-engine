import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Req {
  id: string;
  product_id: string;
  requested_by: string;
  adjustment_type: 'remove' | 'add';
  quantity: number;
  reason: string | null;
  status: 'pending' | 'approved' | 'rejected';
  review_notes: string | null;
  created_at: string;
}

const statusBadge = (s: string) => ({
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}[s] ?? 'bg-gray-100');

const InventoryApprovals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<Req[]>([]);
  const [products, setProducts] = useState<Record<string, { name: string; stock: number }>>({});
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = async () => {
    const [{ data: reqs }, { data: prods }, { data: profs }] = await Promise.all([
      supabase.from('inventory_adjustment_requests').select('*').order('created_at', { ascending: false }),
      supabase.from('products').select('id,name,stock'),
      supabase.from('profiles').select('id,full_name,email'),
    ]);
    setRequests((reqs as Req[]) ?? []);
    const pmap: Record<string, { name: string; stock: number }> = {};
    (prods ?? []).forEach((p: any) => { pmap[p.id] = { name: p.name, stock: Number(p.stock) }; });
    setProducts(pmap);
    const umap: Record<string, string> = {};
    (profs ?? []).forEach((p: any) => { umap[p.id] = p.full_name || p.email || p.id; });
    setProfiles(umap);
  };

  useEffect(() => { load(); }, []);

  const review = async (req: Req, status: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('inventory_adjustment_requests')
      .update({ status, reviewed_by: user!.id, review_notes: notes[req.id] || null })
      .eq('id', req.id);
    if (error) return toast({ title: 'Error', description: error.message, variant: 'destructive' });
    toast({ title: status === 'approved' ? 'Solicitud aprobada y stock actualizado' : 'Solicitud rechazada' });
    load();
  };

  const pending = requests.filter((r) => r.status === 'pending');
  const history = requests.filter((r) => r.status !== 'pending');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Aprobaciones de inventario</h1>
        <p className="text-gray-600">Revisa los ajustes de stock solicitados por el equipo de inventario.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Pendientes ({pending.length})</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {pending.length === 0 && <p className="text-gray-500 text-center py-4">Sin solicitudes pendientes</p>}
          {pending.map((r) => (
            <div key={r.id} className="border rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div><span className="text-gray-500">Producto:</span><br /><strong>{products[r.product_id]?.name ?? r.product_id}</strong></div>
                <div><span className="text-gray-500">Stock actual:</span><br />{products[r.product_id]?.stock ?? '—'}</div>
                <div><span className="text-gray-500">Solicita:</span><br />{r.adjustment_type === 'remove' ? `−${r.quantity}` : `+${r.quantity}`}</div>
                <div><span className="text-gray-500">Por:</span><br />{profiles[r.requested_by] ?? r.requested_by}</div>
              </div>
              {r.reason && <p className="text-sm text-gray-700"><strong>Motivo:</strong> {r.reason}</p>}
              <Textarea
                placeholder="Notas de revisión (opcional)"
                value={notes[r.id] ?? ''}
                onChange={(e) => setNotes({ ...notes, [r.id]: e.target.value })}
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" className="text-red-600 border-red-200" onClick={() => review(r, 'rejected')}>Rechazar</Button>
                <Button onClick={() => review(r, 'approved')}>Aprobar</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Historial</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-gray-600">
                  <th className="p-3">Fecha</th><th className="p-3">Producto</th><th className="p-3">Ajuste</th>
                  <th className="p-3">Solicitante</th><th className="p-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                {history.map((r) => (
                  <tr key={r.id} className="border-b">
                    <td className="p-3 text-sm">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="p-3 text-sm">{products[r.product_id]?.name ?? '—'}</td>
                    <td className="p-3 text-sm">{r.adjustment_type === 'remove' ? `−${r.quantity}` : `+${r.quantity}`}</td>
                    <td className="p-3 text-sm">{profiles[r.requested_by] ?? '—'}</td>
                    <td className="p-3"><Badge className={statusBadge(r.status)}>{r.status}</Badge></td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr><td colSpan={5} className="text-center text-gray-500 py-6">Sin historial</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryApprovals;
