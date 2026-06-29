import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Minus, Trash2, Printer } from 'lucide-react';
import PaymentSection, { type PaymentResult } from '@/components/PaymentSection';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ProductRow {
  id: string;
  code: string;
  name: string;
  price: number;
  unit: string;
  stock: number;
  tax_rate: number;
}

interface CartItem extends ProductRow {
  quantity: number;
}

const Billing = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [discount, setDiscount] = useState(0);
  const [lastPayment, setLastPayment] = useState<PaymentResult | null>(null);
  const [lastInvoice, setLastInvoice] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('id, code, name, price, unit, stock, tax_rate')
      .eq('active', true)
      .order('name');
    if (error) {
      toast({ title: 'Error cargando productos', description: error.message, variant: 'destructive' });
      return;
    }
    setProducts((data as any) ?? []);
  };

  useEffect(() => { loadProducts(); }, []);

  const filtered = products.filter(
    (p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (p: ProductRow) => {
    const existing = cart.find((i) => i.id === p.id);
    if (existing) {
      if (existing.quantity >= p.stock) return toast({ title: 'Stock insuficiente', variant: 'destructive' });
      setCart(cart.map((i) => i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { ...p, quantity: 1 }]);
    }
  };

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) return setCart(cart.filter((i) => i.id !== id));
    const p = products.find((x) => x.id === id);
    if (p && qty > p.stock) return toast({ title: 'Stock insuficiente', variant: 'destructive' });
    setCart(cart.map((i) => i.id === id ? { ...i, quantity: qty } : i));
  };

  const subtotal = cart.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
  const discountAmount = (subtotal * discount) / 100;
  const taxable = subtotal - discountAmount;
  const tax = cart.reduce((s, i) => {
    const lineNet = Number(i.price) * i.quantity * (1 - discount / 100);
    return s + lineNet * (Number(i.tax_rate) / 100);
  }, 0);
  const total = Math.round((taxable + tax) * 100) / 100;

  const handlePayment = async (result: PaymentResult) => {
    if (cart.length === 0 || !user) return;
    setProcessing(true);
    try {
      const { data: invoice, error: invErr } = await supabase
        .from('invoices')
        .insert({
          cashier_id: user.id,
          customer_name: customerName || null,
          customer_email: customerEmail || null,
          subtotal: Math.round(subtotal * 100) / 100,
          tax_total: Math.round(tax * 100) / 100,
          discount_total: Math.round(discountAmount * 100) / 100,
          total,
          payment_method: result.paymentType,
          status: 'paid',
        })
        .select()
        .single();
      if (invErr) throw invErr;

      const items = cart.map((i) => {
        const lineNet = Number(i.price) * i.quantity * (1 - discount / 100);
        const taxAmt = lineNet * (Number(i.tax_rate) / 100);
        return {
          invoice_id: invoice.id,
          product_id: i.id,
          product_code: i.code,
          product_name: i.name,
          unit: i.unit,
          quantity: i.quantity,
          unit_price: i.price,
          discount: discount,
          tax_rate: i.tax_rate,
          tax_amount: Math.round(taxAmt * 100) / 100,
          line_total: Math.round((lineNet + taxAmt) * 100) / 100,
        };
      });
      const { error: itemsErr } = await supabase.from('invoice_items').insert(items);
      if (itemsErr) throw itemsErr;

      const payments: any[] = [];
      if (result.cashReceived > 0) {
        payments.push({
          invoice_id: invoice.id,
          method: 'cash',
          amount: result.paymentType === 'split' ? Math.min(result.cashReceived, total) : total - result.cardReceived,
          received: result.cashReceived,
          change: result.changeAmount,
        });
      }
      if (result.cardReceived > 0) {
        payments.push({
          invoice_id: invoice.id,
          method: 'card',
          amount: result.cardReceived,
        });
      }
      if (payments.length > 0) {
        const { error: payErr } = await supabase.from('payment_details').insert(payments);
        if (payErr) throw payErr;
      }

      setLastPayment(result);
      setLastInvoice(invoice.invoice_number);
      toast({ title: 'Factura generada', description: `${invoice.invoice_number} — Total $${total.toFixed(2)}` });

      setCart([]);
      setCustomerName('');
      setCustomerEmail('');
      setDiscount(0);
      loadProducts();
    } catch (e: any) {
      toast({ title: 'Error al facturar', description: e.message, variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sistema de Facturación</h1>
          <p className="text-muted-foreground">Selecciona productos del supermercado</p>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Buscar productos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((p) => (
            <Card key={p.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold">{p.name}</h3>
                    <p className="text-sm text-muted-foreground">Código: {p.code}</p>
                  </div>
                  <Badge variant="secondary">{Number(p.stock)} disp.</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-green-600">${Number(p.price).toFixed(2)}</span>
                  <Button size="sm" onClick={() => addToCart(p)} disabled={p.stock <= 0}>
                    <Plus className="h-4 w-4" /> Agregar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Cliente</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Nombre (opcional)</Label><Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} /></div>
            <div><Label>Email (opcional)</Label><Input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Carrito</CardTitle></CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">El carrito está vacío</p>
            ) : (
              <div className="space-y-4">
                {cart.map((i) => (
                  <div key={i.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{i.name}</h4>
                      <p className="text-xs text-muted-foreground">${Number(i.price).toFixed(2)} c/u</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => updateQty(i.id, i.quantity - 1)}><Minus className="h-3 w-3" /></Button>
                      <span className="w-8 text-center text-sm">{i.quantity}</span>
                      <Button variant="outline" size="sm" onClick={() => updateQty(i.id, i.quantity + 1)}><Plus className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => updateQty(i.id, 0)} className="text-destructive"><Trash2 className="h-3 w-3" /></Button>
                    </div>
                    <div className="w-20 text-right font-semibold">${(Number(i.price) * i.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Resumen</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Descuento (%)</Label><Input type="number" min="0" max="100" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} /></div>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between"><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-600"><span>Descuento ({discount}%):</span><span>-${discountAmount.toFixed(2)}</span></div>}
              <div className="flex justify-between"><span>Impuestos:</span><span>${tax.toFixed(2)}</span></div>
              <Separator />
              <div className="flex justify-between text-lg font-bold"><span>Total:</span><span>${total.toFixed(2)}</span></div>
            </div>
          </CardContent>
        </Card>

        <PaymentSection total={total} disabled={cart.length === 0 || processing} onConfirmPayment={handlePayment} />

        {lastPayment && lastInvoice && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-green-800">Último Pago</CardTitle></CardHeader>
            <CardContent className="space-y-1 text-sm text-green-700">
              <div className="flex justify-between"><span>Factura:</span><span className="font-mono">{lastInvoice}</span></div>
              <div className="flex justify-between"><span>Tipo:</span><Badge variant="outline">{lastPayment.paymentType}</Badge></div>
              {lastPayment.cashReceived > 0 && <div className="flex justify-between"><span>Efectivo:</span><span>${lastPayment.cashReceived.toFixed(2)}</span></div>}
              {lastPayment.cardReceived > 0 && <div className="flex justify-between"><span>Tarjeta:</span><span>${lastPayment.cardReceived.toFixed(2)}</span></div>}
              {lastPayment.changeAmount > 0 && <div className="flex justify-between"><span>Cambio:</span><span>${lastPayment.changeAmount.toFixed(2)}</span></div>}
            </CardContent>
          </Card>
        )}

        <Button variant="outline" className="w-full" disabled={!lastInvoice}>
          <Printer className="h-4 w-4 mr-2" /> Imprimir
        </Button>
      </div>
    </div>
  );
};

export default Billing;
