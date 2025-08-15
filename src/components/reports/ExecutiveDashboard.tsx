'use client';

import React, { useState } from 'react';
import { useReports } from '@/contexts/ReportsContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  Calendar,
  BarChart3,
  PieChart,
  Map,
  Download,
  Mail,
  Filter,
  RefreshCw
} from 'lucide-react';
import SalesChart from './charts/SalesChart';
import ProductChart from './charts/ProductChart';
import CustomerChart from './charts/CustomerChart';
import RouteChart from './charts/RouteChart';

export default function ExecutiveDashboard() {
  const { user } = useAuth();
  const { 
    getSalesMetrics, 
    getPerformanceMetrics,
    getInventoryAnalysis,
    getRouteAnalysis,
    exportToPDF,
    exportToExcel,
    sendReportByEmail
  } = useReports();

  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedChart, setSelectedChart] = useState('sales');

  // Obtener métricas
  const salesMetrics = getSalesMetrics(selectedPeriod);
  const performanceMetrics = getPerformanceMetrics(selectedPeriod);
  const inventoryAnalysis = getInventoryAnalysis();
  const routeAnalysis = getRouteAnalysis();

  // Calcular cambios porcentuales (simulado)
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 100;
    return ((current - previous) / previous) * 100;
  };

  const salesChange = calculateChange(salesMetrics.totalRevenue, salesMetrics.totalRevenue * 0.9);
  const ordersChange = calculateChange(salesMetrics.totalSales, salesMetrics.totalSales * 0.95);
  const customersChange = calculateChange(salesMetrics.uniqueCustomers, salesMetrics.uniqueCustomers * 0.88);
  const efficiencyChange = calculateChange(performanceMetrics.routeEfficiency, performanceMetrics.routeEfficiency * 0.92);

  const handleExport = (type: 'pdf' | 'excel') => {
    const reportData = {
      period: selectedPeriod,
      salesMetrics,
      performanceMetrics,
      inventoryAnalysis,
      routeAnalysis
    };

    if (type === 'pdf') {
      exportToPDF('executive-dashboard', reportData);
    } else {
      exportToExcel('executive-dashboard', reportData);
    }
  };

  const handleEmailReport = () => {
    const email = prompt('Ingrese el email para enviar el reporte:');
    if (email) {
      const reportData = {
        period: selectedPeriod,
        salesMetrics,
        performanceMetrics,
        inventoryAnalysis,
        routeAnalysis
      };
      sendReportByEmail('executive-dashboard', email, reportData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-pan-sinai-dark-brown">Dashboard Ejecutivo</h1>
            <p className="text-pan-sinai-brown">Resumen ejecutivo de Pan Sinai</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pan-sinai-gold focus:border-transparent"
            >
              <option value="today">Hoy</option>
              <option value="week">Esta Semana</option>
              <option value="month">Este Mes</option>
              <option value="quarter">Este Trimestre</option>
              <option value="year">Este Año</option>
            </select>
            
            <button
              onClick={() => window.location.reload()}
              className="p-2 text-pan-sinai-brown hover:text-pan-sinai-dark-brown transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* KPIs Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Ventas Totales */}
          <div className="bg-gradient-to-r from-pan-sinai-gold to-pan-sinai-yellow rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-pan-sinai-dark-brown font-medium">Ventas Totales</p>
                <p className="text-2xl font-bold text-pan-sinai-dark-brown">
                  ${salesMetrics.totalRevenue.toFixed(2)}
                </p>
                <div className="flex items-center mt-2">
                  {salesChange >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                  )}
                  <span className={`text-sm ${salesChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(salesChange).toFixed(1)}%
                  </span>
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-pan-sinai-dark-brown" />
            </div>
          </div>

          {/* Pedidos */}
          <div className="bg-gradient-to-r from-green-400 to-green-500 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white font-medium">Total Pedidos</p>
                <p className="text-2xl font-bold text-white">{salesMetrics.totalSales}</p>
                <div className="flex items-center mt-2">
                  {ordersChange >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-200 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-200 mr-1" />
                  )}
                  <span className={`text-sm ${ordersChange >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                    {Math.abs(ordersChange).toFixed(1)}%
                  </span>
                </div>
              </div>
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Clientes Únicos */}
          <div className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white font-medium">Clientes Únicos</p>
                <p className="text-2xl font-bold text-white">{salesMetrics.uniqueCustomers}</p>
                <div className="flex items-center mt-2">
                  {customersChange >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-blue-200 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-200 mr-1" />
                  )}
                  <span className={`text-sm ${customersChange >= 0 ? 'text-blue-200' : 'text-red-200'}`}>
                    {Math.abs(customersChange).toFixed(1)}%
                  </span>
                </div>
              </div>
              <Users className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Eficiencia de Rutas */}
          <div className="bg-gradient-to-r from-purple-400 to-purple-500 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white font-medium">Eficiencia Rutas</p>
                <p className="text-2xl font-bold text-white">{performanceMetrics.routeEfficiency.toFixed(1)}%</p>
                <div className="flex items-center mt-2">
                  {efficiencyChange >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-purple-200 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-200 mr-1" />
                  )}
                  <span className={`text-sm ${efficiencyChange >= 0 ? 'text-purple-200' : 'text-red-200'}`}>
                    {Math.abs(efficiencyChange).toFixed(1)}%
                  </span>
                </div>
              </div>
              <Map className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Métricas Secundarias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rendimiento */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-pan-sinai-dark-brown mb-4">Métricas de Rendimiento</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-pan-sinai-brown">Tiempo promedio por pedido</span>
              <span className="font-semibold text-pan-sinai-dark-brown">{performanceMetrics.averageOrderProcessingTime} min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-pan-sinai-brown">Tiempo promedio por cliente</span>
              <span className="font-semibold text-pan-sinai-dark-brown">{performanceMetrics.averageCustomerVisitTime} min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-pan-sinai-brown">Tiempo promedio de viaje</span>
              <span className="font-semibold text-pan-sinai-dark-brown">{performanceMetrics.averageTravelTime} min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-pan-sinai-brown">Ventas por hora</span>
              <span className="font-semibold text-pan-sinai-dark-brown">{performanceMetrics.salesPerHour.toFixed(1)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-pan-sinai-brown">Satisfacción del cliente</span>
              <span className="font-semibold text-pan-sinai-dark-brown">{performanceMetrics.customerSatisfaction}/5</span>
            </div>
          </div>
        </div>

        {/* Inventario */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-pan-sinai-dark-brown mb-4">Análisis de Inventario</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-pan-sinai-brown">Total de productos</span>
              <span className="font-semibold text-pan-sinai-dark-brown">{inventoryAnalysis.totalProducts}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-pan-sinai-brown">Stock total</span>
              <span className="font-semibold text-pan-sinai-dark-brown">{inventoryAnalysis.totalStock}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-pan-sinai-brown">Productos con stock bajo</span>
              <span className="font-semibold text-red-600">{inventoryAnalysis.lowStockProducts.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-pan-sinai-brown">Productos de lento movimiento</span>
              <span className="font-semibold text-orange-600">{inventoryAnalysis.slowMovingProducts.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-pan-sinai-brown">Tasa de rotación promedio</span>
              <span className="font-semibold text-pan-sinai-dark-brown">{inventoryAnalysis.averageRotationRate.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-pan-sinai-dark-brown">Visualizaciones</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedChart('sales')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedChart === 'sales'
                  ? 'bg-pan-sinai-gold text-pan-sinai-dark-brown'
                  : 'text-pan-sinai-brown hover:text-pan-sinai-dark-brown'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Ventas
            </button>
            <button
              onClick={() => setSelectedChart('products')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedChart === 'products'
                  ? 'bg-pan-sinai-gold text-pan-sinai-dark-brown'
                  : 'text-pan-sinai-brown hover:text-pan-sinai-dark-brown'
              }`}
            >
              <PieChart className="w-4 h-4 inline mr-2" />
              Productos
            </button>
            <button
              onClick={() => setSelectedChart('customers')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedChart === 'customers'
                  ? 'bg-pan-sinai-gold text-pan-sinai-dark-brown'
                  : 'text-pan-sinai-brown hover:text-pan-sinai-dark-brown'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Clientes
            </button>
            <button
              onClick={() => setSelectedChart('routes')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedChart === 'routes'
                  ? 'bg-pan-sinai-gold text-pan-sinai-dark-brown'
                  : 'text-pan-sinai-brown hover:text-pan-sinai-dark-brown'
              }`}
            >
              <Map className="w-4 h-4 inline mr-2" />
              Rutas
            </button>
          </div>
        </div>

        <div className="h-96">
          {selectedChart === 'sales' && <SalesChart period={selectedPeriod} />}
          {selectedChart === 'products' && <ProductChart period={selectedPeriod} />}
          {selectedChart === 'customers' && <CustomerChart period={selectedPeriod} />}
          {selectedChart === 'routes' && <RouteChart period={selectedPeriod} />}
        </div>
      </div>

      {/* Acciones */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-pan-sinai-dark-brown mb-4">Exportar Reportes</h3>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => handleExport('pdf')}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Exportar PDF</span>
          </button>
          
          <button
            onClick={() => handleExport('excel')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Excel</span>
          </button>
          
          <button
            onClick={handleEmailReport}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
          >
            <Mail className="w-4 h-4" />
            <span>Enviar por Email</span>
          </button>
        </div>
      </div>
    </div>
  );
} 