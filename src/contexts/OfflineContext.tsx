'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useProducts } from './ProductContext';
import { useCustomers } from './CustomerContext';
import { useSales } from './SalesContext';
import { useReconciliation } from './ReconciliationContext';

interface OfflineData {
  products: any[];
  customers: any[];
  sales: any[];
  reconciliations: any[];
  pendingActions: PendingAction[];
  lastSync: Date | null;
}

interface PendingAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  data: any;
  timestamp: Date;
  retryCount: number;
}

interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSync: Date | null;
  pendingActions: number;
  syncProgress: number;
}

interface OfflineContextType {
  // Estado de conexión
  isOnline: boolean;
  syncStatus: SyncStatus;
  
  // Almacenamiento local
  saveToLocalStorage: (key: string, data: any) => void;
  getFromLocalStorage: (key: string) => any;
  clearLocalStorage: () => void;
  
  // Sincronización
  syncData: () => Promise<void>;
  addPendingAction: (action: Omit<PendingAction, 'id' | 'timestamp' | 'retryCount'>) => void;
  processPendingActions: () => Promise<void>;
  
  // Encriptación
  encryptData: (data: any) => string;
  decryptData: (encryptedData: string) => any;
  
  // Backup
  createBackup: () => Promise<string>;
  restoreBackup: (backupData: string) => Promise<void>;
  
