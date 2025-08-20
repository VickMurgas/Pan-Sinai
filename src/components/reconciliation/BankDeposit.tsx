'use client';

import React, { useState } from 'react';
import { useReconciliation } from '@/contexts/ReconciliationContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  Upload,
  Calculator,
  Building2,
  Clock
} from 'lucide-react';

export default function BankDeposit() {
  const { user } = useAuth();
  const { registerDeposit, getRouteClosure, getDeposits } = useReconciliation();

  const [amount, setAmount] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [reference, setReference] = useState('');
  const [justification, setJustification] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [depositResult, setDepositResult] = useState<any>(null);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);

  // Obtener datos del día
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const routeClosure = user ? getRouteClosure(user.id, today) : null;
  const todayDeposits = user ? getDeposits(user.id, 'today') : [];
  const expectedAmount = routeClosure?.totalRevenue || 0;
  const difference = parseFloat(amount) - expectedAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !amount || !bankAccount || !reference) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirmDeposit = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const deposit = await registerDeposit(
        user.id,
        user.name,
        parseFloat(amount),
        bankAccount,
        reference,
        justification,
        receiptImage || undefined
      );
      setDepositResult(deposit);
      setShowConfirmation(false);

      // Limpiar formulario
      setAmount('');
      setBankAccount('');
      setReference('');
      setJustification('');
      setReceiptImage(null);
    } catch (error) {
      alert('Error al registrar el depósito: ' + error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDifferenceColor = () => {
    if (Math.abs(difference) < 1) return 'text-green-600';
    if (Math.abs(difference) < 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDifferenceIcon = () => {
    if (Math.abs(difference) < 1) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (Math.abs(difference) < 10) return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  if (depositResult) {
    return (
      <div className="space-y-6">
        {/* Header de éxito */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <h2 className="text-2xl font-bold text-pan-sinai-dark-brown">Depósito Registrado</h2>
              <p className="text-pan-sinai-brown">El depósito se ha registrado exitosamente</p>
            </div>
          </div>
        </div>

        {/* Detalles del depósito */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-pan-sinai-dark-brown mb-6">Detalles del Depósito</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-pan-sinai-brown">Monto Depositado</p>
                <p className="text-2xl font-bold text-pan-sinai-dark-brown">${depositResult.amount.toFixed(2)}</p>
              </div>

              <div>
                <p className="text-sm text-pan-sinai-brown">Cuenta Bancaria</p>
                <p className="font-semibold text-pan-sinai-dark-brown">{depositResult.bankAccount}</p>
              </div>

              <div>
                <p className="text-sm text-pan-sinai-brown">Referencia</p>
                <p className="font-semibold text-pan-sinai-dark-brown">{depositResult.reference}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-pan-sinai-brown">Monto Esperado</p>
                <p className="text-lg font-semibold text-pan-sinai-dark-brown">${depositResult.expectedAmount.toFixed(2)}</p>
              </div>

              <div>
                <p className="text-sm text-pan-sinai-brown">Diferencia</p>
                <div className="flex items-center space-x-2">
                  {getDifferenceIcon()}
                  <p className={`text-lg font-semibold ${getDifferenceColor()}`}>
                    ${depositResult.difference.toFixed(2)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-pan-sinai-brown">Estado</p>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  depositResult.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  depositResult.status === 'verified' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {depositResult.status === 'pending' ? 'Pendiente' :
                   depositResult.status === 'verified' ? 'Verificado' : 'Rechazado'}
                </span>
              </div>
            </div>
          </div>

          {depositResult.receipt && (
            <div className="mt-6">
              <p className="text-sm font-semibold text-pan-sinai-dark-brown mb-2">Comprobante</p>
              <img src={depositResult.receipt} alt="Comprobante del depósito" className="max-h-72 rounded-lg border border-gray-200" />
            </div>
          )}

          {depositResult.justification && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-semibold text-pan-sinai-dark-brown mb-2">Justificación</p>
              <p className="text-pan-sinai-brown">{depositResult.justification}</p>
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
              <span>Imprimir Comprobante</span>
            </button>

            <button
              onClick={() => setDepositResult(null)}
              className="bg-pan-sinai-brown text-white px-6 py-3 rounded-lg hover:bg-pan-sinai-dark-brown transition-colors font-medium"
            >
              Nuevo Depósito
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
          <Building2 className="w-8 h-8 text-pan-sinai-dark-brown" />
          <div>
            <h2 className="text-2xl font-bold text-pan-sinai-dark-brown">Registro de Depósito</h2>
            <p className="text-pan-sinai-brown">Registrar depósito bancario del día</p>
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
                  <p className="text-sm text-blue-600">Total Recaudado</p>
                  <p className="text-xl font-bold text-blue-800">${expectedAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="text-sm text-green-600">Ventas Realizadas</p>
                  <p className="text-xl font-bold text-green-800">{routeClosure.totalSales}</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Clock className="w-6 h-6 text-purple-600" />
                <div>
                  <p className="text-sm text-purple-600">Fecha</p>
                  <p className="text-xl font-bold text-purple-800">
                    {today.toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulario de depósito */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-pan-sinai-dark-brown mb-6">Información del Depósito</h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-pan-sinai-dark-brown mb-2">
                Monto Depositado *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pan-sinai-brown">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pan-sinai-gold focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-pan-sinai-dark-brown mb-2">
                Cuenta Bancaria *
              </label>
              <select
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pan-sinai-gold focus:border-transparent"
                required
              >
                <option value="">Seleccionar cuenta</option>
                <option value="BANCO AGRICOLA - 123456789">BANCO AGRICOLA - 123456789</option>
                <option value="BANCO CUSCATLAN - 987654321">BANCO CUSCATLAN - 987654321</option>
                <option value="BANCO DAVIVIENDA - 456789123">BANCO DAVIVIENDA - 456789123</option>
                <option value="BANCO SCOTIABANK - 789123456">BANCO SCOTIABANK - 789123456</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-pan-sinai-dark-brown mb-2">
              Número de Referencia *
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pan-sinai-gold focus:border-transparent"
              placeholder="Ej: DEP-2024-001"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-pan-sinai-dark-brown mb-2">
              Foto del comprobante (opcional)
            </label>
            <div className="flex items-start space-x-4">
              <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-pan-sinai-dark-brown hover:bg-gray-50">
                <Upload className="w-4 h-4 mr-2" />
                <span>Subir imagen</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      setReceiptImage(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </label>

              {receiptImage && (
                <div className="flex-1">
                  <div className="text-xs text-pan-sinai-brown mb-2">Vista previa:</div>
                  <img src={receiptImage} alt="Comprobante" className="max-h-40 rounded-lg border border-gray-200" />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-pan-sinai-dark-brown mb-2">
              Justificación (Opcional)
            </label>
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pan-sinai-gold focus:border-transparent resize-none"
              rows={3}
              placeholder="Explicar diferencias si las hay..."
            />
          </div>

          {/* Validación de diferencias */}
          {amount && expectedAmount > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-pan-sinai-dark-brown">Validación</span>
                {getDifferenceIcon()}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-pan-sinai-brown">Esperado:</span>
                  <span className="font-semibold text-pan-sinai-dark-brown ml-2">${expectedAmount.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-pan-sinai-brown">Depositado:</span>
                  <span className="font-semibold text-pan-sinai-dark-brown ml-2">${parseFloat(amount).toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-pan-sinai-brown">Diferencia:</span>
                  <span className={`font-semibold ml-2 ${getDifferenceColor()}`}>
                    ${difference.toFixed(2)}
                  </span>
                </div>
              </div>

              {Math.abs(difference) > 10 && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    <AlertTriangle className="w-4 h-4 inline mr-2" />
                    Diferencia significativa detectada. Asegúrate de justificar la diferencia.
                  </p>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={!amount || !bankAccount || !reference || isSubmitting}
            className="w-full bg-pan-sinai-brown text-white py-4 px-6 rounded-lg hover:bg-pan-sinai-dark-brown transition-colors font-medium text-lg flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <DollarSign className="w-6 h-6" />
            <span>Registrar Depósito</span>
          </button>
        </form>
      </div>

      {/* Confirmación */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
            <div className="text-center mb-6">
              <DollarSign className="w-16 h-16 text-pan-sinai-dark-brown mx-auto mb-4" />
              <h3 className="text-xl font-bold text-pan-sinai-dark-brown mb-2">Confirmar Depósito</h3>
              <p className="text-pan-sinai-brown">
                ¿Estás seguro de que deseas registrar este depósito?
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-pan-sinai-brown">Monto:</span>
                    <span className="font-semibold text-pan-sinai-dark-brown">${parseFloat(amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-pan-sinai-brown">Cuenta:</span>
                    <span className="font-semibold text-pan-sinai-dark-brown">{bankAccount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-pan-sinai-brown">Referencia:</span>
                    <span className="font-semibold text-pan-sinai-dark-brown">{reference}</span>
                  </div>
                  {Math.abs(difference) > 1 && (
                    <div className="flex justify-between">
                      <span className="text-pan-sinai-brown">Diferencia:</span>
                      <span className={`font-semibold ${getDifferenceColor()}`}>${difference.toFixed(2)}</span>
                    </div>
                  )}
                  {receiptImage && (
                    <div className="pt-3">
                      <div className="text-pan-sinai-brown mb-2">Comprobante:</div>
                      <img src={receiptImage} alt="Comprobante" className="max-h-48 rounded-lg border border-gray-200" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDeposit}
                  disabled={isSubmitting}
                  className="flex-1 bg-pan-sinai-brown text-white py-3 px-4 rounded-lg hover:bg-pan-sinai-dark-brown transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      <span>Registrando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Confirmar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
