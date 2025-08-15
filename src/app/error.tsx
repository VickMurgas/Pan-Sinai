'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Algo salió mal
        </h1>
        
        <p className="text-gray-600 mb-6">
          Ha ocurrido un error inesperado. Por favor, intenta de nuevo.
        </p>
        
        {error.digest && (
          <div className="bg-gray-100 rounded-lg p-3 mb-6">
            <p className="text-sm text-gray-500">
              ID de Error: {error.digest}
            </p>
          </div>
        )}
        
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full bg-pan-sinai-gold text-pan-sinai-dark-brown py-3 px-6 rounded-lg hover:bg-pan-sinai-yellow transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Intentar de nuevo</span>
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <Home className="w-5 h-5" />
            <span>Ir al inicio</span>
          </button>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Si el problema persiste, contacta al soporte técnico.
          </p>
        </div>
      </div>
    </div>
  );
} 