'use client';

import React, { useState } from 'react';
import { useSales } from '@/contexts/SalesContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Search, 
  Filter, 
  Calendar, 
  DollarSign, 
  User, 
  Building,
  MapPin,
  Eye,
  FileText
} from 'lucide-react';
import Receipt from './Receipt';

export default function SalesHistory() {
  const { user } = useAuth();
  const { getSalesHistory, getSalesBySeller } = useSales();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  // Obtener ventas según el rol del usuario
  const allSales = user?.role === 'Gerente' 
    ? getSalesHistory() 
    : getSalesBySeller(user?.id || '');

  // Filtrar ventas por período
  const filterSalesByPeriod = (sales: any[], period: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (period) {
      case 'today':
        return sales.filter(sale => {
          const saleDate = new Date(sale.date);
          return saleDate >= today;
        });
      case 'week':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return sales.filter(sale => {
          const saleDate = new Date(sale.date);
          return saleDate >= weekAgo;
        });
      case 'month':
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        return sales.filter(sale => {
          const saleDate = new Date(sale.date);
          return saleDate >= monthAgo;
        });
      default:
        return sales;
    }
  };

  // Filtrar ventas por búsqueda
  const filterSalesBySearch = (sales: any[], query: string) => {
    if (!query) return sales;
    
    return sales.filter(sale => 
      sale.customerName.toLowerCase().includes(query.toLowerCase()) ||
      sale.sellerName.toLowerCase().includes(query.toLowerCase()) ||
      sale.id.includes(query) ||
      sale.products.some((product: any) => 
        product.productName.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  const filteredSales = filterSalesBySearch(
    filterSalesByPeriod(allSales, selectedPeriod),
    searchQuery
  );

  const totalSales = filteredSales.length;
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewReceipt = (sale: any) => {
    setSelectedSale(sale);
    setShowReceipt(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-pan-sinai-dark-brown mb-6">Historial de Ventas</h2>
        
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-r from-pan-sinai-gold to-pan-sinai-yellow rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <DollarSign className="w-8 h-8 text-pan-sinai-dark-brown" />
              <div>
                <p className="text-sm text-pan-sinai-dark-brown">Total Ventas</p>
                <p className="text-2xl font-bold text-pan-sinai-dark-brown">{totalSales}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-400 to-green-500 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <DollarSign className="w-8 h-8 text-white" />
              <div>
                <p className="text-sm text-white">Ingresos Totales</p>
                <p className="text-2xl font-bold text-white">${totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <DollarSign className="w-8 h-8 text-white" />
              <div>
                <p className="text-sm text-white">Promedio por Venta</p>
                <p className="text-2xl font-bold text-white">${averageSale.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar ventas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pan-sinai-gold focus:border-transparent transition-all"
            />
          </div>
          
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pan-sinai-gold focus:border-transparent transition-all"
          >
            <option value="all">Todas las ventas</option>
            <option value="today">Hoy</option>
            <option value="week">Última semana</option>
            <option value="month">Último mes</option>
          </select>
        </div>
      </div>

      {/* Lista de ventas */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {filteredSales.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-pan-sinai-dark-brown mb-2">
              No hay ventas encontradas
            </h3>
            <p className="text-pan-sinai-brown">
              {searchQuery ? 'Intenta con otros términos de búsqueda' : 'Aún no se han registrado ventas'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-pan-sinai-gold">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-pan-sinai-dark-brown">
                    ID Venta
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-pan-sinai-dark-brown">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-pan-sinai-dark-brown">
                    Vendedor
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-pan-sinai-dark-brown">
                    Productos
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-pan-sinai-dark-brown">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-pan-sinai-dark-brown">
                    Fecha
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-pan-sinai-dark-brown">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-pan-sinai-dark-brown font-medium">
                      #{sale.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-pan-sinai-brown" />
                        <span className="text-sm text-pan-sinai-dark-brown">{sale.customerName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-pan-sinai-brown" />
                        <span className="text-sm text-pan-sinai-dark-brown">{sale.sellerName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-pan-sinai-brown">
                        {sale.products.length} producto{sale.products.length !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-pan-sinai-dark-brown">
                        ${sale.total.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-pan-sinai-brown" />
                        <span className="text-sm text-pan-sinai-brown">
                          {formatDate(sale.date)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewReceipt(sale)}
                        className="bg-pan-sinai-gold text-pan-sinai-dark-brown px-3 py-1 rounded-lg hover:bg-pan-sinai-yellow transition-colors text-sm font-medium flex items-center space-x-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Ver</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal del comprobante */}
      {showReceipt && selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <Receipt 
                sale={selectedSale}
                onPrint={() => window.print()}
                onClose={() => setShowReceipt(false)}
              />
            </div>
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowReceipt(false)}
                className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 