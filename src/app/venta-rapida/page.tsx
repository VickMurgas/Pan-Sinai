'use client';

import React, { useState } from 'react';
import VentaRapida from '../../components/sales/VentaRapida';
import GestionDevoluciones from '../../components/sales/GestionDevoluciones';
import VentaRapidaStats from '../../components/sales/VentaRapidaStats';
import { ShoppingCart, RefreshCw, BarChart3, X } from 'lucide-react';

export default function VentaRapidaPage() {
  const [activeTab, setActiveTab] = useState<'venta' | 'devoluciones' | 'stats'>('venta');
  const [showStats, setShowStats] = useState(false);

  const tabs = [
    {
      id: 'venta',
      name: 'Venta Rápida',
      icon: ShoppingCart,
      description: 'Procesa ventas súper rápido'
    },
    {
      id: 'devoluciones',
      name: 'Devoluciones',
      icon: RefreshCw,
      description: 'Gestiona devoluciones e intercambios'
    }
  ];

  return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-900">Sistema de Ventas Rápidas</h1>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  Panadería Medrano Flores
                </span>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowStats(!showStats)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Estadísticas</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'venta' | 'devoluciones')}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Panel de Estadísticas (Sidebar) */}
            {showStats && (
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Estadísticas</h2>
                    <button
                      onClick={() => setShowStats(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <VentaRapidaStats />
                </div>
              </div>
            )}

            {/* Contenido Principal */}
            <div className={showStats ? 'lg:col-span-3' : 'lg:col-span-4'}>
              {activeTab === 'venta' && <VentaRapida />}
              {activeTab === 'devoluciones' && <GestionDevoluciones />}
            </div>
          </div>
        </div>

        {/* Floating Stats Button (when stats sidebar is hidden) */}
        {!showStats && (
          <button
            onClick={() => setShowStats(true)}
            className="fixed bottom-6 right-6 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
          >
            <BarChart3 className="w-6 h-6" />
          </button>
        )}
      </div>
  );
} 