'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useProducts } from './ProductContext';
import { useSales } from './SalesContext';
import { useReconciliation } from './ReconciliationContext';

interface IntegrationConfig {
  accountingSystem: {
    enabled: boolean;
    apiUrl: string;
    apiKey: string;
    syncInterval: number; // minutos
  };
  emailService: {
    enabled: boolean;
    smtpHost: string;
    smtpPort: number;
    username: string;
    password: string;
  };
  webhooks: {
    enabled: boolean;
    endpoints: string[];
  };
  exportFormats: {
    excel: boolean;
    pdf: boolean;
    csv: boolean;
    json: boolean;
  };
}

interface WebhookEvent {
  id: string;
  timestamp: Date;
  event: string;
  data: any;
  status: 'pending' | 'sent' | 'failed';
  retryCount: number;
  endpoint: string;
}

interface IntegrationContextType {
  // Configuración
  config: IntegrationConfig;
  updateConfig: (config: Partial<IntegrationConfig>) => void;
  
  // Estado de integraciones
  isConnected: boolean;
  lastSync: Date | null;
  syncStatus: 'idle' | 'syncing' | 'error';
  
  // Webhooks
  webhookEvents: WebhookEvent[];
  addWebhookEvent: (event: Omit<WebhookEvent, 'id' | 'timestamp' | 'status' | 'retryCount'>) => void;
  processWebhooks: () => Promise<void>;
  
  // Integración contable
  syncWithAccounting: () => Promise<void>;
  exportToAccounting: (data: any, type: string) => Promise<void>;
  
  // Exportación de datos
  exportData: (format: 'excel' | 'pdf' | 'csv' | 'json', data: any, filename?: string) => Promise<void>;
  generateReport: (type: string, period: string) => Promise<any>;
  
  // APIs
  callExternalAPI: (endpoint: string, method: string, data?: any) => Promise<any>;
  validateAPIResponse: (response: any) => boolean;
  
  // Email
  sendEmail: (to: string, subject: string, body: string, attachments?: any[]) => Promise<void>;
  sendNotificationEmail: (type: string, data: any) => Promise<void>;
}

const IntegrationContext = createContext<IntegrationContextType | undefined>(undefined);

