'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Sale, Product, Customer, Route, User } from '@/types';
import { useSales } from './SalesContext';
import { useProducts } from './ProductContext';
import { useCustomers } from './CustomerContext';
import { useAuth } from './AuthContext';

interface SalesMetrics {
  totalSales: number;
  totalRevenue: number;
  averageSale: number;
  totalProducts: number;
  uniqueCustomers: number;
}

interface ProductMetrics {
  productId: string;
  productName: string;
  totalSold: number;
  totalRevenue: number;
  averageQuantity: number;
  stockLevel: number;
  rotationRate: number;
}

interface CustomerMetrics {
  customerId: string;
  customerName: string;
  totalPurchases: number;
  totalSpent: number;
  averageOrder: number;
  lastPurchase: Date;
  visitFrequency: number;
}

interface RouteMetrics {
  routeId: string;
  sellerId: string;
  sellerName: string;
  totalCustomers: number;
  visitedCustomers: number;
  completionRate: number;
  totalSales: number;
  totalRevenue: number;
  averageTimePerCustomer: number;
  totalRouteTime: number;
}

interface PerformanceMetrics {
  averageOrderProcessingTime: number;
  averageCustomerVisitTime: number;
  averageTravelTime: number;
  routeEfficiency: number;
  salesPerHour: number;
  customerSatisfaction: number;
}

interface ReportsContextType {
  // Métricas generales
  getSalesMetrics: (period: string, sellerId?: string) => SalesMetrics;
  getProductMetrics: (period: string) => ProductMetrics[];
  getCustomerMetrics: (period: string) => CustomerMetrics[];
  getRouteMetrics: (period: string, sellerId?: string) => RouteMetrics[];
  getPerformanceMetrics: (period: string, sellerId?: string) => PerformanceMetrics;
  
  // Reportes específicos
  getDailySalesReport: (date: Date, sellerId?: string) => any;
  getWeeklySalesReport: (startDate: Date, endDate: Date, sellerId?: string) => any;
  getMonthlySalesReport: (month: number, year: number, sellerId?: string) => any;
  
  // Análisis de inventario
  getInventoryAnalysis: () => any;
  getSlowMovingProducts: () => Product[];
  getTopSellingProducts: (limit?: number) => ProductMetrics[];
  
  // Análisis de rutas
  getRouteAnalysis: (sellerId?: string) => any;
  getMostEfficientRoutes: () => RouteMetrics[];
  
  // Exportación
  exportToPDF: (reportType: string, data: any) => void;
  exportToExcel: (reportType: string, data: any) => void;
  sendReportByEmail: (reportType: string, email: string, data: any) => void;
  
