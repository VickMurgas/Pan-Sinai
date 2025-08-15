'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useProducts } from './ProductContext';
import { useCustomers } from './CustomerContext';
import { useSales } from './SalesContext';
import { useReconciliation } from './ReconciliationContext';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  priority: 'low' | 'medium' | 'high';
  category: 'stock' | 'customer' | 'order' | 'reconciliation' | 'system';
}

interface NotificationSettings {
  stockAlerts: boolean;
  customerReminders: boolean;
  orderNotifications: boolean;
  reconciliationAlerts: boolean;
  systemNotifications: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

interface NotificationContextType {
  // Notificaciones
  notifications: Notification[];
  unreadCount: number;
  
  // Configuración
  settings: NotificationSettings;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  
  // Gestión de notificaciones
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Alertas específicas
  checkStockAlerts: () => void;
  checkCustomerReminders: () => void;
  checkOrderNotifications: () => void;
  checkReconciliationAlerts: () => void;
  
  // Notificaciones del sistema
  showSystemNotification: (title: string, message: string) => void;
  requestNotificationPermission: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { products } = useProducts();
  const { customers, getCurrentRoute } = useCustomers();
  const { getSalesHistory } = useSales();
  const { getReconciliations } = useReconciliation();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    stockAlerts: true,
    customerReminders: true,
    orderNotifications: true,
    reconciliationAlerts: true,
    systemNotifications: true,
    soundEnabled: true,
    vibrationEnabled: true
  });

  // Cargar configuración guardada
  useEffect(() => {
    const savedSettings = localStorage.getItem('pan-sinai-notification-settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading notification settings:', error);
      }
    }

    const savedNotifications = localStorage.getItem('pan-sinai-notifications');
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        setNotifications(parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        })));
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    }
  }, []);

  // Guardar configuración
  useEffect(() => {
    localStorage.setItem('pan-sinai-notification-settings', JSON.stringify(settings));
  }, [settings]);

  // Guardar notificaciones
  useEffect(() => {
    localStorage.setItem('pan-sinai-notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Verificar alertas cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      if (settings.stockAlerts) checkStockAlerts();
      if (settings.customerReminders) checkCustomerReminders();
      if (settings.orderNotifications) checkOrderNotifications();
      if (settings.reconciliationAlerts) checkReconciliationAlerts();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [settings, products, customers]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 99)]); // Mantener máximo 100

    // Mostrar notificación del sistema si está habilitada
    if (settings.systemNotifications && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(newNotification.title, {
        body: newNotification.message,
        icon: '/favicon.ico',
        tag: newNotification.id
      });
    }

    // Reproducir sonido si está habilitado
    if (settings.soundEnabled) {
      playNotificationSound();
    }

    // Vibración si está habilitada
    if (settings.vibrationEnabled && 'vibrate' in navigator) {
      navigator.vibrate(200);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Verificar alertas de stock bajo
  const checkStockAlerts = () => {
    const lowStockProducts = products.filter(product => product.stock < 20);
    
    lowStockProducts.forEach(product => {
      const existingAlert = notifications.find(n => 
        n.category === 'stock' && 
        n.message.includes(product.name) &&
        new Date().getTime() - n.timestamp.getTime() < 60 * 60 * 1000 // No duplicar en 1 hora
      );

      if (!existingAlert) {
        addNotification({
          type: 'warning',
          title: 'Stock Bajo',
          message: `${product.name} tiene solo ${product.stock} unidades disponibles`,
          priority: product.stock < 10 ? 'high' : 'medium',
          category: 'stock',
          action: {
            label: 'Ver Producto',
            onClick: () => {
              // Navegar al producto
              console.log('Navegar a producto:', product.id);
            }
          }
        });
      }
    });
  };

  // Verificar recordatorios de clientes
  const checkCustomerReminders = () => {
    if (!user || user.role !== 'Vendedor') return;

    const currentRoute = getCurrentRoute(user.id);
    if (!currentRoute) return;

    const pendingCustomers = currentRoute.customers.filter(customer => !customer.visited);
    
    if (pendingCustomers.length > 0) {
      addNotification({
        type: 'info',
        title: 'Clientes Pendientes',
        message: `Tienes ${pendingCustomers.length} clientes pendientes de visitar hoy`,
        priority: 'medium',
        category: 'customer',
        action: {
          label: 'Ver Ruta',
          onClick: () => {
            // Navegar a la ruta
            console.log('Navegar a ruta');
          }
        }
      });
    }
  };

  // Verificar notificaciones de pedidos (para bodegueros)
  const checkOrderNotifications = () => {
    if (!user || user.role !== 'Bodeguero') return;

    const recentSales = getSalesHistory().filter(sale => {
      const saleDate = new Date(sale.date);
      const now = new Date();
      return now.getTime() - saleDate.getTime() < 30 * 60 * 1000; // Últimos 30 minutos
    });

    if (recentSales.length > 0) {
      addNotification({
        type: 'info',
        title: 'Nuevos Pedidos',
        message: `Se han procesado ${recentSales.length} ventas recientemente`,
        priority: 'medium',
        category: 'order',
        action: {
          label: 'Ver Stock',
          onClick: () => {
            // Navegar al stock
            console.log('Navegar a stock');
          }
        }
      });
    }
  };

  // Verificar alertas de conciliación
  const checkReconciliationAlerts = () => {
    if (!user) return;

    const reconciliations = getReconciliations(user.id, 'today');
    const pendingReconciliations = reconciliations.filter(rec => rec.status === 'with-differences');

    if (pendingReconciliations.length > 0) {
      addNotification({
        type: 'error',
        title: 'Conciliación Pendiente',
        message: `Tienes ${pendingReconciliations.length} conciliación(es) con diferencias pendiente(s)`,
        priority: 'high',
        category: 'reconciliation',
        action: {
          label: 'Revisar',
          onClick: () => {
            // Navegar a conciliación
            console.log('Navegar a conciliación');
          }
        }
      });
    }
  };

  // Mostrar notificación del sistema
  const showSystemNotification = (title: string, message: string) => {
    addNotification({
      type: 'info',
      title,
      message,
      priority: 'low',
      category: 'system'
    });
  };

  // Solicitar permiso para notificaciones
  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  };

  // Reproducir sonido de notificación
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3'); // Archivo de sonido
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Fallback: usar beep del navegador
        console.log('\u0007');
      });
    } catch (error) {
      console.log('\u0007'); // Beep del navegador
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      settings,
      updateSettings,
      addNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAllNotifications,
      checkStockAlerts,
      checkCustomerReminders,
      checkOrderNotifications,
      checkReconciliationAlerts,
      showSystemNotification,
      requestNotificationPermission,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
} 