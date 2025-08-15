'use client';

import React from 'react';
import { useOffline } from '@/contexts/OfflineContext';
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

export default function ConnectionStatus() {
  const { isOnline, syncStatus } = useOffline();

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Nunca';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m atrás`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    
    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 min-w-[200px]">
        {/* Estado de conexión */}
        <div className="flex items-center space-x-2 mb-2">
          {isOnline ? (
            <Wifi className="w-4 h-4 text-green-600" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-600" />
          )}
          <span className={`text-sm font-medium ${
            isOnline ? 'text-green-600' : 'text-red-600'
          }`}>
            {isOnline ? 'En línea' : 'Sin conexión'}
          </span>
        </div>

        {/* Estado de sincronización */}
        {isOnline && (
          <div className="space-y-2">
            {syncStatus.isSyncing ? (
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                <span className="text-sm text-blue-600">Sincronizando...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600">Sincronizado</span>
              </div>
            )}

            {/* Progreso de sincronización */}
            {syncStatus.isSyncing && (
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div 
                  className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${syncStatus.syncProgress}%` }}
                />
              </div>
            )}

            {/* Última sincronización */}
            <div className="text-xs text-gray-500">
              Última sincronización: {formatLastSync(syncStatus.lastSync)}
            </div>

            {/* Acciones pendientes */}
            {syncStatus.pendingActions > 0 && (
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-600">
                  {syncStatus.pendingActions} acción(es) pendiente(s)
                </span>
              </div>
            )}
          </div>
        )}

        {/* Modo offline */}
        {!isOnline && (
          <div className="text-xs text-gray-500">
            Los datos se guardan localmente
          </div>
        )}
      </div>
    </div>
  );
} 