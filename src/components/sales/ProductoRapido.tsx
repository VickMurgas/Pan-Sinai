'use client';

import React, { useState, useEffect } from 'react';
import { useSales } from '@/contexts/SalesContext';
import { 
  Plus, 
  Minus, 
  ShoppingCart, 
  Search, 
  Filter,
  X,
  CheckCircle,
  Package,
  DollarSign
} from 'lucide-react';

// Catálogo real de productos de Medrano Flores Panadería
const PRODUCTOS_MEDRANO_FLORES = [
  // Serie B - Productos de Panadería
  { id: 'B01', name: 'Muffin de Naranja 54gr', price: 0.75, category: 'B', stock: 50 },
  { id: 'B02', name: 'Torta de Fruta 58gr', price: 0.80, category: 'B', stock: 45 },
  { id: 'B03', name: 'Poleadita 54gr', price: 0.70, category: 'B', stock: 60 },
  { id: 'B04', name: 'Quesadilla 46gr Charola', price: 0.65, category: 'B', stock: 40 },
  { id: 'B05', name: 'Magdalena de Vainilla 225gr', price: 1.20, category: 'B', stock: 30 },
  { id: 'B06', name: 'Marquezote 58gr', price: 0.85, category: 'B', stock: 35 },
  { id: 'B11', name: 'Blister de Quesadilla Sinai 9 Unid. 288gr', price: 5.50, category: 'B', stock: 20 },
  { id: 'B17', name: 'Quesadilla Familiar 224gr', price: 3.20, category: 'B', stock: 25 },
  { id: 'B19', name: 'Quesadilla Cuadrada 30gr', price: 0.45, category: 'B', stock: 80 },
  { id: 'B21', name: 'Magdalena Marmoleada 225gr', price: 1.25, category: 'B', stock: 28 },
  { id: 'B25', name: 'Margarita Pack 8 Und. 256gr', price: 4.80, category: 'B', stock: 15 },
  { id: 'B26', name: 'Muffin de Naranja Pack 6 Und. 324gr', price: 4.20, category: 'B', stock: 18 },
  { id: 'B27', name: 'Quesadilla Pack 6 Und. 276gr', price: 3.90, category: 'B', stock: 22 },
  { id: 'B28', name: 'Marquezote Pack 6 Und. 348gr', price: 4.50, category: 'B', stock: 16 },
  { id: 'B29', name: 'Alemana Pack 6 Und. 276gr', price: 4.10, category: 'B', stock: 19 },
  { id: 'B30', name: 'Magdalena de Naranja 225gr', price: 1.30, category: 'B', stock: 25 },
  { id: 'B31', name: 'Blister de Quesadilla Sinai 12 Unid. 528gr', price: 7.20, category: 'B', stock: 12 },
  { id: 'B32', name: 'Muffin Banano Canela', price: 0.90, category: 'B', stock: 40 },
  
  // Serie G - Galletas
  { id: 'G01', name: 'Margarita 32gr', price: 0.50, category: 'G', stock: 100 },
  { id: 'G02', name: 'Pastelito de Piña 40gr', price: 0.60, category: 'G', stock: 85 },
  { id: 'G03', name: 'Hoja', price: 0.55, category: 'G', stock: 90 },
  { id: 'G04', name: 'Pichardin', price: 0.65, category: 'G', stock: 75 },
  { id: 'G05', name: 'Margarita Paquete de 8 Und.', price: 3.80, category: 'G', stock: 20 },
  
  // Serie H - Pastelería
  { id: 'H01', name: 'Oreja 30gr', price: 0.70, category: 'H', stock: 60 },
  { id: 'H03', name: 'Pañuelo Doble', price: 1.10, category: 'H', stock: 35 },
  
  // Serie L - Panes
  { id: 'L01', name: 'Concha 48gr', price: 0.80, category: 'L', stock: 70 },
  { id: 'L02', name: 'Torta de Yema 700gr', price: 4.50, category: 'L', stock: 15 },
  { id: 'L03', name: 'Semita Alta', price: 1.20, category: 'L', stock: 40 },
  { id: 'L04', name: 'Torta de Yema 380gr', price: 2.80, category: 'L', stock: 25 },
  { id: 'L05', name: 'Semita Pacha 67gr', price: 0.95, category: 'L', stock: 55 },
  { id: 'L06', name: 'Pan Sandwich Blanco Sinai 600gr', price: 3.50, category: 'L', stock: 20 },
  { id: 'L07', name: 'Pan Sandwich Integral Sinai 600gr', price: 3.80, category: 'L', stock: 18 },
  { id: 'L09', name: 'Semita Pacha Familiar', price: 2.20, category: 'L', stock: 30 },
  { id: 'L13', name: 'Pan Sandwich Blanco Sinai 540gr', price: 3.20, category: 'L', stock: 22 },
  { id: 'L14', name: 'Pan Tostado Mantequilla 25gr', price: 0.40, category: 'L', stock: 120 }
];

interface ProductoRapidoProps {
  selectedCustomer?: any;
  onComplete?: () => void;
}

