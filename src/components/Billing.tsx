import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Minus, Trash2, FileText, Printer } from 'lucide-react';

interface Product {
  id: string;
  code: string;
  name: string;
  price: number;
  stock: number;
}

interface CartItem extends Product {
  quantity: number;
  subtotal: number;
}

const Billing = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [discount, setDiscount] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);

  // Demo products - supermercado
  const products: Product[] = [
    { id: '1', code: 'BEB001', name: 'Coca Cola 500ml', price: 1.25, stock: 120 },
    { id: '2', code: 'BEB002', name: 'Agua Purificada 1L', price: 0.75, stock: 200 },
    { id: '3', code: 'PAN001', name: 'Pan Blanco Molde', price: 2.50, stock: 45 },
    { id: '4', code: 'LAC001', name: 'Leche Entera 1L', price: 3.20, stock: 60 },
    { id: '5', code: 'LAC002', name: 'Yogurt Natural 500g', price: 2.80, stock: 40 },
    { id: '6', code: 'GRA001', name: 'Arroz Blanco 1kg', price: 1.90, stock: 85 },
    { id: '7', code: 'GRA002', name: 'Frijoles Rojos 1kg', price: 2.40, stock: 70 },
    { id: '8', code: 'CAR001', name: 'Pechuga de Pollo 1kg', price: 5.50, stock: 30 },
    { id: '9', code: 'FRU001', name: 'Banano (Libra)', price: 0.60, stock: 150 },
    { id: '10', code: 'ACE001', name: 'Aceite Vegetal 1L', price: 3.75, stock: 48 },
  ];

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast({
          title: "Stock insuficiente",
          description: `Solo quedan ${product.stock} unidades disponibles`,
          variant: "destructive",
        });
        return;
      }
      
      setCart(cart.map(item =>
        item.id === product.id
          ? {
              ...item,
              quantity: item.quantity + 1,
              subtotal: (item.quantity + 1) * item.price
            }
          : item
      ));
    } else {
      const newItem: CartItem = {
        ...product,
        quantity: 1,
        subtotal: product.price
      };
      setCart([...cart, newItem]);
    }
    
    toast({
      title: "Producto agregado",
      description: `${product.name} agregado al carrito`,
    });
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }

    const product = products.find(p => p.id === id);
    if (product && newQuantity > product.stock) {
      toast({
        title: "Stock insuficiente",
        description: `Solo quedan ${product.stock} unidades disponibles`,
        variant: "destructive",
      });
      return;
    }

    setCart(cart.map(item =>
      item.id === id
        ? {
            ...item,
            quantity: newQuantity,
            subtotal: newQuantity * item.price
          }
        : item
    ));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const discountAmount = (subtotal * discount) / 100;
  const tax = (subtotal - discountAmount) * 0.15; // 15% IVA
  const total = subtotal - discountAmount + tax;

  const generateInvoice = () => {
    if (cart.length === 0) {
      toast({
        title: "Carrito vacío",
        description: "Agrega productos antes de generar la factura",
        variant: "destructive",
      });
      return;
    }

    const invoiceNumber = `FAC-${Date.now()}`;
    
    toast({
      title: "Factura generada",
      description: `Factura ${invoiceNumber} creada exitosamente`,
    });

    // Limpiar carrito después de generar factura
    setCart([]);
    setCustomerName('');
    setCustomerEmail('');
    setDiscount(0);
    setAmountPaid(0);

    console.log('Factura generada:', {
      number: invoiceNumber,
      customer: { name: customerName, email: customerEmail },
      items: cart,
      subtotal,
      discount: discountAmount,
      tax,
      total,
      date: new Date().toISOString()
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Product Search and Selection */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Facturación</h1>
          <p className="text-gray-600">Selecciona productos del supermercado</p>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar productos por nombre o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600">Código: {product.code}</p>
                  </div>
                  <Badge variant="secondary">{product.stock} disponibles</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-green-600">
                    ${product.price.toFixed(2)}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Cart and Billing */}
      <div className="space-y-6">
        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="customerName">Nombre (Opcional)</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nombre del cliente"
              />
            </div>
            <div>
              <Label htmlFor="customerEmail">Email (Opcional)</Label>
              <Input
                id="customerEmail"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="cliente@email.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Cart */}
        <Card>
          <CardHeader>
            <CardTitle>Carrito de Compras</CardTitle>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                El carrito está vacío
              </p>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <p className="text-xs text-gray-600">${item.price.toFixed(2)} c/u</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
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

        {/* Billing Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Factura</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="discount">Descuento (%)</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                max="100"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Descuento ({discount}%):</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span>IVA (15%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Paga Con / Cambio */}
            <Separator />
            <div className="space-y-3">
              <div>
                <Label htmlFor="amountPaid" className="text-sm font-semibold">Paga con:</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                  <Input
                    id="amountPaid"
                    type="number"
                    min="0"
                    step="0.01"
                    value={amountPaid || ''}
                    onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="pl-7 text-lg font-semibold"
                  />
                </div>
              </div>

              {/* Quick amount buttons */}
              {total > 0 && (
                <div className="flex flex-wrap gap-1">
                  {[Math.ceil(total), Math.ceil(total / 5) * 5, Math.ceil(total / 10) * 10, Math.ceil(total / 20) * 20].filter((v, i, a) => v >= total && a.indexOf(v) === i).slice(0, 4).map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => setAmountPaid(amount)}
                    >
                      ${amount.toFixed(2)}
                    </Button>
                  ))}
                </div>
              )}

              <div className={`p-3 rounded-lg text-center ${
                amountPaid >= total && amountPaid > 0
                  ? 'bg-green-50 border border-green-200'
                  : amountPaid > 0
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-gray-50 border border-gray-200'
              }`}>
                <p className="text-xs text-gray-500 uppercase font-medium">Cambio</p>
                <p className={`text-2xl font-bold ${
                  amountPaid >= total && amountPaid > 0
                    ? 'text-green-600'
                    : amountPaid > 0
                    ? 'text-red-600'
                    : 'text-gray-400'
                }`}>
                  ${amountPaid > 0 ? (amountPaid - total).toFixed(2) : '0.00'}
                </p>
                {amountPaid > 0 && amountPaid < total && (
                  <p className="text-xs text-red-500 mt-1">Monto insuficiente</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Button
                onClick={generateInvoice}
                className="w-full"
                disabled={cart.length === 0}
              >
                <FileText className="h-4 w-4 mr-2" />
                Generar Factura
              </Button>
              
              <Button
                variant="outline"
                className="w-full"
                disabled={cart.length === 0}
              >
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Billing;
