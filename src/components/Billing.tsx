import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Minus, Trash2, FileText, Printer } from 'lucide-react';
import PaymentSection, { type PaymentResult } from '@/components/PaymentSection';
import type { Product } from '@/pages/Index';

interface CartItem extends Product {
  quantity: number;
  subtotal: number;
}

interface BillingProps {
  products: Product[];
}

const Billing = ({ products }: BillingProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [discount, setDiscount] = useState(0);
  const [lastPayment, setLastPayment] = useState<PaymentResult | null>(null);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast({ title: "Stock insuficiente", description: `Solo quedan ${product.stock} unidades disponibles`, variant: "destructive" });
        return;
      }
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1, subtotal: product.price }]);
    }
    toast({ title: "Producto agregado", description: `${product.name} agregado al carrito` });
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) { removeFromCart(id); return; }
    const product = products.find(p => p.id === id);
    if (product && newQuantity > product.stock) {
      toast({ title: "Stock insuficiente", description: `Solo quedan ${product.stock} unidades disponibles`, variant: "destructive" });
      return;
    }
    setCart(cart.map(item => item.id === id ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.price } : item));
  };

  const removeFromCart = (id: string) => setCart(cart.filter(item => item.id !== id));

  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const discountAmount = (subtotal * discount) / 100;
  const tax = (subtotal - discountAmount) * 0.15;
  const total = Math.round((subtotal - discountAmount + tax) * 100) / 100;

  const handlePayment = (result: PaymentResult) => {
    if (cart.length === 0) return;
    const invoiceNumber = `FAC-${Date.now()}`;
    setLastPayment(result);

    const methodLabel = result.paymentType === 'split' ? 'Pago Dividido' : result.paymentType === 'card' ? 'Tarjeta' : 'Efectivo';

    toast({
      title: "Factura generada",
      description: `${invoiceNumber} — ${methodLabel}${result.changeAmount > 0 ? ` | Cambio: $${result.changeAmount.toFixed(2)}` : ''}`,
    });

    setCart([]);
    setCustomerName('');
    setCustomerEmail('');
    setDiscount(0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Products panel */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sistema de Facturación</h1>
          <p className="text-muted-foreground">Selecciona productos del supermercado</p>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Buscar productos por nombre o código..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">Código: {product.code}</p>
                  </div>
                  <Badge variant="secondary">{product.stock} disponibles</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-green-600">${product.price.toFixed(2)}</span>
                  <Button size="sm" onClick={() => addToCart(product)} disabled={product.stock === 0} className="flex items-center gap-1">
                    <Plus className="h-4 w-4" /> Agregar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Información del Cliente</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="customerName">Nombre (Opcional)</Label>
              <Input id="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nombre del cliente" />
            </div>
            <div>
              <Label htmlFor="customerEmail">Email (Opcional)</Label>
              <Input id="customerEmail" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="cliente@email.com" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Carrito de Compras</CardTitle></CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">El carrito está vacío</p>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} c/u</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus className="h-3 w-3" /></Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button variant="outline" size="sm" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => removeFromCart(item.id)} className="text-destructive hover:text-destructive/80"><Trash2 className="h-3 w-3" /></Button>
                    </div>
                    <div className="w-20 text-right">
                      <span className="font-semibold">${item.subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Resumen de Factura</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="discount">Descuento (%)</Label>
              <Input id="discount" type="number" min="0" max="100" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} placeholder="0" />
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between"><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600"><span>Descuento ({discount}%):</span><span>-${discountAmount.toFixed(2)}</span></div>
              )}
              <div className="flex justify-between"><span>IVA (15%):</span><span>${tax.toFixed(2)}</span></div>
              <Separator />
              <div className="flex justify-between text-lg font-bold"><span>Total:</span><span>${total.toFixed(2)}</span></div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Section */}
        <PaymentSection total={total} disabled={cart.length === 0} onConfirmPayment={handlePayment} />

        {/* Last payment info */}
        {lastPayment && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-green-800">Último Pago Registrado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-green-700">
              <div className="flex justify-between">
                <span>Tipo:</span>
                <Badge variant="outline" className="text-green-700 border-green-300">
                  {lastPayment.paymentType === 'split' ? 'Dividido' : lastPayment.paymentType === 'card' ? 'Tarjeta' : 'Efectivo'}
                </Badge>
              </div>
              {lastPayment.cashReceived > 0 && (
                <div className="flex justify-between"><span>Efectivo:</span><span>${lastPayment.cashReceived.toFixed(2)}</span></div>
              )}
              {lastPayment.cardReceived > 0 && (
                <div className="flex justify-between"><span>Tarjeta:</span><span>${lastPayment.cardReceived.toFixed(2)}</span></div>
              )}
              <div className="flex justify-between font-semibold"><span>Total pagado:</span><span>${lastPayment.totalPaid.toFixed(2)}</span></div>
              {lastPayment.changeAmount > 0 && (
                <div className="flex justify-between"><span>Cambio:</span><span>${lastPayment.changeAmount.toFixed(2)}</span></div>
              )}
            </CardContent>
          </Card>
        )}

        <Button variant="outline" className="w-full" disabled={cart.length === 0}>
          <Printer className="h-4 w-4 mr-2" /> Imprimir
        </Button>
      </div>
    </div>
  );
};

export default Billing;