export default function ProductoRapido({ selectedCustomer, onComplete }: ProductoRapidoProps) {
  const { addToCart, state } = useSales();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [showCart, setShowCart] = useState(false);

  const categories = Array.from(new Set(PRODUCTOS_MEDRANO_FLORES.map(p => p.category)));

  const filteredProducts = PRODUCTOS_MEDRANO_FLORES.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleQuickAdd = (productId: string, quantity: number) => {
    const product = PRODUCTOS_MEDRANO_FLORES.find(p => p.id === productId);
    if (product && product.stock >= quantity) {
      addToCart(product, quantity);
      
      // Actualizar cantidades locales
      setQuantities(prev => ({
        ...prev,
        [productId]: (prev[productId] || 0) + quantity
      }));
    }
  };

  const handleRemove = (productId: string) => {
    setQuantities(prev => {
      const newQuantities = { ...prev };
      delete newQuantities[productId];
      return newQuantities;
    });
  };

  const getCartTotal = () => {
    return state.cart.items.reduce((total, item) => total + item.subtotal, 0);
  };

  const getCartItemCount = () => {
    return state.cart.items.reduce((count, item) => count + item.quantity, 0);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return 'text-red-500';
    if (stock <= 5) return 'text-orange-500';
    return 'text-green-500';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-pan-sinai-dark-brown">
                Selección Rápida de Productos
              </h1>
              {selectedCustomer && (
                <p className="text-pan-sinai-brown">
                  Cliente: {selectedCustomer.businessName || selectedCustomer.name}
                </p>
              )}
            </div>
            
            {/* Carrito flotante */}
            <div className="relative">
              <button
                onClick={() => setShowCart(!showCart)}
                className="bg-pan-sinai-gold text-pan-sinai-dark-brown px-4 py-2 rounded-lg hover:bg-pan-sinai-yellow transition-colors flex items-center space-x-2"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Carrito ({getCartItemCount()})</span>
                <span className="bg-pan-sinai-dark-brown text-white px-2 py-1 rounded-full text-xs">
                  ${getCartTotal().toFixed(2)}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por código o nombre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pan-sinai-gold focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtro por categoría */}
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === '' 
                    ? 'bg-pan-sinai-gold text-pan-sinai-dark-brown' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Todos
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === category 
                      ? 'bg-pan-sinai-gold text-pan-sinai-dark-brown' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category === 'B' ? 'Panadería' : 
                   category === 'G' ? 'Galletas' : 
                   category === 'H' ? 'Pastelería' : 'Panes'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid de productos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              {/* Header del producto */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-bold bg-pan-sinai-gold text-pan-sinai-dark-brown px-2 py-1 rounded">
                      {product.id}
                    </span>
                    <span className={`text-xs font-medium ${getStockStatus(product.stock)}`}>
                      Stock: {product.stock}
                    </span>
                  </div>
                  <h3 className="font-semibold text-pan-sinai-dark-brown text-sm leading-tight">
                    {product.name}
                  </h3>
                </div>
              </div>

              {/* Precio */}
              <div className="mb-3">
                <span className="text-lg font-bold text-pan-sinai-dark-brown">
                  ${product.price.toFixed(2)}
                </span>
              </div>

              {/* Botones rápidos de cantidad */}
              <div className="space-y-2">
                <div className="grid grid-cols-5 gap-1">
                  {[1, 2, 3, 4, 5].map(num => (
                    <button
                      key={num}
                      onClick={() => handleQuickAdd(product.id, num)}
                      disabled={product.stock < num}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        product.stock >= num
                          ? 'bg-pan-sinai-gold text-pan-sinai-dark-brown hover:bg-pan-sinai-yellow'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {[6, 7, 8, 9, 10].map(num => (
                    <button
                      key={num}
                      onClick={() => handleQuickAdd(product.id, num)}
                      disabled={product.stock < num}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        product.stock >= num
                          ? 'bg-pan-sinai-gold text-pan-sinai-dark-brown hover:bg-pan-sinai-yellow'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cantidad seleccionada */}
              {quantities[product.id] > 0 && (
                <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-700">
                      {quantities[product.id]} unidades
                    </span>
                    <button
                      onClick={() => handleRemove(product.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Carrito flotante */}
        {showCart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-pan-sinai-dark-brown">
                    Carrito de Compras
                  </h2>
                  <button
                    onClick={() => setShowCart(false)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto max-h-[60vh] p-6">
                {state.cart.items.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No hay productos en el carrito</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {state.cart.items.map(item => (
                      <div key={item.product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold bg-pan-sinai-gold text-pan-sinai-dark-brown px-2 py-1 rounded">
                              {item.product.id}
                            </span>
                            <span className="font-medium text-pan-sinai-dark-brown">
                              {item.product.name}
                            </span>
                          </div>
                          <p className="text-sm text-pan-sinai-brown">
                            {item.quantity} x ${item.product.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-pan-sinai-dark-brown">
                            ${item.subtotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {state.cart.items.length > 0 && (
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold text-pan-sinai-dark-brown">
                      Total: ${getCartTotal().toFixed(2)}
                    </span>
                    <span className="text-sm text-pan-sinai-brown">
                      {getCartItemCount()} productos
                    </span>
                  </div>
                  <button
                    onClick={onComplete}
                    className="w-full bg-pan-sinai-gold text-pan-sinai-dark-brown py-3 px-6 rounded-lg hover:bg-pan-sinai-yellow transition-colors font-semibold"
                  >
                    Continuar con el Pago
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 