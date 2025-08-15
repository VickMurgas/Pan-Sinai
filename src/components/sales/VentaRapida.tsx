'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Minus, Trash2, ShoppingCart, CreditCard, DollarSign, Banknote, AlertTriangle, CheckCircle } from 'lucide-react';
import { useSales } from '../../contexts/SalesContext';
import { Product, ProductoSugerido } from '../../types';

export default function VentaRapida() {
  const {
    state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    setPaymentMethod,
    setDiscount,
    processSale,
    searchProducts,
    getProductSuggestions,
    validateStock
  } = useSales();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<ProductoSugerido[]>([]);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus en el campo de búsqueda
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Búsqueda en tiempo real
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchProducts(searchQuery);
      setSearchResults(results);
      setShowSuggestions(false);
    } else {
      setSearchResults([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, searchProducts]);

  // Manejar selección de producto
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setSearchQuery('');
    setSearchResults([]);
    
    // Validar stock antes de agregar
    const validation = validateStock(product.id, 1);
    if (!validation.valid) {
      setMessage({ type: 'error', text: validation.message! });
      setSuggestions(getProductSuggestions(product.id));
      setShowSuggestions(true);
      return;
    }
    
    addToCart(product, 1);
    setMessage({ type: 'success', text: `${product.name} agregado al carrito` });
    setTimeout(() => setMessage(null), 2000);
  };

  // Manejar cambio de cantidad
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    setQuantity(newQuantity);
  };

  // Agregar producto con cantidad específica
  const handleAddWithQuantity = () => {
    if (!selectedProduct) return;
    
    const validation = validateStock(selectedProduct.id, quantity);
    if (!validation.valid) {
      setMessage({ type: 'error', text: validation.message! });
      setSuggestions(getProductSuggestions(selectedProduct.id));
      setShowSuggestions(true);
      return;
    }
    
    addToCart(selectedProduct, quantity);
    setMessage({ type: 'success', text: `${quantity}x ${selectedProduct.name} agregado` });
    setSelectedProduct(null);
    setQuantity(1);
    setTimeout(() => setMessage(null), 2000);
  };

  // Procesar venta
  const handleProcessSale = async () => {
    if (state.cart.items.length === 0) {
      setMessage({ type: 'error', text: 'El carrito está vacío' });
      return;
    }

    setProcessing(true);
    try {
      const venta = await processSale();
      if (venta) {
        setMessage({ type: 'success', text: `Venta #${venta.numero} procesada exitosamente` });
        // Aquí se podría imprimir el ticket
      } else {
        setMessage({ type: 'error', text: 'Error al procesar la venta' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Error desconocido' });
    } finally {
      setProcessing(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Limpiar mensajes
  const clearMessage = () => setMessage(null);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Venta Rápida</h1>
        <p className="text-gray-600">Procesa ventas súper rápido con validación de stock en tiempo real</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel Izquierdo - Búsqueda y Productos */}
        <div className="lg:col-span-2 space-y-6">
          {/* Búsqueda de Productos */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar por código (B01) o nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                autoComplete="off"
              />
            </div>

            {/* Resultados de búsqueda */}
            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                {searchResults.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-600">
                        Código: {product.code} • ${product.price.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${product.stock <= product.stockMinimo ? 'text-red-600' : 'text-green-600'}`}>
                        Stock: {product.stock}
                      </div>
                      {product.stock <= product.stockMinimo && (
                        <div className="text-xs text-red-500">¡Stock bajo!</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Producto seleccionado */}
            {selectedProduct && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{selectedProduct.name}</h3>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 text-right">
                    <div className="text-sm text-gray-600">
                      Stock disponible: {selectedProduct.stock}
                    </div>
                    <div className="font-bold text-lg">
                      ${(selectedProduct.price * quantity).toFixed(2)}
                    </div>
                  </div>
                  <button
                    onClick={handleAddWithQuantity}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            )}

            {/* Sugerencias de productos */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center space-x-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <h3 className="font-semibold text-yellow-800">Productos Alternativos</h3>
                </div>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => handleProductSelect(suggestion.producto)}
                      className="flex items-center justify-between p-2 bg-white rounded cursor-pointer hover:bg-yellow-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{suggestion.producto.name}</div>
                        <div className="text-sm text-gray-600">{suggestion.mensaje}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          Stock: {suggestion.producto.stock}
                        </div>
                        <div className="text-sm">${suggestion.producto.price.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mensajes del sistema */}
          {message && (
            <div className={`p-4 rounded-lg flex items-center space-x-2 ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
              <span>{message.text}</span>
              <button
                onClick={clearMessage}
                className="ml-auto text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Panel Derecho - Carrito */}
        <div className="space-y-6">
          {/* Carrito de Compras */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Carrito</h2>
              {state.cart.items.length > 0 && (
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                  {state.cart.items.length}
                </span>
              )}
            </div>

            {/* Items del carrito */}
            {state.cart.items.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>El carrito está vacío</p>
                <p className="text-sm">Busca productos para comenzar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {state.cart.items.map((item) => (
                  <div key={item.product.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{item.product.name}</div>
                      <div className="text-sm text-gray-600">
                        ${item.product.price.toFixed(2)} × {item.quantity}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">${item.subtotal.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">
                        Stock: {item.stockDisponible}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="w-6 h-6 rounded bg-red-100 flex items-center justify-center hover:bg-red-200 text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Totales */}
            {state.cart.items.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${state.cart.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Descuento:</span>
                  <span>-${state.cart.descuento.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total:</span>
                  <span>${state.cart.total.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Métodos de Pago */}
          {state.cart.items.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Método de Pago</h3>
              <div className="space-y-2">
                {state.metodosPago.map((metodo) => (
                  <button
                    key={metodo.tipo}
                    onClick={() => setPaymentMethod(metodo.tipo)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                      state.cart.metodoPago === metodo.tipo
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-xl">{metodo.icono}</span>
                    <span className="font-medium">{metodo.nombre}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Botón de Procesar Venta */}
          {state.cart.items.length > 0 && (
            <button
              onClick={handleProcessSale}
              disabled={processing}
              className="w-full py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {processing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Procesando...</span>
                </div>
              ) : (
                `Procesar Venta - $${state.cart.total.toFixed(2)}`
              )}
            </button>
          )}

          {/* Botón de Limpiar Carrito */}
          {state.cart.items.length > 0 && (
            <button
              onClick={clearCart}
              className="w-full py-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              Limpiar Carrito
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 