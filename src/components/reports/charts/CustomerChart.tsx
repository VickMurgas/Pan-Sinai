'use client';

import React from 'react';
import { useReports } from '@/contexts/ReportsContext';

interface CustomerChartProps {
  period: string;
}

export default function CustomerChart({ period }: CustomerChartProps) {
  const { getCustomerChartData } = useReports();
  
  const chartData = getCustomerChartData(period);
  const totalSpent = chartData.reduce((sum, d) => sum + d.spent, 0);
  const maxSpent = Math.max(...chartData.map(d => d.spent));

  return (
    <div className="w-full h-full">
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-pan-sinai-dark-brown">Clientes Principales</h4>
        <p className="text-sm text-pan-sinai-brown">Análisis de comportamiento de clientes</p>
      </div>

      <div className="h-80 overflow-y-auto">
        <div className="space-y-4">
          {chartData.map((data, index) => {
            const percentage = (data.spent / totalSpent) * 100;
            const barHeight = (data.spent / maxSpent) * 200;
            
            return (
              <div key={index} className="flex items-center space-x-4">
                {/* Número de ranking */}
                <div className="w-8 h-8 bg-pan-sinai-gold rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-pan-sinai-dark-brown">{index + 1}</span>
                </div>
                
                {/* Información del cliente */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-pan-sinai-dark-brown truncate">
                    {data.name}
                  </p>
                  <p className="text-xs text-pan-sinai-brown">
                    {data.purchases} compras
                  </p>
                </div>
                
                {/* Gráfico de barras */}
                <div className="flex items-center space-x-2 w-32">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-pan-sinai-gold to-pan-sinai-yellow h-3 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-pan-sinai-brown w-12 text-right">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
                
                {/* Monto gastado */}
                <div className="text-right min-w-[80px]">
                  <p className="text-sm font-semibold text-pan-sinai-dark-brown">
                    ${data.spent.toFixed(2)}
                  </p>
                  <p className="text-xs text-pan-sinai-brown">
                    ${(data.spent / data.purchases).toFixed(2)} promedio
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-pan-sinai-brown">Total Clientes</p>
          <p className="text-xl font-bold text-pan-sinai-dark-brown">{chartData.length}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-pan-sinai-brown">Total Gastado</p>
          <p className="text-xl font-bold text-pan-sinai-dark-brown">
            ${totalSpent.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Métricas adicionales */}
      <div className="mt-4 p-4 bg-pan-sinai-cream rounded-lg">
        <h5 className="text-sm font-semibold text-pan-sinai-dark-brown mb-2">Métricas de Clientes</h5>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-pan-sinai-brown">Promedio por Cliente</p>
            <p className="text-sm font-bold text-pan-sinai-dark-brown">
              ${(totalSpent / chartData.length).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-pan-sinai-brown">Total Compras</p>
            <p className="text-sm font-bold text-pan-sinai-dark-brown">
              {chartData.reduce((sum, d) => sum + d.purchases, 0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-pan-sinai-brown">Promedio Compras</p>
            <p className="text-sm font-bold text-pan-sinai-dark-brown">
              {(chartData.reduce((sum, d) => sum + d.purchases, 0) / chartData.length).toFixed(1)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 