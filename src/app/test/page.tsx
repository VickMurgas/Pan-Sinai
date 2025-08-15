'use client';

import React from 'react';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          ✅ Sistema Funcionando Correctamente
        </h1>
        <p className="text-gray-600 mb-4">
          El sistema de ventas rápidas está funcionando correctamente.
        </p>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Tailwind CSS cargado</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Next.js funcionando</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">React cargado</span>
          </div>
        </div>
        <div className="mt-6">
          <a 
            href="/venta-rapida" 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ir al Sistema de Ventas Rápidas
          </a>
        </div>
      </div>
    </div>
  );
} 