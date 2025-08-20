'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import {
  Product,
  CartState,
  CartItem,
  Sale,
  SaleProduct,
  ProductoSugerido,
  StockAlerta,
  MetodoPago,
  DevolucionIntercambio,
  ProductoDevuelto,
  Customer,
  ReturnCartItem
} from '../types';

// Estado inicial del carrito
const initialCartState: CartState = {
  items: [],
  subtotal: 0,
  descuento: 0,
  total: 0,
  metodoPago: 'efectivo',
  cliente: undefined,
  hasReturns: false,
  returnItems: [],
  ajusteDevoluciones: 0
};

// Métodos de pago disponibles
const metodosPago: MetodoPago[] = [
  { tipo: 'efectivo', nombre: 'Efectivo', icono: '💵', activo: true },
  { tipo: 'tarjeta', nombre: 'Tarjeta', icono: '💳', activo: true },
  { tipo: 'transferencia', nombre: 'Transferencia', icono: '🏦', activo: true }
];

// Tipos de acciones
type SalesAction =
  | { type: 'ADD_TO_CART'; payload: { product: Product; quantity: number } }
  | { type: 'REMOVE_FROM_CART'; payload: { productId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_PAYMENT_METHOD'; payload: { metodoPago: 'efectivo' | 'tarjeta' | 'transferencia' } }
  | { type: 'SET_DISCOUNT'; payload: { descuento: number } }
  | { type: 'SET_CUSTOMER'; payload: { cliente?: Customer } }
  | { type: 'UPDATE_STOCK'; payload: { productId: string; stock: number } }
  | { type: 'SET_ALERTAS_STOCK'; payload: { alertas: StockAlerta[] } }
  | { type: 'ADD_SALE'; payload: { venta: Sale } }
  | { type: 'ADD_DEVOLUCION'; payload: { devolucion: DevolucionIntercambio } }
  | { type: 'SET_HAS_RETURNS'; payload: { hasReturns: boolean } }
  | { type: 'ADD_RETURN_ITEM'; payload: { item: ReturnCartItem } }
  | { type: 'UPDATE_RETURN_ITEM'; payload: { index: number; item: ReturnCartItem } }
  | { type: 'REMOVE_RETURN_ITEM'; payload: { index: number } };

function calculateReturnAdjustment(returnItems: ReturnCartItem[] | undefined): number {
  if (!returnItems || returnItems.length === 0) return 0;
  return returnItems.reduce((sum, r) => {
    // Si no hay reemplazo, es una devolución pura: resta el valor original
    if (r.replacementPrice === undefined && r.replacementProductId === undefined && r.replacementProductCode === undefined) {
      return sum - (r.originalPrice * r.quantity);
    }
    const replacementPrice = r.replacementPrice ?? r.originalPrice;
    const diff = (replacementPrice - r.originalPrice) * r.quantity;
    return sum + diff;
  }, 0);
}

// Estado del contexto
interface SalesContextState {
  cart: CartState;
  productos: Product[];
  alertasStock: StockAlerta[];
  ventas: Sale[];
  devoluciones: DevolucionIntercambio[];
  metodosPago: MetodoPago[];
  loading: boolean;
  error: string | null;
}

// Estado inicial del contexto
const initialState: SalesContextState = {
  cart: initialCartState,
  productos: [],
  alertasStock: [],
  ventas: [],
  devoluciones: [],
  metodosPago,
  loading: false,
  error: null
};

// Reducer para manejar el estado
function salesReducer(state: SalesContextState, action: SalesAction): SalesContextState {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const { product, quantity } = action.payload;
      const existingItem = state.cart.items.find(item => item.product.id === product.id);

      let newItems: CartItem[];
      if (existingItem) {
        newItems = state.cart.items.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity, subtotal: (item.quantity + quantity) * item.product.price }
            : item
        );
      } else {
        newItems = [...state.cart.items, {
          product,
          quantity,
          subtotal: quantity * product.price,
          stockDisponible: product.stock
        }];
      }

      const subtotal = newItems.reduce((sum, item) => sum + item.subtotal, 0);
      const ajusteDevoluciones = calculateReturnAdjustment(state.cart.returnItems);
      const total = subtotal - state.cart.descuento + ajusteDevoluciones;

      return {
        ...state,
        cart: {
          ...state.cart,
          items: newItems,
          subtotal,
          total,
          ajusteDevoluciones
        }
      };
    }

    case 'REMOVE_FROM_CART': {
      const newItems = state.cart.items.filter(item => item.product.id !== action.payload.productId);
      const subtotal = newItems.reduce((sum, item) => sum + item.subtotal, 0);
      const ajusteDevoluciones = calculateReturnAdjustment(state.cart.returnItems);
      const total = subtotal - state.cart.descuento + ajusteDevoluciones;

      return {
        ...state,
        cart: {
          ...state.cart,
          items: newItems,
          subtotal,
          total,
          ajusteDevoluciones
        }
      };
    }

    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload;
      const newItems = state.cart.items.map(item =>
        item.product.id === productId
          ? { ...item, quantity, subtotal: quantity * item.product.price }
          : item
      );

      const subtotal = newItems.reduce((sum, item) => sum + item.subtotal, 0);
      const ajusteDevoluciones = calculateReturnAdjustment(state.cart.returnItems);
      const total = subtotal - state.cart.descuento + ajusteDevoluciones;

      return {
        ...state,
        cart: {
          ...state.cart,
          items: newItems,
          subtotal,
          total,
          ajusteDevoluciones
        }
      };
    }

    case 'CLEAR_CART':
      return {
        ...state,
        cart: initialCartState
      };

    case 'SET_PAYMENT_METHOD':
      return {
        ...state,
        cart: {
          ...state.cart,
          metodoPago: action.payload.metodoPago
        }
      };

    case 'SET_DISCOUNT': {
      const ajusteDevoluciones = calculateReturnAdjustment(state.cart.returnItems);
      const total = state.cart.subtotal - action.payload.descuento + ajusteDevoluciones;
      return {
        ...state,
        cart: {
          ...state.cart,
          descuento: action.payload.descuento,
          total,
          ajusteDevoluciones
        }
      };
    }

    case 'SET_CUSTOMER':
      return {
        ...state,
        cart: {
          ...state.cart,
          cliente: action.payload.cliente
        }
      };

    case 'UPDATE_STOCK': {
      const { productId, stock } = action.payload;
      const newProductos = state.productos.map(product =>
        product.id === productId ? { ...product, stock } : product
      );

      // Actualizar stock en el carrito también
      const newCartItems = state.cart.items.map(item =>
        item.product.id === productId
          ? { ...item, stockDisponible: stock }
          : item
      );

      return {
        ...state,
        productos: newProductos,
        cart: {
          ...state.cart,
          items: newCartItems
        }
      };
    }

    case 'SET_ALERTAS_STOCK':
      return {
        ...state,
        alertasStock: action.payload.alertas
      };

    case 'ADD_SALE':
      return {
        ...state,
        ventas: [...state.ventas, action.payload.venta]
      };

    case 'ADD_DEVOLUCION':
      return {
        ...state,
        devoluciones: [...state.devoluciones, action.payload.devolucion]
      };

    case 'SET_HAS_RETURNS': {
      const hasReturns = action.payload.hasReturns;
      const returnItems = hasReturns ? (state.cart.returnItems || []) : [];
      const ajusteDevoluciones = calculateReturnAdjustment(returnItems);
      const total = state.cart.subtotal - state.cart.descuento + ajusteDevoluciones;
      return {
        ...state,
        cart: {
          ...state.cart,
          hasReturns,
          returnItems,
          ajusteDevoluciones,
          total
        }
      };
    }

    case 'ADD_RETURN_ITEM': {
      const returnItems = [...(state.cart.returnItems || []), action.payload.item];
      const ajusteDevoluciones = calculateReturnAdjustment(returnItems);
      const total = state.cart.subtotal - state.cart.descuento + ajusteDevoluciones;
      return {
        ...state,
        cart: {
          ...state.cart,
          hasReturns: true,
          returnItems,
          ajusteDevoluciones,
          total
        }
      };
    }

    case 'UPDATE_RETURN_ITEM': {
      const returnItems = (state.cart.returnItems || []).map((it, idx) => idx === action.payload.index ? action.payload.item : it);
      const ajusteDevoluciones = calculateReturnAdjustment(returnItems);
      const total = state.cart.subtotal - state.cart.descuento + ajusteDevoluciones;
      return {
        ...state,
        cart: {
          ...state.cart,
          returnItems,
          ajusteDevoluciones,
          total
        }
      };
    }

    case 'REMOVE_RETURN_ITEM': {
      const returnItems = (state.cart.returnItems || []).filter((_, idx) => idx !== action.payload.index);
      const hasReturns = returnItems.length > 0 ? true : false;
      const ajusteDevoluciones = calculateReturnAdjustment(returnItems);
      const total = state.cart.subtotal - state.cart.descuento + ajusteDevoluciones;
      return {
        ...state,
        cart: {
          ...state.cart,
          hasReturns,
          returnItems,
          ajusteDevoluciones,
          total
        }
      };
    }

    default:
      return state;
  }
}

