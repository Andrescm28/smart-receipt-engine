
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface LoginProps {
  onLogin: (authenticated: boolean) => void;
  onRoleChange: (role: 'admin' | 'cashier') => void;
}

const Login = ({ onLogin, onRoleChange }: LoginProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'cashier'>('cashier');
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Demo credentials
    const validCredentials = {
      admin: { username: 'admin', password: 'admin123' },
      cashier: { username: 'cajero', password: 'cajero123' }
    };

    if (
      username === validCredentials[role].username && 
      password === validCredentials[role].password
    ) {
      onRoleChange(role);
      onLogin(true);
      toast({
        title: "Bienvenido",
        description: `Sesión iniciada como ${role === 'admin' ? 'Administrador' : 'Cajero'}`,
      });
    } else {
      toast({
        title: "Error de autenticación",
        description: "Credenciales inválidas",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Sistema de Facturación
          </CardTitle>
          <p className="text-gray-600">Inicia sesión para continuar</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="role">Rol</Label>
              <Select value={role} onValueChange={(value: 'admin' | 'cashier') => setRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="cashier">Cajero/Cajera</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu usuario"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                required
              />
            </div>
            
            <Button type="submit" className="w-full">
              Iniciar Sesión
            </Button>
          </form>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
            <p><strong>Demo:</strong></p>
            <p>Admin: admin / admin123</p>
            <p>Cajero: cajero / cajero123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
