'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer, Route, RouteCustomer } from '@/types';

interface CustomerContextType {
  customers: Customer[];
  routes: Route[];
  addCustomer: (customer: Omit<Customer, 'id' | 'qrCode'>) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  searchCustomers: (query: string) => Customer[];
  getCustomerByQR: (qrCode: string) => Customer | undefined;
  createRoute: (sellerId: string, date: Date, customerIds: string[]) => void;
  updateRouteStatus: (routeId: string, status: 'pending' | 'in-progress' | 'completed') => void;
  updateCustomerVisitStatus: (routeId: string, customerId: string, status: 'pending' | 'visited' | 'skipped') => void;
  getCurrentRoute: (sellerId: string) => Route | undefined;
  addPurchaseHistory: (customerId: string, purchase: any) => void;
  getCustomerPurchaseHistory: (customerId: string) => any[];
}

interface PurchaseHistory {
  id: string;
  customerId: string;
  date: Date;
  total: number;
  products: any[];
  sellerId: string;
  sellerName: string;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

// Función para generar código QR único
const generateQRCode = (): string => {
  return 'PS-' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

// Datos de prueba para clientes
const initialCustomers: Customer[] = [
  {
    id: '1',
            businessName: 'Tienda El Sol',
    ownerName: 'María González',
    address: 'Calle Principal #123, San Salvador',
    phone: '503-2123-4567',
    email: 'elsol@pulperia.com',
    qrCode: 'PS-ABC123DEF',
    coordinates: { lat: 13.6929, lng: -89.1919 }
  },
  {
    id: '2',
    businessName: 'Tienda La Esperanza',
    ownerName: 'Carlos Rodríguez',
    address: 'Av. Central #456, Santa Tecla',
    phone: '503-2123-4568',
    email: 'esperanza@tienda.com',
    qrCode: 'PS-DEF456GHI',
    coordinates: { lat: 13.6748, lng: -89.2795 }
  },
  {
    id: '3',
    businessName: 'Mini Super San José',
    ownerName: 'Ana Martínez',
    address: 'Col. San José #789, San Salvador',
    phone: '503-2123-4569',
    email: 'sanjose@minisuper.com',
    qrCode: 'PS-GHI789JKL',
    coordinates: { lat: 13.7000, lng: -89.2000 }
  },
  {
    id: '4',
    businessName: 'Abarrotes María',
    ownerName: 'José López',
    address: 'Calle 5 #321, Mejicanos',
    phone: '503-2123-4570',
    email: 'maria@abarrotes.com',
    qrCode: 'PS-JKL012MNO',
    coordinates: { lat: 13.7200, lng: -89.2100 }
  },
  {
    id: '5',
    businessName: 'Tienda El Progreso',
    ownerName: 'Rosa de Flores',
    address: 'Av. Libertad #654, San Salvador',
    phone: '503-2123-4571',
    email: 'progreso@tienda.com',
    qrCode: 'PS-MNO345PQR',
    coordinates: { lat: 13.6800, lng: -89.1900 }
  },
  {
    id: '6',
            businessName: 'Tienda Los Ángeles',
    ownerName: 'Miguel Ángel',
    address: 'Col. Los Ángeles #987, San Salvador',
    phone: '503-2123-4572',
    email: 'angeles@pulperia.com',
    qrCode: 'PS-PQR678STU',
    coordinates: { lat: 13.7100, lng: -89.2200 }
  },
  {
    id: '7',
    businessName: 'Mini Market Central',
    ownerName: 'Carmen de Santos',
    address: 'Centro Comercial #555, San Salvador',
    phone: '503-2123-4573',
    email: 'central@minimarket.com',
    qrCode: 'PS-STU901VWX',
    coordinates: { lat: 13.6900, lng: -89.1800 }
  },
  {
    id: '8',
    businessName: 'Abarrotes El Buen Precio',
    ownerName: 'Francisco Méndez',
    address: 'Calle Comercial #777, Soyapango',
    phone: '503-2123-4574',
    email: 'buenprecio@abarrotes.com',
    qrCode: 'PS-VWX234YZA',
    coordinates: { lat: 13.7300, lng: -89.1500 }
  }
];

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistory[]>([]);

  useEffect(() => {
    // Cargar datos desde localStorage
    const savedCustomers = localStorage.getItem('pan-sinai-customers');
    const savedRoutes = localStorage.getItem('pan-sinai-routes');
    const savedPurchaseHistory = localStorage.getItem('pan-sinai-purchase-history');
    
    if (savedCustomers) {
      try {
        const parsedCustomers = JSON.parse(savedCustomers);
        // Asegurar que todos los clientes tengan campos requeridos
        const validatedCustomers = parsedCustomers.map((customer: any) => ({
          ...customer,
          qrCode: customer.qrCode || generateQRCode(),
          businessName: customer.businessName || '',
          ownerName: customer.ownerName || '',
          address: customer.address || '',
          phone: customer.phone || ''
        }));
        setCustomers(validatedCustomers);
      } catch (error) {
        console.error('Error loading customers:', error);
        setCustomers(initialCustomers);
        localStorage.setItem('pan-sinai-customers', JSON.stringify(initialCustomers));
      }
    } else {
      setCustomers(initialCustomers);
      localStorage.setItem('pan-sinai-customers', JSON.stringify(initialCustomers));
    }
    
    if (savedRoutes) {
      setRoutes(JSON.parse(savedRoutes));
    }
    
    if (savedPurchaseHistory) {
      setPurchaseHistory(JSON.parse(savedPurchaseHistory));
    }
  }, []);

  const saveCustomers = (newCustomers: Customer[]) => {
    setCustomers(newCustomers);
    localStorage.setItem('pan-sinai-customers', JSON.stringify(newCustomers));
  };

  const saveRoutes = (newRoutes: Route[]) => {
    setRoutes(newRoutes);
    localStorage.setItem('pan-sinai-routes', JSON.stringify(newRoutes));
  };

  const savePurchaseHistory = (newHistory: PurchaseHistory[]) => {
    setPurchaseHistory(newHistory);
    localStorage.setItem('pan-sinai-purchase-history', JSON.stringify(newHistory));
  };

  const addCustomer = (customerData: Omit<Customer, 'id' | 'qrCode'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: Date.now().toString(),
      qrCode: generateQRCode(),
    };
    saveCustomers([...customers, newCustomer]);
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    const updatedCustomers = customers.map(customer => 
      customer.id === id ? { ...customer, ...updates } : customer
    );
    saveCustomers(updatedCustomers);
  };

