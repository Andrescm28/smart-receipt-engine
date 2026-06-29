import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface UserRow {
  id: string;
  full_name: string | null;
  email: string | null;
  roles: ('admin' | 'cashier')[];
  created_at: string;
}

const Users = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('user_roles').select('user_id, role'),
    ]);
    const byUser: Record<string, ('admin' | 'cashier')[]> = {};
    (roles ?? []).forEach((r: any) => {
      byUser[r.user_id] = [...(byUser[r.user_id] ?? []), r.role];
    });
    setUsers((profiles ?? []).map((p: any) => ({ ...p, roles: byUser[p.id] ?? [] })));
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

  const filtered = users.filter(
    (u) =>
      (u.full_name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isAdmin = (u: UserRow) => u.roles.includes('admin');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <p className="text-gray-600">Administra los usuarios del sistema. Los nuevos usuarios se registran desde la pantalla de inicio de sesión.</p>
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
                    <th className="text-left p-4 font-medium text-gray-600">Creado</th>
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
                      <td className="p-4 text-sm text-gray-600">{new Date(u.created_at).toLocaleDateString()}</td>
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
