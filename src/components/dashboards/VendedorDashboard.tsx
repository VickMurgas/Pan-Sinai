'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomers } from '@/contexts/CustomerContext';
import { 
  ShoppingCart, 
  Users, 
  DollarSign, 
  Package, 
  MapPin, 
  Plus,
  LogOut,
  User,
  TrendingUp,
  Clock,
  Eye,
  QrCode,
  Route
} from 'lucide-react';
import { VendedorStats } from '@/types';
import StockView from '@/components/products/StockView';
import CustomerManagement from '@/components/customers/CustomerManagement';
import RouteManagement from '@/components/routes/RouteManagement';
import QRScanner from '@/components/customers/QRScanner';
import SalesHistory from '@/components/sales/SalesHistory';
import SellerReport from '@/components/reports/SellerReport';
import RouteClosure from '@/components/reconciliation/RouteClosure';
import BankDeposit from '@/components/reconciliation/BankDeposit';
import Reconciliation from '@/components/reconciliation/Reconciliation';
import ConnectionStatus from '@/components/ui/ConnectionStatus';
import NotificationCenter from '@/components/ui/NotificationCenter';
import SessionWarning from '@/components/ui/SessionWarning';
import AdvancedSettings from '@/components/settings/AdvancedSettings';
import UltraFastOrder from '@/components/ultra-fast/UltraFastOrder';
import QRGenerator from '@/components/ultra-fast/QRGenerator';
import Logo from '@/components/ui/Logo';
import GestionDevoluciones from '@/components/sales/GestionDevoluciones';
import ProductoRapido from '@/components/sales/ProductoRapido';
import VentaRapidaIntegrada from '@/components/sales/VentaRapidaIntegrada';

