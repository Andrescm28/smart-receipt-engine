import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export interface ProductRow {
  id: string;
  code: string;
  name: string;
  price: number;
  cost_price: number;
  category: string | null;
  unit: string;
  stock: number;
  min_stock: number;
  active: boolean;
}

interface ProductsProps {
  userRole: 'admin' | 'cashier' | 'inventory' | 'accountant';
}

const emptyForm = { code: '', name: '', price: 0, cost_price: 0, category: '', unit: 'Unidad', stock: 0, min_stock: 0 };

const Products = ({ userRole }: ProductsProps) => {
  const { toast } = useToast();
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);

  const units = ['Unidad', 'Kilogramo', 'Libra', 'Litro', 'Paquete'];

  const load = async () => {
    setLoading(true);
    const [{ data: prods, error: pErr }, { data: cats }] = await Promise.all([
      supabase.from('products').select('*').order('name'),
      supabase.from('categories').select('name').order('name'),
    ]);
    if (pErr) toast({ title: 'Error', description: pErr.message, variant: 'destructive' });
    setProducts((prods as ProductRow[]) ?? []);
    setCategories((cats ?? []).map((c: any) => c.name));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async () => {
    if (!form.code || !form.name || !form.category || !form.unit) {
      toast({ title: 'Error', description: 'Completa todos los campos', variant: 'destructive' });
      return;
    }
    if (editingId) {
      const { error } = await supabase.from('products').update(form).eq('id', editingId);
      if (error) return toast({ title: 'Error', description: error.message, variant: 'destructive' });
      toast({ title: 'Producto actualizado' });
    } else {
      const { error } = await supabase.from('products').insert(form);
      if (error) return toast({ title: 'Error', description: error.message, variant: 'destructive' });
      toast({ title: 'Producto creado' });
    }
    setIsDialogOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    load();
  };

  const handleEdit = (p: ProductRow) => {
    setEditingId(p.id);
    setForm({
      code: p.code,
      name: p.name,
      price: Number(p.price),
      cost_price: Number(p.cost_price ?? 0),
      category: p.category ?? '',
      unit: p.unit,
      stock: Number(p.stock),
      min_stock: Number(p.min_stock),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) return toast({ title: 'Error', description: error.message, variant: 'destructive' });
    toast({ title: 'Producto eliminado' });
    load();
  };

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsDialogOpen(true);
  };

  const stockBadge = (s: number, min: number) => {
    if (s <= min) return 'bg-red-100 text-red-800';
    if (s <= min * 2) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Productos</h1>
          <p className="text-gray-600">Administra el inventario del supermercado</p>
        </div>
        {(userRole === 'admin' || userRole === 'inventory') && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNew} className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Nuevo Producto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div><Label>Código</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></div>
                <div><Label>Nombre</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Precio de costo (₡)</Label><Input type="number" step="0.01" value={form.cost_price} onChange={(e) => setForm({ ...form, cost_price: parseFloat(e.target.value) || 0 })} /></div>
                <div><Label>Precio de venta (₡)</Label><Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} /></div>
                <div>
                  <Label>Categoría</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                    <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Unidad</Label>
                  <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{units.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Stock</Label><Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: parseFloat(e.target.value) || 0 })} /></div>
                <div><Label>Stock mínimo</Label><Input type="number" value={form.min_stock} onChange={(e) => setForm({ ...form, min_stock: parseFloat(e.target.value) || 0 })} /></div>
                <Button onClick={handleSave} className="w-full">{editingId ? 'Actualizar' : 'Crear'}</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input placeholder="Buscar por nombre o código..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-center text-gray-500">Cargando...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <Card key={p.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{p.name}</CardTitle>
                    <p className="text-sm text-gray-600">Código: {p.code}</p>
                  </div>
                  {(userRole === 'admin' || userRole === 'inventory') && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(p)}><Edit className="h-4 w-4" /></Button>
                      {userRole === 'admin' && (
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)} className="text-red-600"><Trash2 className="h-4 w-4" /></Button>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between"><span className="text-sm text-gray-600">Costo:</span><span className="font-medium text-gray-700">₡{Number(p.cost_price ?? 0).toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-sm text-gray-600">Precio venta:</span><span className="font-semibold text-green-600">₡{Number(p.price).toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-sm text-gray-600">Categoría:</span><Badge variant="secondary">{p.category}</Badge></div>
                  <div className="flex justify-between"><span className="text-sm text-gray-600">Unidad:</span><span className="text-sm">{p.unit}</span></div>
                  <div className="flex justify-between items-center"><span className="text-sm text-gray-600">Stock:</span><Badge className={stockBadge(Number(p.stock), Number(p.min_stock))}>{Number(p.stock)}</Badge></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <Card><CardContent className="text-center py-8 text-gray-500">No se encontraron productos</CardContent></Card>
      )}
    </div>
  );
};

export default Products;
