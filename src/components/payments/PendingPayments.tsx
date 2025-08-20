'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSales } from '@/contexts/SalesContext';
import { PendingPayment } from '@/types';
import { Clock, CheckCircle, XCircle, Timer, DollarSign, User } from 'lucide-react';

function getTimeLeft(expiresAt: Date): { hours: number; minutes: number; seconds: number; totalMs: number } {
  const now = new Date().getTime();
  const exp = new Date(expiresAt).getTime();
  const diff = Math.max(exp - now, 0);
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { hours, minutes, seconds, totalMs: diff };
}

function getAgeHours(createdAt: Date): number {
  const diff = new Date().getTime() - new Date(createdAt).getTime();
  return diff / (1000 * 60 * 60);
}

function getStatusColorByAge(createdAt: Date): string {
  const age = getAgeHours(createdAt);
  if (age < 5) return 'bg-green-100 text-green-800';
  if (age < 15) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
}

function formatTime(h: number, m: number, s: number): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export default function PendingPayments() {
  const [tick, setTick] = useState(0);
  const [items, setItems] = useState<PendingPayment[]>([] as any);

  const load = () => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem('pan-sinai-pending-payments') : null;
      const list = raw ? JSON.parse(raw) : [];
      setItems(list.map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        expiresAt: new Date(p.expiresAt)
      })));
    } catch (e) {
      console.error('Error cargando pagos pendientes:', e);
      setItems([] as any);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(() => {
      setTick(t => t + 1);
      // sweep expirados
      try {
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem('pan-sinai-pending-payments') : null;
        const list = raw ? JSON.parse(raw) : [];
        const now = new Date().toISOString();
        let changed = false;
        const updated = list.map((p: any) => {
          if (p.status === 'pendiente' && p.expiresAt <= now) {
            changed = true;
            return { ...p, status: 'vencido' };
          }
          return p;
        });
        if (changed && typeof window !== 'undefined') {
          window.localStorage.setItem('pan-sinai-pending-payments', JSON.stringify(updated));
          load();
        }
      } catch {}
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [items, tick]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-pan-sinai-dark-brown">Pagos Pendientes</h2>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center text-pan-sinai-brown">No hay pagos pendientes</div>
      ) : (
        <div className="space-y-4">
          {sorted.map((p: PendingPayment) => {
            const timeLeft = getTimeLeft(p.expiresAt);
            const statusBadge = p.status === 'pagado'
              ? 'bg-blue-100 text-blue-800'
              : p.status === 'vencido'
                ? 'bg-gray-200 text-gray-600'
                : getStatusColorByAge(p.createdAt);

            return (
              <div key={p.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-pan-sinai-brown" />
                      <span className="font-semibold text-pan-sinai-dark-brown">{p.customerName || 'Cliente sin nombre'}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge}`}>
                        {p.status === 'pagado' ? 'Pagado' : p.status === 'vencido' ? 'Vencido' : 'Pendiente'}
                      </span>
                    </div>
                    <div className="text-sm text-pan-sinai-brown mt-1">Venta #{p.saleId}</div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <DollarSign className="w-4 h-4 text-green-700" />
                      <span className="font-bold text-pan-sinai-dark-brown">${p.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-end space-x-2 mt-1 text-sm">
                      <Timer className="w-4 h-4 text-pan-sinai-brown" />
                      <span className="text-pan-sinai-brown">{formatTime(timeLeft.hours, timeLeft.minutes, timeLeft.seconds)}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-pan-sinai-brown">
                  <span>Creado: {new Date(p.createdAt).toLocaleString()}</span>
                  <span>Vence: {new Date(p.expiresAt).toLocaleString()}</span>
                </div>
                <div className="mt-3 flex items-center space-x-2">
                  <button
                    disabled={p.status !== 'pendiente'}
                    onClick={() => {
                      try {
                        const raw = typeof window !== 'undefined' ? window.localStorage.getItem('pan-sinai-pending-payments') : null;
                        const list = raw ? JSON.parse(raw) : [];
                        const updated = list.map((x: any) => x.id === p.id ? { ...x, status: 'pagado' } : x);
                        if (typeof window !== 'undefined') {
                          window.localStorage.setItem('pan-sinai-pending-payments', JSON.stringify(updated));
                        }
                        load();
                      } catch {}
                    }}
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${p.status === 'pendiente' ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                  >
                    Marcar como Pagado
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


