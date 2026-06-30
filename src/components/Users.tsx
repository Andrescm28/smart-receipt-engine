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

type Role = 'admin' | 'cashier' | 'inventory' | 'accountant';

interface UserRow {
  id: string;
  full_name: string | null;
  email: string | null;
  roles: Role[];
  created_at: string;
  supermarket_id: string | null;
}

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'admin', label: 'Administrador' },
  { value: 'cashier', label: 'Cajero/Cajera' },
  { value: 'inventory', label: 'Inventario' },
  { value: 'accountant', label: 'Contador' },
];

const ROLE_LABEL: Record<Role, string> = {
  admin: 'Administrador',
  cashier: 'Cajero',
  inventory: 'Inventario',
  accountant: 'Contador',
};

const ROLE_COLOR: Record<Role, string> = {
  admin: 'bg-purple-100 text-purple-800',
  cashier: 'bg-blue-100 text-blue-800',
  inventory: 'bg-amber-100 text-amber-800',
  accountant: 'bg-emerald-100 text-emerald-800',
};

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
    role: 'cashier' as Role,
    supermarket_id: '',
  });

  const load = async () => {
    setLoading(true);
    const [{ data: profiles }, { data: roles }, { data: sms }] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('user_roles').select('user_id, role'),
      supabase.from('supermarkets').select('id, name').order('name'),
    ]);
    const byUser: Record<string, Role[]> = {};
    (roles ?? []).forEach((r: any) => { byUser[r.user_id] = [...(byUser[r.user_id] ?? []), r.role as Role]; });
    setUsers((profiles ?? []).map((p: any) => ({ ...p, roles: byUser[p.id] ?? [] })));
    setSupermarkets((sms as Supermarket[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleRole = async (userId: string, role: Role, has: boolean) => {
    if (has) {
      const { error } = await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', role);
      if (error) return toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      const { error } = await supabase.from('user_roles').insert({ user_id: userId, role });
      if (error) return toast({ title: 'Error', description: error.message, variant: 'destructive' });
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
  const smName = (id: string | null) => supermarkets.find((s) => s.id === id)?.name ?? '—';
  const countBy = (r: Role) => users.filter((u) => u.roles.includes(r)).length;

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
                <Label>Rol inicial</Label>
                <Select value={form.role} onValueChange={(v: Role) => setForm({ ...form, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">Podrás agregar más roles después si es necesario.</p>
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
                    <th className="text-left p-4 font-medium text-gray-600">Roles</th>
                    <th className="text-left p-4 font-medium text-gray-600">Supermercado</th>
                    <th className="text-left p-4 font-medium text-gray-600">Gestionar roles</th>
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
                        <div className="flex gap-1 flex-wrap">
                          {u.roles.length === 0 && <span className="text-xs text-gray-400">Sin rol</span>}
                          {u.roles.map((r) => (
                            <Badge key={r} className={ROLE_COLOR[r]}>{ROLE_LABEL[r]}</Badge>
                          ))}
                        </div>
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
                        <div className="flex flex-wrap gap-1">
                          {ROLE_OPTIONS.map((o) => {
                            const has = u.roles.includes(o.value);
                            return (
                              <Button
                                key={o.value}
                                size="sm"
                                variant={has ? 'default' : 'outline'}
                                onClick={() => toggleRole(u.id, o.value, has)}
                              >
                                {has ? '−' : '+'} {ROLE_LABEL[o.value]}
                              </Button>
                            );
                          })}
                        </div>
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

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-gray-800">{users.length}</div><p className="text-gray-600 text-sm">Total</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-purple-600">{countBy('admin')}</div><p className="text-gray-600 text-sm">Administradores</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-blue-600">{countBy('cashier')}</div><p className="text-gray-600 text-sm">Cajeros</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-amber-600">{countBy('inventory')}</div><p className="text-gray-600 text-sm">Inventario</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-emerald-600">{countBy('accountant')}</div><p className="text-gray-600 text-sm">Contadores</p></CardContent></Card>
      </div>
    </div>
  );
};

export default Users;
