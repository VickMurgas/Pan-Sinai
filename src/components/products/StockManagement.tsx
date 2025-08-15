'use client';

import React, { useState } from 'react';
import { useProducts } from '@/contexts/ProductContext';
import { 
  Package, 
  Plus, 
  Minus, 
  AlertTriangle, 
  History, 
  Save,
  X,
  CheckCircle
} from 'lucide-react';

export default function StockManagement() {
  const { products, updateStock, addStockMovement, stockMovements, getLowStockProducts } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState('');
  const [movementType, setMovementType] = useState<'reception' | 'adjustment'>('reception');
  const [notes, setNotes] = useState('');
  const [showReceptionForm, setShowReceptionForm] = useState(false);

  const lowStockProducts = getLowStockProducts();

  const handleStockUpdate = () => {
    if (!selectedProduct || !quantity || parseInt(quantity) <= 0) return;

    const quantityNum = parseInt(quantity);
    
    // Actualizar stock
    updateStock(selectedProduct.id, quantityNum, movementType === 'reception' ? 'add' : 'subtract');
    
    // Registrar movimiento
    addStockMovement(
      selectedProduct.id, 
      quantityNum, 
      movementType, 
      notes || undefined
    );

    // Limpiar formulario
    setSelectedProduct(null);
    setQuantity('');
    setNotes('');
    setShowReceptionForm(false);
  };

  const getStockStatus = (stock: number) => {
    if (stock < 20) return { color: 'text-red-600 bg-red-50', text: 'Bajo' };
    if (stock < 50) return { color: 'text-yellow-600 bg-yellow-50', text: 'Medio' };
    return { color: 'text-green-600 bg-green-50', text: 'Alto' };
  };

  const getMovementTypeText = (type: string) => {
    switch (type) {
      case 'reception': return 'Recepción';
      case 'sale': return 'Venta';
      case 'adjustment': return 'Ajuste';
      default: return 'Desconocido';
    }
  };

  const getMovementTypeColor = (type: string) => {
    switch (type) {
      case 'reception': return 'text-green-600 bg-green-50';
      case 'sale': return 'text-red-600 bg-red-50';
      case 'adjustment': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Alertas de stock bajo */}
      {lowStockProducts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-semibold text-red-800">
              Productos con Stock Bajo
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockProducts.map((product) => {
              const stockStatus = getStockStatus(product.stock);
              return (
                <div key={product.id} className="bg-white rounded-lg p-4 border border-red-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-pan-sinai-dark-brown">{product.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                      {product.stock} unidades
                    </span>
                  </div>
                  <p className="text-sm text-pan-sinai-brown mb-3">{product.code}</p>
                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowReceptionForm(true);
                    }}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    Agregar Stock
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Formulario de recepción/ajuste */}
      {showReceptionForm && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-pan-sinai-dark-brown">
              {movementType === 'reception' ? 'Recepción de Productos' : 'Ajuste de Stock'}
            </h3>
            <button
              onClick={() => setShowReceptionForm(false)}
              className="p-2 text-pan-sinai-brown hover:text-pan-sinai-dark-brown transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tipo de movimiento */}
            <div>
              <label className="block text-sm font-medium text-pan-sinai-dark-brown mb-2">
                Tipo de Movimiento
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="reception"
                    checked={movementType === 'reception'}
                    onChange={(e) => setMovementType(e.target.value as 'reception' | 'adjustment')}
                    className="text-pan-sinai-gold focus:ring-pan-sinai-gold"
                  />
                  <span className="text-sm text-pan-sinai-dark-brown">Recepción</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="adjustment"
                    checked={movementType === 'adjustment'}
                    onChange={(e) => setMovementType(e.target.value as 'reception' | 'adjustment')}
                    className="text-pan-sinai-gold focus:ring-pan-sinai-gold"
                  />
                  <span className="text-sm text-pan-sinai-dark-brown">Ajuste</span>
                </label>
              </div>
            </div>

            {/* Producto seleccionado */}
            {selectedProduct && (
              <div>
                <label className="block text-sm font-medium text-pan-sinai-dark-brown mb-2">
                  Producto
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-pan-sinai-dark-brown">{selectedProduct.name}</p>
                  <p className="text-sm text-pan-sinai-brown">{selectedProduct.code}</p>
                  <p className="text-sm text-pan-sinai-brown">Stock actual: {selectedProduct.stock}</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Cantidad */}
            <div>
              <label className="block text-sm font-medium text-pan-sinai-dark-brown mb-2">
                Cantidad
              </label>
              <div className="relative">
                {movementType === 'reception' ? (
                  <Plus className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                ) : (
                  <Minus className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                )}
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pan-sinai-gold focus:border-transparent transition-all"
                  placeholder="Ingrese la cantidad"
                />
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-pan-sinai-dark-brown mb-2">
                Notas (opcional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pan-sinai-gold focus:border-transparent transition-all"
                placeholder="Observaciones del movimiento"
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex space-x-4 mt-6">
            <button
              onClick={handleStockUpdate}
              disabled={!selectedProduct || !quantity || parseInt(quantity) <= 0}
              className="flex-1 bg-pan-sinai-gold text-pan-sinai-dark-brown py-3 px-6 rounded-lg hover:bg-pan-sinai-yellow transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>Guardar Movimiento</span>
            </button>
            <button
              onClick={() => setShowReceptionForm(false)}
              className="px-6 py-3 border border-gray-300 text-pan-sinai-brown rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Historial de movimientos */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-pan-sinai-dark-brown">Historial de Movimientos</h3>
          <History className="w-6 h-6 text-pan-sinai-brown" />
        </div>

        <div className="space-y-4">
          {stockMovements.slice(0, 10).map((movement) => (
            <div key={movement.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMovementTypeColor(movement.type)}`}>
                      {getMovementTypeText(movement.type)}
                    </span>
                    <span className="text-sm text-pan-sinai-brown">
                      {movement.date.toLocaleDateString('es-ES', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <h4 className="font-semibold text-pan-sinai-dark-brown">{movement.productName}</h4>
                  {movement.notes && (
                    <p className="text-sm text-pan-sinai-brown mt-1">{movement.notes}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className={`font-bold text-lg ${movement.type === 'reception' ? 'text-green-600' : 'text-red-600'}`}>
                    {movement.type === 'reception' ? '+' : '-'}{movement.quantity}
                  </p>
                  <p className="text-sm text-pan-sinai-brown">unidades</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {stockMovements.length === 0 && (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-pan-sinai-brown">No hay movimientos registrados</p>
          </div>
        )}
      </div>
    </div>
  );
} 