'use client';

import React, { useState, useMemo } from 'react';
import { useCustomers } from '@/contexts/CustomerContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Play, 
  Pause,
  Users,
  Calendar,
  ArrowUp,
  ArrowDown,
  Eye
} from 'lucide-react';

export default function RouteManagement() {
  const { user } = useAuth();
  const { customers, routes, createRoute, updateRouteStatus, updateCustomerVisitStatus, getCurrentRoute } = useCustomers();
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [showRouteForm, setShowRouteForm] = useState(false);

  const currentRoute = user ? getCurrentRoute(user.id) : undefined;

  const getRouteStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRouteStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'in-progress': return 'En Progreso';
      case 'completed': return 'Completada';
      default: return 'Desconocido';
    }
  };

  const getVisitStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'visited': return 'bg-green-100 text-green-800';
      case 'skipped': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVisitStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'visited': return 'Visitado';
      case 'skipped': return 'Omitido';
      default: return 'Desconocido';
    }
  };

  const handleCreateRoute = () => {
    if (selectedCustomers.length > 0 && user) {
      createRoute(user.id, new Date(), selectedCustomers);
      setSelectedCustomers([]);
      setShowRouteForm(false);
    }
  };

  const handleStartRoute = () => {
    if (currentRoute) {
      updateRouteStatus(currentRoute.id, 'in-progress');
    }
  };

  const handleCompleteRoute = () => {
    if (currentRoute) {
      updateRouteStatus(currentRoute.id, 'completed');
    }
  };

  const handleUpdateVisitStatus = (customerId: string, status: 'pending' | 'visited' | 'skipped') => {
    if (currentRoute) {
      updateCustomerVisitStatus(currentRoute.id, customerId, status);
    }
  };

  const moveCustomerInRoute = (customerId: string, direction: 'up' | 'down') => {
    if (!currentRoute) return;

    const currentIndex = currentRoute.customers.findIndex(c => c.customerId === customerId);
    if (currentIndex === -1) return;

    const newCustomers = [...currentRoute.customers];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex >= 0 && targetIndex < newCustomers.length) {
      [newCustomers[currentIndex], newCustomers[targetIndex]] = [newCustomers[targetIndex], newCustomers[currentIndex]];
      
      // Actualizar el orden
      newCustomers.forEach((customer, index) => {
        customer.order = index + 1;
      });

      // Aquí actualizaríamos la ruta en el contexto
      // Por simplicidad, solo mostramos el cambio visual
    }
  };

  const routeProgress = currentRoute ? {
    total: currentRoute.customers.length,
    visited: currentRoute.customers.filter(c => c.status === 'visited').length,
    skipped: currentRoute.customers.filter(c => c.status === 'skipped').length,
    pending: currentRoute.customers.filter(c => c.status === 'pending').length
  } : null;

  return (
    <div className="space-y-6">
      {/* Estado actual de la ruta */}
      {currentRoute && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-pan-sinai-dark-brown">Ruta del Día</h2>
              <p className="text-pan-sinai-brown">
                {currentRoute.date.toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRouteStatusColor(currentRoute.status)}`}>
                {getRouteStatusText(currentRoute.status)}
              </span>
              {currentRoute.status === 'pending' && (
                <button
                  onClick={handleStartRoute}
                  className="bg-pan-sinai-gold text-pan-sinai-dark-brown px-4 py-2 rounded-lg hover:bg-pan-sinai-yellow transition-colors font-medium flex items-center space-x-2"
                >
                  <Play className="w-4 h-4" />
                  <span>Iniciar Ruta</span>
                </button>
              )}
              {currentRoute.status === 'in-progress' && (
                <button
                  onClick={handleCompleteRoute}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Finalizar Ruta</span>
                </button>
              )}
            </div>
          </div>

          {/* Progreso de la ruta */}
          {routeProgress && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{routeProgress.total}</p>
                <p className="text-sm text-blue-800">Total</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{routeProgress.visited}</p>
                <p className="text-sm text-green-800">Visitados</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{routeProgress.pending}</p>
                <p className="text-sm text-yellow-800">Pendientes</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{routeProgress.skipped}</p>
                <p className="text-sm text-red-800">Omitidos</p>
              </div>
            </div>
          )}

          {/* Lista de clientes en la ruta */}
          <div className="space-y-3">
            {currentRoute.customers.map((routeCustomer, index) => {
              const customer = customers.find(c => c.id === routeCustomer.customerId);
              if (!customer) return null;

              return (
                <div key={routeCustomer.customerId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-8 h-8 bg-pan-sinai-gold rounded-full flex items-center justify-center text-pan-sinai-dark-brown font-bold text-sm">
                        {routeCustomer.order}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-pan-sinai-dark-brown">{customer.businessName}</h3>
                        <p className="text-sm text-pan-sinai-brown">{customer.address}</p>
                        {routeCustomer.visitTime && (
                          <p className="text-xs text-pan-sinai-brown">
                            Visitado: {routeCustomer.visitTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVisitStatusColor(routeCustomer.status)}`}>
                        {getVisitStatusText(routeCustomer.status)}
                      </span>
                      
                      {currentRoute.status === 'in-progress' && routeCustomer.status === 'pending' && (
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleUpdateVisitStatus(routeCustomer.customerId, 'visited')}
                            className="p-1 text-green-600 hover:text-green-800 transition-colors"
                            title="Marcar como visitado"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUpdateVisitStatus(routeCustomer.customerId, 'skipped')}
                            className="p-1 text-red-600 hover:text-red-800 transition-colors"
                            title="Omitir cliente"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      
                      {currentRoute.status === 'pending' && (
                        <div className="flex space-x-1">
                          <button
                            onClick={() => moveCustomerInRoute(routeCustomer.customerId, 'up')}
                            disabled={index === 0}
                            className="p-1 text-pan-sinai-brown hover:text-pan-sinai-dark-brown transition-colors disabled:opacity-50"
                            title="Mover arriba"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => moveCustomerInRoute(routeCustomer.customerId, 'down')}
                            disabled={index === currentRoute.customers.length - 1}
                            className="p-1 text-pan-sinai-brown hover:text-pan-sinai-dark-brown transition-colors disabled:opacity-50"
                            title="Mover abajo"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      
                      <button className="p-2 text-pan-sinai-gold hover:text-pan-sinai-dark-brown transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Crear nueva ruta */}
      {!currentRoute && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-pan-sinai-dark-brown">Crear Nueva Ruta</h2>
              <p className="text-pan-sinai-brown">Selecciona los clientes para la ruta del día</p>
            </div>
            <button
              onClick={() => setShowRouteForm(!showRouteForm)}
              className="bg-pan-sinai-gold text-pan-sinai-dark-brown px-4 py-2 rounded-lg hover:bg-pan-sinai-yellow transition-colors font-medium flex items-center space-x-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Planificar Ruta</span>
            </button>
          </div>

          {showRouteForm && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customers.map((customer) => (
                  <div
                    key={customer.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedCustomers.includes(customer.id)
                        ? 'border-pan-sinai-gold bg-pan-sinai-cream'
                        : 'border-gray-200 hover:border-pan-sinai-gold'
                    }`}
                    onClick={() => {
                      if (selectedCustomers.includes(customer.id)) {
                        setSelectedCustomers(selectedCustomers.filter(id => id !== customer.id));
                      } else {
                        setSelectedCustomers([...selectedCustomers, customer.id]);
                      }
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-pan-sinai-gold rounded-full flex items-center justify-center text-pan-sinai-dark-brown font-bold text-sm">
                        {selectedCustomers.indexOf(customer.id) + 1 || '?'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-pan-sinai-dark-brown">{customer.businessName}</h3>
                        <p className="text-sm text-pan-sinai-brown">{customer.address}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedCustomers.length > 0 && (
                <div className="flex space-x-4">
                  <button
                    onClick={handleCreateRoute}
                    className="bg-pan-sinai-gold text-pan-sinai-dark-brown px-6 py-3 rounded-lg hover:bg-pan-sinai-yellow transition-colors font-medium"
                  >
                    Crear Ruta con {selectedCustomers.length} Cliente{selectedCustomers.length !== 1 ? 's' : ''}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCustomers([]);
                      setShowRouteForm(false);
                    }}
                    className="px-6 py-3 border border-gray-300 text-pan-sinai-brown rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Historial de rutas */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-pan-sinai-dark-brown mb-6">Historial de Rutas</h2>
        <div className="space-y-4">
          {routes.slice(0, 5).map((route) => (
            <div key={route.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-pan-sinai-dark-brown">
                    {route.date.toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="text-sm text-pan-sinai-brown">
                    {route.customers.length} cliente{route.customers.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRouteStatusColor(route.status)}`}>
                  {getRouteStatusText(route.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 