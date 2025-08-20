export type UserRole = 'vendedor' | 'bodeguero' | 'gerente';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

// Producto extendido para panadería
export interface Product {
  id: string;
  code: string; // B01, B02, etc.
  name: string; // "Muffin de Naranja 54gr"
  price: number;
  stock: number;
  category: string; // "Muffins", "Tortas", "Panes"
  description?: string;
  image?: string;
  perecedero: boolean; // Nuevo: para productos que vencen
  fechaVencimiento?: Date; // Nuevo: fecha de vencimiento
  stockMinimo: number; // Nuevo: stock mínimo para alertas
  activo: boolean; // Nuevo: producto activo/inactivo
}

// Cliente extendido
export interface Customer {
  id: string;
  businessName: string;
  ownerName: string;
  address: string;
  phone: string;
  email?: string;
  qrCode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  tipoCliente: 'minorista' | 'mayorista' | 'consumidor'; // Nuevo
  limiteCredito?: number; // Nuevo
}

// Venta optimizada para venta rápida
export interface Sale {
  id: string;
  numero: string; // Correlativo de venta
  customerId?: string; // Opcional para ventas sin cliente
  customerName?: string;
  products: SaleProduct[];
  subtotal: number;
  descuento: number;
  total: number;
  metodoPago: 'efectivo' | 'tarjeta' | 'transferencia' | 'credito';
  fecha: Date;
  sellerId: string;
  sellerName: string;
  status: 'completada' | 'cancelada' | 'pendiente';
  coordinates?: {
    lat: number;
    lng: number;
  };
  observaciones?: string;
  // Devoluciones integradas en la venta
  tieneDevoluciones?: boolean;
  returnItems?: ReturnCartItem[];
  ajusteDevoluciones?: number;
}

export interface SaleProduct {
  productId: string;
  productCode: string; // Nuevo: código del producto
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
  stockDisponible: number; // Nuevo: stock al momento de la venta
}

// Nuevo: Devolución/Intercambio
export interface DevolucionIntercambio {
  id: string;
  fecha: Date;
  tipo: 'devolucion' | 'intercambio';
  ventaOriginalId?: string; // ID de la venta original
  ventaOriginalNumero?: string; // Número de venta original
  productos: ProductoDevuelto[];
  motivo: string;
  reembolso: number;
  vendedorId: string;
  vendedorName: string;
  clienteId?: string;
  clienteName?: string;
  estado: 'pendiente' | 'procesada' | 'cancelada';
  observaciones?: string;
}

// Nuevo: Producto devuelto
export interface ProductoDevuelto {
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  precioOriginal: number;
  subtotal: number;
  razon: 'vencido' | 'defectuoso' | 'cliente_no_gusto' | 'otro';
  productoIntercambioId?: string; // Para intercambios
  productoIntercambioName?: string;
}

// Nuevo: Ítem de devolución/intercambio integrado al carrito/venta
export interface ReturnCartItem {
  originalProductId: string;
  originalProductCode: string;
  originalProductName: string;
  quantity: number;
  originalPrice: number;
  // Cuando es intercambio
  replacementProductId?: string;
  replacementProductCode?: string;
  replacementProductName?: string;
  replacementPrice?: number;
  reason: 'vencido' | 'defectuoso' | 'cliente_no_gusto' | 'otro';
  note?: string; // Marca si se cambió por producto diferente, observaciones
}

// Nuevo: Carrito de compras para venta rápida
export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
  stockDisponible: number;
}

// Nuevo: Estado del carrito
export interface CartState {
  items: CartItem[];
  subtotal: number;
  descuento: number;
  total: number;
  metodoPago: 'efectivo' | 'tarjeta' | 'transferencia' | 'credito';
  cliente?: Customer;
  // Devoluciones/intercambios integrados a la venta
  hasReturns?: boolean;
  returnItems?: ReturnCartItem[];
  ajusteDevoluciones?: number; // efecto neto de devoluciones/intercambios en el total
}

// Nuevo: Sugerencia de producto alternativo
export interface ProductoSugerido {
  producto: Product;
  razon: 'stock_bajo' | 'similar' | 'mas_vendido' | 'mismo_precio';
  mensaje: string;
}

// Nuevo: Alertas de stock
export interface StockAlerta {
  productId: string;
  productCode: string;
  productName: string;
  stockActual: number;
  stockMinimo: number;
  tipo: 'bajo_stock' | 'sin_stock' | 'proximo_vencer';
  fechaVencimiento?: Date;
}

// Nuevo: Métodos de pago
export interface MetodoPago {
  tipo: 'efectivo' | 'tarjeta' | 'transferencia' | 'credito';
  nombre: string;
  icono: string;
  activo: boolean;
}

// Nuevo: Pago pendiente por crédito
export interface PendingPayment {
  id: string; // id del pago pendiente
  saleId: string; // referencia a la venta creada
  customerId?: string;
  customerName?: string;
  amount: number;
  createdAt: Date;
  expiresAt: Date; // creado + 24h
  status: 'pendiente' | 'pagado' | 'vencido';
}

// Nuevo: Configuración de ventas
export interface ConfiguracionVentas {
  stockMinimoGlobal: number;
  diasLimiteDevolucion: number;
  descuentoMaximo: number;
  productosPorPagina: number;
  tiempoCacheStock: number; // en segundos
}

// Nuevo: Estadísticas de venta rápida
export interface VentaRapidaStats {
  ventasHoy: number;
  ingresosHoy: number;
  productosVendidos: number;
  promedioTiempoVenta: number; // en segundos
  devolucionesHoy: number;
  intercambiosHoy: number;
}

export interface Route {
  id: string;
  sellerId: string;
  date: Date;
  customers: RouteCustomer[];
  status: 'pending' | 'in-progress' | 'completed';
}

export interface RouteCustomer {
  customerId: string;
  customerName: string;
  order: number;
  status: 'pending' | 'visited' | 'skipped';
  visitTime?: Date;
}

export interface DashboardStats {
  totalSales: number;
  totalRevenue: number;
  activeSellers: number;
  pendingOrders: number;
  lowStockProducts: number;
}

export interface VendedorStats {
  salesToday: number;
  revenueToday: number;
  customersVisited: number;
  routeStatus: 'available' | 'en-ruta' | 'finalizando';
  pendingCustomers: number;
}
