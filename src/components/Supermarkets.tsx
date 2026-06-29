import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Store, Pencil } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Supermarket {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  active: boolean;
}

const Supermarkets = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<Supermarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Supermarket | null>(null);
  const [form, setForm] = useState({ name: '', address: '', phone: '', active: true });

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('supermarkets').select('*').order('created_at', { ascending: false });
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    setItems((data as Supermarket[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', address: '', phone: '', active: true });
    setOpen(true);
  };
  const openEdit = (s: Supermarket) => {
    setEditing(s);
    setForm({ name: s.name, address: s.address ?? '', phone: s.phone ?? '', active: s.active });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) return toast({ title: 'Nombre requerido', variant: 'destructive' });
    const payload = { name: form.name.trim(), address: form.address || null, phone: form.phone || null, active: form.active };
    const { error } = editing
      ? await supabase.from('supermarkets').update(payload).eq('id', editing.id)
      : await supabase.from('supermarkets').insert(payload);
    if (error) return toast({ title: 'Error', description: error.message, variant: 'destructive' });
    toast({ title: editing ? 'Supermercado actualizado' : 'Supermercado creado' });
    setOpen(false);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Supermercados</h1>
          <p className="text-gray-600">Administra las sucursales del sistema.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" /> Nuevo</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? 'Editar' : 'Nuevo'} supermercado</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Nombre</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Dirección</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
              <div><Label>Teléfono</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                Activo
              </label>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={save}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle>Listado</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="text-gray-500 text-center py-6">Cargando...</p> : items.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No hay supermercados aún.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((s) => (
                <Card key={s.id}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Store className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold">{s.name}</span>
                      </div>
                      <Badge className={s.active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}>
                        {s.active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    {s.address && <p className="text-sm text-gray-600">{s.address}</p>}
                    {s.phone && <p className="text-sm text-gray-600">{s.phone}</p>}
                    <Button size="sm" variant="outline" onClick={() => openEdit(s)}>
                      <Pencil className="h-3 w-3 mr-1" /> Editar
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Supermarkets;
