'use client';

import React, { useState } from 'react';
import { useCustomers } from '@/contexts/CustomerContext';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  QrCode, 
  MapPin, 
  Phone, 
  Mail,
  User,
  Building,
  Save,
  X
} from 'lucide-react';
import VentaRapidaIntegrada from '../sales/VentaRapidaIntegrada';

interface CustomerFormData {
  businessName: string;
  ownerName: string;
  address: string;
  phone: string;
  email: string;
  tipoCliente: 'minorista' | 'mayorista' | 'consumidor';
  limiteCredito?: number;
}

export default function CustomerManagement() {
  const { customers, addCustomer, updateCustomer, deleteCustomer, searchCustomers } = useCustomers();
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [formData, setFormData] = useState<CustomerFormData>({
    businessName: '',
    ownerName: '',
    address: '',
    phone: '',
    email: '',
    tipoCliente: 'minorista',
    limiteCredito: 0
  });
  const [showSalesProcess, setShowSalesProcess] = useState(false);
  const [selectedCustomerForSale, setSelectedCustomerForSale] = useState<any>(null);

  const filteredCustomers = searchQuery ? searchCustomers(searchQuery) : customers;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCustomer) {
      updateCustomer(editingCustomer.id, formData);
    } else {
      addCustomer(formData);
    }
    
    resetForm();
  };

  const handleEdit = (customer: any) => {
    setEditingCustomer(customer);
    setFormData({
      businessName: customer.businessName,
      ownerName: customer.ownerName,
      address: customer.address,
      phone: customer.phone,
      email: customer.email || '',
      tipoCliente: customer.tipoCliente || 'minorista',
      limiteCredito: customer.limiteCredito || 0
    });
    setShowForm(true);
  };

  const handleDelete = (customerId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      deleteCustomer(customerId);
    }
  };

  const resetForm = () => {
    setFormData({
      businessName: '',
      ownerName: '',
      address: '',
      phone: '',
      email: '',
      tipoCliente: 'minorista',
      limiteCredito: 0
    });
    setEditingCustomer(null);
    setShowForm(false);
  };

  const generateQRCode = (qrCode: string) => {
    // Simulación de generación de QR - en producción usaría una librería real
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrCode}`;
  };

  const handleStartOrder = (customer: any) => {
    setSelectedCustomerForSale(customer);
    setShowSalesProcess(true);
  };

  const handleCloseSalesProcess = () => {
    setShowSalesProcess(false);
    setSelectedCustomerForSale(null);
  };

  return (
    <div className="space-y-6">
      {/* Header con búsqueda y botón agregar */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar clientes por nombre, propietario, QR o dirección..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pan-sinai-gold focus:border-transparent transition-all"
            />
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-pan-sinai-gold text-pan-sinai-dark-brown px-6 py-3 rounded-lg hover:bg-pan-sinai-yellow transition-colors font-medium flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Agregar Cliente</span>
          </button>
        </div>

        {searchQuery && (
          <div className="mt-4 text-sm text-pan-sinai-brown">
            {filteredCustomers.length} cliente{filteredCustomers.length !== 1 ? 's' : ''} encontrado{filteredCustomers.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Formulario de cliente */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-pan-sinai-dark-brown">
              {editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}
            </h3>
            <button
              onClick={resetForm}
              className="p-2 text-pan-sinai-brown hover:text-pan-sinai-dark-brown transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-pan-sinai-dark-brown mb-2">
                  Nombre del Negocio *
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pan-sinai-gold focus:border-transparent transition-all"
                    placeholder="Ej: Tienda El Sol"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-pan-sinai-dark-brown mb-2">
                  Propietario *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    required
                    value={formData.ownerName}
                    onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pan-sinai-gold focus:border-transparent transition-all"
                    placeholder="Ej: María González"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-pan-sinai-dark-brown mb-2">
                  Dirección *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pan-sinai-gold focus:border-transparent transition-all"
                    placeholder="Ej: Calle Principal #123, San Salvador"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-pan-sinai-dark-brown mb-2">
                  Teléfono *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pan-sinai-gold focus:border-transparent transition-all"
                    placeholder="Ej: 503-2123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-pan-sinai-dark-brown mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pan-sinai-gold focus:border-transparent transition-all"
                    placeholder="Ej: cliente@negocio.com"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 bg-pan-sinai-gold text-pan-sinai-dark-brown py-3 px-6 rounded-lg hover:bg-pan-sinai-yellow transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <Save className="w-5 h-5" />
                <span>{editingCustomer ? 'Actualizar' : 'Guardar'} Cliente</span>
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 border border-gray-300 text-pan-sinai-brown rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            {/* Header del cliente */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-pan-sinai-dark-brown text-lg mb-1">
                    {customer.businessName}
                  </h3>
                  <p className="text-sm text-pan-sinai-brown flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {customer.ownerName}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(customer)}
                    className="p-2 text-pan-sinai-gold hover:text-pan-sinai-dark-brown transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(customer.id)}
                    className="p-2 text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Información de contacto */}
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 text-pan-sinai-brown mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-pan-sinai-brown">{customer.address}</p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-pan-sinai-brown flex-shrink-0" />
                  <p className="text-sm text-pan-sinai-brown">{customer.phone}</p>
                </div>
                
                {customer.email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-pan-sinai-brown flex-shrink-0" />
                    <p className="text-sm text-pan-sinai-brown">{customer.email}</p>
                  </div>
                )}
              </div>

              {/* Código QR */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-pan-sinai-dark-brown mb-1">Código QR</p>
                    <p className="text-xs text-pan-sinai-brown font-mono">{customer.qrCode}</p>
                  </div>
                  <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                    <QrCode className="w-6 h-6 text-pan-sinai-brown" />
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="px-6 pb-6">
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleStartOrder(customer)}
                  className="flex-1 bg-pan-sinai-gold text-pan-sinai-dark-brown py-2 px-4 rounded-lg hover:bg-pan-sinai-yellow transition-colors font-medium text-sm"
                >
                  Iniciar Pedido
                </button>
                <button className="p-2 text-pan-sinai-brown hover:text-pan-sinai-dark-brown transition-colors">
                  <QrCode className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mensaje cuando no hay clientes */}
      {filteredCustomers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-pan-sinai-dark-brown mb-2">
            No se encontraron clientes
          </h3>
          <p className="text-pan-sinai-brown">
            {searchQuery ? 'Intenta con otros términos de búsqueda' : 'No hay clientes registrados'}
          </p>
        </div>
      )}

      {/* Proceso de Venta */}
      {showSalesProcess && selectedCustomerForSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-pan-sinai-dark-brown">
                  Nueva Venta - {selectedCustomerForSale.businessName}
                </h2>
                <button
                  onClick={handleCloseSalesProcess}
                  className="p-2 text-pan-sinai-brown hover:text-pan-sinai-dark-brown transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
              <VentaRapidaIntegrada preSelectedCustomer={selectedCustomerForSale} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 