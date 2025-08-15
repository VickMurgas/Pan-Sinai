'use client';

import React, { useState } from 'react';
import { useCustomers } from '@/contexts/CustomerContext';
import { 
  QrCode, 
  Download, 
  Printer, 
  Copy, 
  CheckCircle,
  User,
  Building2,
  Phone,
  MapPin
} from 'lucide-react';

export default function QRGenerator() {
  const { customers } = useCustomers();
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [generatedQR, setGeneratedQR] = useState<string>('');

  // Generar QR code (simulado)
  const generateQRCode = (customer: any) => {
    const qrData = {
      id: customer.id,
      businessName: customer.businessName,
      owner: customer.owner,
      phone: customer.phone,
      timestamp: new Date().toISOString()
    };
    
    // Simular generación de QR (en producción usar librería real)
    const qrString = JSON.stringify(qrData);
    const encoded = btoa(qrString);
    
    // Crear URL de QR code simulado
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrString)}`;
    
    setGeneratedQR(qrUrl);
    setSelectedCustomer(customer);
  };

  const downloadQR = () => {
    if (!generatedQR) return;
    
    const link = document.createElement('a');
    link.href = generatedQR;
    link.download = `qr-${selectedCustomer.businessName.replace(/\s+/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printQR = () => {
    if (!generatedQR) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - ${selectedCustomer.businessName}</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
              .qr-container { margin: 20px 0; }
              .customer-info { margin: 20px 0; }
              .qr-code { max-width: 200px; }
            </style>
          </head>
          <body>
            <h2>QR Code - Pan Sinai</h2>
            <div class="customer-info">
              <h3>${selectedCustomer.businessName}</h3>
              <p>${selectedCustomer.owner}</p>
              <p>${selectedCustomer.phone}</p>
              <p>ID: ${selectedCustomer.id}</p>
            </div>
            <div class="qr-container">
              <img src="${generatedQR}" alt="QR Code" class="qr-code" />
            </div>
            <p>Escanea este código para acceso rápido</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const copyCustomerInfo = () => {
    if (!selectedCustomer) return;
    
    const info = `Cliente: ${selectedCustomer.businessName}\nPropietario: ${selectedCustomer.owner}\nTeléfono: ${selectedCustomer.phone}\nID: ${selectedCustomer.id}`;
    
    navigator.clipboard.writeText(info).then(() => {
      alert('Información copiada al portapapeles');
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <QrCode className="w-8 h-8 text-pan-sinai-dark-brown" />
          <div>
            <h2 className="text-2xl font-bold text-pan-sinai-dark-brown">Generador de QR</h2>
            <p className="text-pan-sinai-brown">Genera códigos QR únicos para cada cliente</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de clientes */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-pan-sinai-dark-brown mb-4">Seleccionar Cliente</h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {customers.map((customer) => (
              <button
                key={customer.id}
                onClick={() => generateQRCode(customer)}
                className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                  selectedCustomer?.id === customer.id
                    ? 'border-pan-sinai-gold bg-pan-sinai-gold bg-opacity-10'
                    : 'border-gray-200 hover:border-pan-sinai-gold hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Building2 className="w-4 h-4 text-pan-sinai-brown" />
                      <h4 className="font-semibold text-pan-sinai-dark-brown">
                        {customer.businessName}
                      </h4>
                    </div>
                    
                    <div className="space-y-1 text-sm text-pan-sinai-brown">
                      <div className="flex items-center space-x-2">
                        <User className="w-3 h-3" />
                        <span>{customer.owner}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Phone className="w-3 h-3" />
                        <span>{customer.phone}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-3 h-3" />
                        <span>{customer.address}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-pan-sinai-dark-brown">
                      #{customer.id}
                    </div>
                    <div className="text-xs text-pan-sinai-brown">
                      ID Cliente
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Generador de QR */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-pan-sinai-dark-brown mb-4">Código QR</h3>
          
          {selectedCustomer && generatedQR ? (
            <div className="space-y-6">
              {/* Información del cliente */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-pan-sinai-dark-brown mb-2">
                  Cliente Seleccionado
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-pan-sinai-brown" />
                    <span className="font-medium">{selectedCustomer.businessName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-pan-sinai-brown" />
                    <span>{selectedCustomer.owner}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-pan-sinai-brown" />
                    <span>{selectedCustomer.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-pan-sinai-brown">ID: {selectedCustomer.id}</span>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="text-center">
                <div className="bg-white border-2 border-gray-200 rounded-lg p-4 inline-block">
                  <img 
                    src={generatedQR} 
                    alt="QR Code" 
                    className="w-48 h-48 mx-auto"
                  />
                </div>
                <p className="text-sm text-pan-sinai-brown mt-2">
                  Código QR único para {selectedCustomer.businessName}
                </p>
              </div>

              {/* Acciones */}
              <div className="space-y-3">
                <button
                  onClick={downloadQR}
                  className="w-full bg-pan-sinai-gold text-pan-sinai-dark-brown py-3 px-4 rounded-lg hover:bg-pan-sinai-yellow transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar QR</span>
                </button>
                
                <button
                  onClick={printQR}
                  className="w-full bg-pan-sinai-brown text-white py-3 px-4 rounded-lg hover:bg-pan-sinai-dark-brown transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir Etiqueta</span>
                </button>
                
                <button
                  onClick={copyCustomerInfo}
                  className="w-full bg-gray-100 text-pan-sinai-dark-brown py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copiar Información</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-pan-sinai-dark-brown mb-2">
                Selecciona un cliente
              </h4>
              <p className="text-pan-sinai-brown">
                Elige un cliente de la lista para generar su código QR único
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-pan-sinai-dark-brown mb-4">Información del QR</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-blue-800">Identificación Rápida</h4>
            </div>
            <p className="text-sm text-blue-700">
              Escanea el QR para identificar al cliente instantáneamente
            </p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <QrCode className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-green-800">Código Único</h4>
            </div>
            <p className="text-sm text-green-700">
              Cada cliente tiene su propio código QR personalizado
            </p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Download className="w-5 h-5 text-purple-600" />
              <h4 className="font-semibold text-purple-800">Fácil Impresión</h4>
            </div>
            <p className="text-sm text-purple-700">
              Descarga e imprime etiquetas para entregar a los clientes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 