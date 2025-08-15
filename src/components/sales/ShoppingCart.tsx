'use client';

import React from 'react';
import { useSales } from '@/contexts/SalesContext';
import { 
  ShoppingCart as ShoppingCartIcon, 
  Plus, 
  Minus, 
  Trash2, 
  DollarSign,
  Package,
  X
} from 'lucide-react';

interface ShoppingCartProps {
  onCheckout?: () => void;
  onClose?: () => void;
  showCloseButton?: boolean;
}

export default function ShoppingCart({ onCheckout, onClose, showCloseButton = false }: ShoppingCartProps) {
  const { 
    cart, 
    removeFromCart, 
    updateCartQuantity, 
    clearCart,
    getCartTotal, 
    getCartItemCount 
  } = useSales();

  if (cart.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-8">
          <ShoppingCartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-pan-sinai-dark-brown mb-2">
            Carrito Vacío
          </h3>
          <p className="text-pan-sinai-brown">
            Agrega productos para comenzar una venta
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header del carrito */}
      <div className="bg-pan-sinai-gold px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ShoppingCartIcon className="w-6 h-6 text-pan-sinai-dark-brown" />
            <h3 className="text-lg font-bold text-pan-sinai-dark-brown">
              Carrito de Compras
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-pan-sinai-dark-brown">
              {getCartItemCount()} producto{getCartItemCount() !== 1 ? 's' : ''}
            </span>
            {showCloseButton && onClose && (
              <button
                onClick={onClose}
                className="p-1 text-pan-sinai-dark-brown hover:text-pan-sinai-brown transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lista de productos */}
      <div className="max-h-96 overflow-y-auto">
        {cart.map((item) => (
          <div key={item.product.id} className="border-b border-gray-100 p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-4">
              {/* Información del producto */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-pan-sinai-dark-brown">{item.product.name}</h4>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-1 text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-pan-sinai-brown mb-2">{item.product.code}</p>
                <p className="text-sm text-pan-sinai-brown">
                  Stock disponible: {item.product.stock}
                </p>
              </div>

              {/* Controles de cantidad */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-pan-sinai-brown hover:bg-gray-200 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                
                <span className="w-12 text-center font-semibold text-pan-sinai-dark-brown">
                  {item.quantity}
                </span>
                
                <button
                  onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                  disabled={item.quantity >= item.product.stock}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-pan-sinai-brown hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Precios */}
              <div className="text-right min-w-[80px]">
                <p className="font-semibold text-pan-sinai-dark-brown">
                  ${item.subtotal.toFixed(2)}
                </p>
                <p className="text-sm text-pan-sinai-brown">
                  ${item.product.price.toFixed(2)} c/u
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Resumen y acciones */}
      <div className="p-6 bg-gray-50">
        {/* Resumen */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-pan-sinai-brown">Subtotal:</span>
            <span className="text-pan-sinai-dark-brown">${getCartTotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-pan-sinai-brown">IVA (13%):</span>
            <span className="text-pan-sinai-dark-brown">${(getCartTotal() * 0.13).toFixed(2)}</span>
          </div>
          <hr className="border-gray-300" />
          <div className="flex justify-between text-lg font-bold">
            <span className="text-pan-sinai-dark-brown">Total:</span>
            <span className="text-pan-sinai-dark-brown">
              ${(getCartTotal() * 1.13).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="space-y-3">
          {onCheckout && (
            <button
              onClick={onCheckout}
              className="w-full bg-pan-sinai-gold text-pan-sinai-dark-brown py-3 px-6 rounded-lg hover:bg-pan-sinai-yellow transition-colors font-medium flex items-center justify-center space-x-2"
            >
              <DollarSign className="w-5 h-5" />
              <span>Procesar Venta</span>
            </button>
          )}
          
          <button
            onClick={clearCart}
            className="w-full bg-red-500 text-white py-2 px-6 rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Vaciar Carrito</span>
          </button>
        </div>
      </div>
    </div>
  );
} 