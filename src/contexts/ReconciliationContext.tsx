'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Sale, Product } from '@/types';
import { useSales } from './SalesContext';
import { useProducts } from './ProductContext';
import { useAuth } from './AuthContext';

interface RouteClosure {
  id: string;
  sellerId: string;
  sellerName: string;
  date: Date;
  totalSales: number;
  totalRevenue: number;
  totalProducts: number;
  unsoldProducts: Product[];
  reorderSuggestion: Product[];
  status: 'pending' | 'completed' | 'approved';
  notes?: string;
}

interface BankDeposit {
  id: string;
  sellerId: string;
  sellerName: string;
  date: Date;
  amount: number;
  bankAccount: string;
  reference: string;
  expectedAmount: number;
  difference: number;
  justification?: string;
  status: 'pending' | 'verified' | 'approved' | 'rejected';
  receipt?: string;
}

interface Reconciliation {
  id: string;
  sellerId: string;
  sellerName: string;
  date: Date;
  routeClosureId: string;
  bankDepositId: string;
  expectedAmount: number;
  actualAmount: number;
  difference: number;
  status: 'pending' | 'reconciled' | 'with-differences' | 'approved';
  managerApproval?: {
    managerId: string;
    managerName: string;
    approvedAt: Date;
    notes?: string;
  };
  auditTrail: AuditEntry[];
}

interface AuditEntry {
  id: string;
  timestamp: Date;
  action: string;
  userId: string;
  userName: string;
  details: string;
  oldValue?: any;
  newValue?: any;
}

interface ReconciliationContextType {
  // Cierre de ruta
  closeRoute: (sellerId: string, sellerName: string, notes?: string) => Promise<RouteClosure>;
  getRouteClosure: (sellerId: string, date: Date) => RouteClosure | null;
  getRouteClosures: (sellerId?: string, period?: string) => RouteClosure[];

  // Depósito bancario
  registerDeposit: (sellerId: string, sellerName: string, amount: number, bankAccount: string, reference: string, justification?: string, receipt?: string) => Promise<BankDeposit>;
  getDeposits: (sellerId?: string, period?: string) => BankDeposit[];
  updateDepositStatus: (depositId: string, status: string, managerId?: string, managerName?: string) => void;

  // Conciliación
  createReconciliation: (sellerId: string, date: Date) => Promise<Reconciliation>;
  getReconciliations: (sellerId?: string, period?: string) => Reconciliation[];
  approveReconciliation: (reconciliationId: string, managerId: string, managerName: string, notes?: string) => void;

  // Auditoría
  addAuditEntry: (action: string, details: string, oldValue?: any, newValue?: any) => void;
  getAuditTrail: (entityId: string, entityType: string) => AuditEntry[];

  // Preparación siguiente día
  generateReorderSuggestion: (sellerId: string, date: Date) => Product[];
  getNextDayPreparation: (sellerId: string) => any;
}

const ReconciliationContext = createContext<ReconciliationContextType | undefined>(undefined);

