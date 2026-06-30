import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Plus } from 'lucide-react';

interface Req {
  id: string;
  product_id: string;
  adjustment_type: 'remove' | 'add';
  quantity: number;
  reason: string | null;
  status: 'pending' | 'approved' | 'rejected';
  review_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
}

interface Product { id: string; name: string; code: string; stock: number }

const statusBadge = (s: string) => ({
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}[s] ?? 'bg-gray-100');

const InventoryRequests = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<Req[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ product_id: '', adjustment_type: 'remove' as 'remove' | 'add', quantity: 0, reason: '' });

  const load = async () => {
    const [{ data: reqs }, { data: prods }] = await Promise.all([
      supabase.from('inventory_adjustment_requests').select('*').order('created_at', { ascending: false }),
      supabase.from('products').select('id,name,code,stock').order('name'),
    ]);
    setRequests((reqs as Req[]) ?? []);
    setProducts((prods as Product[]) ?? []);
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.product_id || form.quantity <= 0) {
      return toast({ title: 'Completa producto y cantidad', variant: 'destructive' });
    }
    setSaving(true);
    const { error } = await supabase.from('inventory_adjustment_requests').insert({
      product_id: form.product_id,
      adjustment_type: form.adjustment_type,
      quantity: form.quantity,
      reason: form.reason || null,
      requested_by: user!.id,
    });
    setSaving(false);
    if (error) return toast({ title: 'Error', description: error.message, variant: 'destructive' });
    toast({ title: 'Solicitud enviada al administrador' });
    setOpen(false);
    setForm({ product_id: '', adjustment_type: 'remove', quantity: 0, reason: '' });
    load();
  };

  const prodName = (id: string) => products.find((p) => p.id === id)?.name ?? id;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis solicitudes de inventario</h1>
          <p className="text-gray-600">Las disminuciones de stock requieren aprobación del administrador.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Nueva solicitud</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Solicitar ajuste de stock</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Producto</Label>
                <Select value={form.product_id} onValueChange={(v) => setForm({ ...form, product_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccione" /></SelectTrigger>
                  <SelectContent>
                    {products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} (stock: {p.stock})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tipo de ajuste</Label>
                <Select value={form.adjustment_type} onValueChange={(v: 'remove' | 'add') => setForm({ ...form, adjustment_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remove">Disminuir (merma, daño, vencimiento)</SelectItem>
                    <SelectItem value="add">Aumentar (recuento, devolución)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Cantidad</Label><Input type="number" step="0.001" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: parseFloat(e.target.value) || 0 })} /></div>
              <div><Label>Motivo</Label><Textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Explica brevemente la razón" /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={submit} disabled={saving}>{saving ? 'Enviando...' : 'Enviar solicitud'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle>Historial</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-gray-600">
                  <th className="p-3">Fecha</th><th className="p-3">Producto</th><th className="p-3">Tipo</th>
                  <th className="p-3">Cantidad</th><th className="p-3">Motivo</th><th className="p-3">Estado</th><th className="p-3">Notas admin</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-sm">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="p-3 text-sm">{prodName(r.product_id)}</td>
                    <td className="p-3 text-sm">{r.adjustment_type === 'remove' ? 'Disminuir' : 'Aumentar'}</td>
                    <td className="p-3 text-sm">{Number(r.quantity)}</td>
                    <td className="p-3 text-sm">{r.reason || '—'}</td>
                    <td className="p-3"><Badge className={statusBadge(r.status)}>{r.status}</Badge></td>
                    <td className="p-3 text-sm">{r.review_notes || '—'}</td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr><td colSpan={7} className="text-center text-gray-500 py-8">Sin solicitudes</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryRequests;