  // Datos para gráficos
  getSalesChartData: (period: string, groupBy: 'day' | 'week' | 'month') => any[];
  getProductChartData: (period: string) => any[];
  getCustomerChartData: (period: string) => any[];
  getRouteChartData: (period: string) => any[];
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

export function ReportsProvider({ children }: { children: React.ReactNode }) {
  const { getSalesHistory, getSalesBySeller } = useSales();
  const { products } = useProducts();
  const { customers, getCurrentRoute } = useCustomers();
  const { user } = useAuth();

  const [salesData, setSalesData] = useState<Sale[]>([]);

  useEffect(() => {
    // Cargar datos de ventas
    const sales = getSalesHistory();
    setSalesData(sales);
  }, [getSalesHistory]);

  // Función para filtrar ventas por período
  const filterSalesByPeriod = (sales: Sale[], period: string, sellerId?: string) => {
    let filteredSales = sellerId ? getSalesBySeller(sellerId) : sales;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (period) {
      case 'today':
        return filteredSales.filter(sale => {
          const saleDate = new Date(sale.date);
          return saleDate >= today;
        });
      case 'week':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return filteredSales.filter(sale => {
          const saleDate = new Date(sale.date);
          return saleDate >= weekAgo;
        });
      case 'month':
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        return filteredSales.filter(sale => {
          const saleDate = new Date(sale.date);
          return saleDate >= monthAgo;
        });
      case 'quarter':
        const quarterAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
        return filteredSales.filter(sale => {
          const saleDate = new Date(sale.date);
          return saleDate >= quarterAgo;
        });
      case 'year':
        const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
        return filteredSales.filter(sale => {
          const saleDate = new Date(sale.date);
          return saleDate >= yearAgo;
        });
      default:
        return filteredSales;
    }
  };

  // Métricas de ventas
  const getSalesMetrics = (period: string, sellerId?: string): SalesMetrics => {
    const filteredSales = filterSalesByPeriod(salesData, period, sellerId);
    
    const totalSales = filteredSales.length;
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0;
    const totalProducts = filteredSales.reduce((sum, sale) => 
      sum + sale.products.reduce((pSum, product) => pSum + product.quantity, 0), 0
    );
    const uniqueCustomers = new Set(filteredSales.map(sale => sale.customerId)).size;

    return {
      totalSales,
      totalRevenue,
      averageSale,
      totalProducts,
      uniqueCustomers
    };
  };

  // Métricas de productos
  const getProductMetrics = (period: string): ProductMetrics[] => {
    const filteredSales = filterSalesByPeriod(salesData, period);
    
    const productMap = new Map<string, ProductMetrics>();

    // Inicializar métricas para todos los productos
    products.forEach(product => {
      productMap.set(product.id, {
        productId: product.id,
        productName: product.name,
        totalSold: 0,
        totalRevenue: 0,
        averageQuantity: 0,
        stockLevel: product.stock,
        rotationRate: 0
      });
    });

    // Calcular métricas de ventas
    filteredSales.forEach(sale => {
      sale.products.forEach(saleProduct => {
        const existing = productMap.get(saleProduct.productId);
        if (existing) {
          existing.totalSold += saleProduct.quantity;
          existing.totalRevenue += saleProduct.subtotal;
        }
      });
    });

    // Calcular promedios y tasas de rotación
    productMap.forEach(metrics => {
      const salesCount = filteredSales.filter(sale => 
        sale.products.some(p => p.productId === metrics.productId)
      ).length;
      
      metrics.averageQuantity = salesCount > 0 ? metrics.totalSold / salesCount : 0;
      metrics.rotationRate = metrics.stockLevel > 0 ? metrics.totalSold / metrics.stockLevel : 0;
    });

    return Array.from(productMap.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);
  };

  // Métricas de clientes
  const getCustomerMetrics = (period: string): CustomerMetrics[] => {
    const filteredSales = filterSalesByPeriod(salesData, period);
    
    const customerMap = new Map<string, CustomerMetrics>();

    filteredSales.forEach(sale => {
      const existing = customerMap.get(sale.customerId);
      if (existing) {
        existing.totalPurchases += 1;
        existing.totalSpent += sale.total;
        existing.lastPurchase = new Date(Math.max(existing.lastPurchase.getTime(), sale.date.getTime()));
      } else {
        customerMap.set(sale.customerId, {
          customerId: sale.customerId,
          customerName: sale.customerName,
          totalPurchases: 1,
          totalSpent: sale.total,
          averageOrder: sale.total,
          lastPurchase: sale.date,
          visitFrequency: 1
        });
      }
    });

    // Calcular promedios y frecuencia de visitas
    customerMap.forEach(metrics => {
      metrics.averageOrder = metrics.totalSpent / metrics.totalPurchases;
      metrics.visitFrequency = metrics.totalPurchases / (period === 'month' ? 1 : period === 'week' ? 4 : 12);
    });

    return Array.from(customerMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  };

  // Métricas de rutas
  const getRouteMetrics = (period: string, sellerId?: string): RouteMetrics[] => {
    const filteredSales = filterSalesByPeriod(salesData, period, sellerId);
    
    // Simular métricas de rutas basadas en ventas
    const routeMap = new Map<string, RouteMetrics>();

    filteredSales.forEach(sale => {
      const routeKey = `${sale.sellerId}-${sale.date.toDateString()}`;
      const existing = routeMap.get(routeKey);
      
      if (existing) {
        existing.totalSales += 1;
        existing.totalRevenue += sale.total;
        existing.visitedCustomers += 1;
      } else {
        routeMap.set(routeKey, {
          routeId: routeKey,
          sellerId: sale.sellerId,
          sellerName: sale.sellerName,
          totalCustomers: 10, // Simulado
          visitedCustomers: 1,
          completionRate: 10, // Simulado
          totalSales: 1,
          totalRevenue: sale.total,
          averageTimePerCustomer: 15, // Simulado en minutos
          totalRouteTime: 150 // Simulado en minutos
        });
      }
    });

    // Calcular tasas de completitud
    routeMap.forEach(metrics => {
      metrics.completionRate = (metrics.visitedCustomers / metrics.totalCustomers) * 100;
    });

    return Array.from(routeMap.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);
  };

  // Métricas de rendimiento
  const getPerformanceMetrics = (period: string, sellerId?: string): PerformanceMetrics => {
    const filteredSales = filterSalesByPeriod(salesData, period, sellerId);
    
    // Simular métricas de rendimiento
    const totalSales = filteredSales.length;
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    
    return {
      averageOrderProcessingTime: 5.5, // Simulado en minutos
      averageCustomerVisitTime: 12.3, // Simulado en minutos
      averageTravelTime: 8.7, // Simulado en minutos
      routeEfficiency: 78.5, // Simulado en porcentaje
      salesPerHour: totalSales > 0 ? (totalSales / (period === 'day' ? 8 : period === 'week' ? 40 : 160)) : 0,
      customerSatisfaction: 4.2 // Simulado en escala 1-5
    };
  };

  // Reportes específicos
  const getDailySalesReport = (date: Date, sellerId?: string) => {
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    
    const dailySales = salesData.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= dayStart && saleDate < dayEnd && (!sellerId || sale.sellerId === sellerId);
    });

    return {
      date: date.toLocaleDateString('es-ES'),
      sales: dailySales,
      metrics: getSalesMetrics('today', sellerId),
      productMetrics: getProductMetrics('today'),
      customerMetrics: getCustomerMetrics('today')
    };
  };

