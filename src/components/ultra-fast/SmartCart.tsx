'use client';

import React, { useState } from 'react';
import { useSales } from '@/contexts/SalesContext';
import { 
  ShoppingCart, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle,
  DollarSign,
  Package,
  Clock,
  Zap
} from 'lucide-react';

interface SmartCartProps {
  isVisible: boolean;
  onToggle: () => void;
  onProcess: () => void;
  isProcessing: boolean;
  itemCount: number;
  total: number;
}

export default function SmartCart({ 
  isVisible, 
  onToggle, 
  onProcess, 
  isProcessing, 
  itemCount, 
  total 
}: SmartCartProps) {
  const { cart, removeFromCart, updateCartQuantity, clearCart } = useSales();
  const [showDetails, setShowDetails] = useState(false);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateCartQuantity(productId, newQuantity);
    }
  };

  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstimatedTime = () => {
    // Simular tiempo estimado basado en cantidad de productos
    const baseTime = 2; // minutos base
    const timePerItem = 0.5; // minutos por item
    const estimatedMinutes = Math.ceil(baseTime + (itemCount * timePerItem));
    return `${estimatedMinutes} min`;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      {/* Resumen flotante */}
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
        {/* Header del carrito */}
        <div className="bg-pan-sinai-gold p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ShoppingCart className="w-6 h-6 text-pan-sinai-dark-brown" />
              <div>
                <h3 className="font-semibold text-pan-sinai-dark-brown">
                  Carrito de Compras
                </h3>
                <p className="text-sm text-pan-sinai-brown">
                  {itemCount} producto{itemCount !== 1 ? 's' : ''} • {formatTime()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="text-right">
                <div className="text-xl font-bold text-pan-sinai-dark-brown">
                  ${total.toFixed(2)}
                </div>
                <div className="text-sm text-pan-sinai-brown">
                  Tiempo estimado: {getEstimatedTime()}
                </div>
              </div>
              
              <button
                onClick={onToggle}
                className="p-2 text-pan-sinai-brown hover:text-pan-sinai-dark-brown transition-colors"
              >
                {showDetails ? <X className="w-5 h-5" /> : <Package className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Detalles del carrito */}
        {showDetails && (
          <div className="max-h-96 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="p-6 text-center">
                <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-pan-sinai-brown">El carrito está vacío</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {cart.map((item) => (
                  <div key={item.product.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-mono text-sm text-pan-sinai-brown bg-gray-100 px-2 py-1 rounded">
                            {item.product.codigo || item.product.code}
                          </span>
                        </div>
                        <h4 className="font-medium text-pan-sinai-dark-brown">
                          {item.product.nombre || item.product.name}
                        </h4>
                        <p className="text-sm text-pan-sinai-brown">
                          ${item.product.precio || item.product.price} c/u
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {/* Controles de cantidad */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                            className="w-8 h-8 bg-gray-200 hover:bg-gray-300 text-pan-sinai-dark-brown rounded flex items-center justify-center transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          
                          <span className="w-12 text-center font-medium text-pan-sinai-dark-brown">
                            {item.quantity}
                          </span>
                          
                          <button
                            onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                            className="w-8 h-8 bg-gray-200 hover:bg-gray-300 text-pan-sinai-dark-brown rounded flex items-center justify-center transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        
                        {/* Subtotal */}
                        <div className="text-right min-w-[80px]">
                          <div className="font-semibold text-pan-sinai-dark-brown">
                            ${(item.quantity * (item.product.precio || item.product.price)).toFixed(2)}
                          </div>
                        </div>
                        
                        {/* Eliminar */}
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1 text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer con acciones */}
        <div className="bg-gray-50 p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={clearCart}
                disabled={cart.length === 0}
                className="text-red-600 hover:text-red-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Vaciar Carrito
              </button>
              
              {!showDetails && (
                <button
                  onClick={() => setShowDetails(true)}
                  className="text-pan-sinai-brown hover:text-pan-sinai-dark-brown font-medium text-sm"
                >
                  Ver Detalle
                </button>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-lg font-bold text-pan-sinai-dark-brown">
                  ${total.toFixed(2)}
                </div>
                <div className="text-xs text-pan-sinai-brown">
                  Total
                </div>
              </div>
              
              <button
                onClick={onProcess}
                disabled={cart.length === 0 || isProcessing}
                className="bg-pan-sinai-brown hover:bg-pan-sinai-dark-brown text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Finalizar Pedido</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Indicador de velocidad */}
      <div className="mt-2 text-center">
        <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
          <Zap className="w-4 h-4" />
          <span>5x más rápido que papel</span>
        </div>
      </div>
    </div>
  );
} 