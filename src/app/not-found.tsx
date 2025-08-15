'use client';

import { Search, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <Search className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Página no encontrada
        </h1>
        
        <p className="text-gray-600 mb-6">
          La página que buscas no existe o ha sido movida.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver atrás</span>
          </button>
          
          <Link
            href="/"
            className="w-full bg-pan-sinai-gold text-pan-sinai-dark-brown py-3 px-6 rounded-lg hover:bg-pan-sinai-yellow transition-colors font-medium flex items-center justify-center space-x-2 inline-block"
          >
            <Home className="w-5 h-5" />
            <span>Ir al inicio</span>
          </Link>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Error 404 - Página no encontrada
          </p>
        </div>
      </div>
    </div>
  );
} 