  const getWeeklySalesReport = (startDate: Date, endDate: Date, sellerId?: string) => {
    const weeklySales = salesData.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= startDate && saleDate <= endDate && (!sellerId || sale.sellerId === sellerId);
    });

    return {
      period: `${startDate.toLocaleDateString('es-ES')} - ${endDate.toLocaleDateString('es-ES')}`,
      sales: weeklySales,
      metrics: getSalesMetrics('week', sellerId),
      productMetrics: getProductMetrics('week'),
      customerMetrics: getCustomerMetrics('week')
    };
  };

  const getMonthlySalesReport = (month: number, year: number, sellerId?: string) => {
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);
    
    const monthlySales = salesData.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= monthStart && saleDate <= monthEnd && (!sellerId || sale.sellerId === sellerId);
    });

    return {
      period: `${month}/${year}`,
      sales: monthlySales,
      metrics: getSalesMetrics('month', sellerId),
      productMetrics: getProductMetrics('month'),
      customerMetrics: getCustomerMetrics('month')
    };
  };

  // Análisis de inventario
  const getInventoryAnalysis = () => {
    const productMetrics = getProductMetrics('month');
    
    return {
      totalProducts: products.length,
      totalStock: products.reduce((sum, product) => sum + product.stock, 0),
      lowStockProducts: products.filter(product => product.stock < 20),
      slowMovingProducts: getSlowMovingProducts(),
      topSellingProducts: getTopSellingProducts(10),
      averageRotationRate: productMetrics.reduce((sum, metric) => sum + metric.rotationRate, 0) / productMetrics.length
    };
  };

  const getSlowMovingProducts = (): Product[] => {
    const productMetrics = getProductMetrics('month');
    const slowMoving = productMetrics
      .filter(metric => metric.rotationRate < 0.1) // Menos del 10% de rotación
      .map(metric => products.find(p => p.id === metric.productId))
      .filter(Boolean) as Product[];
    
    return slowMoving;
  };

  const getTopSellingProducts = (limit: number = 10): ProductMetrics[] => {
    return getProductMetrics('month').slice(0, limit);
  };

  // Análisis de rutas
  const getRouteAnalysis = (sellerId?: string) => {
    const routeMetrics = getRouteMetrics('week', sellerId);
    
    return {
      totalRoutes: routeMetrics.length,
      averageCompletionRate: routeMetrics.reduce((sum, route) => sum + route.completionRate, 0) / routeMetrics.length,
      mostEfficientRoutes: getMostEfficientRoutes(),
      averageRevenuePerRoute: routeMetrics.reduce((sum, route) => sum + route.totalRevenue, 0) / routeMetrics.length,
      routeMetrics
    };
  };

  const getMostEfficientRoutes = (): RouteMetrics[] => {
    return getRouteMetrics('week').sort((a, b) => b.completionRate - a.completionRate).slice(0, 5);
  };

  // Datos para gráficos
  const getSalesChartData = (period: string, groupBy: 'day' | 'week' | 'month') => {
    const filteredSales = filterSalesByPeriod(salesData, period);
    
    const groupedData = new Map<string, { date: string; sales: number; revenue: number }>();
    
    filteredSales.forEach(sale => {
      let key: string;
      const saleDate = new Date(sale.date);
      
      switch (groupBy) {
        case 'day':
          key = saleDate.toLocaleDateString('es-ES');
          break;
        case 'week':
          const weekStart = new Date(saleDate.getTime() - saleDate.getDay() * 24 * 60 * 60 * 1000);
          key = `Semana ${weekStart.toLocaleDateString('es-ES')}`;
          break;
        case 'month':
          key = `${saleDate.getMonth() + 1}/${saleDate.getFullYear()}`;
          break;
      }
      
      const existing = groupedData.get(key);
      if (existing) {
        existing.sales += 1;
        existing.revenue += sale.total;
      } else {
        groupedData.set(key, { date: key, sales: 1, revenue: sale.total });
      }
    });
    
    return Array.from(groupedData.values()).sort((a, b) => a.date.localeCompare(b.date));
  };

  const getProductChartData = (period: string) => {
    return getProductMetrics(period).slice(0, 10).map(metric => ({
      name: metric.productName,
      sales: metric.totalSold,
      revenue: metric.totalRevenue
    }));
  };

  const getCustomerChartData = (period: string) => {
    return getCustomerMetrics(period).slice(0, 10).map(metric => ({
      name: metric.customerName,
      purchases: metric.totalPurchases,
      spent: metric.totalSpent
    }));
  };

  const getRouteChartData = (period: string) => {
    return getRouteMetrics(period).slice(0, 10).map(metric => ({
      name: metric.sellerName,
      completion: metric.completionRate,
      revenue: metric.totalRevenue
    }));
  };

  // Exportación
  const exportToPDF = (reportType: string, data: any) => {
    console.log(`Exportando ${reportType} a PDF:`, data);
    // Implementación de exportación a PDF
    alert(`Reporte ${reportType} exportado a PDF`);
  };

  const exportToExcel = (reportType: string, data: any) => {
    console.log(`Exportando ${reportType} a Excel:`, data);
    // Implementación de exportación a Excel
    alert(`Reporte ${reportType} exportado a Excel`);
  };

  const sendReportByEmail = (reportType: string, email: string, data: any) => {
    console.log(`Enviando ${reportType} por email a ${email}:`, data);
    // Implementación de envío por email
    alert(`Reporte ${reportType} enviado por email a ${email}`);
  };

  return (
    <ReportsContext.Provider value={{
      getSalesMetrics,
      getProductMetrics,
      getCustomerMetrics,
      getRouteMetrics,
      getPerformanceMetrics,
      getDailySalesReport,
      getWeeklySalesReport,
      getMonthlySalesReport,
      getInventoryAnalysis,
      getSlowMovingProducts,
      getTopSellingProducts,
      getRouteAnalysis,
      getMostEfficientRoutes,
      exportToPDF,
      exportToExcel,
      sendReportByEmail,
      getSalesChartData,
      getProductChartData,
      getCustomerChartData,
      getRouteChartData,
    }}>
      {children}
    </ReportsContext.Provider>
  );
}

export function useReports() {
  const context = useContext(ReportsContext);
  if (context === undefined) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
} 