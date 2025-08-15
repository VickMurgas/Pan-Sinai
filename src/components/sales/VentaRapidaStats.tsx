'use client';

import React from 'react';
import { TrendingUp, DollarSign, Package, Clock, RefreshCw, AlertTriangle } from 'lucide-react';
import { useSales } from '../../contexts/SalesContext';
import { VentaRapidaStats } from '../../types';

export default function VentaRapidaStats() {
  const { state } = useSales();

  // Calcular estadísticas en tiempo real
  const stats: VentaRapidaStats = {
    ventasHoy: state.ventas.filter(v => {
      const today = new Date();
      const ventaDate = new Date(v.fecha);
      return ventaDate.toDateString() === today.toDateString();
    }).length,
    ingresosHoy: state.ventas
      .filter(v => {
        const today = new Date();
        const ventaDate = new Date(v.fecha);
        return ventaDate.toDateString() === today.toDateString();
      })
      .reduce((sum, v) => sum + v.total, 0),
    productosVendidos: state.ventas
      .filter(v => {
        const today = new Date();
        const ventaDate = new Date(v.fecha);
        return ventaDate.toDateString() === today.toDateString();
      })
      .reduce((sum, v) => sum + v.products.reduce((pSum, p) => pSum + p.quantity, 0), 0),
    promedioTiempoVenta: 25, // En producción se calcularía basado en timestamps
    devolucionesHoy: state.devoluciones.filter(d => {
      const today = new Date();
      const devolucionDate = new Date(d.fecha);
      return devolucionDate.toDateString() === today.toDateString() && d.tipo === 'devolucion';
    }).length,
    intercambiosHoy: state.devoluciones.filter(d => {
      const today = new Date();
      const devolucionDate = new Date(d.fecha);
      return devolucionDate.toDateString() === today.toDateString() && d.tipo === 'intercambio';
    }).length
  };

  // Productos con stock bajo
  const productosStockBajo = state.productos.filter(p => p.stock <= p.stockMinimo && p.activo);
  const productosSinStock = state.productos.filter(p => p.stock === 0 && p.activo);

  return (
    <div className="space-y-6">
      {/* Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Ventas Hoy */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ventas Hoy</p>
              <p className="text-2xl font-bold text-gray-900">{stats.ventasHoy}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Ingresos Hoy */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ingresos Hoy</p>
              <p className="text-2xl font-bold text-gray-900">${stats.ingresosHoy.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Productos Vendidos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Productos Vendidos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.productosVendidos}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Tiempo Promedio */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
              <p className="text-2xl font-bold text-gray-900">{stats.promedioTiempoVenta}s</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Devoluciones */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Devoluciones</p>
              <p className="text-2xl font-bold text-gray-900">{stats.devolucionesHoy}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <RefreshCw className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        {/* Intercambios */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Intercambios</p>
              <p className="text-2xl font-bold text-gray-900">{stats.intercambiosHoy}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <RefreshCw className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Alertas de Stock */}
      {(productosStockBajo.length > 0 || productosSinStock.length > 0) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Alertas de Stock</h3>
          </div>
          
          <div className="space-y-3">
            {/* Productos sin stock */}
            {productosSinStock.length > 0 && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-800 mb-2">
                  Sin Stock ({productosSinStock.length})
                </h4>
                <div className="space-y-1">
                  {productosSinStock.slice(0, 3).map(product => (
                    <div key={product.id} className="flex justify-between text-sm">
                      <span className="text-red-700">{product.name}</span>
                      <span className="text-red-600 font-medium">Código: {product.code}</span>
                    </div>
                  ))}
                  {productosSinStock.length > 3 && (
                    <div className="text-sm text-red-600">
                      +{productosSinStock.length - 3} productos más...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Productos con stock bajo */}
            {productosStockBajo.length > 0 && (
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-2">
                  Stock Bajo ({productosStockBajo.length})
                </h4>
                <div className="space-y-1">
                  {productosStockBajo.slice(0, 3).map(product => (
                    <div key={product.id} className="flex justify-between text-sm">
                      <span className="text-yellow-700">{product.name}</span>
                      <span className="text-yellow-600 font-medium">
                        Stock: {product.stock} (mín: {product.stockMinimo})
                      </span>
                    </div>
                  ))}
                  {productosStockBajo.length > 3 && (
                    <div className="text-sm text-yellow-600">
                      +{productosStockBajo.length - 3} productos más...
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Métodos de Pago Más Usados */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Métodos de Pago</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {state.metodosPago.map(metodo => (
            <div key={metodo.tipo} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-2xl">{metodo.icono}</span>
              <div>
                <div className="font-medium text-gray-900">{metodo.nombre}</div>
                <div className="text-sm text-gray-600">
                  {metodo.activo ? 'Disponible' : 'No disponible'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Últimas Ventas */}
      {state.ventas.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Últimas Ventas</h3>
          <div className="space-y-3">
            {state.ventas.slice(-5).reverse().map(venta => (
              <div key={venta.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Venta #{venta.numero}</div>
                  <div className="text-sm text-gray-600">
                    {new Date(venta.fecha).toLocaleTimeString()} • {venta.products.length} productos
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">${venta.total.toFixed(2)}</div>
                  <div className="text-sm text-gray-600 capitalize">{venta.metodoPago}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 