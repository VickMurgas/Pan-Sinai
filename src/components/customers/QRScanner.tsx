'use client';

import React, { useState } from 'react';
import { useCustomers } from '@/contexts/CustomerContext';
import { 
  QrCode, 
  Search, 
  X, 
  CheckCircle, 
  MapPin, 
  Phone, 
  Mail,
  User,
  Building,
  ShoppingCart
} from 'lucide-react';

interface QRScannerProps {
  onCustomerSelect?: (customer: any) => void;
  onClose?: () => void;
}

export default function QRScanner({ onCustomerSelect, onClose }: QRScannerProps) {
  const { getCustomerByQR, searchCustomers } = useCustomers();
  const [scanMode, setScanMode] = useState<'qr' | 'manual'>('qr');
  const [qrInput, setQrInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [scannedCustomer, setScannedCustomer] = useState<any>(null);

  const handleQRScan = () => {
    if (!qrInput.trim()) return;
    
    const customer = getCustomerByQR(qrInput.trim());
    if (customer) {
      setScannedCustomer(customer);
    } else {
      alert('Código QR no encontrado. Verifica el código e intenta nuevamente.');
    }
  };

  const handleManualSearch = () => {
    if (!searchQuery.trim()) return;
    
    const results = searchCustomers(searchQuery);
    if (results.length > 0) {
      setScannedCustomer(results[0]);
    } else {
      alert('Cliente no encontrado. Verifica la información e intenta nuevamente.');
    }
  };

  const handleCustomerSelect = (customer: any) => {
    if (onCustomerSelect) {
      onCustomerSelect(customer);
    }
    if (onClose) {
      onClose();
    }
  };

  const resetScanner = () => {
    setQrInput('');
    setSearchQuery('');
    setScannedCustomer(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-pan-sinai-dark-brown">Identificar Cliente</h2>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-pan-sinai-brown hover:text-pan-sinai-dark-brown transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {!scannedCustomer ? (
            <>
              {/* Selector de modo */}
              <div className="flex space-x-2 mb-6">
                <button
                  onClick={() => setScanMode('qr')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    scanMode === 'qr'
                      ? 'bg-pan-sinai-gold text-pan-sinai-dark-brown'
                      : 'bg-gray-100 text-pan-sinai-brown hover:text-pan-sinai-dark-brown'
                  }`}
                >
                  <QrCode className="w-4 h-4 inline mr-2" />
                  Escanear QR
                </button>
                <button
                  onClick={() => setScanMode('manual')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    scanMode === 'manual'
                      ? 'bg-pan-sinai-gold text-pan-sinai-dark-brown'
                      : 'bg-gray-100 text-pan-sinai-brown hover:text-pan-sinai-dark-brown'
                  }`}
                >
                  <Search className="w-4 h-4 inline mr-2" />
                  Búsqueda Manual
                </button>
              </div>

              {/* Modo QR */}
              {scanMode === 'qr' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <QrCode className="w-16 h-16 text-gray-400" />
                    </div>
                    <p className="text-sm text-pan-sinai-brown mb-4">
                      Escanea el código QR del cliente o ingresa el código manualmente
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-pan-sinai-dark-brown mb-2">
                      Código QR
                    </label>
                    <input
                      type="text"
                      value={qrInput}
                      onChange={(e) => setQrInput(e.target.value)}
                      placeholder="Ej: PS-ABC123DEF"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pan-sinai-gold focus:border-transparent transition-all"
                    />
                  </div>

                  <button
                    onClick={handleQRScan}
                    disabled={!qrInput.trim()}
                    className="w-full bg-pan-sinai-gold text-pan-sinai-dark-brown py-3 px-6 rounded-lg hover:bg-pan-sinai-yellow transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Buscar Cliente
                  </button>
                </div>
              )}

              {/* Modo búsqueda manual */}
              {scanMode === 'manual' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-pan-sinai-dark-brown mb-2">
                      Buscar por nombre, propietario o dirección
                    </label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Ej: Tienda El Sol"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pan-sinai-gold focus:border-transparent transition-all"
                    />
                  </div>

                  <button
                    onClick={handleManualSearch}
                    disabled={!searchQuery.trim()}
                    className="w-full bg-pan-sinai-gold text-pan-sinai-dark-brown py-3 px-6 rounded-lg hover:bg-pan-sinai-yellow transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Buscar Cliente
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Cliente encontrado */
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-pan-sinai-dark-brown mb-2">
                  Cliente Encontrado
                </h3>
                <p className="text-sm text-pan-sinai-brown">
                  Código QR: {scannedCustomer.qrCode}
                </p>
              </div>

              {/* Información del cliente */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <Building className="w-5 h-5 text-pan-sinai-brown" />
                  <div>
                    <p className="font-semibold text-pan-sinai-dark-brown">{scannedCustomer.businessName}</p>
                    <p className="text-sm text-pan-sinai-brown">Negocio</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-pan-sinai-brown" />
                  <div>
                    <p className="font-semibold text-pan-sinai-dark-brown">{scannedCustomer.ownerName}</p>
                    <p className="text-sm text-pan-sinai-brown">Propietario</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-pan-sinai-brown mt-0.5" />
                  <div>
                    <p className="font-semibold text-pan-sinai-dark-brown">{scannedCustomer.address}</p>
                    <p className="text-sm text-pan-sinai-brown">Dirección</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-pan-sinai-brown" />
                  <div>
                    <p className="font-semibold text-pan-sinai-dark-brown">{scannedCustomer.phone}</p>
                    <p className="text-sm text-pan-sinai-brown">Teléfono</p>
                  </div>
                </div>

                {scannedCustomer.email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-pan-sinai-brown" />
                    <div>
                      <p className="font-semibold text-pan-sinai-dark-brown">{scannedCustomer.email}</p>
                      <p className="text-sm text-pan-sinai-brown">Email</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Acciones */}
              <div className="flex space-x-3">
                <button
                  onClick={() => handleCustomerSelect(scannedCustomer)}
                  className="flex-1 bg-pan-sinai-gold text-pan-sinai-dark-brown py-3 px-6 rounded-lg hover:bg-pan-sinai-yellow transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Iniciar Pedido</span>
                </button>
                <button
                  onClick={resetScanner}
                  className="px-6 py-3 border border-gray-300 text-pan-sinai-brown rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Escanear Otro
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 