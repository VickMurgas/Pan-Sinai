'use client';

import React from 'react';
import { X, Printer, Download, Share2, FileText, User, Calendar, DollarSign, Package } from 'lucide-react';

interface ReceiptProps {
  sale: {
    id: string;
    numero?: string;
    customerName?: string;
    sellerName: string;
    date: Date;
    total: number;
    products?: Array<{
      productId: string;
      productCode: string;
      productName: string;
      quantity: number;
      price: number;
      subtotal: number;
      stockDisponible: number;
    }>;
    metodoPago?: string;
    status: string;
  };
  onClose: () => void;
}

export default function Receipt({ sale, onClose }: ReceiptProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PA', {
      style: 'currency',
      currency: 'PAB'
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Simular descarga del recibo
    const receiptContent = `
      RECIBO DE VENTA
      ================
      ID: ${sale.id}
      Cliente: ${sale.customerName}
      Vendedor: ${sale.sellerName}
      Fecha: ${formatDate(sale.date)}
      Método de Pago: ${sale.metodoPago}
      
      PRODUCTOS:
      ${sale.products?.map(product => 
        `${product.productCode} ${product.productName}: ${product.quantity} unidades x ${formatCurrency(product.price)} cada una, total ${formatCurrency(product.subtotal)}`
      ).join('\n') || 'Sin productos detallados'}
      
      TOTAL: ${formatCurrency(sale.total)}
    `;
    
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recibo-${sale.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Recibo de Venta ${sale.id}`,
          text: `Recibo de venta por ${formatCurrency(sale.total)}`,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error compartiendo:', error);
      }
    } else {
      // Fallback: copiar al portapapeles
      const receiptText = `Recibo ${sale.id} - ${formatCurrency(sale.total)}`;
      await navigator.clipboard.writeText(receiptText);
      alert('Información del recibo copiada al portapapeles');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-pan-sinai-gold" />
            <h2 className="text-xl font-bold text-pan-sinai-dark-brown">
              Recibo de Venta
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Contenido del recibo */}
        <div className="p-6 space-y-6">
          {/* Información de la venta */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">ID de Venta:</span>
              <span className="font-semibold text-pan-sinai-dark-brown">{sale.id}</span>
            </div>
            
            {sale.numero && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Número:</span>
                <span className="font-semibold text-pan-sinai-dark-brown">{sale.numero}</span>
              </div>
            )}
            
            {sale.customerName && (
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-500" />
                <div className="flex-1">
                  <span className="text-sm text-gray-600">Cliente:</span>
                  <span className="ml-2 font-semibold text-pan-sinai-dark-brown">
                    {sale.customerName}
                  </span>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-500" />
              <div className="flex-1">
                <span className="text-sm text-gray-600">Vendedor:</span>
                <span className="ml-2 font-semibold text-pan-sinai-dark-brown">
                  {sale.sellerName}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div className="flex-1">
                <span className="text-sm text-gray-600">Fecha:</span>
                <span className="ml-2 font-semibold text-pan-sinai-dark-brown">
                  {formatDate(sale.date)}
                </span>
              </div>
            </div>
            
            {sale.metodoPago && (
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <div className="flex-1">
                  <span className="text-sm text-gray-600">Método de Pago:</span>
                  <span className="ml-2 font-semibold text-pan-sinai-dark-brown">
                    {sale.metodoPago}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Lista de productos */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-gray-500" />
              <h3 className="font-semibold text-pan-sinai-dark-brown">Productos</h3>
            </div>
            
            <div className="space-y-2">
              {sale.products?.map((product, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div className="flex-1">
                    <div className="font-medium text-pan-sinai-dark-brown">
                      {product.productCode} {product.productName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {product.quantity} unidades x {formatCurrency(product.price)} cada una
                    </div>
                  </div>
                  <div className="font-semibold text-pan-sinai-dark-brown">
                    {formatCurrency(product.subtotal)}
                  </div>
                </div>
              )) || (
                <div className="text-center py-4 text-gray-500">
                  <p>Sin detalles de productos</p>
                </div>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-pan-sinai-dark-brown">Total:</span>
              <span className="text-xl font-bold text-pan-sinai-gold">
                {formatCurrency(sale.total)}
              </span>
            </div>
          </div>

          {/* Estado de la venta */}
          <div className="flex items-center justify-center">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              sale.status === 'completed' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {sale.status === 'completed' ? 'Completada' : 'En Proceso'}
            </span>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center space-x-2 bg-pan-sinai-gold text-pan-sinai-dark-brown py-2 px-4 rounded-lg hover:bg-pan-sinai-gold/90 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span className="text-sm font-medium">Imprimir</span>
          </button>
          
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center space-x-2 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Descargar</span>
          </button>
          
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span className="text-sm font-medium">Compartir</span>
          </button>
        </div>
      </div>
    </div>
  );
} 