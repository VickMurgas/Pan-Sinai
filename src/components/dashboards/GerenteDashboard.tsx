'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Package, 
  BarChart3,
  LogOut,
  User,
  Calendar,
  Target,
  Activity,
  Clock,
  FileText,
  BarChart,
  AlertTriangle,
  MapPin
} from 'lucide-react';
import { DashboardStats } from '@/types';
import ExecutiveDashboard from '@/components/reports/ExecutiveDashboard';
import Logo from '@/components/ui/Logo';

export default function GerenteDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'analytics'>('overview');

  // Datos de prueba para el gerente
  const stats: DashboardStats = {
    totalSales: 45,
    totalRevenue: 8750.75,
    activeSellers: 8,
    pendingOrders: 12,
    lowStockProducts: 3
  };

  const salesData = [
    { name: 'Carlos Vanegas', sales: 12, revenue: 1850.50, performance: 95 },
    { name: 'María Vendedora', sales: 8, revenue: 1200.00, performance: 85 },
    { name: 'Juan Vendedor', sales: 15, revenue: 2200.75, performance: 98 },
  ];

  const topProducts = [
    { name: 'Pan Francés', sales: 85, revenue: 1275.00, growth: 12 },
    { name: 'Pan Dulce', sales: 62, revenue: 930.00, growth: 8 },
    { name: 'Croissant', sales: 45, revenue: 675.00, growth: 15 },
    { name: 'Pastel de Chocolate', sales: 38, revenue: 760.00, growth: 5 },
  ];

  const recentActivity = [
    { id: '1', action: 'Venta completada', details: 'Tienda El Sol - $125.50', time: '10:30', type: 'sale' },
    { id: '2', action: 'Stock bajo', details: 'Pan Dulce - 15 unidades', time: '09:45', type: 'alert' },
    { id: '3', action: 'Nuevo cliente', details: 'Tienda Los Ángeles registrada', time: '09:15', type: 'customer' },
    { id: '4', action: 'Ruta completada', details: 'Carlos Vanegas - 8 clientes', time: '08:30', type: 'route' },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sale': return <DollarSign className="w-4 h-4" />;
      case 'alert': return <AlertTriangle className="w-4 h-4" />;
      case 'customer': return <Users className="w-4 h-4" />;
      case 'route': return <MapPin className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'sale': return 'text-green-600 bg-green-50';
      case 'alert': return 'text-red-600 bg-red-50';
      case 'customer': return 'text-blue-600 bg-blue-50';
      case 'route': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
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
                <p className="text-lg font-semibold text-pan-sinai-dark-brown">Panel de Control Ejecutivo</p>
                <p className="text-sm text-pan-sinai-brown">Gerente: {user?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-pan-sinai-brown">
                {new Date().toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
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
              onClick={() => setActiveTab('reports')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'reports'
                  ? 'bg-pan-sinai-gold text-pan-sinai-dark-brown'
                  : 'text-pan-sinai-brown hover:text-pan-sinai-dark-brown'
              }`}
            >
              Reportes Ejecutivos
            </button>
          </div>
        </div>

        {activeTab === 'overview' && (
          <>
            {/* KPIs principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-pan-sinai-brown">Ventas del Día</p>
                <p className="text-2xl font-bold text-pan-sinai-dark-brown">{stats.totalSales}</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +15% vs ayer
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-pan-sinai-brown">Ingresos del Día</p>
                <p className="text-2xl font-bold text-pan-sinai-dark-brown">${stats.totalRevenue.toFixed(2)}</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12% vs ayer
                </p>
              </div>
              <div className="w-12 h-12 bg-pan-sinai-gold bg-opacity-20 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-pan-sinai-dark-brown" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-pan-sinai-brown">Vendedores Activos</p>
                <p className="text-2xl font-bold text-pan-sinai-dark-brown">{stats.activeSellers}</p>
                <p className="text-xs text-blue-600 flex items-center">
                  <Activity className="w-3 h-3 mr-1" />
                  En ruta
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-pan-sinai-brown">Pedidos Pendientes</p>
                <p className="text-2xl font-bold text-pan-sinai-dark-brown">{stats.pendingOrders}</p>
                <p className="text-xs text-yellow-600 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  En preparación
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-pan-sinai-brown">Stock Bajo</p>
                <p className="text-2xl font-bold text-red-600">{stats.lowStockProducts}</p>
                <p className="text-xs text-red-600 flex items-center">
                  <Target className="w-3 h-3 mr-1" />
                  Requiere atención
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos y análisis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Vendedores */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-pan-sinai-dark-brown">Top Vendedores</h2>
              <button className="text-pan-sinai-gold hover:text-pan-sinai-dark-brown transition-colors">
                <BarChart3 className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {salesData.map((seller, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-pan-sinai-gold rounded-full flex items-center justify-center text-sm font-bold text-pan-sinai-dark-brown">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-pan-sinai-dark-brown">{seller.name}</p>
                      <p className="text-sm text-pan-sinai-brown">{seller.sales} ventas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-pan-sinai-dark-brown">${seller.revenue.toFixed(2)}</p>
                    <p className="text-sm text-green-600">{seller.performance}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Productos Más Vendidos */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-pan-sinai-dark-brown">Productos Más Vendidos</h2>
              <button className="text-pan-sinai-gold hover:text-pan-sinai-dark-brown transition-colors">
                <BarChart3 className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-pan-sinai-yellow rounded-full flex items-center justify-center text-sm font-bold text-pan-sinai-dark-brown">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-pan-sinai-dark-brown">{product.name}</p>
                      <p className="text-sm text-pan-sinai-brown">{product.sales} unidades</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-pan-sinai-dark-brown">${product.revenue.toFixed(2)}</p>
                    <p className="text-sm text-green-600">+{product.growth}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-pan-sinai-dark-brown">Actividad Reciente</h2>
            <button className="bg-pan-sinai-brown text-white px-4 py-2 rounded-lg hover:bg-pan-sinai-dark-brown transition-colors">
              Ver Todo
            </button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={activity.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className={`w-3 h-3 rounded-full ${getActivityColor(activity.type).split(' ')[1]}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-pan-sinai-dark-brown">{activity.action}</p>
                  <p className="text-sm text-pan-sinai-brown">{activity.details}</p>
                </div>
                <span className="text-sm text-pan-sinai-brown">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
          </>
        )}

        {activeTab === 'reports' && (
          <ExecutiveDashboard />
        )}
      </div>
    </div>
  );
} 