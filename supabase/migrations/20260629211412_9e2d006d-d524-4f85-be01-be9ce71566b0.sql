
-- Emisor configuration (one row per tenant; singleton for now)
CREATE TABLE public.emisor_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cedula_tipo TEXT NOT NULL DEFAULT '02', -- 01 fisica, 02 juridica, 03 DIMEX, 04 NITE
  cedula_numero TEXT NOT NULL,
  razon_social TEXT NOT NULL,
  nombre_comercial TEXT,
  provincia TEXT NOT NULL,
  canton TEXT NOT NULL,
  distrito TEXT NOT NULL,
  barrio TEXT,
  otras_senas TEXT,
  telefono_codigo_pais TEXT DEFAULT '506',
  telefono TEXT,
  correo_electronico TEXT NOT NULL,
  actividad_economica TEXT NOT NULL,
  sucursal TEXT NOT NULL DEFAULT '001',
  terminal TEXT NOT NULL DEFAULT '00001',
  ambiente TEXT NOT NULL DEFAULT 'sandbox' CHECK (ambiente IN ('sandbox', 'produccion')),
  gti_usuario TEXT,
  gti_api_url TEXT DEFAULT 'https://api.facturaelectronica.cr',
  consecutivo_tiquete BIGINT NOT NULL DEFAULT 0,
  consecutivo_factura BIGINT NOT NULL DEFAULT 0,
  consecutivo_nota_credito BIGINT NOT NULL DEFAULT 0,
  certificado_cargado BOOLEAN NOT NULL DEFAULT FALSE,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.emisor_config TO authenticated;
GRANT ALL ON public.emisor_config TO service_role;
ALTER TABLE public.emisor_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view emisor config"
  ON public.emisor_config FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert emisor config"
  ON public.emisor_config FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update emisor config"
  ON public.emisor_config FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete emisor config"
  ON public.emisor_config FOR DELETE TO authenticated USING (true);

-- Electronic invoice records
CREATE TABLE public.comprobantes_electronicos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo_comprobante TEXT NOT NULL CHECK (tipo_comprobante IN ('tiquete', 'factura', 'nota_credito', 'nota_debito')),
  clave_numerica TEXT UNIQUE,
  consecutivo TEXT NOT NULL,
  numero_factura_interno TEXT NOT NULL,
  fecha_emision TIMESTAMPTZ NOT NULL DEFAULT now(),
  receptor_tipo_id TEXT,
  receptor_identificacion TEXT,
  receptor_nombre TEXT,
  receptor_correo TEXT,
  moneda TEXT NOT NULL DEFAULT 'CRC',
  tipo_cambio NUMERIC(12,5) DEFAULT 1,
  subtotal NUMERIC(14,2) NOT NULL DEFAULT 0,
  descuento_total NUMERIC(14,2) NOT NULL DEFAULT 0,
  impuesto_total NUMERIC(14,2) NOT NULL DEFAULT 0,
  total NUMERIC(14,2) NOT NULL DEFAULT 0,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','enviado','aceptado','rechazado','error')),
  intentos INT NOT NULL DEFAULT 0,
  ultimo_intento_at TIMESTAMPTZ,
  proximo_intento_at TIMESTAMPTZ,
  hacienda_mensaje TEXT,
  gti_respuesta JSONB,
  xml_firmado TEXT,
  pdf_url TEXT,
  payload_solicitud JSONB,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_comprobantes_estado ON public.comprobantes_electronicos(estado);
CREATE INDEX idx_comprobantes_fecha ON public.comprobantes_electronicos(fecha_emision DESC);
CREATE INDEX idx_comprobantes_tipo ON public.comprobantes_electronicos(tipo_comprobante);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.comprobantes_electronicos TO authenticated;
GRANT ALL ON public.comprobantes_electronicos TO service_role;
ALTER TABLE public.comprobantes_electronicos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view comprobantes"
  ON public.comprobantes_electronicos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert comprobantes"
  ON public.comprobantes_electronicos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update comprobantes"
  ON public.comprobantes_electronicos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Log table for audit trail of GTI calls
CREATE TABLE public.comprobantes_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comprobante_id UUID REFERENCES public.comprobantes_electronicos(id) ON DELETE CASCADE,
  accion TEXT NOT NULL, -- 'emitir', 'consultar_estado', 'reintento'
  estado_resultado TEXT,
  request_payload JSONB,
  response_payload JSONB,
  http_status INT,
  mensaje TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_logs_comprobante ON public.comprobantes_logs(comprobante_id);

GRANT SELECT, INSERT ON public.comprobantes_logs TO authenticated;
GRANT ALL ON public.comprobantes_logs TO service_role;
ALTER TABLE public.comprobantes_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view logs"
  ON public.comprobantes_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert logs"
  ON public.comprobantes_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_emisor_config_updated_at
  BEFORE UPDATE ON public.emisor_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_comprobantes_updated_at
  BEFORE UPDATE ON public.comprobantes_electronicos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
