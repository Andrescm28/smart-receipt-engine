
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Edit, Trash2, User } from 'lucide-react';

interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'admin' | 'cashier';
  status: 'active' | 'inactive';
  lastLogin: string;
}

const Users = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      username: 'admin',
      name: 'Administrador Sistema',
      email: 'admin@empresa.com',
      role: 'admin',
      status: 'active',
      lastLogin: '2024-01-15 10:30:00'
    },
    {
      id: '2',
      username: 'cajero1',
      name: 'Ana García',
      email: 'ana.garcia@empresa.com',
      role: 'cashier',
      status: 'active',
      lastLogin: '2024-01-15 09:15:00'
    },
    {
      id: '3',
      username: 'cajero2',
      name: 'Carlos López',
      email: 'carlos.lopez@empresa.com',
      role: 'cashier',
      status: 'active',
      lastLogin: '2024-01-14 16:45:00'
    },
    {
      id: '4',
      username: 'cajero3',
      name: 'María Rodríguez',
      email: 'maria.rodriguez@empresa.com',
      role: 'cashier',
      status: 'inactive',
      lastLogin: '2024-01-10 14:20:00'
    }
  ]);

  const [newUser, setNewUser] = useState({
    username: '',
    name: '',
    email: '',
    role: 'cashier' as 'admin' | 'cashier',
    status: 'active' as 'active' | 'inactive'
  });

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveUser = () => {
    if (!newUser.username || !newUser.name || !newUser.email) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios",
        variant: "destructive",
      });
      return;
    }

    // Check if username already exists (except when editing)
    const existingUser = users.find(u => u.username === newUser.username);
    if (existingUser && (!editingUser || existingUser.id !== editingUser.id)) {
      toast({
        title: "Error",
        description: "El nombre de usuario ya existe",
        variant: "destructive",
      });
      return;
    }

    if (editingUser) {
      setUsers(users.map(u => 
        u.id === editingUser.id 
          ? { ...newUser, id: editingUser.id, lastLogin: u.lastLogin }
          : u
      ));
      toast({
        title: "Usuario actualizado",
        description: "El usuario se ha actualizado correctamente",
      });
    } else {
      const user: User = {
        ...newUser,
        id: Date.now().toString(),
        lastLogin: 'Nunca'
      };
      setUsers([...users, user]);
      toast({
        title: "Usuario creado",
        description: "El usuario se ha creado correctamente",
      });
    }

    setNewUser({ username: '', name: '', email: '', role: 'cashier', status: 'active' });
    setEditingUser(null);
    setIsDialogOpen(false);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setNewUser({
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    });
    setIsDialogOpen(true);
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
    toast({
      title: "Usuario eliminado",
      description: "El usuario se ha eliminado correctamente",
    });
  };

  const toggleUserStatus = (id: string) => {
    setUsers(users.map(u => 
      u.id === id 
        ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' }
        : u
    ));
    toast({
      title: "Estado actualizado",
      description: "El estado del usuario se ha actualizado",
    });
  };

  const getRoleBadgeColor = (role: string) => {
    return role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800';
  };

  const getStatusBadgeColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600">Administra los usuarios del sistema</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Nombre de Usuario</Label>
                <Input
                  id="username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  placeholder="usuario123"
                />
              </div>
              
              <div>
                <Label htmlFor="name">Nombre Completo</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  placeholder="Juan Pérez"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="usuario@empresa.com"
                />
              </div>
              
              <div>
                <Label htmlFor="role">Rol</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value: 'admin' | 'cashier') => setNewUser({...newUser, role: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="cashier">Cajero/Cajera</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={newUser.status}
                  onValueChange={(value: 'active' | 'inactive') => setNewUser({...newUser, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={handleSaveUser} className="w-full">
                {editingUser ? 'Actualizar' : 'Crear'} Usuario
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nombre, usuario o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium text-gray-600">Usuario</th>
                  <th className="text-left p-4 font-medium text-gray-600">Información</th>
                  <th className="text-left p-4 font-medium text-gray-600">Rol</th>
                  <th className="text-left p-4 font-medium text-gray-600">Estado</th>
                  <th className="text-left p-4 font-medium text-gray-600">Último Acceso</th>
                  <th className="text-left p-4 font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role === 'admin' ? 'Administrador' : 'Cajero'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={getStatusBadgeColor(user.status)}>
                        {user.status === 'active' ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-gray-600">{user.lastLogin}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleUserStatus(user.id)}
                          className={user.status === 'active' ? 'text-red-600' : 'text-green-600'}
                        >
                          {user.status === 'active' ? 'Desactivar' : 'Activar'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron usuarios</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {users.filter(u => u.status === 'active').length}
            </div>
            <p className="text-gray-600">Usuarios Activos</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {users.filter(u => u.role === 'admin').length}
            </div>
            <p className="text-gray-600">Administradores</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.role === 'cashier').length}
            </div>
            <p className="text-gray-600">Cajeros</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Users;
