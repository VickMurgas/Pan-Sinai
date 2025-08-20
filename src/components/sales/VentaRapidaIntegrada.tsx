'use client';

import React, { useState, useEffect } from 'react';
import { useSales } from '@/contexts/SalesContext';
import { useCustomers } from '@/contexts/CustomerContext';
import PaymentQR from './PaymentQR';
import Receipt from './Receipt';
import {
  Search,
  ShoppingCart,
  User,
  Package,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  X,
  Plus,
  Minus,
  CreditCard,
  Banknote,
  RefreshCw
} from 'lucide-react';
import { ReturnCartItem } from '@/types';

// Catálogo de productos del furgón (stock disponible en la unidad de ventas)
const PRODUCTOS_FURGON = [
  // Serie B - Productos de Panadería
  { id: 'B01', name: 'Muffin de Naranja 54gr', price: 0.75, category: 'B', stock: 25, stockFurgon: 15 },
  { id: 'B02', name: 'Torta de Fruta 58gr', price: 0.80, category: 'B', stock: 45, stockFurgon: 20 },
  { id: 'B03', name: 'Poleadita 54gr', price: 0.70, category: 'B', stock: 60, stockFurgon: 30 },
  { id: 'B04', name: 'Quesadilla 46gr Charola', price: 0.65, category: 'B', stock: 40, stockFurgon: 18 },
  { id: 'B05', name: 'Magdalena de Vainilla 225gr', price: 1.20, category: 'B', stock: 30, stockFurgon: 12 },
  { id: 'B06', name: 'Marquezote 58gr', price: 0.85, category: 'B', stock: 35, stockFurgon: 15 },
  { id: 'B11', name: 'Blister de Quesadilla Sinai 9 Unid. 288gr', price: 5.50, category: 'B', stock: 20, stockFurgon: 8 },
  { id: 'B17', name: 'Quesadilla Familiar 224gr', price: 3.20, category: 'B', stock: 25, stockFurgon: 10 },
  { id: 'B19', name: 'Quesadilla Cuadrada 30gr', price: 0.45, category: 'B', stock: 80, stockFurgon: 35 },
  { id: 'B21', name: 'Magdalena Marmoleada 225gr', price: 1.25, category: 'B', stock: 28, stockFurgon: 12 },
  { id: 'B25', name: 'Margarita Pack 8 Und. 256gr', price: 4.80, category: 'B', stock: 15, stockFurgon: 6 },
  { id: 'B26', name: 'Muffin de Naranja Pack 6 Und. 324gr', price: 4.20, category: 'B', stock: 18, stockFurgon: 8 },
  { id: 'B27', name: 'Quesadilla Pack 6 Und. 276gr', price: 3.90, category: 'B', stock: 22, stockFurgon: 10 },
  { id: 'B28', name: 'Marquezote Pack 6 Und. 348gr', price: 4.50, category: 'B', stock: 16, stockFurgon: 7 },
  { id: 'B29', name: 'Alemana Pack 6 Und. 276gr', price: 4.10, category: 'B', stock: 19, stockFurgon: 8 },
  { id: 'B30', name: 'Magdalena de Naranja 225gr', price: 1.30, category: 'B', stock: 25, stockFurgon: 12 },
  { id: 'B31', name: 'Blister de Quesadilla Sinai 12 Unid. 528gr', price: 7.20, category: 'B', stock: 12, stockFurgon: 5 },
  { id: 'B32', name: 'Muffin Banano Canela', price: 0.90, category: 'B', stock: 40, stockFurgon: 20 },

  // Serie G - Galletas
  { id: 'G01', name: 'Margarita 32gr', price: 0.50, category: 'G', stock: 100, stockFurgon: 50 },
  { id: 'G02', name: 'Pastelito de Piña 40gr', price: 0.60, category: 'G', stock: 85, stockFurgon: 40 },
  { id: 'G03', name: 'Hoja', price: 0.55, category: 'G', stock: 90, stockFurgon: 45 },
  { id: 'G04', name: 'Pichardin', price: 0.65, category: 'G', stock: 75, stockFurgon: 35 },
  { id: 'G05', name: 'Margarita Paquete de 8 Und.', price: 3.80, category: 'G', stock: 20, stockFurgon: 10 },

  // Serie H - Pastelería
  { id: 'H01', name: 'Oreja 30gr', price: 0.70, category: 'H', stock: 60, stockFurgon: 25 },
  { id: 'H03', name: 'Pañuelo Doble', price: 1.10, category: 'H', stock: 35, stockFurgon: 15 },

  // Serie L - Panes
  { id: 'L01', name: 'Concha 48gr', price: 0.80, category: 'L', stock: 70, stockFurgon: 30 },
  { id: 'L02', name: 'Torta de Yema 700gr', price: 4.50, category: 'L', stock: 15, stockFurgon: 6 },
  { id: 'L03', name: 'Semita Alta', price: 1.20, category: 'L', stock: 40, stockFurgon: 18 },
  { id: 'L04', name: 'Torta de Yema 380gr', price: 2.80, category: 'L', stock: 25, stockFurgon: 10 },
  { id: 'L05', name: 'Semita Pacha 67gr', price: 0.95, category: 'L', stock: 55, stockFurgon: 25 },
  { id: 'L06', name: 'Pan Sandwich Blanco Sinai 600gr', price: 3.50, category: 'L', stock: 20, stockFurgon: 8 },
  { id: 'L07', name: 'Pan Sandwich Integral Sinai 600gr', price: 3.80, category: 'L', stock: 18, stockFurgon: 7 },
  { id: 'L09', name: 'Semita Pacha Familiar', price: 2.20, category: 'L', stock: 30, stockFurgon: 12 },
  { id: 'L13', name: 'Pan Sandwich Blanco Sinai 540gr', price: 3.20, category: 'L', stock: 22, stockFurgon: 9 },
  { id: 'L14', name: 'Pan Tostado Mantequilla 25gr', price: 0.40, category: 'L', stock: 120, stockFurgon: 60 }
];

