import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProductProvider } from '@/contexts/ProductContext';
import { CustomerProvider } from '@/contexts/CustomerContext';
import { SalesProvider } from '@/contexts/SalesContext';
import { ReportsProvider } from '@/contexts/ReportsContext';
import { ReconciliationProvider } from '@/contexts/ReconciliationContext';
import { OfflineProvider } from '@/contexts/OfflineContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { SecurityProvider } from '@/contexts/SecurityContext';
import { IntegrationProvider } from '@/contexts/IntegrationContext';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import SafeInitializer from '@/components/ui/SafeInitializer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Pan Sinai - Sistema de Gestión de Ventas',
  description: 'Sistema digital para gestión de ventas y stock de Pan Sinai',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          <ProductProvider>
            <CustomerProvider>
              <SalesProvider>
                <ReportsProvider>
                  <ReconciliationProvider>
                    <OfflineProvider>
                      <NotificationProvider>
                        <SecurityProvider>
                          <IntegrationProvider>
                            <ErrorBoundary>
                              <SafeInitializer>
                                {children}
                              </SafeInitializer>
                            </ErrorBoundary>
                          </IntegrationProvider>
                        </SecurityProvider>
                      </NotificationProvider>
                    </OfflineProvider>
                  </ReconciliationProvider>
                </ReportsProvider>
              </SalesProvider>
            </CustomerProvider>
          </ProductProvider>
        </AuthProvider>
      </body>
    </html>
  );
} 