export function IntegrationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { products } = useProducts();
  const { getSalesHistory } = useSales();
  const { getReconciliations } = useReconciliation();
  
  const [config, setConfig] = useState<IntegrationConfig>({
    accountingSystem: {
      enabled: false,
      apiUrl: 'https://api.contabilidad.com',
      apiKey: '',
      syncInterval: 60
    },
    emailService: {
      enabled: false,
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      username: '',
      password: ''
    },
    webhooks: {
      enabled: false,
      endpoints: []
    },
    exportFormats: {
      excel: true,
      pdf: true,
      csv: true,
      json: true
    }
  });

  const [isConnected, setIsConnected] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const [webhookEvents, setWebhookEvents] = useState<WebhookEvent[]>([]);

  // Cargar configuración guardada
  useEffect(() => {
    const savedConfig = localStorage.getItem('pan-sinai-integration-config');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error('Error loading integration config:', error);
      }
    }

    const savedWebhooks = localStorage.getItem('pan-sinai-webhook-events');
    if (savedWebhooks) {
      try {
        const parsed = JSON.parse(savedWebhooks);
        setWebhookEvents(parsed.map((event: any) => ({
          ...event,
          timestamp: new Date(event.timestamp)
        })));
      } catch (error) {
        console.error('Error loading webhook events:', error);
      }
    }
  }, []);

  // Guardar configuración
  useEffect(() => {
    localStorage.setItem('pan-sinai-integration-config', JSON.stringify(config));
  }, [config]);

  // Guardar webhooks
  useEffect(() => {
    localStorage.setItem('pan-sinai-webhook-events', JSON.stringify(webhookEvents));
  }, [webhookEvents]);

  // Sincronización automática
  useEffect(() => {
    if (!config.accountingSystem.enabled) return;

    const interval = setInterval(() => {
      if (isConnected) {
        syncWithAccounting();
      }
    }, config.accountingSystem.syncInterval * 60 * 1000);

    return () => clearInterval(interval);
  }, [config.accountingSystem.enabled, config.accountingSystem.syncInterval, isConnected]);

  const updateConfig = (newConfig: Partial<IntegrationConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  // Simular conexión con sistema contable
  const syncWithAccounting = async (): Promise<void> => {
    if (!config.accountingSystem.enabled) {
      throw new Error('Integración contable no habilitada');
    }

    setSyncStatus('syncing');
    
    try {
      // Simular llamada a API contable
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const salesData = getSalesHistory();
      const reconciliationData = getReconciliations();
      
      // Simular envío de datos
      const accountingData = {
        sales: salesData.map(sale => ({
          id: sale.id,
          date: sale.date,
          customer: sale.customerName,
          total: sale.total,
          products: sale.products
        })),
        reconciliations: reconciliationData.map(rec => ({
          id: rec.id,
          date: rec.date,
          expectedAmount: rec.expectedAmount,
          actualAmount: rec.actualAmount,
          status: rec.status
        })),
        products: products.map(product => ({
          id: product.id,
          name: product.name,
          stock: product.stock,
          price: product.price
        }))
      };

      // Simular respuesta exitosa
      console.log('Datos sincronizados con sistema contable:', accountingData);
      
      setLastSync(new Date());
      setSyncStatus('idle');
      setIsConnected(true);
      
      // Agregar evento webhook
      addWebhookEvent({
        event: 'accounting_sync',
        data: accountingData,
        endpoint: config.accountingSystem.apiUrl
      });
      
    } catch (error) {
      console.error('Error syncing with accounting system:', error);
      setSyncStatus('error');
      setIsConnected(false);
    }
  };

  const exportToAccounting = async (data: any, type: string): Promise<void> => {
    if (!config.accountingSystem.enabled) {
      throw new Error('Integración contable no habilitada');
    }

    try {
      const response = await callExternalAPI(
        `${config.accountingSystem.apiUrl}/export`,
        'POST',
        {
          type,
          data,
          timestamp: new Date().toISOString(),
          source: 'pan-sinai'
        }
      );

      if (validateAPIResponse(response)) {
        console.log(`Datos exportados exitosamente a sistema contable: ${type}`);
      } else {
        throw new Error('Respuesta inválida del sistema contable');
      }
    } catch (error) {
      console.error('Error exporting to accounting system:', error);
      throw error;
    }
  };

  const addWebhookEvent = (event: Omit<WebhookEvent, 'id' | 'timestamp' | 'status' | 'retryCount'>) => {
    const webhookEvent: WebhookEvent = {
      ...event,
      id: Date.now().toString(),
      timestamp: new Date(),
      status: 'pending',
      retryCount: 0
    };

    setWebhookEvents(prev => [webhookEvent, ...prev]);
  };

  const processWebhooks = async (): Promise<void> => {
    if (!config.webhooks.enabled || webhookEvents.length === 0) return;

    const pendingEvents = webhookEvents.filter(event => event.status === 'pending');
    
    for (const event of pendingEvents) {
      try {
        // Simular envío de webhook
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Simular respuesta exitosa
        const success = Math.random() > 0.1; // 90% de éxito
        
        if (success) {
          setWebhookEvents(prev => 
            prev.map(e => 
              e.id === event.id ? { ...e, status: 'sent' } : e
            )
          );
        } else {
          throw new Error('Webhook failed');
        }
      } catch (error) {
        console.error(`Error processing webhook ${event.id}:`, error);
        
        setWebhookEvents(prev => 
          prev.map(e => 
            e.id === event.id ? { 
              ...e, 
              status: 'failed',
              retryCount: e.retryCount + 1
            } : e
          )
        );
      }
    }
  };

  const exportData = async (format: 'excel' | 'pdf' | 'csv' | 'json', data: any, filename?: string): Promise<void> => {
    if (!config.exportFormats[format]) {
      throw new Error(`Formato ${format} no habilitado`);
    }

    try {
      let content: string;
      let mimeType: string;
      let extension: string;

      switch (format) {
        case 'json':
          content = JSON.stringify(data, null, 2);
          mimeType = 'application/json';
          extension = 'json';
          break;
        case 'csv':
          content = convertToCSV(data);
          mimeType = 'text/csv';
          extension = 'csv';
          break;
        case 'excel':
          // Simular exportación a Excel
          content = 'Excel data would be generated here';
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          extension = 'xlsx';
          break;
        case 'pdf':
          // Simular exportación a PDF
          content = 'PDF data would be generated here';
          mimeType = 'application/pdf';
          extension = 'pdf';
          break;
        default:
          throw new Error(`Formato no soportado: ${format}`);
      }

      // Crear y descargar archivo
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `pan-sinai-export-${Date.now()}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log(`Datos exportados exitosamente en formato ${format}`);
    } catch (error) {
      console.error(`Error exporting data in ${format} format:`, error);
      throw error;
    }
  };

  const generateReport = async (type: string, period: string): Promise<any> => {
    try {
      const reportData = {
        type,
        period,
        generatedAt: new Date().toISOString(),
        user: user?.name,
        data: {}
      };

      switch (type) {
        case 'sales':
          reportData.data = {
            sales: getSalesHistory(),
            summary: {
              totalSales: getSalesHistory().length,
              totalRevenue: getSalesHistory().reduce((sum, sale) => sum + sale.total, 0)
            }
          };
          break;
        case 'inventory':
          reportData.data = {
            products,
            summary: {
              totalProducts: products.length,
              lowStock: products.filter(p => p.stock < 20).length
            }
          };
          break;
        case 'reconciliation':
          reportData.data = {
            reconciliations: getReconciliations(),
            summary: {
              totalReconciliations: getReconciliations().length,
              pending: getReconciliations().filter(r => r.status === 'with-differences').length
            }
          };
          break;
        default:
          throw new Error(`Tipo de reporte no soportado: ${type}`);
      }

      return reportData;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  };

  const callExternalAPI = async (endpoint: string, method: string, data?: any): Promise<any> => {
    try {
      // Simular llamada a API externa
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simular respuesta
      const response = {
        success: true,
        data: data || {},
        timestamp: new Date().toISOString(),
        endpoint,
        method
      };

      return response;
    } catch (error) {
      console.error('Error calling external API:', error);
      throw error;
    }
  };

  const validateAPIResponse = (response: any): boolean => {
    return response && 
           response.success && 
           response.data && 
           response.timestamp;
  };

  const sendEmail = async (to: string, subject: string, body: string, attachments?: any[]): Promise<void> => {
    if (!config.emailService.enabled) {
      throw new Error('Servicio de email no habilitado');
    }

    try {
      // Simular envío de email
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Email enviado:', { to, subject, body, attachments });
      
      // Agregar evento webhook
      addWebhookEvent({
        event: 'email_sent',
        data: { to, subject, body, attachments },
        endpoint: config.emailService.smtpHost
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  };

  const sendNotificationEmail = async (type: string, data: any): Promise<void> => {
    const emailTemplates = {
      low_stock: {
        subject: 'Alerta de Stock Bajo - Pan Sinai',
        body: `Se ha detectado stock bajo en los siguientes productos:\n${JSON.stringify(data, null, 2)}`
      },
      reconciliation: {
        subject: 'Conciliación Pendiente - Pan Sinai',
        body: `Hay conciliaciones pendientes que requieren atención:\n${JSON.stringify(data, null, 2)}`
      },
      daily_report: {
        subject: 'Reporte Diario - Pan Sinai',
        body: `Reporte diario de actividades:\n${JSON.stringify(data, null, 2)}`
      }
    };

    const template = emailTemplates[type as keyof typeof emailTemplates];
    if (!template) {
      throw new Error(`Template de email no encontrado: ${type}`);
    }

    // Enviar a gerentes
    const managers = ['gerente@pansinai.com', 'admin@pansinai.com'];
    
    for (const email of managers) {
      await sendEmail(email, template.subject, template.body);
    }
  };

  const convertToCSV = (data: any): string => {
    if (!Array.isArray(data) || data.length === 0) {
      return '';
    }

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value}"` : value;
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  };

  return (
    <IntegrationContext.Provider value={{
      config,
      updateConfig,
      isConnected,
      lastSync,
      syncStatus,
      webhookEvents,
      addWebhookEvent,
      processWebhooks,
      syncWithAccounting,
      exportToAccounting,
      exportData,
      generateReport,
      callExternalAPI,
      validateAPIResponse,
      sendEmail,
      sendNotificationEmail,
    }}>
      {children}
    </IntegrationContext.Provider>
  );
}

export function useIntegration() {
  const context = useContext(IntegrationContext);
  if (context === undefined) {
    throw new Error('useIntegration must be used within an IntegrationProvider');
  }
  return context;
} 