export default function VendedorDashboard() {
  const { user, logout } = useAuth();
  const { getCurrentRoute } = useCustomers();
  const [routeStatus, setRouteStatus] = useState<'available' | 'en-ruta' | 'finalizando'>('available');
  const [showStock, setShowStock] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'customers' | 'routes' | 'qr' | 'history' | 'reports' | 'closure' | 'deposit' | 'reconciliation' | 'settings' | 'ultra-fast' | 'qr-generator' | 'devoluciones' | 'producto-rapido' | 'venta-rapida-integrada'>('dashboard');
  const [showQRScanner, setShowQRScanner] = useState(false);

  // Datos de prueba para el vendedor
  const stats: VendedorStats = {
    salesToday: 8,
    revenueToday: 1250.50,
    customersVisited: 12,
    routeStatus: routeStatus,
    pendingCustomers: 5
  };

  const currentRoute = user ? getCurrentRoute(user.id) : undefined;
  const pendingCustomers = currentRoute?.customers.filter(c => c.status === 'pending').map(c => ({
    id: c.customerId,
    name: c.customerName,
    address: 'Dirección del cliente',
    time: '09:00'
  })) || [
            { id: '1', name: 'Tienda El Sol', address: 'Calle Principal #123', time: '09:00' },
    { id: '2', name: 'Tienda La Esperanza', address: 'Av. Central #456', time: '10:30' },
    { id: '3', name: 'Mini Super San José', address: 'Col. San José #789', time: '11:45' },
    { id: '4', name: 'Abarrotes María', address: 'Calle 5 #321', time: '14:00' },
    { id: '5', name: 'Tienda El Progreso', address: 'Av. Libertad #654', time: '15:30' },
  ];

  const handleStartRoute = () => {
    setRouteStatus('en-ruta');
  };

  const handleFinishDay = () => {
    setRouteStatus('finalizando');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'en-ruta': return 'bg-blue-100 text-blue-800';
      case 'finalizando': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'en-ruta': return 'En Ruta';
      case 'finalizando': return 'Finalizando Día';
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
                <p className="text-lg font-semibold text-pan-sinai-dark-brown">Sistema de Gestión de Ventas - Pan Sinaí</p>
                <p className="text-sm text-pan-sinai-brown">Vendedor: {user?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(routeStatus)}`}>
                {getStatusText(routeStatus)}
              </span>
              <NotificationCenter />
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
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-pan-sinai-gold text-pan-sinai-dark-brown'
                  : 'text-pan-sinai-brown hover:text-pan-sinai-dark-brown'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'customers'
                  ? 'bg-pan-sinai-gold text-pan-sinai-dark-brown'
                  : 'text-pan-sinai-brown hover:text-pan-sinai-dark-brown'
              }`}
            >
              Clientes
            </button>
                            <button
                  onClick={() => setActiveTab('routes')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    activeTab === 'routes'
                      ? 'bg-pan-sinai-gold text-pan-sinai-dark-brown'
                      : 'text-pan-sinai-brown hover:text-pan-sinai-dark-brown'
                  }`}
                >
                  Rutas
                </button>
                            <button
              onClick={() => setActiveTab('venta-rapida-integrada')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'venta-rapida-integrada'
                  ? 'bg-pan-sinai-gold text-pan-sinai-dark-brown'
                  : 'text-pan-sinai-brown hover:text-pan-sinai-dark-brown'
              }`}
            >
              Nueva Venta
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'history'
                  ? 'bg-pan-sinai-gold text-pan-sinai-dark-brown'
                  : 'text-pan-sinai-brown hover:text-pan-sinai-dark-brown'
              }`}
            >
              Historial
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'reports'
                  ? 'bg-pan-sinai-gold text-pan-sinai-dark-brown'
                  : 'text-pan-sinai-brown hover:text-pan-sinai-dark-brown'
              }`}
            >
              Reportes
            </button>
            <button
              onClick={() => setActiveTab('ultra-fast')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'ultra-fast'
                  ? 'bg-pan-sinai-gold text-pan-sinai-dark-brown'
                  : 'text-pan-sinai-brown hover:text-pan-sinai-dark-brown'
              }`}
            >
              Ultra Fast
            </button>
            <button
              onClick={() => setActiveTab('qr-generator')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'qr-generator'
                  ? 'bg-pan-sinai-gold text-pan-sinai-dark-brown'
                  : 'text-pan-sinai-brown hover:text-pan-sinai-dark-brown'
              }`}
            >
              Generador QR
            </button>
              </div>
            </div>

            {/* Segunda fila de pestañas */}
            <div className="bg-white rounded-xl shadow-lg p-2 mb-8">
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('closure')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    activeTab === 'closure'
                      ? 'bg-pan-sinai-gold text-pan-sinai-dark-brown'
                      : 'text-pan-sinai-brown hover:text-pan-sinai-dark-brown'
                  }`}
                >
                  Cerrar Ruta
                </button>
                <button
                  onClick={() => setActiveTab('deposit')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    activeTab === 'deposit'
                      ? 'bg-pan-sinai-gold text-pan-sinai-dark-brown'
                      : 'text-pan-sinai-brown hover:text-pan-sinai-dark-brown'
                  }`}
                >
                  Depósito
                </button>
                <button
                  onClick={() => setActiveTab('reconciliation')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    activeTab === 'reconciliation'
                      ? 'bg-pan-sinai-gold text-pan-sinai-dark-brown'
                      : 'text-pan-sinai-brown hover:text-pan-sinai-dark-brown'
                  }`}
                >
                  Conciliación
                </button>
                <button
                  onClick={() => setActiveTab('devoluciones')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    activeTab === 'devoluciones'
                      ? 'bg-pan-sinai-gold text-pan-sinai-dark-brown'
                      : 'text-pan-sinai-brown hover:text-pan-sinai-dark-brown'
                  }`}
                >
                  Devoluciones
                </button>
                <button
                  onClick={() => setActiveTab('producto-rapido')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    activeTab === 'producto-rapido'
                      ? 'bg-pan-sinai-gold text-pan-sinai-dark-brown'
                      : 'text-pan-sinai-brown hover:text-pan-sinai-dark-brown'
                  }`}
                >
                  Producto Rápido
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    activeTab === 'settings'
                      ? 'bg-pan-sinai-gold text-pan-sinai-dark-brown'
                      : 'text-pan-sinai-brown hover:text-pan-sinai-dark-brown'
                  }`}
                >
                  Configuración
                </button>
          </div>
        </div>

        {/* Contenido según pestaña activa */}
        {activeTab === 'dashboard' && (
          <>
            {/* Resumen del día */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-pan-sinai-brown">Ventas del Día</p>
                <p className="text-2xl font-bold text-pan-sinai-dark-brown">{stats.salesToday}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-pan-sinai-brown">Dinero Recaudado</p>
                <p className="text-2xl font-bold text-pan-sinai-dark-brown">${stats.revenueToday.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-pan-sinai-gold bg-opacity-20 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-pan-sinai-dark-brown" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-pan-sinai-brown">Clientes Visitados</p>
                <p className="text-2xl font-bold text-pan-sinai-dark-brown">{stats.customersVisited}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-pan-sinai-brown">Stock Disponible</p>
                <p className="text-2xl font-bold text-pan-sinai-dark-brown">85%</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <button
              onClick={() => setShowStock(!showStock)}
              className="w-full mt-3 bg-pan-sinai-gold text-pan-sinai-dark-brown py-2 px-4 rounded-lg hover:bg-pan-sinai-yellow transition-colors flex items-center justify-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>{showStock ? 'Ocultar' : 'Ver'} Stock Detallado</span>
            </button>
          </div>
        </div>

        {/* Botones de acción principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={handleStartRoute}
            disabled={routeStatus !== 'available'}
            className="bg-gradient-to-r from-pan-sinai-gold to-pan-sinai-yellow text-pan-sinai-dark-brown font-semibold py-4 px-6 rounded-xl shadow-lg hover:from-pan-sinai-yellow hover:to-pan-sinai-gold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
          >
            <MapPin className="w-6 h-6" />
            <span className="text-lg">Iniciar Ruta</span>
          </button>

          <button
            onClick={handleFinishDay}
            disabled={routeStatus === 'available'}
            className="bg-gradient-to-r from-pan-sinai-brown to-pan-sinai-dark-brown text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:from-pan-sinai-dark-brown hover:to-pan-sinai-brown transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
          >
            <Clock className="w-6 h-6" />
            <span className="text-lg">Finalizar Jornada</span>
          </button>
        </div>

        {/* Visualización de stock */}
        {showStock && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-pan-sinai-dark-brown mb-6">Stock Disponible</h2>
            <StockView />
          </div>
        )}

            {/* Lista de clientes pendientes */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-pan-sinai-dark-brown">Clientes Pendientes por Visitar</h2>
                <button className="bg-pan-sinai-gold text-pan-sinai-dark-brown px-4 py-2 rounded-lg hover:bg-pan-sinai-yellow transition-colors flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Nueva Venta</span>
                </button>
              </div>

              <div className="space-y-4">
                {pendingCustomers.map((customer) => (
                  <div key={customer.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-pan-sinai-dark-brown">{customer.name}</h3>
                        <p className="text-sm text-pan-sinai-brown">{customer.address}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-pan-sinai-brown">{customer.time}</span>
                        <button className="bg-pan-sinai-gold text-pan-sinai-dark-brown px-3 py-1 rounded-lg hover:bg-pan-sinai-yellow transition-colors text-sm">
                          Iniciar Pedido
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'customers' && (
          <CustomerManagement />
        )}

        {activeTab === 'routes' && (
          <RouteManagement />
        )}

        {activeTab === 'history' && (
          <SalesHistory />
        )}

        {activeTab === 'reports' && (
          <SellerReport />
        )}

        {activeTab === 'closure' && (
          <RouteClosure />
        )}

        {activeTab === 'deposit' && (
          <BankDeposit />
        )}

        {activeTab === 'reconciliation' && (
          <Reconciliation />
        )}

        {activeTab === 'settings' && (
          <AdvancedSettings />
        )}

        {activeTab === 'ultra-fast' && (
          <UltraFastOrder />
        )}

        {activeTab === 'qr-generator' && (
          <QRGenerator />
        )}

        {activeTab === 'devoluciones' && (
          <GestionDevoluciones />
        )}

        {activeTab === 'producto-rapido' && (
          <ProductoRapido />
        )}

        {activeTab === 'venta-rapida-integrada' && (
          <VentaRapidaIntegrada />
        )}

        {/* Scanner QR */}
        {showQRScanner && (
          <QRScanner 
            onCustomerSelect={(customer) => {
              console.log('Cliente seleccionado:', customer);
              setShowQRScanner(false);
            }}
            onClose={() => setShowQRScanner(false)}
          />
        )}
      </div>

      {/* Componentes de UI avanzados */}
      <ConnectionStatus />
      <SessionWarning />
    </div>
  );
} 