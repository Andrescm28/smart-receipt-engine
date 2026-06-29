import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Save, ShieldCheck, FileKey, AlertTriangle } from 'lucide-react';

const STORAGE_KEY = 'emisor_config_draft';

interface EmisorForm {
  cedula_tipo: string;
  cedula_numero: string;
  razon_social: string;
  nombre_comercial: string;
  provincia: string;
  canton: string;
  distrito: string;
  barrio: string;
  otras_senas: string;
  telefono: string;
  correo_electronico: string;
  actividad_economica: string;
  sucursal: string;
  terminal: string;
  ambiente: 'sandbox' | 'produccion';
  gti_usuario: string;
  gti_api_url: string;
}

const defaultForm: EmisorForm = {
  cedula_tipo: '02',
  cedula_numero: '',
  razon_social: '',
  nombre_comercial: '',
  provincia: '',
  canton: '',
  distrito: '',
  barrio: '',
  otras_senas: '',
  telefono: '',
  correo_electronico: '',
  actividad_economica: '',
  sucursal: '001',
  terminal: '00001',
  ambiente: 'sandbox',
  gti_usuario: '',
  gti_api_url: 'https://api.facturaelectronica.cr',
};

const EmisorConfig = () => {
  const { toast } = useToast();
  const [form, setForm] = useState<EmisorForm>(defaultForm);
  const [certUploaded, setCertUploaded] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try { setForm({ ...defaultForm, ...JSON.parse(raw) }); } catch {}
    }
    setCertUploaded(!!localStorage.getItem('emisor_cert_name'));
  }, []);

  const update = <K extends keyof EmisorForm>(k: K, v: EmisorForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.cedula_numero || !form.razon_social || !form.correo_electronico || !form.actividad_economica) {
      toast({ title: 'Faltan datos obligatorios', description: 'Cédula, razón social, correo y actividad económica son requeridos.', variant: 'destructive' });
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    toast({ title: 'Configuración guardada', description: 'Los datos del emisor se almacenaron correctamente.' });
  };

  const handleCertUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.p12') && !file.name.toLowerCase().endsWith('.pfx')) {
      toast({ title: 'Formato inválido', description: 'El certificado debe ser .p12 o .pfx', variant: 'destructive' });
      return;
    }
    localStorage.setItem('emisor_cert_name', file.name);
    setCertUploaded(true);
    toast({ title: 'Certificado registrado', description: `${file.name} listo para subir al backend cuando conectemos GTI.` });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configuración del Emisor</h1>
          <p className="text-muted-foreground">Datos fiscales y credenciales para facturación electrónica (GTI – Costa Rica)</p>
        </div>
        <Badge variant={form.ambiente === 'produccion' ? 'destructive' : 'secondary'}>
          {form.ambiente === 'produccion' ? 'PRODUCCIÓN' : 'SANDBOX'}
        </Badge>
      </div>

      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="flex gap-3 pt-6">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900">
            <strong>Fase 1 — Preparación.</strong> Esta pantalla almacena la configuración localmente.
            Cuando recibás la documentación del API de GTI, conectaremos esta misma información a la base de datos
            cifrada y a las Edge Functions de emisión sin reescribir nada.
          </div>
        </CardContent>
      </Card>

      {/* Datos fiscales */}
      <Card>
        <CardHeader>
          <CardTitle>Datos fiscales</CardTitle>
          <CardDescription>Información oficial del emisor ante Hacienda</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Tipo de identificación</Label>
            <Select value={form.cedula_tipo} onValueChange={(v) => update('cedula_tipo', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="01">Física</SelectItem>
                <SelectItem value="02">Jurídica</SelectItem>
                <SelectItem value="03">DIMEX</SelectItem>
                <SelectItem value="04">NITE</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Número de cédula *</Label>
            <Input value={form.cedula_numero} onChange={(e) => update('cedula_numero', e.target.value)} placeholder="3101123456" />
          </div>
          <div>
            <Label>Razón social *</Label>
            <Input value={form.razon_social} onChange={(e) => update('razon_social', e.target.value)} />
          </div>
          <div>
            <Label>Nombre comercial</Label>
            <Input value={form.nombre_comercial} onChange={(e) => update('nombre_comercial', e.target.value)} />
          </div>
          <div>
            <Label>Actividad económica *</Label>
            <Input value={form.actividad_economica} onChange={(e) => update('actividad_economica', e.target.value)} placeholder="Código CAEC" />
          </div>
          <div>
            <Label>Correo electrónico *</Label>
            <Input type="email" value={form.correo_electronico} onChange={(e) => update('correo_electronico', e.target.value)} />
          </div>
          <div>
            <Label>Teléfono</Label>
            <Input value={form.telefono} onChange={(e) => update('telefono', e.target.value)} placeholder="22221111" />
          </div>
        </CardContent>
      </Card>

      {/* Ubicación */}
      <Card>
        <CardHeader>
          <CardTitle>Ubicación</CardTitle>
          <CardDescription>Códigos oficiales de Hacienda (provincia / cantón / distrito)</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><Label>Provincia *</Label><Input value={form.provincia} onChange={(e) => update('provincia', e.target.value)} placeholder="1" /></div>
          <div><Label>Cantón *</Label><Input value={form.canton} onChange={(e) => update('canton', e.target.value)} placeholder="01" /></div>
          <div><Label>Distrito *</Label><Input value={form.distrito} onChange={(e) => update('distrito', e.target.value)} placeholder="01" /></div>
          <div><Label>Barrio</Label><Input value={form.barrio} onChange={(e) => update('barrio', e.target.value)} /></div>
          <div className="md:col-span-2"><Label>Otras señas</Label><Input value={form.otras_senas} onChange={(e) => update('otras_senas', e.target.value)} /></div>
        </CardContent>
      </Card>

      {/* GTI / Numeración */}
      <Card>
        <CardHeader>
          <CardTitle>Conexión con GTI</CardTitle>
          <CardDescription>Credenciales de facturaelectronica.cr y numeración</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Ambiente</Label>
            <Select value={form.ambiente} onValueChange={(v) => update('ambiente', v as 'sandbox' | 'produccion')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sandbox">Sandbox (pruebas)</SelectItem>
                <SelectItem value="produccion">Producción</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>URL del API</Label>
            <Input value={form.gti_api_url} onChange={(e) => update('gti_api_url', e.target.value)} />
          </div>
          <div>
            <Label>Usuario GTI</Label>
            <Input value={form.gti_usuario} onChange={(e) => update('gti_usuario', e.target.value)} />
          </div>
          <div>
            <Label>Clave GTI</Label>
            <Input type="password" placeholder="Se solicitará al activar la integración" disabled />
            <p className="text-xs text-muted-foreground mt-1">La clave se guarda cifrada como secreto del backend, no en esta pantalla.</p>
          </div>
          <Separator className="md:col-span-2" />
          <div><Label>Sucursal</Label><Input value={form.sucursal} onChange={(e) => update('sucursal', e.target.value)} maxLength={3} /></div>
          <div><Label>Terminal</Label><Input value={form.terminal} onChange={(e) => update('terminal', e.target.value)} maxLength={5} /></div>
        </CardContent>
      </Card>

      {/* Certificado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileKey className="h-5 w-5" /> Certificado digital (.p12)</CardTitle>
          <CardDescription>Llave criptográfica para firmar los comprobantes ante Hacienda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input type="file" accept=".p12,.pfx" onChange={handleCertUpload} />
          {certUploaded && (
            <div className="flex items-center gap-2 text-sm text-green-700">
              <ShieldCheck className="h-4 w-4" />
              Certificado registrado: <strong>{localStorage.getItem('emisor_cert_name')}</strong>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            El archivo y su PIN se almacenarán cifrados en el backend cuando activemos la integración con GTI.
            Nunca se exponen al navegador ni quedan en el código.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button onClick={handleSave} className="gap-2"><Save className="h-4 w-4" /> Guardar configuración</Button>
      </div>
    </div>
  );
};

export default EmisorConfig;
