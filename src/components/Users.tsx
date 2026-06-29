import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, User, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface UserRow {
  id: string;
  full_name: string | null;
  email: string | null;
  roles: ('admin' | 'cashier')[];
  created_at: string;
  supermarket_id: string | null;
}

interface Supermarket { id: string; name: string }

const Users = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'cashier' as 'admin' | 'cashier',
    supermarket_id: '',
  });

  const load = async () => {
    setLoading(true);
    const [{ data: profiles }, { data: roles }, { data: sms }] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('user_roles').select('user_id, role'),
      supabase.from('supermarkets').select('id, name').order('name'),
    ]);
    const byUser: Record<string, ('admin' | 'cashier')[]> = {};
    (roles ?? []).forEach((r: any) => { byUser[r.user_id] = [...(byUser[r.user_id] ?? []), r.role]; });
    setUsers((profiles ?? []).map((p: any) => ({ ...p, roles: byUser[p.id] ?? [] })));
    setSupermarkets((sms as Supermarket[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleAdmin = async (userId: string, hasAdmin: boolean) => {
    if (hasAdmin) {
      const { error } = await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', 'admin');
      if (error) return toast({ title: 'Error', description: error.message, variant: 'destructive' });
      toast({ title: 'Permiso de admin removido' });
    } else {
      const { error } = await supabase.from('user_roles').insert({ user_id: userId, role: 'admin' });
      if (error) return toast({ title: 'Error', description: error.message, variant: 'destructive' });
      toast({ title: 'Promovido a administrador' });
    }
    load();
  };

  const updateSupermarket = async (userId: string, supermarket_id: string) => {
    const { error } = await supabase.from('profiles').update({ supermarket_id: supermarket_id || null }).eq('id', userId);
    if (error) return toast({ title: 'Error', description: error.message, variant: 'destructive' });
    toast({ title: 'Supermercado actualizado' });
    load();
  };

  const createUser = async () => {
    if (!form.full_name || !form.email || !form.password) {
      return toast({ title: 'Completa todos los campos', variant: 'destructive' });
    }
    setSaving(true);
    const { data, error } = await supabase.functions.invoke('admin-create-user', {
      body: {
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        role: form.role,
        supermarket_id: form.supermarket_id || null,
      },
    });
    setSaving(false);
    if (error || (data as any)?.error) {
      return toast({ title: 'Error', description: (data as any)?.error ?? error?.message, variant: 'destructive' });
    }
    toast({ title: 'Usuario creado correctamente' });
    setOpen(false);
    setForm({ full_name: '', email: '', password: '', role: 'cashier', supermarket_id: '' });
    load();
  };

  const filtered = users.filter(
    (u) => (u.full_name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
           (u.email ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  const isAdmin = (u: UserRow) => u.roles.includes('admin');
  const smName = (id: string | null) => supermarkets.find((s) => s.id === id)?.name ?? '—';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600">Crea y administra al personal de cada supermercado.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Nuevo usuario</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Crear usuario</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Nombre completo</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
              <div><Label>Correo</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label>Contraseña (mín. 6)</Label><Input type="password" minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
              <div>
                <Label>Rol</Label>
                <Select value={form.role} onValueChange={(v: 'admin' | 'cashier') => setForm({ ...form, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="cashier">Cajero/Cajera</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Supermercado asignado</Label>
                <Select value={form.supermarket_id} onValueChange={(v) => setForm({ ...form, supermarket_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccione una sucursal" /></SelectTrigger>
                  <SelectContent>
                    {supermarkets.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {supermarkets.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">Primero registra un supermercado en el módulo correspondiente.</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={createUser} disabled={saving}>{saving ? 'Creando...' : 'Crear'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input placeholder="Buscar por nombre o email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Usuarios</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="text-center text-gray-500 py-4">Cargando...</p> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium text-gray-600">Usuario</th>
                    <th className="text-left p-4 font-medium text-gray-600">Email</th>
                    <th className="text-left p-4 font-medium text-gray-600">Rol</th>
                    <th className="text-left p-4 font-medium text-gray-600">Supermercado</th>
                    <th className="text-left p-4 font-medium text-gray-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <span className="font-medium">{u.full_name || '—'}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600">{u.email}</td>
                      <td className="p-4">
                        <Badge className={isAdmin(u) ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}>
                          {isAdmin(u) ? 'Administrador' : 'Cajero'}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm">
                        <Select value={u.supermarket_id ?? ''} onValueChange={(v) => updateSupermarket(u.id, v)}>
                          <SelectTrigger className="w-48"><SelectValue placeholder={smName(u.supermarket_id)} /></SelectTrigger>
                          <SelectContent>
                            {supermarkets.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-4">
                        <Button variant="outline" size="sm" onClick={() => toggleAdmin(u.id, isAdmin(u))}>
                          {isAdmin(u) ? 'Quitar Admin' : 'Hacer Admin'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && <p className="text-center text-gray-500 py-8">No hay usuarios</p>}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card><CardContent className="p-6 text-center"><div className="text-2xl font-bold text-blue-600">{users.length}</div><p className="text-gray-600">Total</p></CardContent></Card>
        <Card><CardContent className="p-6 text-center"><div className="text-2xl font-bold text-purple-600">{users.filter(isAdmin).length}</div><p className="text-gray-600">Administradores</p></CardContent></Card>
        <Card><CardContent className="p-6 text-center"><div className="text-2xl font-bold text-green-600">{users.filter((u) => !isAdmin(u)).length}</div><p className="text-gray-600">Cajeros</p></CardContent></Card>
      </div>
    </div>
  );
};

export default Users;
