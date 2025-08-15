'use client';

import React, { useState } from 'react';
import { useReconciliation } from '@/contexts/ReconciliationContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock,
  DollarSign,
  FileText,
  Download,
  Send,
  Eye,
  Shield
} from 'lucide-react';

export default function Reconciliation() {
  const { user } = useAuth();
  const { 
    createReconciliation, 
    getReconciliations, 
    approveReconciliation,
    getRouteClosure,
    getDeposits
  } = useReconciliation();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isProcessing, setIsProcessing] = useState(false);
  const [reconciliationResult, setReconciliationResult] = useState<any>(null);
  const [showApproval, setShowApproval] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');

  // Obtener datos
  const reconciliations = getReconciliations(user?.id);
  const routeClosure = user ? getRouteClosure(user.id, selectedDate) : null;
  const deposits = user ? getDeposits(user.id, 'today') : [];

  const handleCreateReconciliation = async () => {
    if (!user) return;
    
    setIsProcessing(true);
    try {
      const reconciliation = await createReconciliation(user.id, selectedDate);
      setReconciliationResult(reconciliation);
    } catch (error) {
      alert('Error al crear la conciliación: ' + error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveReconciliation = async (reconciliationId: string) => {
    if (!user) return;
    
    try {
      approveReconciliation(reconciliationId, user.id, user.name, approvalNotes);
      setShowApproval(false);
      setApprovalNotes('');
      // Recargar datos
      window.location.reload();
    } catch (error) {
      alert('Error al aprobar la conciliación: ' + error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reconciled': return 'text-green-600 bg-green-50';
      case 'with-differences': return 'text-red-600 bg-red-50';
      case 'approved': return 'text-blue-600 bg-blue-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'reconciled': return <CheckCircle className="w-5 h-5" />;
      case 'with-differences': return <AlertTriangle className="w-5 h-5" />;
      case 'approved': return <Shield className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'reconciled': return 'Conciliado';
      case 'with-differences': return 'Con Diferencias';
      case 'approved': return 'Aprobado';
      default: return 'Pendiente';
    }
  };

  if (reconciliationResult) {
    return (
      <div className="space-y-6">
        {/* Header de resultado */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            {getStatusIcon(reconciliationResult.status)}
            <div>
              <h2 className="text-2xl font-bold text-pan-sinai-dark-brown">Conciliación Creada</h2>
              <p className="text-pan-sinai-brown">La conciliación se ha procesado exitosamente</p>
            </div>
          </div>
        </div>

        {/* Detalles de la conciliación */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-pan-sinai-dark-brown mb-6">Detalles de la Conciliación</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-pan-sinai-brown">Fecha</p>
                <p className="font-semibold text-pan-sinai-dark-brown">
                  {selectedDate.toLocaleDateString('es-ES')}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-pan-sinai-brown">Vendedor</p>
                <p className="font-semibold text-pan-sinai-dark-brown">{reconciliationResult.sellerName}</p>
              </div>
              
              <div>
                <p className="text-sm text-pan-sinai-brown">Estado</p>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reconciliationResult.status)}`}>
                  {getStatusText(reconciliationResult.status)}
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-pan-sinai-brown">Monto Esperado</p>
                <p className="text-xl font-bold text-pan-sinai-dark-brown">
                  ${reconciliationResult.expectedAmount.toFixed(2)}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-pan-sinai-brown">Monto Depositado</p>
                <p className="text-xl font-bold text-pan-sinai-dark-brown">
                  ${reconciliationResult.actualAmount.toFixed(2)}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-pan-sinai-brown">Diferencia</p>
                <div className="flex items-center space-x-2">
                  {Math.abs(reconciliationResult.difference) < 1 ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  )}
                  <p className={`text-xl font-bold ${
                    Math.abs(reconciliationResult.difference) < 1 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ${reconciliationResult.difference.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {Math.abs(reconciliationResult.difference) > 10 && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <p className="font-semibold text-red-800">Diferencia Significativa</p>
              </div>
              <p className="text-sm text-red-700">
                La diferencia es mayor a $10.00. Se requiere aprobación gerencial para proceder.
              </p>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-pan-sinai-dark-brown mb-4">Acciones</h3>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.print()}
              className="bg-pan-sinai-gold text-pan-sinai-dark-brown px-6 py-3 rounded-lg hover:bg-pan-sinai-yellow transition-colors font-medium flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>Imprimir Reporte</span>
            </button>
            
            <button
              onClick={() => setReconciliationResult(null)}
              className="bg-pan-sinai-brown text-white px-6 py-3 rounded-lg hover:bg-pan-sinai-dark-brown transition-colors font-medium"
            >
              Nueva Conciliación
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <CheckCircle className="w-8 h-8 text-pan-sinai-dark-brown" />
          <div>
            <h2 className="text-2xl font-bold text-pan-sinai-dark-brown">Conciliación</h2>
            <p className="text-pan-sinai-brown">Comparar ventas con depósitos bancarios</p>
          </div>
        </div>
      </div>

      {/* Resumen del día */}
      {routeClosure && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-pan-sinai-dark-brown mb-4">Resumen del Día</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600">Ventas del Día</p>
                  <p className="text-xl font-bold text-blue-800">${routeClosure.totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="text-sm text-green-600">Ruta Cerrada</p>
                  <p className="text-xl font-bold text-green-800">Sí</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Clock className="w-6 h-6 text-purple-600" />
                <div>
                  <p className="text-sm text-purple-600">Depósitos</p>
                  <p className="text-xl font-bold text-purple-800">{deposits.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulario de conciliación */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-pan-sinai-dark-brown mb-6">Crear Conciliación</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-pan-sinai-dark-brown mb-2">
              Fecha a Conciliar
            </label>
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pan-sinai-gold focus:border-transparent"
            />
          </div>

          {/* Validaciones */}
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-pan-sinai-dark-brown mb-3">Validaciones Requeridas</h4>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  {routeClosure ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="text-sm text-pan-sinai-dark-brown">
                    Ruta cerrada para la fecha seleccionada
                  </span>
                </div>
                
                <div className="flex items-center space-x-3">
                  {deposits.length > 0 ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="text-sm text-pan-sinai-dark-brown">
                    Depósito registrado para la fecha seleccionada
                  </span>
                </div>
                
                <div className="flex items-center space-x-3">
                  {!reconciliations.some(rec => {
                    const recDate = new Date(rec.date);
                    const targetDate = new Date(selectedDate);
                    return recDate.getTime() === targetDate.getTime();
                  }) ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="text-sm text-pan-sinai-dark-brown">
                    No existe conciliación previa para esta fecha
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleCreateReconciliation}
            disabled={!routeClosure || deposits.length === 0 || isProcessing}
            className="w-full bg-pan-sinai-brown text-white py-4 px-6 rounded-lg hover:bg-pan-sinai-dark-brown transition-colors font-medium text-lg flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Clock className="w-6 h-6 animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-6 h-6" />
                <span>Crear Conciliación</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Historial de conciliaciones */}
      {reconciliations.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-pan-sinai-dark-brown mb-6">Historial de Conciliaciones</h3>
          
          <div className="space-y-4">
            {reconciliations.slice(0, 10).map((reconciliation) => (
              <div key={reconciliation.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(reconciliation.status)}
                    <div>
                      <p className="font-semibold text-pan-sinai-dark-brown">
                        {reconciliation.sellerName}
                      </p>
                      <p className="text-sm text-pan-sinai-brown">
                        {new Date(reconciliation.date).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reconciliation.status)}`}>
                      {getStatusText(reconciliation.status)}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-pan-sinai-brown">Esperado:</span>
                    <span className="font-semibold text-pan-sinai-dark-brown ml-2">
                      ${reconciliation.expectedAmount.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-pan-sinai-brown">Real:</span>
                    <span className="font-semibold text-pan-sinai-dark-brown ml-2">
                      ${reconciliation.actualAmount.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-pan-sinai-brown">Diferencia:</span>
                    <span className={`font-semibold ml-2 ${
                      Math.abs(reconciliation.difference) < 1 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${reconciliation.difference.toFixed(2)}
                    </span>
                  </div>
                </div>

                {reconciliation.status === 'with-differences' && user?.role === 'Gerente' && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setShowApproval(true);
                        setApprovalNotes('');
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center space-x-2"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Aprobar Diferencia</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de aprobación */}
      {showApproval && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
            <div className="text-center mb-6">
              <Shield className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-pan-sinai-dark-brown mb-2">Aprobar Diferencia</h3>
              <p className="text-pan-sinai-brown">
                Como gerente, puedes aprobar diferencias en la conciliación
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-pan-sinai-dark-brown mb-2">
                  Notas de Aprobación
                </label>
                <textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pan-sinai-gold focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Explicar por qué se aprueba la diferencia..."
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowApproval(false)}
                  className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleApproveReconciliation(reconciliations[0].id)}
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Aprobar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 