export function ReconciliationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { getSalesBySeller, getSalesHistory } = useSales();
  const { products, updateStock } = useProducts();

  const [routeClosures, setRouteClosures] = useState<RouteClosure[]>([]);
  const [bankDeposits, setBankDeposits] = useState<BankDeposit[]>([]);
  const [reconciliations, setReconciliations] = useState<Reconciliation[]>([]);
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>([]);

  useEffect(() => {
    // Cargar datos desde localStorage
    const savedRouteClosures = localStorage.getItem('pan-sinai-route-closures');
    const savedBankDeposits = localStorage.getItem('pan-sinai-bank-deposits');
    const savedReconciliations = localStorage.getItem('pan-sinai-reconciliations');
    const savedAuditTrail = localStorage.getItem('pan-sinai-audit-trail');

    if (savedRouteClosures) setRouteClosures(JSON.parse(savedRouteClosures));
    if (savedBankDeposits) setBankDeposits(JSON.parse(savedBankDeposits));
    if (savedReconciliations) setReconciliations(JSON.parse(savedReconciliations));
    if (savedAuditTrail) setAuditTrail(JSON.parse(savedAuditTrail));
  }, []);

  const saveData = () => {
    localStorage.setItem('pan-sinai-route-closures', JSON.stringify(routeClosures));
    localStorage.setItem('pan-sinai-bank-deposits', JSON.stringify(bankDeposits));
    localStorage.setItem('pan-sinai-reconciliations', JSON.stringify(reconciliations));
    localStorage.setItem('pan-sinai-audit-trail', JSON.stringify(auditTrail));
  };

  // Cierre de ruta
  const closeRoute = async (sellerId: string, sellerName: string, notes?: string): Promise<RouteClosure> => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Obtener ventas del día
    const dailySales: Sale[] = getSalesBySeller(sellerId).filter((sale: Sale) => {
      const saleDate = new Date(sale.fecha);
      return saleDate >= today;
    });

    // Calcular métricas
    const totalSales: number = dailySales.length;
    const totalRevenue: number = dailySales.reduce((sum: number, sale: Sale) => sum + sale.total, 0);
    const totalProducts: number = dailySales.reduce((sum: number, sale: Sale) =>
      sum + sale.products.reduce((pSum: number, product: any) => pSum + product.quantity, 0), 0
    );

    // Identificar productos no vendidos (simulado)
    const unsoldProducts = products
      .filter(product => product.stock > 0)
      .slice(0, 5) // Simular algunos productos no vendidos
      .map(product => ({
        ...product,
        stock: Math.floor(Math.random() * 20) + 1 // Stock aleatorio para simulación
      }));

    // Generar sugerencias de reabastecimiento
    const reorderSuggestion = products
      .filter(product => product.stock < 30)
      .map(product => ({
        ...product,
        suggestedQuantity: Math.max(50 - product.stock, 20)
      }));

    const routeClosure: RouteClosure = {
      id: Date.now().toString(),
      sellerId,
      sellerName,
      date: today,
      totalSales,
      totalRevenue,
      totalProducts,
      unsoldProducts,
      reorderSuggestion,
      status: 'pending',
      notes
    };

    setRouteClosures(prev => [routeClosure, ...prev]);
    addAuditEntry('route_closure', `Cierre de ruta para ${sellerName}`, undefined, routeClosure);
    saveData();

    return routeClosure;
  };

  const getRouteClosure = (sellerId: string, date: Date): RouteClosure | null => {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    return routeClosures.find(closure =>
      closure.sellerId === sellerId &&
      new Date(closure.date).getTime() === targetDate.getTime()
    ) || null;
  };

  const getRouteClosures = (sellerId?: string, period: string = 'week'): RouteClosure[] => {
    let filtered = sellerId ? routeClosures.filter(rc => rc.sellerId === sellerId) : routeClosures;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (period) {
      case 'today':
        return filtered.filter(rc => new Date(rc.date).getTime() === today.getTime());
      case 'week':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return filtered.filter(rc => new Date(rc.date) >= weekAgo);
      case 'month':
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        return filtered.filter(rc => new Date(rc.date) >= monthAgo);
      default:
        return filtered;
    }
  };

  // Depósito bancario
  const registerDeposit = async (
    sellerId: string,
    sellerName: string,
    amount: number,
    bankAccount: string,
    reference: string,
    justification?: string,
    receipt?: string
  ): Promise<BankDeposit> => {
    // Obtener el cierre de ruta del día
    const routeClosure = getRouteClosure(sellerId, new Date());
    const expectedAmount = routeClosure?.totalRevenue || 0;
    const difference = amount - expectedAmount;

    const deposit: BankDeposit = {
      id: Date.now().toString(),
      sellerId,
      sellerName,
      date: new Date(),
      amount,
      bankAccount,
      reference,
      expectedAmount,
      difference,
      justification,
      status: 'pending',
      receipt
    };

    setBankDeposits(prev => [deposit, ...prev]);
    addAuditEntry('bank_deposit', `Depósito registrado por ${sellerName}`, undefined, deposit);
    saveData();

    return deposit;
  };

  const getDeposits = (sellerId?: string, period: string = 'week'): BankDeposit[] => {
    let filtered = sellerId ? bankDeposits.filter(dep => dep.sellerId === sellerId) : bankDeposits;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (period) {
      case 'today':
        return filtered.filter(dep => {
          const depDate = new Date(dep.date);
          return depDate.getTime() === today.getTime();
        });
      case 'week':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return filtered.filter(dep => new Date(dep.date) >= weekAgo);
      case 'month':
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        return filtered.filter(dep => new Date(dep.date) >= monthAgo);
      default:
        return filtered;
    }
  };

  const updateDepositStatus = (depositId: string, status: string, managerId?: string, managerName?: string) => {
    setBankDeposits(prev =>
      prev.map(dep =>
        dep.id === depositId
          ? { ...dep, status: status as any }
          : dep
      )
    );

    addAuditEntry('deposit_status_update', `Estado de depósito actualizado a ${status}`, undefined, { depositId, status, managerId, managerName });
    saveData();
  };

  // Conciliación
  const createReconciliation = async (sellerId: string, date: Date): Promise<Reconciliation> => {
    const routeClosure = getRouteClosure(sellerId, date);
    const deposits = getDeposits(sellerId, 'today');
    const todayDeposit = deposits.find(dep => {
      const depDate = new Date(dep.date);
      const targetDate = new Date(date);
      return depDate.getTime() === targetDate.getTime();
    });

    if (!routeClosure) {
      throw new Error('No se encontró cierre de ruta para la fecha especificada');
    }

    if (!todayDeposit) {
      throw new Error('No se encontró depósito para la fecha especificada');
    }

    const reconciliation: Reconciliation = {
      id: Date.now().toString(),
      sellerId,
      sellerName: routeClosure.sellerName,
      date,
      routeClosureId: routeClosure.id,
      bankDepositId: todayDeposit.id,
      expectedAmount: routeClosure.totalRevenue,
      actualAmount: todayDeposit.amount,
      difference: todayDeposit.difference,
      status: Math.abs(todayDeposit.difference) < 1 ? 'reconciled' : 'with-differences',
      auditTrail: []
    };

    setReconciliations(prev => [reconciliation, ...prev]);
    addAuditEntry('reconciliation_created', `Conciliación creada para ${reconciliation.sellerName}`, undefined, reconciliation);
    saveData();

    return reconciliation;
  };

  const getReconciliations = (sellerId?: string, period: string = 'week'): Reconciliation[] => {
    let filtered = sellerId ? reconciliations.filter(rec => rec.sellerId === sellerId) : reconciliations;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (period) {
      case 'today':
        return filtered.filter(rec => {
          const recDate = new Date(rec.date);
          return recDate.getTime() === today.getTime();
        });
      case 'week':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return filtered.filter(rec => new Date(rec.date) >= weekAgo);
      case 'month':
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        return filtered.filter(rec => new Date(rec.date) >= monthAgo);
      default:
        return filtered;
    }
  };

  const approveReconciliation = (reconciliationId: string, managerId: string, managerName: string, notes?: string) => {
    setReconciliations(prev =>
      prev.map(rec =>
        rec.id === reconciliationId
          ? {
              ...rec,
              status: 'approved',
              managerApproval: {
                managerId,
                managerName,
                approvedAt: new Date(),
                notes
              }
            }
          : rec
      )
    );

    addAuditEntry('reconciliation_approved', `Conciliación aprobada por ${managerName}`, undefined, { reconciliationId, managerId, managerName, notes });
    saveData();
  };

  // Auditoría
  const addAuditEntry = (action: string, details: string, oldValue?: any, newValue?: any) => {
    if (!user) return;

    const auditEntry: AuditEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      action,
      userId: user.id,
      userName: user.name,
      details,
      oldValue,
      newValue
    };

    setAuditTrail(prev => [auditEntry, ...prev]);
    saveData();
  };

  const getAuditTrail = (entityId: string, entityType: string): AuditEntry[] => {
    return auditTrail.filter(entry =>
      entry.details.includes(entityId) || entry.details.includes(entityType)
    );
  };

  // Preparación siguiente día
  const generateReorderSuggestion = (sellerId: string, date: Date): Product[] => {
    const routeClosure = getRouteClosure(sellerId, date);
    if (!routeClosure) return [];

    return routeClosure.reorderSuggestion.map(product => ({
      ...product,
      suggestedQuantity: Math.max(50 - product.stock, 20)
    }));
  };

  const getNextDayPreparation = (sellerId: string) => {
    const today = new Date();
    const routeClosure = getRouteClosure(sellerId, today);

    if (!routeClosure) return null;

    return {
      reorderSuggestion: routeClosure.reorderSuggestion,
      unsoldProducts: routeClosure.unsoldProducts,
      nextDayRoute: [], // Simulado - se generaría basado en clientes y rutas
      stockAlerts: products.filter(p => p.stock < 20)
    };
  };

  return (
    <ReconciliationContext.Provider value={{
      closeRoute,
      getRouteClosure,
      getRouteClosures,
      registerDeposit,
      getDeposits,
      updateDepositStatus,
      createReconciliation,
      getReconciliations,
      approveReconciliation,
      addAuditEntry,
      getAuditTrail,
      generateReorderSuggestion,
      getNextDayPreparation,
    }}>
      {children}
    </ReconciliationContext.Provider>
  );
}

export function useReconciliation() {
  const context = useContext(ReconciliationContext);
  if (context === undefined) {
    throw new Error('useReconciliation must be used within a ReconciliationProvider');
  }
  return context;
}