// Contexto
const SalesContext = createContext<{
  state: SalesContextState;
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setPaymentMethod: (metodoPago: 'efectivo' | 'tarjeta' | 'transferencia') => void;
  setDiscount: (descuento: number) => void;
  setCustomer: (cliente?: Customer) => void;
  processSale: () => Promise<Sale | null>;
  processDevolucion: (devolucion: Omit<DevolucionIntercambio, 'id' | 'fecha'>) => Promise<DevolucionIntercambio | null>;
  searchProducts: (query: string) => Product[];
  getProductSuggestions: (productId: string) => ProductoSugerido[];
  validateStock: (productId: string, quantity: number) => { valid: boolean; message?: string };
  updateProductStock: (productId: string, stock: number) => void;
  getStockAlerts: () => StockAlerta[];
  getSalesHistory: () => Sale[];
  getSalesBySeller: (sellerId: string) => Sale[];
  // Devoluciones integradas
  setHasReturns: (has: boolean) => void;
  addReturnItem: (item: ReturnCartItem) => void;
  updateReturnItem: (index: number, item: ReturnCartItem) => void;
  removeReturnItem: (index: number) => void;
} | undefined>(undefined);

// Provider del contexto
export function SalesProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(salesReducer, initialState);

  // Cargar productos al inicializar
  useEffect(() => {
    loadProducts();
  }, []);

  // Cargar productos desde localStorage o API
  const loadProducts = useCallback(async () => {
    try {
      // Simular carga de productos (en producción sería desde API)
      const productosMock: Product[] = [
        {
          id: '1',
          code: 'B01',
          name: 'Muffin de Naranja 54gr',
          price: 2.50,
          stock: 15,
          category: 'Muffins',
          perecedero: true,
          stockMinimo: 5,
          activo: true
        },
        {
          id: '2',
          code: 'B02',
          name: 'Muffin de Chocolate 54gr',
          price: 2.50,
          stock: 12,
          category: 'Muffins',
          perecedero: true,
          stockMinimo: 5,
          activo: true
        },
        {
          id: '3',
          code: 'B03',
          name: 'Torta de Fresa 200gr',
          price: 8.00,
          stock: 8,
          category: 'Tortas',
          perecedero: true,
          stockMinimo: 3,
          activo: true
        },
        {
          id: '4',
          code: 'B04',
          name: 'Pan Integral 500gr',
          price: 3.50,
          stock: 25,
          category: 'Panes',
          perecedero: true,
          stockMinimo: 10,
          activo: true
        }
      ];

      // Simular alertas de stock
      const alertas: StockAlerta[] = productosMock
        .filter(p => p.stock <= p.stockMinimo)
        .map(p => ({
          productId: p.id,
          productCode: p.code,
          productName: p.name,
          stockActual: p.stock,
          stockMinimo: p.stockMinimo,
          tipo: p.stock === 0 ? 'sin_stock' : 'bajo_stock'
        }));

      dispatch({ type: 'SET_ALERTAS_STOCK', payload: { alertas } });

      // Actualizar productos en el estado
      productosMock.forEach(product => {
        dispatch({ type: 'UPDATE_STOCK', payload: { productId: product.id, stock: product.stock } });
      });
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  }, []);

  // Validar stock
  const validateStock = useCallback((productId: string, quantity: number): { valid: boolean; message?: string } => {
    const product = state.productos.find(p => p.id === productId || p.code === productId);
    if (!product) {
      return { valid: false, message: 'Producto no encontrado' };
    }

    if (!product.activo) {
      return { valid: false, message: 'Producto no disponible' };
    }

    if (product.stock < quantity) {
      return {
        valid: false,
        message: `Solo hay ${product.stock} unidades disponibles de ${product.name}`
      };
    }

    return { valid: true };
  }, [state.productos]);

  // Agregar producto al carrito
  const addToCart = useCallback((product: Product, quantity: number) => {
    const externalId = (product as any).id;
    const internal = state.productos.find(p => p.id === externalId || p.code === externalId);

    if (internal) {
      const validation = validateStock(internal.id, quantity);
      if (!validation.valid) {
        throw new Error(validation.message);
      }
      dispatch({ type: 'ADD_TO_CART', payload: { product: { ...internal } as any, quantity } });
      return;
    }

    // Fallback: producto externo (p.ej. Producto Rápido) que no existe en el catálogo del contexto
    const available = (product as any).stock ?? 0;
    if (available < quantity) {
      throw new Error(`Solo hay ${available} unidades disponibles de ${(product as any).name || 'este producto'}`);
    }
    const enriched: Product = {
      // usar el id externo para mantener coherencia en el carrito
      id: externalId,
      code: (product as any).code || externalId,
      name: (product as any).name,
      price: (product as any).price,
      stock: (product as any).stock,
      category: (product as any).category || 'General',
      perecedero: true,
      stockMinimo: 1,
      activo: true
    } as any;

    dispatch({ type: 'ADD_TO_CART', payload: { product: enriched, quantity } });
  }, [state.productos, validateStock]);

  // Remover producto del carrito
  const removeFromCart = useCallback((productId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { productId } });
  }, []);

  // Actualizar cantidad en carrito
  const updateQuantity = useCallback((productId: string, quantity: number) => {
    // Buscar por id directo o por code para items internos
    const cartItem = state.cart.items.find(i => i.product.id === productId || (i.product as any).code === productId);
    if (cartItem) {
      const internal = state.productos.find(p => p.id === cartItem.product.id || p.code === cartItem.product.id);
      if (internal) {
        const validation = validateStock(internal.id, quantity);
        if (!validation.valid) {
          throw new Error(validation.message);
        }
      } else {
        // item externo: validar contra su propio stockDisponible
        if (cartItem.stockDisponible < quantity) {
          throw new Error(`Solo hay ${cartItem.stockDisponible} unidades disponibles de ${cartItem.product.name}`);
        }
      }
    }

    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  }, [state.cart.items, state.productos, validateStock]);

  // Limpiar carrito
  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  // Establecer método de pago
  const setPaymentMethod = useCallback((metodoPago: 'efectivo' | 'tarjeta' | 'transferencia') => {
    dispatch({ type: 'SET_PAYMENT_METHOD', payload: { metodoPago } });
  }, []);

  // Establecer descuento
  const setDiscount = useCallback((descuento: number) => {
    dispatch({ type: 'SET_DISCOUNT', payload: { descuento } });
  }, []);

  // Establecer cliente
  const setCustomer = useCallback((cliente?: Customer) => {
    dispatch({ type: 'SET_CUSTOMER', payload: { cliente } });
  }, []);

  // Devoluciones integradas en carrito
  const setHasReturns = useCallback((has: boolean) => {
    dispatch({ type: 'SET_HAS_RETURNS', payload: { hasReturns: has } });
  }, []);

  const addReturnItem = useCallback((item: ReturnCartItem) => {
    dispatch({ type: 'ADD_RETURN_ITEM', payload: { item } });
  }, []);

  const updateReturnItem = useCallback((index: number, item: ReturnCartItem) => {
    dispatch({ type: 'UPDATE_RETURN_ITEM', payload: { index, item } });
  }, []);

  const removeReturnItem = useCallback((index: number) => {
    dispatch({ type: 'REMOVE_RETURN_ITEM', payload: { index } });
  }, []);

  // Procesar venta
  const processSale = useCallback(async (): Promise<Sale | null> => {
    if (state.cart.items.length === 0) {
      throw new Error('El carrito está vacío');
    }

    try {
      const venta: Sale = {
        id: Date.now().toString(),
        numero: `V${Date.now()}`,
        customerId: state.cart.cliente?.id,
        customerName: state.cart.cliente?.businessName,
        products: state.cart.items.map(item => ({
          productId: item.product.id,
          productCode: (item.product as any).code || item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          subtotal: item.subtotal,
          stockDisponible: item.stockDisponible
        })),
        subtotal: state.cart.subtotal,
        descuento: state.cart.descuento,
        total: state.cart.total,
        metodoPago: state.cart.metodoPago,
        fecha: new Date(),
        sellerId: 'current-user', // En producción sería el usuario actual
        sellerName: 'Vendedor Actual',
        status: 'completada',
        tieneDevoluciones: state.cart.hasReturns,
        returnItems: state.cart.returnItems,
        ajusteDevoluciones: state.cart.ajusteDevoluciones
      };

      // Actualizar stock de productos vendidos
      state.cart.items.forEach(item => {
        const matched = state.productos.find(p =>
          p.id === item.product.id ||
          p.code === (item.product as any).code ||
          p.code === item.product.id
        );
        if (matched) {
          const newStock = matched.stock - item.quantity;
          dispatch({ type: 'UPDATE_STOCK', payload: { productId: matched.id, stock: newStock } });
        }
      });

      // Actualizar stock por devoluciones/intercambios integrados
      if (state.cart.hasReturns && state.cart.returnItems && state.cart.returnItems.length > 0) {
        state.cart.returnItems.forEach(r => {
          // Sumar al stock del producto devuelto
          const original = state.productos.find(p => p.id === r.originalProductId || p.code === r.originalProductCode);
          if (original) {
            dispatch({ type: 'UPDATE_STOCK', payload: { productId: original.id, stock: original.stock + r.quantity } });
          }
          // Restar del stock del producto de reemplazo si existe
          if (r.replacementProductId || r.replacementProductCode) {
            const replacement = state.productos.find(p => p.id === (r.replacementProductId as any) || p.code === (r.replacementProductCode as any));
            if (replacement) {
              dispatch({ type: 'UPDATE_STOCK', payload: { productId: replacement.id, stock: replacement.stock - r.quantity } });
            }
          }
        });
      }

      // Agregar venta al historial
      dispatch({ type: 'ADD_SALE', payload: { venta } });

      // Limpiar carrito
      dispatch({ type: 'CLEAR_CART' });

      return venta;
    } catch (error) {
      console.error('Error procesando venta:', error);
      return null;
    }
  }, [state.cart]);

  // Procesar devolución/intercambio
  const processDevolucion = useCallback(async (
    devolucion: Omit<DevolucionIntercambio, 'id' | 'fecha'>
  ): Promise<DevolucionIntercambio | null> => {
    try {
      const nuevaDevolucion: DevolucionIntercambio = {
        ...devolucion,
        id: Date.now().toString(),
        fecha: new Date()
      };

      // Actualizar stock según el tipo de operación
      devolucion.productos.forEach(producto => {
        const currentProduct = state.productos.find(p => p.id === producto.productId);
        if (currentProduct) {
          let newStock = currentProduct.stock;

          if (devolucion.tipo === 'devolucion') {
            // Devolución: agregar stock
            newStock += producto.quantity;
          } else {
            // Intercambio: agregar stock del producto devuelto, restar del nuevo
            newStock += producto.quantity;
            if (producto.productoIntercambioId) {
              const productoIntercambio = state.productos.find(p => p.id === producto.productoIntercambioId);
              if (productoIntercambio) {
                dispatch({
                  type: 'UPDATE_STOCK',
                  payload: {
                    productId: producto.productoIntercambioId,
                    stock: productoIntercambio.stock - producto.quantity
                  }
                });
              }
            }
          }

          dispatch({ type: 'UPDATE_STOCK', payload: { productId: producto.productId, stock: newStock } });
        }
      });

      // Agregar devolución al historial
      dispatch({ type: 'ADD_DEVOLUCION', payload: { devolucion: nuevaDevolucion } });

      return nuevaDevolucion;
    } catch (error) {
      console.error('Error procesando devolución:', error);
      return null;
    }
  }, [state.productos]);

  // Buscar productos
  const searchProducts = useCallback((query: string): Product[] => {
    if (!query.trim()) return state.productos;

    const searchTerm = query.toLowerCase();
    return state.productos.filter(product =>
      product.activo && (
        product.code.toLowerCase().includes(searchTerm) ||
        product.name.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm)
      )
    );
  }, [state.productos]);

  // Obtener sugerencias de productos
  const getProductSuggestions = useCallback((productId: string): ProductoSugerido[] => {
    const currentProduct = state.productos.find(p => p.id === productId);
    if (!currentProduct) return [];

    const suggestions: ProductoSugerido[] = [];

    // Productos similares (misma categoría)
    const similares = state.productos.filter(p =>
      p.id !== productId &&
      p.activo &&
      p.category === currentProduct.category &&
      p.stock > 0
    ).slice(0, 3);

    similares.forEach(product => {
      suggestions.push({
        producto: product,
        razon: 'similar',
        mensaje: `Similar: ${product.name}`
      });
    });

    // Productos con stock alto
    const conStock = state.productos.filter(p =>
      p.id !== productId &&
      p.activo &&
      p.stock > p.stockMinimo * 2
    ).slice(0, 2);

    conStock.forEach(product => {
      suggestions.push({
        producto: product,
        razon: 'mas_vendido',
        mensaje: `${product.name} (${product.stock} disponibles)`
      });
    });

    return suggestions;
  }, [state.productos]);



  // Actualizar stock de producto
  const updateProductStock = useCallback((productId: string, stock: number) => {
    dispatch({ type: 'UPDATE_STOCK', payload: { productId, stock } });
  }, []);

  // Obtener alertas de stock
  const getStockAlerts = useCallback((): StockAlerta[] => {
    return state.alertasStock;
  }, [state.alertasStock]);

  // Obtener historial de ventas
  const getSalesHistory = useCallback((): Sale[] => {
    return state.ventas;
  }, [state.ventas]);

  // Obtener ventas por vendedor
  const getSalesBySeller = useCallback((sellerId: string): Sale[] => {
    return state.ventas.filter(venta => venta.sellerId === sellerId);
  }, [state.ventas]);

  const value = {
    state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    setPaymentMethod,
    setDiscount,
    setCustomer,
    processSale,
    processDevolucion,
    searchProducts,
    getProductSuggestions,
    validateStock,
    updateProductStock,
    getStockAlerts,
    getSalesHistory,
    getSalesBySeller,
    setHasReturns,
    addReturnItem,
    updateReturnItem,
    removeReturnItem
  };

  return (
    <SalesContext.Provider value={value}>
      {children}
    </SalesContext.Provider>
  );
}

// Hook para usar el contexto
export function useSales() {
  const context = useContext(SalesContext);
  if (context === undefined) {
    throw new Error('useSales debe ser usado dentro de un SalesProvider');
  }
  return context;
}
