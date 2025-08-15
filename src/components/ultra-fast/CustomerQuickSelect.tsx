'use client';

import React, { useState, useEffect } from 'react';
import { Search, Clock, Star, MapPin, Phone, TrendingUp } from 'lucide-react';

interface CustomerQuickSelectProps {
  customers: any[];
  onSelect: (customer: any) => void;
  searchQuery: string;
}

export default function CustomerQuickSelect({ customers, onSelect, searchQuery }: CustomerQuickSelectProps) {
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
  const [recentCustomers, setRecentCustomers] = useState<any[]>([]);
  const [frequentCustomers, setFrequentCustomers] = useState<any[]>([]);

  // Filtrar clientes basado en búsqueda
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCustomers([]);
      return;
    }

    const filtered = customers.filter(customer =>
      customer.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.id.toString().includes(searchQuery) ||
      customer.phone.includes(searchQuery)
    );

    setFilteredCustomers(filtered.slice(0, 10)); // Limitar a 10 resultados
  }, [customers, searchQuery]);

  // Cargar clientes recientes y frecuentes
  useEffect(() => {
    // Simular clientes recientes (últimos 5)
    setRecentCustomers(customers.slice(0, 5));
    
    // Simular clientes frecuentes (top 5 por compras)
    setFrequentCustomers(customers.slice(0, 5));
  }, [customers]);

  const formatLastPurchase = (customer: any) => {
    // Simular última compra
    const days = Math.floor(Math.random() * 7) + 1;
    const amount = (Math.random() * 100 + 20).toFixed(2);
    
    if (days === 1) return `Ayer - $${amount}`;
    if (days < 7) return `Hace ${days} días - $${amount}`;
    return `Hace ${days} días - $${amount}`;
  };

  const getCustomerStatus = (customer: any) => {
    // Simular estado del cliente
    const statuses = ['activo', 'nuevo', 'frecuente'];
    const random = Math.random();
    
    if (random > 0.8) return { type: 'nuevo', color: 'bg-blue-100 text-blue-800' };
    if (random > 0.5) return { type: 'frecuente', color: 'bg-green-100 text-green-800' };
    return { type: 'activo', color: 'bg-gray-100 text-gray-800' };
  };

  const CustomerCard = ({ customer, showDetails = true }: { customer: any; showDetails?: boolean }) => {
    const status = getCustomerStatus(customer);
    
    return (
      <button
        onClick={() => onSelect(customer)}
        className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200 hover:border-pan-sinai-gold"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 text-left">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-pan-sinai-dark-brown text-lg">
                {customer.businessName}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                {status.type}
              </span>
            </div>
            
            <p className="text-pan-sinai-brown text-sm mb-2">
              {customer.owner}
            </p>
            
            {showDetails && (
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-xs text-pan-sinai-brown">
                  <Phone className="w-3 h-3" />
                  <span>{customer.phone}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-xs text-pan-sinai-brown">
                  <MapPin className="w-3 h-3" />
                  <span>{customer.address}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-xs text-pan-sinai-brown">
                  <Clock className="w-3 h-3" />
                  <span>{formatLastPurchase(customer)}</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-pan-sinai-dark-brown">
              #{customer.id}
            </div>
            {showDetails && (
              <div className="text-xs text-pan-sinai-brown">
                ID Cliente
              </div>
            )}
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* Resultados de búsqueda */}
      {searchQuery && filteredCustomers.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-pan-sinai-dark-brown mb-3 flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Resultados de búsqueda ({filteredCustomers.length})
          </h3>
          <div className="space-y-3">
            {filteredCustomers.map((customer) => (
              <CustomerCard key={customer.id} customer={customer} />
            ))}
          </div>
        </div>
      )}

      {/* Clientes Recientes */}
      {!searchQuery && recentCustomers.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-pan-sinai-dark-brown mb-3 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Clientes Recientes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentCustomers.map((customer) => (
              <CustomerCard key={customer.id} customer={customer} />
            ))}
          </div>
        </div>
      )}

      {/* Clientes Frecuentes */}
      {!searchQuery && frequentCustomers.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-pan-sinai-dark-brown mb-3 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Clientes Frecuentes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {frequentCustomers.map((customer) => (
              <CustomerCard key={customer.id} customer={customer} />
            ))}
          </div>
        </div>
      )}

      {/* Sin resultados */}
      {searchQuery && filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-pan-sinai-dark-brown mb-2">
            No se encontraron clientes
          </h3>
          <p className="text-pan-sinai-brown">
            Intenta con otro nombre, negocio o ID de cliente
          </p>
        </div>
      )}

      {/* Búsqueda vacía */}
      {!searchQuery && recentCustomers.length === 0 && (
        <div className="text-center py-12">
          <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-pan-sinai-dark-brown mb-2">
            Busca un cliente para comenzar
          </h3>
          <p className="text-pan-sinai-brown">
            Escribe el nombre del negocio, propietario o ID del cliente
          </p>
        </div>
      )}
    </div>
  );
} 