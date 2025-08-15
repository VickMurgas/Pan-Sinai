'use client';

import React, { useState } from 'react';
import { QrCode, Copy, Download, CreditCard, Banknote, Smartphone } from 'lucide-react';

interface PaymentQRProps {
  total: number;
  saleId: string;
  customerName: string;
  onPaymentComplete: () => void;
}

export default function PaymentQR({ total, saleId, customerName, onPaymentComplete }: PaymentQRProps) {
  const [selectedMethod, setSelectedMethod] = useState<'cash' | 'qr'>('cash');
  const [paymentLink, setPaymentLink] = useState('');

  // Generar enlace de pago (simulado)
  const generatePaymentLink = () => {
    const baseUrl = 'https://pansinai.com/pay';
    const params = new URLSearchParams({
      saleId,
      amount: total.toString(),
      customer: customerName,
      timestamp: Date.now().toString()
    });
    return `${baseUrl}?${params.toString()}`;
  };

  const handleGenerateQR = () => {
    const link = generatePaymentLink();
    setPaymentLink(link);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(paymentLink);
      alert('Enlace copiado al portapapeles');
    } catch (error) {
      console.error('Error copiando enlace:', error);
    }
  };

  const handleCashPayment = () => {
    // Simular procesamiento de pago en efectivo
    setTimeout(() => {
      onPaymentComplete();
    }, 1000);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-pan-sinai-dark-brown mb-6">
        Método de Pago
      </h2>

      {/* Selector de método de pago */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setSelectedMethod('cash')}
          className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
            selectedMethod === 'cash'
              ? 'bg-pan-sinai-gold text-pan-sinai-dark-brown'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Banknote className="w-5 h-5" />
          <span>Efectivo</span>
        </button>
        
        <button
          onClick={() => setSelectedMethod('qr')}
          className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
            selectedMethod === 'qr'
              ? 'bg-pan-sinai-gold text-pan-sinai-dark-brown'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <QrCode className="w-5 h-5" />
          <span>Pago Digital</span>
        </button>
      </div>

      {/* Pago en Efectivo */}
      {selectedMethod === 'cash' && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Banknote className="w-6 h-6 text-green-600" />
              <h3 className="font-semibold text-green-800">Pago en Efectivo</h3>
            </div>
            <p className="text-green-700 text-sm">
              Total a cobrar: <span className="font-bold">${total.toFixed(2)}</span>
            </p>
          </div>
          
          <button
            onClick={handleCashPayment}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            Confirmar Pago en Efectivo
          </button>
        </div>
      )}

      {/* Pago Digital con QR */}
      {selectedMethod === 'qr' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Smartphone className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold text-blue-800">Pago Digital</h3>
            </div>
            <p className="text-blue-700 text-sm">
              Escanea el código QR o comparte el enlace para realizar el pago
            </p>
          </div>

          {!paymentLink ? (
            <button
              onClick={handleGenerateQR}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center space-x-2"
            >
              <QrCode className="w-5 h-5" />
              <span>Generar Código QR de Pago</span>
            </button>
          ) : (
            <div className="space-y-4">
              {/* QR Code Placeholder */}
              <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-48 h-48 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center mb-4">
                    <QrCode className="w-24 h-24 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600">Código QR generado</p>
                  <p className="text-xs text-gray-500">Escanea con tu teléfono</p>
                </div>
              </div>

              {/* Enlace de pago */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-pan-sinai-dark-brown">
                  Enlace de Pago:
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={paymentLink}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-1"
                  >
                    <Copy className="w-4 h-4" />
                    <span className="text-sm">Copiar</span>
                  </button>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex space-x-3">
                <button
                  onClick={() => window.open(paymentLink, '_blank')}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center space-x-1"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Abrir Pago</span>
                </button>
                
                <button
                  onClick={handleCashPayment}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  Confirmar Pago
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-pan-sinai-dark-brown mb-2">
          Información de la Venta
        </h4>
        <div className="space-y-1 text-sm text-pan-sinai-brown">
          <p><strong>ID de Venta:</strong> {saleId}</p>
          <p><strong>Cliente:</strong> {customerName}</p>
          <p><strong>Total:</strong> ${total.toFixed(2)}</p>
          <p><strong>Fecha:</strong> {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
} 