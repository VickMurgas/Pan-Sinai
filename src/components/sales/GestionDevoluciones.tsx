'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, RefreshCw, DollarSign, Package, AlertTriangle, CheckCircle, X, ArrowLeftRight } from 'lucide-react';
import { useSales } from '../../contexts/SalesContext';
import { Product, Sale, DevolucionIntercambio, ProductoDevuelto } from '../../types';

export default function GestionDevoluciones() {
  const {
    state,
    searchProducts,
    processDevolucion,
    validateStock
  } = useSales();

  const [tipoOperacion, setTipoOperacion] = useState<'devolucion' | 'intercambio'>('intercambio');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedReplacement, setSelectedReplacement] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [motivo, setMotivo] = useState('');
  const [ventaOriginal, setVentaOriginal] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus en el campo de búsqueda
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Búsqueda en tiempo real
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchProducts(searchQuery);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, searchProducts]);

  // Manejar selección de producto
  const handleProductSelect = (product: Product) => {
    if (!selectedProduct) {
      setSelectedProduct(product);
      setQuantity(1);
    } else if (tipoOperacion === 'intercambio') {
      setSelectedReplacement(product);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  // Manejar cambio de cantidad
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    setQuantity(newQuantity);
  };

  // Procesar devolución/intercambio
  const handleProcessOperation = async () => {
    if (!selectedProduct) {
      setMessage({ type: 'error', text: 'Debes seleccionar un producto' });
      return;
    }

    if (tipoOperacion === 'intercambio' && !selectedReplacement) {
      setMessage({ type: 'error', text: 'Debes seleccionar un producto de reemplazo' });
      return;
    }

    if (!motivo.trim()) {
      setMessage({ type: 'error', text: 'Debes especificar el motivo' });
      return;
    }

    // Validar stock del producto de reemplazo
    if (tipoOperacion === 'intercambio' && selectedReplacement) {
      const validation = validateStock(selectedReplacement.id, quantity);
      if (!validation.valid) {
        setMessage({ type: 'error', text: validation.message! });
        return;
      }
    }

    setProcessing(true);
    try {
      const productos: ProductoDevuelto[] = [{
        productId: selectedProduct.id,
        productCode: selectedProduct.code,
        productName: selectedProduct.name,
        quantity,
        precioOriginal: selectedProduct.price,
        subtotal: selectedProduct.price * quantity,
        razon: motivo.includes('vencido') ? 'vencido' : 
               motivo.includes('defectuoso') ? 'defectuoso' : 
               motivo.includes('gusto') ? 'cliente_no_gusto' : 'otro',
        productoIntercambioId: selectedReplacement?.id,
        productoIntercambioName: selectedReplacement?.name
      }];

      const devolucion: Omit<DevolucionIntercambio, 'id' | 'fecha'> = {
        tipo: tipoOperacion,
        ventaOriginalId: ventaOriginal || undefined,
        ventaOriginalNumero: ventaOriginal || undefined,
        productos,
        motivo,
        reembolso: tipoOperacion === 'devolucion' ? selectedProduct.price * quantity : 0,
        vendedorId: 'current-user', // En producción sería el usuario actual
        vendedorName: 'Vendedor Actual',
        estado: 'procesada'
      };

      const result = await processDevolucion(devolucion);
      if (result) {
        setMessage({ 
          type: 'success', 
          text: `${tipoOperacion === 'intercambio' ? 'Intercambio' : 'Devolución'} procesada exitosamente` 
        });
        resetForm();
      } else {
        setMessage({ type: 'error', text: 'Error al procesar la operación' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Error desconocido' });
    } finally {
      setProcessing(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setSelectedProduct(null);
    setSelectedReplacement(null);
    setQuantity(1);
    setMotivo('');
    setVentaOriginal('');
    setSearchQuery('');
    setSearchResults([]);
  };

  // Limpiar mensajes
  const clearMessage = () => setMessage(null);

  // Calcular diferencia de precio para intercambios
  const getPriceDifference = () => {
    if (!selectedProduct || !selectedReplacement) return 0;
    return (selectedReplacement.price - selectedProduct.price) * quantity;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Devoluciones</h1>
        <p className="text-gray-600">Procesa devoluciones e intercambios de productos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel Izquierdo - Configuración */}
        <div className="space-y-6">
          {/* Tipo de Operación */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Tipo de Operación</h2>
            <div className="space-y-3">
              <button
                onClick={() => setTipoOperacion('intercambio')}
                className={`w-full flex items-center space-x-3 p-4 rounded-lg border transition-colors ${
                  tipoOperacion === 'intercambio'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <RefreshCw className="w-6 h-6" />
                <div className="text-left">
                  <div className="font-semibold">Intercambio</div>
                  <div className="text-sm">Producto vencido/defectuoso por uno nuevo</div>
                </div>
              </button>
              
              <button
                onClick={() => setTipoOperacion('devolucion')}
                className={`w-full flex items-center space-x-3 p-4 rounded-lg border transition-colors ${
                  tipoOperacion === 'devolucion'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <DollarSign className="w-6 h-6" />
                <div className="text-left">
                  <div className="font-semibold">Devolución</div>
                  <div className="text-sm">Devolver producto y reembolsar dinero</div>
                </div>
              </button>
            </div>
          </div>

          {/* Información de Venta Original */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Venta Original (Opcional)</h3>
            <input
              type="text"
              placeholder="Número de venta (ej: V1234567890)"
              value={ventaOriginal}
              onChange={(e) => setVentaOriginal(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Motivo */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Motivo</h3>
            <select
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar motivo...</option>
              <option value="Producto vencido">Producto vencido</option>
              <option value="Producto defectuoso">Producto defectuoso</option>
              <option value="Cliente no le gustó">Cliente no le gustó</option>
              <option value="Error en pedido">Error en pedido</option>
              <option value="Otro">Otro</option>
            </select>
            {motivo === 'Otro' && (
              <input
                type="text"
                placeholder="Especificar motivo..."
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
          </div>
        </div>

        {/* Panel Derecho - Productos */}
        <div className="space-y-6">
          {/* Búsqueda de Producto */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              {!selectedProduct ? 'Buscar Producto a Devolver' : 
               tipoOperacion === 'intercambio' && !selectedReplacement ? 'Buscar Producto de Reemplazo' : 'Productos Seleccionados'}
            </h3>
            
            {!selectedProduct || (tipoOperacion === 'intercambio' && !selectedReplacement) ? (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Buscar por código o nombre..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Resultados de búsqueda */}
                {searchResults.length > 0 && (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {searchResults.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleProductSelect(product)}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-600">
                            Código: {product.code} • ${product.price.toFixed(2)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">
                            Stock: {product.stock}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Producto a devolver */}
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-red-800">Producto a Devolver</h4>
                    <button
                      onClick={() => setSelectedProduct(null)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">{selectedProduct.name}</div>
                    <div className="text-gray-600">Código: {selectedProduct.code}</div>
                    <div className="text-gray-600">Precio: ${selectedProduct.price.toFixed(2)}</div>
                  </div>
                </div>

                {/* Producto de reemplazo (solo para intercambios) */}
                {tipoOperacion === 'intercambio' && selectedReplacement && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-green-800">Producto de Reemplazo</h4>
                      <button
                        onClick={() => setSelectedReplacement(null)}
                        className="text-green-400 hover:text-green-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">{selectedReplacement.name}</div>
                      <div className="text-gray-600">Código: {selectedReplacement.code}</div>
                      <div className="text-gray-600">Precio: ${selectedReplacement.price.toFixed(2)}</div>
                    </div>
                  </div>
                )}

                {/* Cantidad */}
                <div className="flex items-center space-x-4">
                  <label className="font-medium text-gray-700">Cantidad:</label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                    >
                      <Package className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Resumen de precios */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Valor producto devuelto:</span>
                      <span>${(selectedProduct.price * quantity).toFixed(2)}</span>
                    </div>
                    {tipoOperacion === 'intercambio' && selectedReplacement && (
                      <>
                        <div className="flex justify-between">
                          <span>Valor producto reemplazo:</span>
                          <span>${(selectedReplacement.price * quantity).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span>Diferencia:</span>
                          <span className={getPriceDifference() >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {getPriceDifference() >= 0 ? '+' : ''}${getPriceDifference().toFixed(2)}
                          </span>
                        </div>
                      </>
                    )}
                    {tipoOperacion === 'devolucion' && (
                      <div className="flex justify-between font-semibold text-red-600">
                        <span>Reembolso:</span>
                        <span>${(selectedProduct.price * quantity).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mensajes del sistema */}
          {message && (
            <div className={`p-4 rounded-lg flex items-center space-x-2 ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
              <span>{message.text}</span>
              <button
                onClick={clearMessage}
                className="ml-auto text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          )}

          {/* Botón de Procesar */}
          {selectedProduct && (tipoOperacion === 'devolucion' || selectedReplacement) && (
            <button
              onClick={handleProcessOperation}
              disabled={processing || !motivo.trim()}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {processing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Procesando...</span>
                </div>
              ) : (
                `Procesar ${tipoOperacion === 'intercambio' ? 'Intercambio' : 'Devolución'}`
              )}
            </button>
          )}

          {/* Botón de Resetear */}
          {(selectedProduct || selectedReplacement) && (
            <button
              onClick={resetForm}
              className="w-full py-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              Limpiar Formulario
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 