  // Validación de integridad
  validateDataIntegrity: () => boolean;
  repairData: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { products } = useProducts();
  const { customers } = useCustomers();
  const { getSalesHistory } = useSales();
  const { getReconciliations } = useReconciliation();
  
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncProgress, setSyncProgress] = useState(0);

  // Detectar estado de conexión
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Sincronizar automáticamente al recuperar conexión
      setTimeout(() => {
        if (pendingActions.length > 0) {
          processPendingActions();
        }
      }, 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificar estado inicial
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pendingActions.length]);

  // Cargar datos offline al iniciar
  useEffect(() => {
    const savedLastSync = getFromLocalStorage('lastSync');
    if (savedLastSync) {
      setLastSync(new Date(savedLastSync));
    }

    const savedPendingActions = getFromLocalStorage('pendingActions');
    if (savedPendingActions) {
      setPendingActions(savedPendingActions);
    }
  }, []);

  // Encriptación simple (en producción usar librerías especializadas)
  const encryptData = (data: any): string => {
    const jsonString = JSON.stringify(data);
    // Encriptación básica - en producción usar crypto-js o similar
    return btoa(jsonString);
  };

  const decryptData = (encryptedData: string): any => {
    try {
      const jsonString = atob(encryptedData);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Error decrypting data:', error);
      return null;
    }
  };

  // Almacenamiento local seguro
  const saveToLocalStorage = (key: string, data: any) => {
    try {
      const encryptedData = encryptData(data);
      localStorage.setItem(`pan-sinai-${key}`, encryptedData);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const getFromLocalStorage = (key: string): any => {
    try {
      const encryptedData = localStorage.getItem(`pan-sinai-${key}`);
      if (!encryptedData) return null;
      return decryptData(encryptedData);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  };

  const clearLocalStorage = () => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('pan-sinai-')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  };

  // Sincronización de datos
  const syncData = async (): Promise<void> => {
    if (!isOnline) {
      throw new Error('No hay conexión a internet');
    }

    setIsSyncing(true);
    setSyncProgress(0);

    try {
      // Simular sincronización con servidor
      const steps = [
        { name: 'Productos', progress: 20 },
        { name: 'Clientes', progress: 40 },
        { name: 'Ventas', progress: 60 },
        { name: 'Conciliaciones', progress: 80 },
        { name: 'Acciones pendientes', progress: 100 }
      ];

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simular delay
        setSyncProgress(step.progress);
      }

      // Guardar datos actuales
      saveToLocalStorage('products', products);
      saveToLocalStorage('customers', customers);
      saveToLocalStorage('sales', getSalesHistory());
      saveToLocalStorage('reconciliations', getReconciliations());

      setLastSync(new Date());
      saveToLocalStorage('lastSync', new Date().toISOString());

      // Procesar acciones pendientes
      await processPendingActions();

    } catch (error) {
      console.error('Error syncing data:', error);
      throw error;
    } finally {
      setIsSyncing(false);
      setSyncProgress(0);
    }
  };

  // Agregar acción pendiente
  const addPendingAction = (action: Omit<PendingAction, 'id' | 'timestamp' | 'retryCount'>) => {
    const pendingAction: PendingAction = {
      ...action,
      id: Date.now().toString(),
      timestamp: new Date(),
      retryCount: 0
    };

    setPendingActions(prev => {
      const newActions = [...prev, pendingAction];
      saveToLocalStorage('pendingActions', newActions);
      return newActions;
    });
  };

  // Procesar acciones pendientes
  const processPendingActions = async (): Promise<void> => {
    if (!isOnline || pendingActions.length === 0) return;

    const actionsToProcess = [...pendingActions];
    const successfulActions: string[] = [];

    for (const action of actionsToProcess) {
      try {
        // Simular envío al servidor
        await new Promise(resolve => setTimeout(resolve, 200));

        // Marcar como exitosa
        successfulActions.push(action.id);
      } catch (error) {
        console.error(`Error processing action ${action.id}:`, error);
        
        // Incrementar contador de reintentos
        action.retryCount++;
        
        // Si excede 3 reintentos, marcar como fallida
        if (action.retryCount >= 3) {
          console.error(`Action ${action.id} failed after 3 retries`);
        }
      }
    }

    // Remover acciones exitosas
    setPendingActions(prev => {
      const remainingActions = prev.filter(action => !successfulActions.includes(action.id));
      saveToLocalStorage('pendingActions', remainingActions);
      return remainingActions;
    });
  };

  // Crear backup
  const createBackup = async (): Promise<string> => {
    const backupData = {
      timestamp: new Date().toISOString(),
      user: user,
      products,
      customers,
      sales: getSalesHistory(),
      reconciliations: getReconciliations(),
      pendingActions,
      version: '1.0.0'
    };

    const encryptedBackup = encryptData(backupData);
    return encryptedBackup;
  };

  // Restaurar backup
  const restoreBackup = async (backupData: string): Promise<void> => {
    try {
      const backup = decryptData(backupData);
      
      if (!backup || !backup.version) {
        throw new Error('Backup inválido');
      }

      // Restaurar datos
      saveToLocalStorage('products', backup.products || []);
      saveToLocalStorage('customers', backup.customers || []);
      saveToLocalStorage('sales', backup.sales || []);
      saveToLocalStorage('reconciliations', backup.reconciliations || []);
      saveToLocalStorage('pendingActions', backup.pendingActions || []);

      // Recargar la página para aplicar cambios
      window.location.reload();
    } catch (error) {
      console.error('Error restoring backup:', error);
      throw error;
    }
  };

  // Validar integridad de datos
  const validateDataIntegrity = (): boolean => {
    try {
      const storedProducts = getFromLocalStorage('products');
      const storedCustomers = getFromLocalStorage('customers');
      const storedSales = getFromLocalStorage('sales');

      // Validaciones básicas
      if (storedProducts && !Array.isArray(storedProducts)) return false;
      if (storedCustomers && !Array.isArray(storedCustomers)) return false;
      if (storedSales && !Array.isArray(storedSales)) return false;

      return true;
    } catch (error) {
      console.error('Data integrity validation failed:', error);
      return false;
    }
  };

  // Reparar datos corruptos
  const repairData = async (): Promise<void> => {
    try {
      // Limpiar datos corruptos
      clearLocalStorage();
      
      // Recrear datos básicos
      saveToLocalStorage('products', []);
      saveToLocalStorage('customers', []);
      saveToLocalStorage('sales', []);
      saveToLocalStorage('reconciliations', []);
      saveToLocalStorage('pendingActions', []);
      
      console.log('Data repair completed');
    } catch (error) {
      console.error('Error repairing data:', error);
      throw error;
    }
  };

  const syncStatus: SyncStatus = {
    isOnline,
    isSyncing,
    lastSync,
    pendingActions: pendingActions.length,
    syncProgress
  };

  return (
    <OfflineContext.Provider value={{
      isOnline,
      syncStatus,
      saveToLocalStorage,
      getFromLocalStorage,
      clearLocalStorage,
      syncData,
      addPendingAction,
      processPendingActions,
      encryptData,
      decryptData,
      createBackup,
      restoreBackup,
      validateDataIntegrity,
      repairData,
    }}>
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
} 