'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface SafeInitializerProps {
  children: React.ReactNode;
}

export default function SafeInitializer({ children }: SafeInitializerProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular inicialización de contextos
    const initializeApp = async () => {
      try {
        // Verificar que localStorage esté disponible
        if (typeof window !== 'undefined') {
          // Cargar datos iniciales si no existen
          const hasInitialData = localStorage.getItem('pan-sinai-initialized');
          
          if (!hasInitialData) {
            // Inicializar datos por defecto
            localStorage.setItem('pan-sinai-initialized', 'true');
            
            // Datos de prueba para usuarios
            const defaultUsers = [
              { id: '1', name: 'Juan Vendedor', role: 'Vendedor', username: 'vendedor', password: '123' },
              { id: '2', name: 'María Bodeguera', role: 'Bodeguero', username: 'bodeguero', password: '123' },
              { id: '3', name: 'Carlos Gerente', role: 'Gerente', username: 'gerente', password: '123' }
            ];
            localStorage.setItem('pan-sinai-users', JSON.stringify(defaultUsers));
            
            // Datos de prueba para productos
            const defaultProducts = [
              { id: '1', code: 'B01', name: 'Muffin Naranja', price: 1.25, stock: 15, category: 'pan_dulce' },
              { id: '2', code: 'B02', name: 'Torta Fresa', price: 2.50, stock: 8, category: 'pan_dulce' },
              { id: '3', code: 'T01', name: 'Torta Yema', price: 8.00, stock: 3, category: 'tortas' }
            ];
            localStorage.setItem('pan-sinai-products', JSON.stringify(defaultProducts));
            
            // Datos de prueba para clientes
            const defaultCustomers = [
              { id: '1', businessName: 'Tienda San Miguel', owner: 'Juan Pérez', phone: '7123-4567', address: 'Calle Principal #123' },
              { id: '2', businessName: 'Súper López', owner: 'María López', phone: '7123-4568', address: 'Av. Central #456' },
              { id: '3', businessName: 'Mini Market Ana', owner: 'Ana Martínez', phone: '7123-4569', address: 'Col. San José #789' }
            ];
            localStorage.setItem('pan-sinai-customers', JSON.stringify(defaultCustomers));
          }
        }
        
        // Simular delay de carga
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Error during initialization:', error);
        // Continuar incluso si hay errores
        setIsInitialized(true);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pan-sinai-cream to-pan-sinai-light-brown flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-pan-sinai-gold rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-pan-sinai-dark-brown animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-pan-sinai-dark-brown mb-2">
            Inicializando Pan Sinai
          </h2>
          <p className="text-pan-sinai-brown">
            Cargando sistema de pedidos ultra-rápido...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 