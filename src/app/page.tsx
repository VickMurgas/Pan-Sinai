'use client';

import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/LoginForm';
import VendedorDashboard from '@/components/dashboards/VendedorDashboard';
import BodegueroDashboard from '@/components/dashboards/BodegueroDashboard';
import GerenteDashboard from '@/components/dashboards/GerenteDashboard';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pan-sinai-cream to-pan-sinai-light-brown flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-pan-sinai-dark-brown animate-spin mx-auto mb-4" />
          <p className="text-pan-sinai-dark-brown">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  // Renderizar dashboard según el rol
  switch (user.role) {
    case 'vendedor':
      return <VendedorDashboard />;
    case 'bodeguero':
      return <BodegueroDashboard />;
    case 'gerente':
      return <GerenteDashboard />;
    default:
      return <LoginForm />;
  }
} 