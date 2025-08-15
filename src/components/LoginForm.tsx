'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, LogIn, Eye, EyeOff, ChevronDown, Zap } from 'lucide-react';
import Logo from './ui/Logo';

// Perfiles predefinidos para demo
const DEMO_PROFILES = [
  {
    id: 'vendedor',
    name: 'Vendedor',
    email: 'vendedor@pan-sinai.com',
    password: '123456',
    description: 'Gestión de ventas y rutas',
    icon: '🛒'
  },
  {
    id: 'bodeguero',
    name: 'Bodeguero',
    email: 'bodeguero@pan-sinai.com',
    password: '123456',
    description: 'Gestión de inventario',
    icon: '📦'
  },
  {
    id: 'gerente',
    name: 'Gerente',
    email: 'gerente@pan-sinai.com',
    password: '123456',
    description: 'Reportes y análisis',
    icon: '📊'
  }
];

export default function LoginForm() {
  const [selectedProfile, setSelectedProfile] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { login, isLoading } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Obtener perfil seleccionado
  const currentProfile = DEMO_PROFILES.find(p => p.id === selectedProfile);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleProfileSelect = (profileId: string) => {
    setSelectedProfile(profileId);
    setIsDropdownOpen(false);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!currentProfile) {
      setError('Por favor selecciona un perfil');
      return;
    }
    
    const success = await login(currentProfile.email, currentProfile.password);
    if (!success) {
      setError('Error al iniciar sesión. Intente nuevamente.');
    }
  };

  const handleQuickLogin = async (profileId: string) => {
    const profile = DEMO_PROFILES.find(p => p.id === profileId);
    if (profile) {
      setError('');
      const success = await login(profile.email, profile.password);
      if (!success) {
        setError('Error al iniciar sesión. Intente nuevamente.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pan-sinai-cream to-pan-sinai-light-brown flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Logo centrado */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="xl" showText={false} />
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-pan-sinai-gold to-pan-sinai-yellow rounded-full mx-auto mb-4"></div>
        </div>

        {/* Información de demo */}
        <div className="mb-6 p-4 bg-gradient-to-r from-pan-sinai-gold to-pan-sinai-yellow rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-5 h-5 text-pan-sinai-dark-brown" />
            <h3 className="font-semibold text-pan-sinai-dark-brown">Demo Rápido</h3>
          </div>
          <p className="text-sm text-pan-sinai-dark-brown">
            Selecciona un perfil para iniciar sesión automáticamente
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Dropdown de perfiles */}
          <div>
            <label className="block text-sm font-medium text-pan-sinai-dark-brown mb-2">
              Seleccionar Perfil
            </label>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pan-sinai-gold focus:border-transparent transition-all flex items-center justify-between bg-white"
              >
                <div className="flex items-center space-x-3">
                  {currentProfile ? (
                    <>
                      <span className="text-2xl">{currentProfile.icon}</span>
                      <div className="text-left">
                        <div className="font-medium text-pan-sinai-dark-brown">{currentProfile.name}</div>
                        <div className="text-sm text-pan-sinai-brown">{currentProfile.description}</div>
                      </div>
                    </>
                  ) : (
                    <span className="text-pan-sinai-brown">Selecciona un perfil...</span>
                  )}
                </div>
                <ChevronDown className={`w-5 h-5 text-pan-sinai-brown transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown menu */}
              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg" ref={dropdownRef}>
                  {DEMO_PROFILES.map((profile) => (
                    <button
                      key={profile.id}
                      type="button"
                      onClick={() => handleProfileSelect(profile.id)}
                      className="w-full px-4 py-3 text-left hover:bg-pan-sinai-cream transition-colors flex items-center space-x-3 border-b border-gray-100 last:border-b-0"
                    >
                      <span className="text-2xl">{profile.icon}</span>
                      <div>
                        <div className="font-medium text-pan-sinai-dark-brown">{profile.name}</div>
                        <div className="text-sm text-pan-sinai-brown">{profile.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Información del perfil seleccionado */}
          {currentProfile && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-pan-sinai-brown">Email:</span>
                <span className="text-sm font-medium text-pan-sinai-dark-brown">{currentProfile.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-pan-sinai-brown">Contraseña:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-mono text-pan-sinai-dark-brown">
                    {showPassword ? currentProfile.password : '••••••'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-pan-sinai-brown"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !currentProfile}
            className="w-full bg-gradient-to-r from-pan-sinai-gold to-pan-sinai-yellow text-pan-sinai-dark-brown font-semibold py-3 px-6 rounded-lg hover:from-pan-sinai-yellow hover:to-pan-sinai-gold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-pan-sinai-dark-brown border-t-transparent rounded-full animate-spin" />
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            <span>{isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}</span>
          </button>
        </form>

        {/* Acceso rápido */}
        <div className="mt-6">
          <p className="text-sm text-pan-sinai-brown text-center mb-3">Acceso rápido:</p>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_PROFILES.map((profile) => (
              <button
                key={profile.id}
                onClick={() => handleQuickLogin(profile.id)}
                disabled={isLoading}
                className="p-3 bg-gray-100 hover:bg-pan-sinai-gold text-pan-sinai-dark-brown rounded-lg transition-colors disabled:opacity-50 flex flex-col items-center space-y-1"
              >
                <span className="text-xl">{profile.icon}</span>
                <span className="text-xs font-medium">{profile.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-6 p-4 bg-pan-sinai-cream rounded-lg">
          <h3 className="font-semibold text-pan-sinai-dark-brown mb-2 text-sm">Sistema Ultra-Rápido</h3>
          <div className="space-y-1 text-xs text-pan-sinai-brown">
            <p>• Búsqueda express de clientes</p>
            <p>• Escaneo QR instantáneo</p>
            <p>• Carrito inteligente flotante</p>
            <p>• Procesamiento ultra-rápido</p>
          </div>
        </div>
      </div>
    </div>
  );
} 