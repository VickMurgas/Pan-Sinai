'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Zap, Search, Plus, Minus, ShoppingCart, DollarSign, CreditCard, Banknote, CheckCircle, X } from 'lucide-react';
import { useSales } from '../../contexts/SalesContext';
import { Product } from '../../types';

export default function UltraFastOrder() {
  const {
    state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    setPaymentMethod,
    processSale,
    searchProducts
  } = useSales();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Productos más vendidos (shortcuts)
  const productosPopulares = state.productos
    .filter(p => p.activo && p.stock > 0)
    .slice(0, 8);

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
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, searchProducts]);

  // Agregar producto con un click
  const handleQuickAdd = (product: Product) => {
    try {
      addToCart(product, 1);
      setMessage({ type: 'success', text: `${product.name} agregado` });
      setTimeout(() => setMessage(null), 1500);
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Error' });
      setTimeout(() => setMessage(null), 2000);
    }
  };

  // Procesar venta ultra-rápida
  const handleUltraFastSale = async () => {
    if (state.cart.items.length === 0) {
      setMessage({ type: 'error', text: 'Carrito vacío' });
      return;
    }

    setProcessing(true);
    try {
      const venta = await processSale();
      if (venta) {
        setMessage({ type: 'success', text: `¡Venta #${venta.numero} completada!` });
        setTimeout(() => setMessage(null), 2000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error en venta' });
      setTimeout(() => setMessage(null), 2000);
    } finally {
      setProcessing(false);
    }
  };

  // Limpiar mensajes
  const clearMessage = () => setMessage(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Header Ultra-Fast */}
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Zap className="w-8 h-8 text-yellow-500" />
          <h1 className="text-4xl font-bold text-gray-900">VENTA ULTRA-RÁPIDA</h1>
          <Zap className="w-8 h-8 text-yellow-500" />
        </div>
        <p className="text-gray-600 text-lg">¡Ventas súper rápidas en segundos!</p>
              </div>
              
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel Izquierdo - Búsqueda y Productos Populares */}
        <div className="lg:col-span-2 space-y-6">
          {/* Búsqueda Ultra-Rápida */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                  <input
                    ref={searchInputRef}
                    type="text"
                placeholder="🔍 Buscar producto (código o nombre)..."
                    value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-transparent text-xl font-medium"
                autoComplete="off"
              />
            </div>

            {/* Resultados de búsqueda */}
            {searchResults.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {searchResults.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleQuickAdd(product)}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 transform hover:scale-105"
                  >
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 text-lg">{product.name}</div>
                      <div className="text-sm text-gray-600">
                        {product.code} • ${product.price.toFixed(2)}
                  </div>
                </div>
                <div className="text-right">
                      <div className={`font-bold text-lg ${product.stock <= product.stockMinimo ? 'text-red-600' : 'text-green-600'}`}>
                        {product.stock}
                      </div>
                      <div className="text-xs text-gray-500">stock</div>
                    </div>
                </div>
                ))}
              </div>
            )}
              
            {/* Productos Populares */}
            {!searchQuery && (
                <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                  Productos Populares
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {productosPopulares.map((product) => (
                      <button
                        key={product.id}
                      onClick={() => handleQuickAdd(product)}
                      className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:from-green-100 hover:to-emerald-100 transition-all duration-200 transform hover:scale-105 text-left"
                    >
                      <div className="font-bold text-gray-900 text-sm mb-1">{product.name}</div>
                      <div className="text-xs text-gray-600 mb-2">{product.code}</div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-green-600">${product.price.toFixed(2)}</span>
                        <span className="text-xs text-gray-500">{product.stock}</span>
                      </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* Mensajes del sistema */}
          {message && (
            <div className={`p-4 rounded-xl flex items-center space-x-3 ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <X className="w-6 h-6" />
              )}
              <span className="font-medium">{message.text}</span>
              <button
                onClick={clearMessage}
                className="ml-auto text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          )}
      </div>

        {/* Panel Derecho - Carrito Ultra-Rápido */}
        <div className="space-y-6">
          {/* Carrito Express */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <ShoppingCart className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Carrito Express</h2>
              {state.cart.items.length > 0 && (
                <span className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded-full">
                  {state.cart.items.length}
                </span>
              )}
            </div>

            {/* Items del carrito */}
            {state.cart.items.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Carrito vacío</p>
                <p className="text-sm">Agrega productos para comenzar</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {state.cart.items.map((item) => (
                  <div key={item.product.id} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <div className="flex-1">
                      <div className="font-bold text-gray-900">{item.product.name}</div>
                      <div className="text-sm text-gray-600">
                        ${item.product.price.toFixed(2)} × {item.quantity}
            </div>
          </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">${item.subtotal.toFixed(2)}</div>
                  </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center hover:bg-red-200 text-red-600"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center hover:bg-green-200 text-green-600"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Total Express */}
            {state.cart.items.length > 0 && (
              <div className="mt-6 pt-4 border-t-2 border-gray-200">
                <div className="flex justify-between items-center text-2xl font-bold text-gray-900">
                  <span>TOTAL:</span>
                  <span className="text-blue-600">${state.cart.total.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Métodos de Pago Express */}
          {state.cart.items.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">Método de Pago</h3>
              <div className="space-y-3">
                {state.metodosPago.map((metodo) => (
                  <button
                    key={metodo.tipo}
                    onClick={() => setPaymentMethod(metodo.tipo)}
                    className={`w-full flex items-center space-x-4 p-4 rounded-xl border-2 transition-all duration-200 ${
                      state.cart.metodoPago === metodo.tipo
                        ? 'border-blue-500 bg-blue-50 text-blue-700 transform scale-105'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-2xl">{metodo.icono}</span>
                    <span className="font-bold text-lg">{metodo.nombre}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Botón Ultra-Rápido */}
          {state.cart.items.length > 0 && (
            <button
              onClick={handleUltraFastSale}
              disabled={processing}
              className="w-full py-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-bold text-2xl hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              {processing ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>PROCESANDO...</span>
        </div>
      ) : (
                <div className="flex items-center justify-center space-x-3">
                  <Zap className="w-6 h-6" />
                  <span>¡VENDER AHORA!</span>
        </div>
      )}
            </button>
          )}

          {/* Botón Limpiar */}
          {state.cart.items.length > 0 && (
            <button
              onClick={clearCart}
              className="w-full py-3 text-gray-600 hover:text-red-600 transition-colors font-medium"
            >
              Limpiar Carrito
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 