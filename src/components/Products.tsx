import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';

interface Product {
  id: string;
  code: string;
  name: string;
  price: number;
  category: string;
  unit: string;
  stock: number;
}

interface ProductsProps {
  userRole: 'admin' | 'cashier';
}

const Products = ({ userRole }: ProductsProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      code: 'VN001',
      name: 'Vestido Niña Princesa Rosa',
      price: 45.99,
      category: 'Vestidos Niñas',
      unit: 'Unidad',
      stock: 25
    },
    {
      id: '2',
      code: 'BM001',
      name: 'Blusa Mujer Manga Larga',
      price: 32.50,
      category: 'Blusas',
      unit: 'Unidad',
      stock: 18
    },
    {
      id: '3',
      code: 'JN001',
      name: 'Jeans Niña Talla 8-12',
      price: 28.75,
      category: 'Pantalones Niñas',
      unit: 'Unidad',
      stock: 30
    },
    {
      id: '4',
      code: 'FM001',
      name: 'Falda Mujer A-Line',
      price: 38.00,
      category: 'Faldas',
      unit: 'Unidad',
      stock: 15
    },
    {
      id: '5',
      code: 'CN001',
      name: 'Camiseta Niña Unicornio',
      price: 18.99,
      category: 'Camisetas Niñas',
      unit: 'Unidad',
      stock: 40
    },
    {
      id: '6',
      code: 'ZM001',
      name: 'Zapatos Mujer Tacón Bajo',
      price: 65.00,
      category: 'Calzado',
      unit: 'Par',
      stock: 12
    },
    {
      id: '7',
      code: 'LN001',
      name: 'Leggings Niña Estampados',
      price: 22.50,
      category: 'Pantalones Niñas',
      unit: 'Unidad',
      stock: 35
    },
    {
      id: '8',
      code: 'SM001',
      name: 'Suéter Mujer Cuello V',
      price: 48.75,
      category: 'Suéteres',
      unit: 'Unidad',
      stock: 20
    }
  ]);

  const [newProduct, setNewProduct] = useState({
    code: '',
    name: '',
    price: 0,
    category: '',
    unit: '',
    stock: 0
  });

  const categories = [
    'Vestidos Niñas', 
    'Camisetas Niñas', 
    'Pantalones Niñas', 
    'Blusas', 
    'Faldas', 
    'Suéteres', 
    'Calzado', 
    'Accesorios',
    'Ropa Interior',
    'Pijamas'
  ];
  
  const units = ['Unidad', 'Par', 'Set', 'Paquete'];

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveProduct = () => {
    if (!newProduct.code || !newProduct.name || !newProduct.category || !newProduct.unit) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios",
        variant: "destructive",
      });
      return;
    }

    if (editingProduct) {
      setProducts(products.map(p => 
        p.id === editingProduct.id 
          ? { ...newProduct, id: editingProduct.id }
          : p
      ));
      toast({
        title: "Producto actualizado",
        description: "El producto se ha actualizado correctamente",
      });
    } else {
      const product: Product = {
        ...newProduct,
        id: Date.now().toString()
      };
      setProducts([...products, product]);
      toast({
        title: "Producto creado",
        description: "El producto se ha agregado correctamente",
      });
    }

    setNewProduct({ code: '', name: '', price: 0, category: '', unit: '', stock: 0 });
    setEditingProduct(null);
    setIsDialogOpen(false);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setNewProduct(product);
    setIsDialogOpen(true);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
    toast({
      title: "Producto eliminado",
      description: "El producto se ha eliminado correctamente",
    });
  };

  const getStockBadgeColor = (stock: number) => {
    if (stock > 20) return 'bg-green-100 text-green-800';
    if (stock > 10) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Productos</h1>
          <p className="text-gray-600">Administra tu inventario de ropa femenina e infantil</p>
        </div>
        
        {userRole === 'admin' && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Producto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="code">Código</Label>
                  <Input
                    id="code"
                    value={newProduct.code}
                    onChange={(e) => setNewProduct({...newProduct, code: e.target.value})}
                    placeholder="Ej: VN001"
                  />
                </div>
                
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    placeholder="Nombre del producto"
                  />
                </div>
                
                <div>
                  <Label htmlFor="price">Precio</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <Select
                    value={newProduct.category}
                    onValueChange={(value) => setNewProduct({...newProduct, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="unit">Unidad de Medida</Label>
                  <Select
                    value={newProduct.unit}
                    onValueChange={(value) => setNewProduct({...newProduct, unit: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona unidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map(unit => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="stock">Cantidad en Inventario</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({...newProduct, stock: parseInt(e.target.value) || 0})}
                    placeholder="0"
                  />
                </div>
                
                <Button onClick={handleSaveProduct} className="w-full">
                  {editingProduct ? 'Actualizar' : 'Crear'} Producto
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nombre o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <p className="text-sm text-gray-600">Código: {product.code}</p>
                </div>
                {userRole === 'admin' && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditProduct(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Precio:</span>
                  <span className="font-semibold text-green-600">${product.price.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Categoría:</span>
                  <Badge variant="secondary">{product.category}</Badge>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Unidad:</span>
                  <span className="text-sm">{product.unit}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Stock:</span>
                  <Badge className={getStockBadgeColor(product.stock)}>
                    {product.stock} {product.unit === 'Par' ? 'pares' : 'unidades'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No se encontraron productos</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Products;
