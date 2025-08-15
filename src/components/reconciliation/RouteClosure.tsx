'use client';

import React, { useState } from 'react';
import { useReconciliation } from '@/contexts/ReconciliationContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSales } from '@/contexts/SalesContext';
import { 
  CheckCircle, 
  AlertTriangle, 
  Package, 
  DollarSign, 
  ShoppingCart,
  Users,
  Clock,
  FileText,
  Download,
  Send,
  RefreshCw
} from 'lucide-react';

export default function RouteClosure() {
  const { user } = useAuth();
  const { getSalesBySeller } = useSales();
  const { closeRoute, getRouteClosure } = useReconciliation();
  
  const [isClosing, setIsClosing] = useState(false);
  const [notes, setNotes] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [routeClosure, setRouteClosure] = useState<any>(null);

  // Obtener datos del día actual
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dailySales = user ? getSalesBySeller(user.id).filter(sale => {
    const saleDate = new Date(sale.date);
    return saleDate >= today;
  }) : [];

  const totalSales = dailySales.length;
  const totalRevenue = dailySales.reduce((sum, sale) => sum + sale.total, 0);
  const totalProducts = dailySales.reduce((sum, sale) => 
    sum + sale.products.reduce((pSum, product) => pSum + product.quantity, 0), 0
  );
  const uniqueCustomers = new Set(dailySales.map(sale => sale.customerId)).size;

  // Verificar si ya se cerró la ruta hoy
  const existingClosure = user ? getRouteClosure(user.id, today) : null;

  const handleCloseRoute = async () => {
    if (!user) return;
    
    setIsClosing(true);
    try {
      const closure = await closeRoute(user.id, user.name, notes);
      setRouteClosure(closure);
      setShowConfirmation(false);
    } catch (error) {
      alert('Error al cerrar la ruta: ' + error);
    } finally {
      setIsClosing(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (existingClosure) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <h2 className="text-2xl font-bold text-pan-sinai-dark-brown">Ruta Cerrada</h2>
              <p className="text-pan-sinai-brown">La ruta del día ya ha sido finalizada</p>
            </div>
          </div>
        </div>

        {/* Resumen del cierre */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-pan-sinai-dark-brown mb-6">Resumen del Cierre</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <ShoppingCart className="w-6 h-6 text-green-600" />
                <div>
                  <p className="text-sm text-green-600">Ventas Realizadas</p>
                  <p className="text-xl font-bold text-green-800">{existingClosure.totalSales}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600">Total Recaudado</p>
                  <p className="text-xl font-bold text-blue-800">${existingClosure.totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Package className="w-6 h-6 text-purple-600" />
                <div>
                  <p className="text-sm text-purple-600">Productos Vendidos</p>
                  <p className="text-xl font-bold text-purple-800">{existingClosure.totalProducts}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Users className="w-6 h-6 text-orange-600" />
                <div>
                  <p className="text-sm text-orange-600">Clientes Visitados</p>
                  <p className="text-xl font-bold text-orange-800">{uniqueCustomers}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Productos no vendidos */}
          {existingClosure.unsoldProducts.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-pan-sinai-dark-brown mb-3">Productos No Vendidos</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {existingClosure.unsoldProducts.map((product: any, index: number) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-pan-sinai-dark-brown">{product.name}</p>
                        <p className="text-sm text-pan-sinai-brown">{product.code}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-pan-sinai-dark-brown">
                          {product.stock} unidades
                        </p>
                        <p className="text-xs text-pan-sinai-brown">sobrante</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sugerencias de reabastecimiento */}
          {existingClosure.reorderSuggestion.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-pan-sinai-dark-brown mb-3">Sugerencias de Reabastecimiento</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {existingClosure.reorderSuggestion.map((product: any, index: number) => (
                  <div key={index} className="bg-yellow-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-pan-sinai-dark-brown">{product.name}</p>
                        <p className="text-sm text-pan-sinai-brown">Stock actual: {product.stock}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-yellow-800">
                          Sugerido: {product.suggestedQuantity}
                        </p>
                        <p className="text-xs text-pan-sinai-brown">unidades</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notas */}
          {existingClosure.notes && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-semibold text-pan-sinai-dark-brown mb-2">Notas del Cierre</h4>
              <p className="text-pan-sinai-brown">{existingClosure.notes}</p>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-pan-sinai-dark-brown mb-4">Acciones Disponibles</h3>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.print()}
              className="bg-pan-sinai-gold text-pan-sinai-dark-brown px-6 py-3 rounded-lg hover:bg-pan-sinai-yellow transition-colors font-medium flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>Imprimir Resumen</span>
            </button>
            
            <button
              onClick={() => {/* Implementar exportación */}}
              className="bg-pan-sinai-brown text-white px-6 py-3 rounded-lg hover:bg-pan-sinai-dark-brown transition-colors font-medium flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Exportar Datos</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle className="w-8 h-8 text-orange-600" />
          <div>
            <h2 className="text-2xl font-bold text-pan-sinai-dark-brown">Cierre de Ruta</h2>
            <p className="text-pan-sinai-brown">Finalizar la jornada de trabajo</p>
          </div>
        </div>
      </div>

      {/* Resumen del día */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-pan-sinai-dark-brown mb-6">Resumen del Día</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <ShoppingCart className="w-6 h-6 text-green-600" />
              <div>
                <p className="text-sm text-green-600">Ventas Realizadas</p>
                <p className="text-xl font-bold text-green-800">{totalSales}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <DollarSign className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600">Total Recaudado</p>
                <p className="text-xl font-bold text-blue-800">${totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Package className="w-6 h-6 text-purple-600" />
              <div>
                <p className="text-sm text-purple-600">Productos Vendidos</p>
                <p className="text-xl font-bold text-purple-800">{totalProducts}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6 text-orange-600" />
              <div>
                <p className="text-sm text-orange-600">Clientes Visitados</p>
                <p className="text-xl font-bold text-orange-800">{uniqueCustomers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de ventas del día */}
        {dailySales.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-pan-sinai-dark-brown mb-3">Ventas del Día</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {dailySales.map((sale, index) => (
                <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-pan-sinai-gold rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-pan-sinai-dark-brown">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-pan-sinai-dark-brown">{sale.customerName}</p>
                      <p className="text-sm text-pan-sinai-brown">
                        {sale.products.length} producto{sale.products.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-pan-sinai-dark-brown">${sale.total.toFixed(2)}</p>
                    <p className="text-xs text-pan-sinai-brown">{formatTime(sale.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notas */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-pan-sinai-dark-brown mb-2">
            Notas del Cierre (Opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Agregar observaciones sobre la jornada..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pan-sinai-gold focus:border-transparent resize-none"
            rows={3}
          />
        </div>
      </div>

      {/* Confirmación */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
            <div className="text-center mb-6">
              <AlertTriangle className="w-16 h-16 text-orange-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-pan-sinai-dark-brown mb-2">Confirmar Cierre de Ruta</h3>
              <p className="text-pan-sinai-brown">
                ¿Estás seguro de que deseas finalizar la jornada? Esta acción no se puede deshacer.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-pan-sinai-brown">Resumen:</p>
                <p className="font-semibold text-pan-sinai-dark-brown">
                  {totalSales} ventas • ${totalRevenue.toFixed(2)} recaudado • {uniqueCustomers} clientes
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCloseRoute}
                  disabled={isClosing}
                  className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isClosing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Cerrando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Finalizar Jornada</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botón de cierre */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <button
          onClick={() => setShowConfirmation(true)}
          disabled={totalSales === 0}
          className="w-full bg-red-600 text-white py-4 px-6 rounded-lg hover:bg-red-700 transition-colors font-medium text-lg flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircle className="w-6 h-6" />
          <span>Finalizar Jornada</span>
        </button>
        
        {totalSales === 0 && (
          <p className="text-center text-pan-sinai-brown mt-3">
            No se pueden cerrar rutas sin ventas registradas
          </p>
        )}
      </div>
    </div>
  );
} 