  const deleteCustomer = (id: string) => {
    const filteredCustomers = customers.filter(customer => customer.id !== id);
    saveCustomers(filteredCustomers);
  };

  const searchCustomers = (query: string): Customer[] => {
    const lowercaseQuery = query.toLowerCase();
    return customers.filter(customer => 
      (customer.businessName?.toLowerCase() || '').includes(lowercaseQuery) ||
      (customer.ownerName?.toLowerCase() || '').includes(lowercaseQuery) ||
      (customer.qrCode?.toLowerCase() || '').includes(lowercaseQuery) ||
      (customer.address?.toLowerCase() || '').includes(lowercaseQuery) ||
      (customer.phone || '').includes(query)
    );
  };

  const getCustomerByQR = (qrCode: string): Customer | undefined => {
    return customers.find(customer => customer.qrCode === qrCode);
  };

  const createRoute = (sellerId: string, date: Date, customerIds: string[]) => {
    const routeCustomers: RouteCustomer[] = customerIds.map((customerId, index) => {
      const customer = customers.find(c => c.id === customerId);
      return {
        customerId,
        customerName: customer?.businessName || '',
        order: index + 1,
        status: 'pending'
      };
    });

    const newRoute: Route = {
      id: Date.now().toString(),
      sellerId,
      date,
      customers: routeCustomers,
      status: 'pending'
    };

    saveRoutes([...routes, newRoute]);
  };

  const updateRouteStatus = (routeId: string, status: 'pending' | 'in-progress' | 'completed') => {
    const updatedRoutes = routes.map(route => 
      route.id === routeId ? { ...route, status } : route
    );
    saveRoutes(updatedRoutes);
  };

  const updateCustomerVisitStatus = (routeId: string, customerId: string, status: 'pending' | 'visited' | 'skipped') => {
    const updatedRoutes = routes.map(route => {
      if (route.id === routeId) {
        const updatedCustomers = route.customers.map(customer => 
          customer.customerId === customerId 
            ? { ...customer, status, visitTime: status === 'visited' ? new Date() : undefined }
            : customer
        );
        return { ...route, customers: updatedCustomers };
      }
      return route;
    });
    saveRoutes(updatedRoutes);
  };

  const getCurrentRoute = (sellerId: string): Route | undefined => {
    const today = new Date().toDateString();
    return routes.find(route => 
      route.sellerId === sellerId && 
      route.date.toDateString() === today
    );
  };

  const addPurchaseHistory = (customerId: string, purchase: any) => {
    const newPurchase: PurchaseHistory = {
      id: Date.now().toString(),
      customerId,
      date: new Date(),
      total: purchase.total,
      products: purchase.products,
      sellerId: purchase.sellerId,
      sellerName: purchase.sellerName
    };
    savePurchaseHistory([newPurchase, ...purchaseHistory]);
  };

  const getCustomerPurchaseHistory = (customerId: string): any[] => {
    return purchaseHistory.filter(purchase => purchase.customerId === customerId);
  };

  return (
    <CustomerContext.Provider value={{
      customers,
      routes,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      searchCustomers,
      getCustomerByQR,
      createRoute,
      updateRouteStatus,
      updateCustomerVisitStatus,
      getCurrentRoute,
      addPurchaseHistory,
      getCustomerPurchaseHistory,
    }}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomers() {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomers must be used within a CustomerProvider');
  }
  return context;
} 