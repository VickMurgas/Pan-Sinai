'use client';

import React, { useState } from 'react';
import { useReports } from '@/contexts/ReportsContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProducts } from '@/contexts/ProductContext';
import { 
  Calendar, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  Clock,
  TrendingUp,
  TrendingDown,
  Download,
  Mail,
  Filter
} from 'lucide-react';

export default function SellerReport() {
  const { user } = useAuth();
  const { products } = useProducts();
  const { 
    getDailySalesReport, 
    getSalesMetrics, 
    getPerformanceMetrics,
    exportToPDF,
    exportToExcel,
    sendReportByEmail
  } = useReports();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  // Obtener reporte del día
  const dailyReport = getDailySalesReport(selectedDate, user?.id);
  const salesMetrics = getSalesMetrics(selectedPeriod, user?.id);
  const performanceMetrics = getPerformanceMetrics(selectedPeriod, user?.id);

  // Calcular métricas adicionales
  const totalProducts = dailyReport.sales.reduce((sum, sale) => 
    sum + sale.products.reduce((pSum, product) => pSum + product.quantity, 0), 0
  );

  const averageOrderValue = salesMetrics.totalSales > 0 ? salesMetrics.totalRevenue / salesMetrics.totalSales : 0;
  const moneyCollected = salesMetrics.totalRevenue;
  const moneyDeposited = moneyCollected * 0.95; // Simulado: 95% depositado

  const handleExport = (type: 'pdf' | 'excel') => {
    const reportData = {
      seller: user?.name,
      date: selectedDate.toLocaleDateString('es-ES'),
      dailyReport,
      salesMetrics,
      performanceMetrics
    };

    if (type === 'pdf') {
      exportToPDF('seller-daily-report', reportData);
    } else {
      exportToExcel('seller-daily-report', reportData);
    }
  };

  const handleEmailReport = () => {
    const email = prompt('Ingrese el email para enviar el reporte:');
    if (email) {
      const reportData = {
        seller: user?.name,
        date: selectedDate.toLocaleDateString('es-ES'),
        dailyReport,
        salesMetrics,
        performanceMetrics
      };
      sendReportByEmail('seller-daily-report', email, reportData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-pan-sinai-dark-brown">Reporte del Vendedor</h1>
            <p className="text-pan-sinai-brown">Resumen diario de actividades</p>
          </div>
          <div className="flex items-center space-x-4">
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pan-sinai-gold focus:border-transparent"
            />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pan-sinai-gold focus:border-transparent"
            >
              <option value="today">Hoy</option>
              <option value="week">Esta Semana</option>
              <option value="month">Este Mes</option>
            </select>
          </div>
        </div>

        {/* KPIs Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Ventas del día */}
          <div className="bg-gradient-to-r from-pan-sinai-gold to-pan-sinai-yellow rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-pan-sinai-dark-brown font-medium">Ventas del Día</p>
                <p className="text-2xl font-bold text-pan-sinai-dark-brown">{dailyReport.sales.length}</p>
                <p className="text-sm text-pan-sinai-dark-brown">${dailyReport.metrics.totalRevenue.toFixed(2)}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-pan-sinai-dark-brown" />
            </div>
          </div>

          {/* Productos vendidos */}
          <div className="bg-gradient-to-r from-green-400 to-green-500 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white font-medium">Productos Vendidos</p>
                <p className="text-2xl font-bold text-white">{totalProducts}</p>
                <p className="text-sm text-white">Unidades</p>
              </div>
              <Package className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Clientes visitados */}
          <div className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white font-medium">Clientes Visitados</p>
                <p className="text-2xl font-bold text-white">{dailyReport.metrics.uniqueCustomers}</p>
                <p className="text-sm text-white">Únicos</p>
              </div>
              <Users className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Dinero recaudado */}
          <div className="bg-gradient-to-r from-purple-400 to-purple-500 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white font-medium">Dinero Recaudado</p>
                <p className="text-2xl font-bold text-white">${moneyCollected.toFixed(2)}</p>
                <p className="text-sm text-white">${moneyDeposited.toFixed(2)} depositado</p>
              </div>
              <DollarSign className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Métricas de Rendimiento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tiempos y Eficiencia */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-pan-sinai-dark-brown mb-4">Métricas de Rendimiento</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-pan-sinai-brown">Tiempo promedio por venta</span>
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
              <span className="text-pan-sinai-brown">Valor promedio por orden</span>
              <span className="font-semibold text-pan-sinai-dark-brown">${averageOrderValue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Stock Restante */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-pan-sinai-dark-brown mb-4">Stock Restante</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {products.slice(0, 10).map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-pan-sinai-dark-brown">{product.name}</p>
                  <p className="text-xs text-pan-sinai-brown">{product.code}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${
                    product.stock < 20 ? 'text-red-600' :
                    product.stock < 50 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {product.stock} unidades
                  </p>
                  <div className={`w-16 h-2 rounded-full mt-1 ${
                    product.stock < 20 ? 'bg-red-200' :
                    product.stock < 50 ? 'bg-yellow-200' : 'bg-green-200'
                  }`}>
                    <div
                      className={`h-2 rounded-full ${
                        product.stock < 20 ? 'bg-red-500' :
                        product.stock < 50 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min((product.stock / 100) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detalle de Ventas */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-pan-sinai-dark-brown mb-4">Detalle de Ventas</h3>
        
        {dailyReport.sales.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-pan-sinai-brown">No hay ventas registradas para este día</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-pan-sinai-gold">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-pan-sinai-dark-brown">
                    Hora
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-pan-sinai-dark-brown">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-pan-sinai-dark-brown">
                    Productos
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-pan-sinai-dark-brown">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dailyReport.sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-pan-sinai-brown">
                      {new Date(sale.date).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm text-pan-sinai-dark-brown font-medium">
                      {sale.customerName}
                    </td>
                    <td className="px-4 py-3 text-sm text-pan-sinai-brown">
                      {sale.products.length} producto{sale.products.length !== 1 ? 's' : ''}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-pan-sinai-dark-brown">
                      ${sale.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-pan-sinai-dark-brown mb-4">Exportar Reporte</h3>
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