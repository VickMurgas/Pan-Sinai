'use client';

import React, { useState } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  AlertCircle,
  Trash2,
  Settings
} from 'lucide-react';

export default function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications, settings, updateSettings } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'error':
        return 'border-l-red-500 bg-red-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  return (
    <>
      {/* Botón de notificaciones */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 text-pan-sinai-brown hover:text-pan-sinai-dark-brown transition-colors"
        >
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Panel de notificaciones */}
        {isOpen && (
          <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-pan-sinai-dark-brown">Notificaciones</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-1 text-pan-sinai-brown hover:text-pan-sinai-dark-brown transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-pan-sinai-brown hover:text-pan-sinai-dark-brown transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Configuración */}
            {showSettings && (
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h4 className="font-medium text-pan-sinai-dark-brown mb-3">Configuración</h4>
                <div className="space-y-2">
                  {Object.entries(settings).map(([key, value]) => (
                    <label key={key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => updateSettings({ [key]: e.target.checked })}
                        className="rounded text-pan-sinai-gold focus:ring-pan-sinai-gold"
                      />
                      <span className="text-sm text-pan-sinai-dark-brown">
                        {key === 'stockAlerts' && 'Alertas de stock'}
                        {key === 'customerReminders' && 'Recordatorios de clientes'}
                        {key === 'orderNotifications' && 'Notificaciones de pedidos'}
                        {key === 'reconciliationAlerts' && 'Alertas de conciliación'}
                        {key === 'systemNotifications' && 'Notificaciones del sistema'}
                        {key === 'soundEnabled' && 'Sonidos'}
                        {key === 'vibrationEnabled' && 'Vibración'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Lista de notificaciones */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-pan-sinai-brown">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No hay notificaciones</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {notifications.slice(0, 10).map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-l-4 ${getNotificationColor(notification.type)} ${
                        !notification.read ? 'bg-opacity-100' : 'bg-opacity-50'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium ${
                              !notification.read ? 'text-pan-sinai-dark-brown' : 'text-pan-sinai-brown'
                            }`}>
                              {notification.title}
                            </p>
                            <span className="text-xs text-pan-sinai-brown">
                              {formatTime(notification.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-pan-sinai-brown mt-1">
                            {notification.message}
                          </p>
                          {notification.action && (
                            <button
                              onClick={() => {
                                notification.action?.onClick();
                                markAsRead(notification.id);
                              }}
                              className="text-xs text-pan-sinai-gold hover:text-pan-sinai-yellow mt-2 font-medium"
                            >
                              {notification.action.label}
                            </button>
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1 text-pan-sinai-brown hover:text-pan-sinai-dark-brown transition-colors"
                            >
                              <CheckCircle className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1 text-pan-sinai-brown hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="flex items-center justify-between p-3 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-pan-sinai-brown hover:text-pan-sinai-dark-brown transition-colors"
                >
                  Marcar todas como leídas
                </button>
                <button
                  onClick={clearAllNotifications}
                  className="text-xs text-red-600 hover:text-red-700 transition-colors"
                >
                  Limpiar todas
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Overlay para cerrar */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
} 