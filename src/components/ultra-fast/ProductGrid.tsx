'use client';

import React, { useState } from 'react';
import { Plus, Minus, Star, AlertTriangle, Package, X } from 'lucide-react';

interface ProductGridProps {
  products: any[];
  onAddToCart: (product: any, quantity: number) => void;
  customerFavorites: any[];
}

export default function ProductGrid({ products, onAddToCart, customerFavorites }: ProductGridProps) {
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  // Productos reales de Pan Sinai basados en la factura
  const realProducts = [
    // PANES DULCES (B01-B52)
    { codigo: 'B01', nombre: 'Muffin Naranja', peso: '54gr', precio: 1.25, categoria: 'pan_dulce', stock: 15 },
    { codigo: 'B02', nombre: 'Torta Fresa', peso: '58gr', precio: 2.50, categoria: 'pan_dulce', stock: 8 },
    { codigo: 'B03', nombre: 'Quesadilla', peso: '64gr', precio: 1.75, categoria: 'pan_dulce', stock: 12 },
    { codigo: 'B04', nombre: 'Quesadilla Canela', peso: '64gr', precio: 1.75, categoria: 'pan_dulce', stock: 10 },
    { codigo: 'B05', nombre: 'Magdalena Vainilla', peso: '225gr', precio: 3.25, categoria: 'pan_dulce', stock: 6 },
    { codigo: 'B06', nombre: 'Margarita', peso: '56gr', precio: 1.50, categoria: 'pan_dulce', stock: 4 },
    { codigo: 'B07', nombre: 'Semita', peso: '120gr', precio: 2.00, categoria: 'pan_dulce', stock: 18 },
    { codigo: 'B08', nombre: 'Pan de Yema', peso: '45gr', precio: 0.85, categoria: 'pan_dulce', stock: 25 },
    { codigo: 'B09', nombre: 'Concha', peso: '45gr', precio: 0.85, categoria: 'pan_dulce', stock: 22 },
    { codigo: 'B10', nombre: 'Donut Glaseado', peso: '60gr', precio: 1.80, categoria: 'pan_dulce', stock: 14 },
    
    // TORTAS
    { codigo: 'T01', nombre: 'Torta Yema', peso: '700gr', precio: 8.00, categoria: 'tortas', stock: 3 },
    { codigo: 'T02', nombre: 'Torta Chocolate', peso: '800gr', precio: 9.50, categoria: 'tortas', stock: 2 },
    { codigo: 'T03', nombre: 'Torta Vainilla', peso: '750gr', precio: 8.75, categoria: 'tortas', stock: 4 },
    
    // GALLETAS
    { codigo: 'G01', nombre: 'Margarita', peso: '32gr', precio: 0.75, categoria: 'galletas', stock: 30 },
    { codigo: 'G02', nombre: 'Pretzel Piña', peso: '40gr', precio: 1.00, categoria: 'galletas', stock: 20 },
    { codigo: 'G03', nombre: 'Galleta Mantequilla', peso: '35gr', precio: 0.85, categoria: 'galletas', stock: 25 },
    
    // PAN TRADICIONAL
    { codigo: 'P01', nombre: 'Pan Francés', peso: '80gr', precio: 1.20, categoria: 'pan_tradicional', stock: 35 },
    { codigo: 'P02', nombre: 'Pan Integral', peso: '90gr', precio: 1.50, categoria: 'pan_tradicional', stock: 15 },
    { codigo: 'P03', nombre: 'Pan de Molde', peso: '500gr', precio: 3.75, categoria: 'pan_tradicional', stock: 8 },
  ];

  // Combinar productos reales con los del sistema
  const allProducts = realProducts.map(realProduct => {
    const systemProduct = products.find(p => p.code === realProduct.codigo);
    return {
      ...realProduct,
      id: systemProduct?.id || realProduct.codigo,
      stock: systemProduct?.stock || realProduct.stock,
      isFavorite: customerFavorites.some(fav => fav.code === realProduct.codigo)
    };
  });

  const getStockColor = (stock: number) => {
    if (stock > 10) return 'text-green-600';
    if (stock > 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStockIcon = (stock: number) => {
    if (stock > 10) return '🟢';
    if (stock > 5) return '🟡';
    return '🔴';
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    if (newQuantity > product.stock) {
      // Mostrar alerta de stock insuficiente
      alert(`⚠️ Solo tienes ${product.stock} ${product.nombre} disponibles`);
      return;
    }
    
    setQuantities(prev => ({
      ...prev,
      [productId]: newQuantity
    }));
  };

  const handleQuickAdd = (product: any, quantity: number) => {
    onAddToCart(product, quantity);
    
    // Feedback visual
    const button = document.querySelector(`[data-product-id="${product.id}"]`);
    if (button) {
      button.classList.add('bg-green-500');
      setTimeout(() => {
        button.classList.remove('bg-green-500');
      }, 200);
    }
  };

  const handleAddToCart = (product: any) => {
    const quantity = quantities[product.id] || 1;
    if (quantity > 0) {
      onAddToCart(product, quantity);
      setQuantities(prev => ({ ...prev, [product.id]: 0 }));
    }
  };

  const ProductCard = ({ product }: { product: any }) => {
    const quantity = quantities[product.id] || 0;
    const isLowStock = product.stock <= 5;
    const isOutOfStock = product.stock === 0;

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200">
        {/* Header del producto */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-mono text-sm text-pan-sinai-brown bg-gray-100 px-2 py-1 rounded">
                {product.codigo}
              </span>
              {product.isFavorite && (
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
              )}
            </div>
            <h3 className="font-semibold text-pan-sinai-dark-brown text-lg leading-tight">
              {product.nombre}
            </h3>
            <p className="text-sm text-pan-sinai-brown">
              {product.peso}
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-xl font-bold text-pan-sinai-dark-brown">
              ${product.precio}
            </div>
            <div className={`text-sm font-medium ${getStockColor(product.stock)}`}>
              {getStockIcon(product.stock)} {product.stock}
            </div>
          </div>
        </div>

        {/* Alerta de stock bajo */}
        {isLowStock && !isOutOfStock && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mb-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                Solo quedan {product.stock} unidades
              </span>
            </div>
          </div>
        )}

        {/* Sin stock */}
        {isOutOfStock && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-3">
            <div className="flex items-center space-x-2">
              <X className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-800">
                Sin stock disponible
              </span>
            </div>
          </div>
        )}

        {/* Controles de cantidad */}
        {!isOutOfStock && (
          <div className="space-y-3">
            {/* Botones rápidos */}
            <div className="grid grid-cols-3 gap-2">
              {[1, 5, 10].map((qty) => (
                <button
                  key={qty}
                  onClick={() => handleQuickAdd(product, qty)}
                  disabled={qty > product.stock}
                  className="bg-pan-sinai-gold hover:bg-pan-sinai-yellow text-pan-sinai-dark-brown py-2 px-3 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {qty}
                </button>
              ))}
            </div>

            {/* Control de cantidad */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleQuantityChange(product.id, quantity - 1)}
                disabled={quantity <= 0}
                className="w-10 h-10 bg-gray-200 hover:bg-gray-300 text-pan-sinai-dark-brown rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
              >
                <Minus className="w-4 h-4" />
              </button>
              
              <div className="flex-1 text-center">
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value) || 0)}
                  className="w-full text-center py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pan-sinai-gold focus:border-transparent"
                  min="0"
                  max={product.stock}
                />
              </div>
              
              <button
                onClick={() => handleQuantityChange(product.id, quantity + 1)}
                disabled={quantity >= product.stock}
                className="w-10 h-10 bg-gray-200 hover:bg-gray-300 text-pan-sinai-dark-brown rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Botón agregar */}
            <button
              onClick={() => handleAddToCart(product)}
              disabled={quantity === 0}
              data-product-id={product.id}
              className="w-full bg-pan-sinai-brown hover:bg-pan-sinai-dark-brown text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar al Carrito</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-pan-sinai-dark-brown">
          Productos ({allProducts.length})
        </h3>
        <div className="flex items-center space-x-2 text-sm text-pan-sinai-brown">
          <span>🟢 Alto</span>
          <span>🟡 Medio</span>
          <span>🔴 Bajo</span>
        </div>
      </div>

      {/* Grid de productos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Sin productos */}
      {allProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-pan-sinai-dark-brown mb-2">
            No hay productos disponibles
          </h3>
          <p className="text-pan-sinai-brown">
            Cambia de categoría o verifica el stock
          </p>
        </div>
      )}
    </div>
  );
} 