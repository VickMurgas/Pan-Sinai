'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProducts } from '@/contexts/ProductContext';
import { 
  Package, 
  AlertTriangle, 
  Plus, 
  LogOut,
  User,
  TrendingDown,
  CheckCircle,
  Clock,
  BarChart3,
  Search
} from 'lucide-react';
import ProductCatalog from '@/components/products/ProductCatalog';
import StockManagement from '@/components/products/StockManagement';
import Logo from '@/components/ui/Logo';

export default function BodegueroDashboard() {
  const { user, logout } = useAuth();
  const { products, getLowStockProducts } = useProducts();
  const [activeTab, setActiveTab] = useState<'overview' | 'catalog' | 'stock'>('overview');

  // Datos de prueba para el bodeguero
  const stockData = [
    { id: '1', name: 'Pan Francés', code: 'PF001', stock: 150, minStock: 50, category: 'Pan Básico' },
    { id: '2', name: 'Pan Dulce', code: 'PD002', stock: 25, minStock: 30, category: 'Pan Dulce' },
    { id: '3', name: 'Pastel de Chocolate', code: 'PC003', stock: 8, minStock: 15, category: 'Pasteles' },
    { id: '4', name: 'Croissant', code: 'CR004', stock: 45, minStock: 20, category: 'Pan Dulce' },
    { id: '5', name: 'Pan Integral', code: 'PI005', stock: 60, minStock: 25, category: 'Pan Saludable' },
  ];

  const pendingOrders = [
            { id: '1', customer: 'Tienda El Sol', products: ['Pan Francés', 'Pan Dulce'], status: 'pending', time: '08:30' },
    { id: '2', customer: 'Tienda La Esperanza', products: ['Croissant', 'Pastel de Chocolate'], status: 'preparing', time: '09:15' },
    { id: '3', customer: 'Mini Super San José', products: ['Pan Integral', 'Pan Francés'], status: 'ready', time: '10:00' },
  ];

  const lowStockProducts = getLowStockProducts();

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock <= minStock) return 'low';
    if (stock <= minStock * 1.5) return 'medium';
    return 'high';
  };

  const getStockColor = (status: string) => {
    switch (status) {
      case 'low': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'preparing': return 'Preparando';
      case 'ready': return 'Listo';
      default: return 'Desconocido';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pan-sinai-cream to-pan-sinai-light-brown">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Logo size="lg" showText={false} />
              <div>
                <p className="text-lg font-semibold text-pan-sinai-dark-brown">Gestión de Inventario</p>
                <p className="text-sm text-pan-sinai-brown">Bodeguero: {user?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={logout}
                className="p-2 text-pan-sinai-brown hover:text-pan-sinai-dark-brown transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pestañas de navegación */}
        <div className="bg-white rounded-xl shadow-lg p-2 mb-8">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-pan-sinai-gold text-pan-sinai-dark-brown'
                  : 'text-pan-sinai-brown hover:text-pan-sinai-dark-brown'
              }`}
            >
              Resumen
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'catalog'
                  ? 'bg-pan-sinai-gold text-pan-sinai-dark-brown'
                  : 'text-pan-sinai-brown hover:text-pan-sinai-dark-brown'
              }`}
            >
              Catálogo
            </button>
            <button
              onClick={() => setActiveTab('stock')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'stock'
                  ? 'bg-pan-sinai-gold text-pan-sinai-dark-brown'
                  : 'text-pan-sinai-brown hover:text-pan-sinai-dark-brown'
              }`}
            >
              Gestión Stock
            </button>
          </div>
        </div>

        {/* Contenido según pestaña activa */}
        {activeTab === 'overview' && (
          <>
            {/* Resumen del inventario */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-pan-sinai-brown">Total Productos</p>
                    <p className="text-2xl font-bold text-pan-sinai-dark-brown">{products.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-pan-sinai-brown">Stock Bajo</p>
                    <p className="text-2xl font-bold text-red-600">{lowStockProducts.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-pan-sinai-brown">Pedidos Pendientes</p>
                    <p className="text-2xl font-bold text-pan-sinai-dark-brown">
                      {pendingOrders.filter(order => order.status === 'pending').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-pan-sinai-brown">Listos para Entrega</p>
                    <p className="text-2xl font-bold text-green-600">
                      {pendingOrders.filter(order => order.status === 'ready').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Stock por producto */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-pan-sinai-dark-brown">Stock por Producto</h2>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setActiveTab('stock')}
                    className="bg-pan-sinai-gold text-pan-sinai-dark-brown px-4 py-2 rounded-lg hover:bg-pan-sinai-yellow transition-colors flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Gestionar Stock</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('catalog')}
                    className="bg-pan-sinai-brown text-white px-4 py-2 rounded-lg hover:bg-pan-sinai-dark-brown transition-colors flex items-center space-x-2"
                  >
                    <Search className="w-4 h-4" />
                    <span>Ver Catálogo</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-pan-sinai-dark-brown">Producto</th>
                      <th className="text-left py-3 px-4 font-semibold text-pan-sinai-dark-brown">Código</th>
                      <th className="text-left py-3 px-4 font-semibold text-pan-sinai-dark-brown">Categoría</th>
                      <th className="text-left py-3 px-4 font-semibold text-pan-sinai-dark-brown">Stock</th>
                      <th className="text-left py-3 px-4 font-semibold text-pan-sinai-dark-brown">Mínimo</th>
                      <th className="text-left py-3 px-4 font-semibold text-pan-sinai-dark-brown">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockData.map((item) => {
                      const status = getStockStatus(item.stock, item.minStock);
                      return (
                        <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-pan-sinai-dark-brown">{item.name}</td>
                          <td className="py-3 px-4 text-pan-sinai-brown">{item.code}</td>
                          <td className="py-3 px-4 text-pan-sinai-brown">{item.category}</td>
                          <td className="py-3 px-4 font-semibold text-pan-sinai-dark-brown">{item.stock}</td>
                          <td className="py-3 px-4 text-pan-sinai-brown">{item.minStock}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockColor(status)}`}>
                              {status === 'low' ? 'Bajo' : status === 'medium' ? 'Medio' : 'Alto'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pedidos pendientes */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-pan-sinai-dark-brown">Pedidos Pendientes de Preparar</h2>
                <button className="bg-pan-sinai-brown text-white px-4 py-2 rounded-lg hover:bg-pan-sinai-dark-brown transition-colors flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>Ver Historial</span>
                </button>
              </div>

              <div className="space-y-4">
                {pendingOrders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-pan-sinai-dark-brown">{order.customer}</h3>
                        <p className="text-sm text-pan-sinai-brown">{order.products.join(', ')}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-pan-sinai-brown">{order.time}</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getOrderStatusColor(order.status)}`}>
                          {getOrderStatusText(order.status)}
                        </span>
                        {order.status === 'pending' && (
                          <button className="bg-pan-sinai-gold text-pan-sinai-dark-brown px-3 py-1 rounded-lg hover:bg-pan-sinai-yellow transition-colors text-sm">
                            Preparar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'catalog' && (
          <ProductCatalog showStock={true} showActions={false} />
        )}

        {activeTab === 'stock' && (
          <StockManagement />
        )}
      </div>
    </div>
  );
} 