'use client';

import React, { useState } from 'react';
import { useOffline } from '@/contexts/OfflineContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useSecurity } from '@/contexts/SecurityContext';
import { useIntegration } from '@/contexts/IntegrationContext';
import { 
  Settings, 
  Wifi, 
  Bell, 
  Shield, 
  Database, 
  Download, 
  Upload,
  Save,
  RefreshCw,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export default function AdvancedSettings() {
  const { syncData, createBackup, restoreBackup, validateDataIntegrity, repairData } = useOffline();
  const { settings: notificationSettings, updateSettings: updateNotificationSettings } = useNotifications();
  const { sessionConfig, updateSessionConfig } = useSecurity();
  const { config: integrationConfig, updateConfig: updateIntegrationConfig } = useIntegration();
  
  const [activeTab, setActiveTab] = useState<'offline' | 'notifications' | 'security' | 'integration'>('offline');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [backupData, setBackupData] = useState('');
  const [showRestoreModal, setShowRestoreModal] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncData();
      alert('Sincronización completada exitosamente');
    } catch (error) {
      alert('Error en la sincronización: ' + error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    try {
      const backup = await createBackup();
      setBackupData(backup);
      alert('Backup creado exitosamente');
    } catch (error) {
      alert('Error creando backup: ' + error);
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleRestoreBackup = async () => {
    if (!backupData.trim()) {
      alert('Por favor ingresa los datos del backup');
      return;
    }

    try {
      await restoreBackup(backupData);
      alert('Backup restaurado exitosamente. La página se recargará.');
    } catch (error) {
      alert('Error restaurando backup: ' + error);
    }
  };

  const handleRepairData = async () => {
    if (confirm('¿Estás seguro de que deseas reparar los datos? Esto puede resultar en pérdida de información.')) {
      try {
        await repairData();
        alert('Reparación de datos completada');
        window.location.reload();
      } catch (error) {
        alert('Error reparando datos: ' + error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Settings className="w-8 h-8 text-pan-sinai-dark-brown" />
          <div>
            <h2 className="text-2xl font-bold text-pan-sinai-dark-brown">Configuración Avanzada</h2>
            <p className="text-pan-sinai-brown">Gestionar configuraciones del sistema</p>
          </div>
        </div>
      </div>

      {/* Pestañas */}
      <div className="bg-white rounded-xl shadow-lg p-2">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('offline')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'offline'
                ? 'bg-pan-sinai-gold text-pan-sinai-dark-brown'
                : 'text-pan-sinai-brown hover:text-pan-sinai-dark-brown'
            }`}
          >
            <Wifi className="w-4 h-4 inline mr-2" />
            Modo Offline
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'notifications'
                ? 'bg-pan-sinai-gold text-pan-sinai-dark-brown'
                : 'text-pan-sinai-brown hover:text-pan-sinai-dark-brown'
            }`}
          >
            <Bell className="w-4 h-4 inline mr-2" />
            Notificaciones
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'security'
                ? 'bg-pan-sinai-gold text-pan-sinai-dark-brown'
                : 'text-pan-sinai-brown hover:text-pan-sinai-dark-brown'
            }`}
          >
            <Shield className="w-4 h-4 inline mr-2" />
            Seguridad
          </button>
          <button
            onClick={() => setActiveTab('integration')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'integration'
                ? 'bg-pan-sinai-gold text-pan-sinai-dark-brown'
                : 'text-pan-sinai-brown hover:text-pan-sinai-dark-brown'
            }`}
          >
            <Database className="w-4 h-4 inline mr-2" />
            Integraciones
          </button>
        </div>
      </div>

      {/* Contenido según pestaña */}
      {activeTab === 'offline' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-pan-sinai-dark-brown mb-6">Configuración Offline</h3>
          
          <div className="space-y-6">
            {/* Sincronización */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-pan-sinai-dark-brown mb-3">Sincronización de Datos</h4>
              <div className="space-y-3">
                <button
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  {isSyncing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Ahora'}</span>
                </button>
                <p className="text-sm text-pan-sinai-brown">
                  Sincroniza todos los datos locales con el servidor
                </p>
              </div>
            </div>

            {/* Backup y Restauración */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-pan-sinai-dark-brown mb-3">Backup y Restauración</h4>
              <div className="space-y-3">
                <button
                  onClick={handleCreateBackup}
                  disabled={isCreatingBackup}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>{isCreatingBackup ? 'Creando...' : 'Crear Backup'}</span>
                </button>
                
                <button
                  onClick={() => setShowRestoreModal(true)}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Restaurar Backup</span>
                </button>
                
                <p className="text-sm text-pan-sinai-brown">
                  Crea una copia de seguridad de todos los datos
                </p>
              </div>
            </div>

            {/* Reparación de Datos */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-pan-sinai-dark-brown mb-3">Mantenimiento</h4>
              <div className="space-y-3">
                <button
                  onClick={handleRepairData}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Reparar Datos</span>
                </button>
                
                <p className="text-sm text-pan-sinai-brown">
                  Repara datos corruptos (¡Cuidado! Puede resultar en pérdida de datos)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-pan-sinai-dark-brown mb-6">Configuración de Notificaciones</h3>
          
          <div className="space-y-4">
            {Object.entries(notificationSettings).map(([key, value]) => (
              <label key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <span className="font-medium text-pan-sinai-dark-brown">
                    {key === 'stockAlerts' && 'Alertas de Stock Bajo'}
                    {key === 'customerReminders' && 'Recordatorios de Clientes'}
                    {key === 'orderNotifications' && 'Notificaciones de Pedidos'}
                    {key === 'reconciliationAlerts' && 'Alertas de Conciliación'}
                    {key === 'systemNotifications' && 'Notificaciones del Sistema'}
                    {key === 'soundEnabled' && 'Sonidos de Notificación'}
                    {key === 'vibrationEnabled' && 'Vibración'}
                  </span>
                  <p className="text-sm text-pan-sinai-brown">
                    {key === 'stockAlerts' && 'Recibir alertas cuando el stock esté bajo'}
                    {key === 'customerReminders' && 'Recordatorios de clientes por visitar'}
                    {key === 'orderNotifications' && 'Notificaciones de nuevos pedidos'}
                    {key === 'reconciliationAlerts' && 'Alertas de diferencias en conciliación'}
                    {key === 'systemNotifications' && 'Notificaciones del navegador'}
                    {key === 'soundEnabled' && 'Reproducir sonidos para notificaciones'}
                    {key === 'vibrationEnabled' && 'Vibración en dispositivos móviles'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => updateNotificationSettings({ [key]: e.target.checked })}
                  className="rounded text-pan-sinai-gold focus:ring-pan-sinai-gold"
                />
              </label>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-pan-sinai-dark-brown mb-6">Configuración de Seguridad</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-pan-sinai-dark-brown mb-2">
                  Timeout de Sesión (minutos)
                </label>
                <input
                  type="number"
                  value={sessionConfig.timeoutMinutes}
                  onChange={(e) => updateSessionConfig({ timeoutMinutes: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pan-sinai-gold focus:border-transparent"
                  min="5"
                  max="120"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-pan-sinai-dark-brown mb-2">
                  Advertencia (minutos antes)
                </label>
                <input
                  type="number"
                  value={sessionConfig.warningMinutes}
                  onChange={(e) => updateSessionConfig({ warningMinutes: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pan-sinai-gold focus:border-transparent"
                  min="1"
                  max="10"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-pan-sinai-dark-brown mb-2">
                  Máximo Intentos de Login
                </label>
                <input
                  type="number"
                  value={sessionConfig.maxLoginAttempts}
                  onChange={(e) => updateSessionConfig({ maxLoginAttempts: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pan-sinai-gold focus:border-transparent"
                  min="3"
                  max="10"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-pan-sinai-dark-brown mb-2">
                  Duración de Bloqueo (minutos)
                </label>
                <input
                  type="number"
                  value={sessionConfig.lockoutDurationMinutes}
                  onChange={(e) => updateSessionConfig({ lockoutDurationMinutes: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pan-sinai-gold focus:border-transparent"
                  min="5"
                  max="60"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'integration' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-pan-sinai-dark-brown mb-6">Configuración de Integraciones</h3>
          
          <div className="space-y-6">
            {/* Sistema Contable */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-pan-sinai-dark-brown mb-3">Sistema Contable</h4>
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={integrationConfig.accountingSystem.enabled}
                    onChange={(e) => updateIntegrationConfig({
                      accountingSystem: {
                        ...integrationConfig.accountingSystem,
                        enabled: e.target.checked
                      }
                    })}
                    className="rounded text-pan-sinai-gold focus:ring-pan-sinai-gold"
                  />
                  <span className="text-sm text-pan-sinai-dark-brown">Habilitar integración contable</span>
                </label>
                
                <div>
                  <label className="block text-sm font-medium text-pan-sinai-dark-brown mb-1">
                    URL de la API
                  </label>
                  <input
                    type="url"
                    value={integrationConfig.accountingSystem.apiUrl}
                    onChange={(e) => updateIntegrationConfig({
                      accountingSystem: {
                        ...integrationConfig.accountingSystem,
                        apiUrl: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pan-sinai-gold focus:border-transparent"
                    placeholder="https://api.contabilidad.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-pan-sinai-dark-brown mb-1">
                    Clave de API
                  </label>
                  <input
                    type="password"
                    value={integrationConfig.accountingSystem.apiKey}
                    onChange={(e) => updateIntegrationConfig({
                      accountingSystem: {
                        ...integrationConfig.accountingSystem,
                        apiKey: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pan-sinai-gold focus:border-transparent"
                    placeholder="Ingresa tu clave de API"
                  />
                </div>
              </div>
            </div>

            {/* Formatos de Exportación */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-pan-sinai-dark-brown mb-3">Formatos de Exportación</h4>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(integrationConfig.exportFormats).map(([format, enabled]) => (
                  <label key={format} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => updateIntegrationConfig({
                        exportFormats: {
                          ...integrationConfig.exportFormats,
                          [format]: e.target.checked
                        }
                      })}
                      className="rounded text-pan-sinai-gold focus:ring-pan-sinai-gold"
                    />
                    <span className="text-sm text-pan-sinai-dark-brown uppercase">{format}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Restauración */}
      {showRestoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-pan-sinai-dark-brown mb-4">Restaurar Backup</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-pan-sinai-dark-brown mb-2">
                  Datos del Backup
                </label>
                <textarea
                  value={backupData}
                  onChange={(e) => setBackupData(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pan-sinai-gold focus:border-transparent resize-none"
                  rows={6}
                  placeholder="Pega aquí los datos del backup..."
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowRestoreModal(false)}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRestoreBackup}
                  className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Restaurar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 