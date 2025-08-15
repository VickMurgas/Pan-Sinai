'use client';

import React from 'react';
import { useSecurity } from '@/contexts/SecurityContext';
import { Clock, AlertTriangle, RefreshCw } from 'lucide-react';

export default function SessionWarning() {
  const { showSessionWarning, sessionTimeRemaining, extendSession } = useSecurity();

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!showSessionWarning) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
        <div className="text-center">
          {/* Icono */}
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>

          {/* Título */}
          <h3 className="text-xl font-bold text-pan-sinai-dark-brown mb-2">
            Sesión Próxima a Expirar
          </h3>

          {/* Mensaje */}
          <p className="text-pan-sinai-brown mb-6">
            Tu sesión expirará en <span className="font-semibold text-red-600">
              {formatTime(sessionTimeRemaining)}
            </span> por inactividad.
          </p>

          {/* Tiempo restante */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-2">
              <Clock className="w-5 h-5 text-pan-sinai-brown" />
              <span className="text-lg font-mono font-bold text-pan-sinai-dark-brown">
                {formatTime(sessionTimeRemaining)}
              </span>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div 
              className="bg-red-500 h-2 rounded-full transition-all duration-1000"
              style={{ 
                width: `${(sessionTimeRemaining / (5 * 60 * 1000)) * 100}%` 
              }}
            />
          </div>

          {/* Botones */}
          <div className="flex space-x-3">
            <button
              onClick={extendSession}
              className="flex-1 bg-pan-sinai-gold text-pan-sinai-dark-brown py-3 px-4 rounded-lg hover:bg-pan-sinai-yellow transition-colors font-medium flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Extender Sesión</span>
            </button>
          </div>

          {/* Información adicional */}
          <p className="text-xs text-pan-sinai-brown mt-4">
            Tu sesión se extenderá automáticamente si continúas usando la aplicación.
          </p>
        </div>
      </div>
    </div>
  );
} 