interface VentaRapidaIntegradaProps {
  preSelectedCustomer?: any;
}

export default function VentaRapidaIntegrada({ preSelectedCustomer }: VentaRapidaIntegradaProps) {
  const { addToCart, state, setCustomer, processSale } = useSales();
  const { customers, searchCustomers } = useCustomers();

  const [step, setStep] = useState<'cliente' | 'venta-rapida' | 'devoluciones' | 'pago'>('cliente');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(preSelectedCustomer);
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [showCart, setShowCart] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Devoluciones/Intercambios locales para "Nueva Venta"
  const [returnsEnabled, setReturnsEnabled] = useState<boolean>(false);
  const [returnItems, setReturnItems] = useState<ReturnCartItem[]>([]);
  const [retOriginalQuery, setRetOriginalQuery] = useState('');
  const [retReplacementQuery, setRetReplacementQuery] = useState('');
  const [retOriginalResults, setRetOriginalResults] = useState<typeof PRODUCTOS_FURGON>([]);
  const [retReplacementResults, setRetReplacementResults] = useState<typeof PRODUCTOS_FURGON>([]);
  const [retOriginal, setRetOriginal] = useState<any | null>(null);
  const [retReplacement, setRetReplacement] = useState<any | null>(null);
  const [retQuantity, setRetQuantity] = useState<number>(1);
  const [retReason, setRetReason] = useState<'vencido' | 'defectuoso' | 'cliente_no_gusto' | 'otro'>('vencido');
  const [retNote, setRetNote] = useState<string>('');

  // Carrito local para productos del furgón
  const [localCart, setLocalCart] = useState<Array<{
    product: any;
    quantity: number;
    subtotal: number;
  }>>([]);

  // Estado para el pago y comprobante
  const [showReceipt, setShowReceipt] = useState(false);
  const [currentSale, setCurrentSale] = useState<any>(null);

  const categories = Array.from(new Set(PRODUCTOS_FURGON.map(p => p.category)));

  const filteredProducts = PRODUCTOS_FURGON.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                         product.id.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredCustomers = customerSearch
    ? searchCustomers(customerSearch)
    : customers.slice(0, 10);

  const handleCustomerSelect = (customer: any) => {
    setSelectedCustomer(customer);
    setCustomer(customer);
    setStep('venta-rapida');
  };

  const handleQuickAdd = (productId: string, quantity: number) => {
    const product = PRODUCTOS_FURGON.find(p => p.id === productId);
    if (product && product.stockFurgon >= quantity) {
      // Agregar al carrito local
      setLocalCart(prevCart => {
        const existingItem = prevCart.find(item => item.product.id === productId);
        const newQuantity = (existingItem?.quantity || 0) + quantity;

        if (existingItem) {
          // Actualizar cantidad existente
          return prevCart.map(item =>
            item.product.id === productId
              ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.product.price }
              : item
          );
        } else {
          // Agregar nuevo item
          return [...prevCart, {
            product,
            quantity,
            subtotal: quantity * product.price
          }];
        }
      });

      // Actualizar cantidades mostradas
      setQuantities(prev => ({
        ...prev,
        [productId]: (prev[productId] || 0) + quantity
      }));
    }
  };

  const handleRemove = (productId: string) => {
    // Remover del carrito local
    setLocalCart(prevCart =>
      prevCart.filter(item => item.product.id !== productId)
    );

    // Limpiar cantidad mostrada
    setQuantities(prev => {
      const newQuantities = { ...prev };
      delete newQuantities[productId];
      return newQuantities;
    });
  };

  const handleReduceQuantity = (productId: string, quantityToReduce: number) => {
    setLocalCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === productId);

      if (existingItem) {
        const newQuantity = existingItem.quantity - quantityToReduce;

        if (newQuantity <= 0) {
          // Si la cantidad llega a 0 o menos, remover completamente
          return prevCart.filter(item => item.product.id !== productId);
        } else {
          // Actualizar cantidad
          return prevCart.map(item =>
            item.product.id === productId
              ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.product.price }
              : item
          );
        }
      }
      return prevCart;
    });

    // Actualizar cantidades mostradas
    setQuantities(prev => {
      const currentQuantity = prev[productId] || 0;
      const newQuantity = currentQuantity - quantityToReduce;

      if (newQuantity <= 0) {
        const newQuantities = { ...prev };
        delete newQuantities[productId];
        return newQuantities;
      } else {
        return { ...prev, [productId]: newQuantity };
      }
    });
  };

  const getCartTotal = () => {
    return localCart.reduce((total, item) => total + item.subtotal, 0);
  };

  const getReturnAdjustment = () => {
    if (!returnsEnabled || returnItems.length === 0) return 0;
    return returnItems.reduce((sum, r) => {
      // Devolución pura: no hay reemplazo => resta el valor original
      if (!r.replacementProductId && !r.replacementProductCode) {
        return sum - (r.originalPrice * r.quantity);
      }
      const replacementPrice = r.replacementPrice ?? r.originalPrice;
      const diff = (replacementPrice - r.originalPrice) * r.quantity;
      return sum + diff;
    }, 0);
  };

  const getTotalWithReturns = () => {
    return getCartTotal() + getReturnAdjustment();
  };

  const getCartItemCount = () => {
    return localCart.reduce((count, item) => count + item.quantity, 0);
  };

  const getStockStatus = (stock: number, stockFurgon: number) => {
    if (stockFurgon === 0) return 'text-red-500';
    if (stockFurgon <= 3) return 'text-orange-500';
    return 'text-green-500';
  };

  // Búsqueda de productos para devoluciones/intercambios
  useEffect(() => {
    if (retOriginalQuery.trim()) {
      const term = retOriginalQuery.toLowerCase();
      setRetOriginalResults(PRODUCTOS_FURGON.filter(p => p.name.toLowerCase().includes(term) || p.id.toLowerCase().includes(term)) as any);
    } else {
      setRetOriginalResults([] as any);
    }
  }, [retOriginalQuery]);

  useEffect(() => {
    if (retReplacementQuery.trim()) {
      const term = retReplacementQuery.toLowerCase();
      setRetReplacementResults(PRODUCTOS_FURGON.filter(p => p.name.toLowerCase().includes(term) || p.id.toLowerCase().includes(term)) as any);
    } else {
      setRetReplacementResults([] as any);
    }
  }, [retReplacementQuery]);

  const handleUseSameProduct = () => {
    if (!retOriginal) return;
    // Validar contra stock del furgón
    if (retOriginal.stockFurgon < retQuantity) return;
    setRetReplacement(retOriginal);
  };

  const handleAddReturnLine = () => {
    if (!retOriginal || retQuantity < 1) return;
    if (retReplacement && retReplacement.stockFurgon < retQuantity) return;

    const line: ReturnCartItem = {
      originalProductId: retOriginal.id,
      originalProductCode: retOriginal.id,
      originalProductName: retOriginal.name,
      quantity: retQuantity,
      originalPrice: retOriginal.price,
      replacementProductId: retReplacement?.id,
      replacementProductCode: retReplacement?.id,
      replacementProductName: retReplacement?.name,
      replacementPrice: retReplacement?.price,
      reason: retReason,
      note: retNote || (retReplacement && retReplacement.id !== retOriginal.id ? 'Cambio por producto diferente' : undefined)
    };

    setReturnItems(prev => [...prev, line]);

    // limpiar formulario
    setRetOriginal(null);
    setRetOriginalQuery('');
    setRetOriginalResults([] as any);
    setRetReplacement(null);
    setRetReplacementQuery('');
    setRetReplacementResults([] as any);
    setRetQuantity(1);
    setRetReason('vencido');
    setRetNote('');
  };

  const handleProcessSale = async () => {
    if (!selectedCustomer || localCart.length === 0) return;

    setProcessing(true);
    try {
      // Crear objeto de venta
      const saleData = {
        id: `V${Date.now()}`,
        customer: selectedCustomer,
        items: localCart,
        total: getTotalWithReturns(),
        date: new Date(),
        paymentMethod: 'Efectivo'
      };

      setCurrentSale(saleData);
      setStep('pago');
    } catch (error) {
      console.error('Error procesando venta:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handlePaymentComplete = () => {
    if (currentSale) {
      setShowReceipt(true);
    }
  };

  const handleReceiptClose = () => {
    setShowReceipt(false);
    setCurrentSale(null);
    setLocalCart([]);
    setQuantities({});
    setReturnItems([]);
    setReturnsEnabled(false);
    setRetOriginal(null);
    setRetReplacement(null);
    setRetOriginalQuery('');
    setRetReplacementQuery('');
    setStep('cliente');
    setSelectedCustomer(null);
    setCustomer(undefined);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-pan-sinai-dark-brown">
                Venta Rápida - Furgón de Ventas - Pan Sinaí
              </h1>
              {selectedCustomer && (
                <p className="text-pan-sinai-brown">
                  Cliente: {selectedCustomer.businessName || selectedCustomer.name}
                </p>
              )}
            </div>

            {/* Carrito flotante */}
            <div className="relative">
              <button
                onClick={() => setShowCart(!showCart)}
                className="bg-pan-sinai-gold text-pan-sinai-dark-brown px-4 py-2 rounded-lg hover:bg-pan-sinai-yellow transition-colors flex items-center space-x-2"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Carrito ({getCartItemCount()})</span>
                <span className="bg-pan-sinai-dark-brown text-white px-2 py-1 rounded-full text-xs">
                  ${getCartTotal().toFixed(2)}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Indicador de pasos */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-center space-x-8">
            <div className={`flex items-center space-x-2 ${step === 'cliente' ? 'text-pan-sinai-gold' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'cliente' ? 'bg-pan-sinai-gold text-pan-sinai-dark-brown' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="font-medium">Seleccionar Cliente</span>
            </div>
            <div className={`flex items-center space-x-2 ${step === 'venta-rapida' ? 'text-pan-sinai-gold' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'venta-rapida' ? 'bg-pan-sinai-gold text-pan-sinai-dark-brown' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="font-medium">Venta Rápida</span>
            </div>
            <div className={`flex items-center space-x-2 ${step === 'devoluciones' ? 'text-pan-sinai-gold' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'devoluciones' ? 'bg-pan-sinai-gold text-pan-sinai-dark-brown' : 'bg-gray-200'}`}>
                3
              </div>
              <span className="font-medium">Devoluciones</span>
            </div>
            <div className={`flex items-center space-x-2 ${step === 'pago' ? 'text-pan-sinai-gold' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'pago' ? 'bg-pan-sinai-gold text-pan-sinai-dark-brown' : 'bg-gray-200'}`}>
                4
              </div>
              <span className="font-medium">Procesar Pago</span>
            </div>
          </div>
        </div>

        {/* Paso 1: Selección de Cliente */}
        {step === 'cliente' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-pan-sinai-dark-brown mb-4">
              Seleccionar Cliente
            </h2>

            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar cliente por nombre o dirección..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pan-sinai-gold focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCustomers.map(customer => (
                <div
                  key={customer.id}
                  onClick={() => handleCustomerSelect(customer)}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer hover:border-pan-sinai-gold"
                >
                  <div className="flex items-center space-x-3">
                    <User className="w-8 h-8 text-pan-sinai-brown" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-pan-sinai-dark-brown">
                        {customer.businessName || (customer as any).name}
                      </h3>
                      <p className="text-sm text-pan-sinai-brown">{customer.address}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Paso 2: Venta Rápida */}
        {step === 'venta-rapida' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-pan-sinai-dark-brown">
                Seleccionar Productos - Stock Furgón
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStep('devoluciones')}
                  disabled={localCart.length === 0}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ir a Devoluciones
                </button>
                <button
                  onClick={handleProcessSale}
                  disabled={localCart.length === 0}
                  className="bg-pan-sinai-gold text-pan-sinai-dark-brown px-6 py-2 rounded-lg hover:bg-pan-sinai-yellow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuar al Pago
                </button>
              </div>
            </div>

            {/* Filtros */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar por código o nombre..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pan-sinai-gold focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === ''
                      ? 'bg-pan-sinai-gold text-pan-sinai-dark-brown'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Todos
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === category
                        ? 'bg-pan-sinai-gold text-pan-sinai-dark-brown'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {category === 'B' ? 'Panadería' :
                     category === 'G' ? 'Galletas' :
                     category === 'H' ? 'Pastelería' : 'Panes'}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid de productos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  {/* Header del producto */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-bold bg-pan-sinai-gold text-pan-sinai-dark-brown px-2 py-1 rounded">
                          {product.id}
                        </span>
                        <span className={`text-xs font-medium ${getStockStatus(product.stock, product.stockFurgon)}`}>
                          Furgón: {product.stockFurgon}
                        </span>
                      </div>
                      <h3 className="font-semibold text-pan-sinai-dark-brown text-sm leading-tight">
                        {product.name}
                      </h3>
                    </div>
                  </div>

                  {/* Precio */}
                  <div className="mb-3">
                    <span className="text-lg font-bold text-pan-sinai-dark-brown">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>

                  {/* Botones rápidos de cantidad */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-5 gap-1">
                      {[1, 2, 3, 4, 5].map(num => (
                        <button
                          key={num}
                          onClick={() => handleQuickAdd(product.id, num)}
                          disabled={product.stockFurgon < num}
                          className={`px-2 py-1 text-xs rounded transition-colors ${
                            product.stockFurgon >= num
                              ? 'bg-pan-sinai-gold text-pan-sinai-dark-brown hover:bg-pan-sinai-yellow'
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-5 gap-1">
                      {[6, 7, 8, 9, 10].map(num => (
                        <button
                          key={num}
                          onClick={() => handleQuickAdd(product.id, num)}
                          disabled={product.stockFurgon < num}
                          className={`px-2 py-1 text-xs rounded transition-colors ${
                            product.stockFurgon >= num
                              ? 'bg-pan-sinai-gold text-pan-sinai-dark-brown hover:bg-pan-sinai-yellow'
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cantidad seleccionada */}
                  {quantities[product.id] > 0 && (
                    <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-green-700">
                          {quantities[product.id]} unidades
                        </span>
                        <button
                          onClick={() => handleRemove(product.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Eliminar todo"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Botones de reducción rápida */}
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleReduceQuantity(product.id, 1)}
                          className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                          title="Reducir 1 unidad"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => handleReduceQuantity(product.id, 2)}
                          className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                          title="Reducir 2 unidades"
                        >
                          -2
                        </button>
                        <button
                          onClick={() => handleReduceQuantity(product.id, 5)}
                          className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                          title="Reducir 5 unidades"
                        >
                          -5
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Devoluciones movidas a paso propio */}
          </div>
        )}

        {/* Paso 3: Devoluciones */}
        {step === 'devoluciones' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-pan-sinai-dark-brown">Devoluciones / Intercambios</h2>
              <div className="flex items-center gap-2">
                <button onClick={() => setStep('venta-rapida')} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Volver</button>
                <button onClick={() => setStep('pago')} className="bg-pan-sinai-gold text-pan-sinai-dark-brown px-6 py-2 rounded-lg hover:bg-pan-sinai-yellow transition-colors">Ir a Pago</button>
              </div>
            </div>

            <div className="mb-4">
              <label className="inline-flex items-center space-x-2 text-sm">
                <input type="checkbox" checked={returnsEnabled} onChange={(e) => setReturnsEnabled(e.target.checked)} />
                <span>Incluir devoluciones en esta venta</span>
              </label>
            </div>

            {returnsEnabled && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Producto a devolver</label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={retOriginal ? `${retOriginal.id} - ${retOriginal.name}` : retOriginalQuery}
                      onChange={(e) => { setRetOriginal(null); setRetOriginalQuery(e.target.value); }}
                      placeholder="Buscar por código o nombre..."
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pan-sinai-gold focus:border-transparent"
                    />
                  </div>
                  {retOriginalResults.length > 0 && !retOriginal && (
                    <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                      {retOriginalResults.map(p => (
                        <div key={p.id} className="p-2 bg-gray-50 rounded cursor-pointer hover:bg-blue-50" onClick={() => { setRetOriginal(p); setRetOriginalResults([] as any); setRetOriginalQuery(''); }}>
                          <div className="text-sm font-medium">{p.name}</div>
                          <div className="text-xs text-gray-600">{p.id} • ${p.price.toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Producto de reemplazo (opcional)</label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={retReplacement ? `${retReplacement.id} - ${retReplacement.name}` : retReplacementQuery}
                      onChange={(e) => { setRetReplacement(null); setRetReplacementQuery(e.target.value); }}
                      placeholder="Buscar producto para intercambio..."
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pan-sinai-gold focus:border-transparent"
                      disabled={!retOriginal}
                    />
                  </div>
                  {retReplacementResults.length > 0 && !retReplacement && (
                    <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                      {retReplacementResults.map(p => (
                        <div key={p.id} className="p-2 bg-gray-50 rounded cursor-pointer hover:bg-blue-50" onClick={() => { setRetReplacement(p); setRetReplacementResults([] as any); setRetReplacementQuery(''); }}>
                          <div className="text-sm font-medium">{p.name}</div>
                          <div className="text-xs text-gray-600">{p.id} • Stock Furgón: {p.stockFurgon} • ${p.price.toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-2">
                    <button onClick={handleUseSameProduct} disabled={!retOriginal} className="text-sm px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50">Usar mismo producto</button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setRetQuantity(Math.max(1, retQuantity - 1))} className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"><Minus className="w-4 h-4" /></button>
                    <span className="w-10 text-center font-semibold">{retQuantity}</span>
                    <button onClick={() => setRetQuantity(retQuantity + 1)} className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"><Plus className="w-4 h-4" /></button>
                  </div>
                  <select value={retReason} onChange={(e) => setRetReason(e.target.value as any)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="vencido">Producto vencido</option>
                    <option value="defectuoso">Producto defectuoso</option>
                    <option value="cliente_no_gusto">Cliente no le gustó</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <input
                  type="text"
                  value={retNote}
                  onChange={(e) => setRetNote(e.target.value)}
                  placeholder="Nota u observaciones (opcional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />

                <div>
                  <button onClick={handleAddReturnLine} className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Agregar devolución/intercambio</button>
                </div>

                {returnItems.length > 0 && (
                  <div className="pt-4 border-t border-gray-200 space-y-2">
                    {returnItems.map((r, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="text-sm">
                          <div className="font-medium">{r.originalProductName} × {r.quantity}</div>
                          <div className="text-xs text-gray-600">
                            {r.replacementProductName ? `Reemplazo: ${r.replacementProductName}` : 'Reembolso'} • {r.reason}
                          </div>
                        </div>
                        <button onClick={() => setReturnItems(prev => prev.filter((_, i) => i !== idx))} className="p-1 text-red-600 hover:text-red-800"><X className="w-4 h-4" /></button>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Ajuste por devoluciones:</span>
                      <span className={`${getReturnAdjustment() < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {getReturnAdjustment() >= 0 ? '+' : ''}${getReturnAdjustment().toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Paso 4: Procesar Pago */}
        {step === 'pago' && currentSale && (
          <PaymentQR
            total={currentSale.total}
            saleId={currentSale.id}
            customerName={currentSale.customer.businessName || currentSale.customer.name}
            onPaymentComplete={handlePaymentComplete}
            onMethodChange={(method) => {
              setCurrentSale((prev: any) => prev ? { ...prev, paymentMethod: method === 'cash' ? 'Efectivo' : method === 'qr' ? 'Pago Digital' : 'Crédito' } : prev);
            }}
          />
        )}

        {/* Carrito flotante */}
        {showCart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-pan-sinai-dark-brown">
                    Carrito de Compras
                  </h2>
                  <button
                    onClick={() => setShowCart(false)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto max-h-[60vh] p-6">
                {localCart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No hay productos en el carrito</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {localCart.map(item => (
                      <div key={item.product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold bg-pan-sinai-gold text-pan-sinai-dark-brown px-2 py-1 rounded">
                              {item.product.id}
                            </span>
                            <span className="font-medium text-pan-sinai-dark-brown">
                              {item.product.name}
                            </span>
                          </div>
                          <p className="text-sm text-pan-sinai-brown">
                            {item.quantity} x ${item.product.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-pan-sinai-dark-brown">
                            ${item.subtotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {localCart.length > 0 && (
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <div className="space-y-1 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-pan-sinai-brown">Subtotal</span>
                      <span className="text-sm text-pan-sinai-dark-brown">${getCartTotal().toFixed(2)}</span>
                    </div>
                    {returnsEnabled && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-pan-sinai-brown">Ajuste por devoluciones</span>
                        <span className={`text-sm ${getReturnAdjustment() < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {getReturnAdjustment() >= 0 ? '+' : ''}${getReturnAdjustment().toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-pan-sinai-dark-brown">Total</span>
                      <span className="text-lg font-bold text-pan-sinai-dark-brown">${getTotalWithReturns().toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-pan-sinai-brown text-right">{getCartItemCount()} productos</div>
                  </div>
                  <button
                    onClick={() => {
                      setShowCart(false);
                      setStep('pago');
                    }}
                    className="w-full bg-pan-sinai-gold text-pan-sinai-dark-brown py-3 px-6 rounded-lg hover:bg-pan-sinai-yellow transition-colors font-semibold"
                  >
                    Continuar al Pago
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Comprobante de venta */}
        {showReceipt && currentSale && (
          <>
            {console.log('Rendering Receipt with sale:', currentSale)}
            <Receipt
              sale={{
                id: currentSale.id,
                numero: currentSale.id,
                customerName: currentSale.customer?.businessName || currentSale.customer?.name,
                sellerName: 'Vendedor Actual',
                date: currentSale.date,
                total: currentSale.total,
                returns: returnItems.map(r => ({
                  originalProductName: r.originalProductName,
                  quantity: r.quantity,
                  originalPrice: r.originalPrice,
                  replacementProductName: r.replacementProductName,
                  replacementPrice: r.replacementPrice,
                  reason: r.reason,
                  note: r.note
                })),
                returnAdjustment: getReturnAdjustment(),
                products: currentSale.items?.map((item: any) => ({
                  productId: item.product.id,
                  productCode: item.product.code,
                  productName: item.product.name,
                  quantity: item.quantity,
                  price: item.product.price,
                  subtotal: item.subtotal,
                  stockDisponible: item.product.stock
                })),
                metodoPago: currentSale.paymentMethod,
                status: 'completada'
              }}
              onClose={handleReceiptClose}
            />
          </>
        )}
      </div>
    </div>
  );
}
