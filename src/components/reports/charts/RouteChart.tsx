'use client';

import React from 'react';
import { useReports } from '@/contexts/ReportsContext';

interface RouteChartProps {
  period: string;
}

export default function RouteChart({ period }: RouteChartProps) {
  const { getRouteChartData } = useReports();
  
  const chartData = getRouteChartData(period);
  const maxRevenue = Math.max(...chartData.map(d => d.revenue));
  const maxCompletion = Math.max(...chartData.map(d => d.completion));

  return (
    <div className="w-full h-full">
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-pan-sinai-dark-brown">Análisis de Rutas</h4>
        <p className="text-sm text-pan-sinai-brown">Eficiencia y rendimiento por vendedor</p>
      </div>

      <div className="h-80 overflow-y-auto">
        <div className="space-y-4">
          {chartData.map((data, index) => {
            const revenuePercentage = (data.revenue / maxRevenue) * 100;
            const completionPercentage = data.completion;
            
            return (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                {/* Header del vendedor */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-pan-sinai-gold rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-pan-sinai-dark-brown">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-pan-sinai-dark-brown">{data.name}</p>
                      <p className="text-xs text-pan-sinai-brown">Vendedor</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-pan-sinai-dark-brown">
                      ${data.revenue.toFixed(2)}
                    </p>
                    <p className="text-xs text-pan-sinai-brown">Ingresos</p>
                  </div>
                </div>
                
                {/* Barras de métricas */}
                <div className="space-y-2">
                  {/* Eficiencia de ruta */}
                  <div>
                    <div className="flex justify-between text-xs text-pan-sinai-brown mb-1">
                      <span>Eficiencia de Ruta</span>
                      <span>{completionPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          completionPercentage >= 80 ? 'bg-green-500' :
                          completionPercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${completionPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Ingresos relativos */}
                  <div>
                    <div className="flex justify-between text-xs text-pan-sinai-brown mb-1">
                      <span>Ingresos Relativos</span>
                      <span>{revenuePercentage.toFixed(1)}%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-pan-sinai-gold to-pan-sinai-yellow h-2 rounded-full"
                        style={{ width: `${revenuePercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                {/* Indicadores de rendimiento */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      completionPercentage >= 80 ? 'bg-green-500' :
                      completionPercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-xs text-pan-sinai-brown">
                      {completionPercentage >= 80 ? 'Excelente' :
                       completionPercentage >= 60 ? 'Bueno' : 'Necesita mejora'}
                    </span>
                  </div>
                  <div className="text-xs text-pan-sinai-brown">
                    #{index + 1} en ingresos
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-sm text-pan-sinai-brown">Vendedores</p>
          <p className="text-xl font-bold text-pan-sinai-dark-brown">{chartData.length}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-sm text-pan-sinai-brown">Promedio Eficiencia</p>
          <p className="text-xl font-bold text-pan-sinai-dark-brown">
            {(chartData.reduce((sum, d) => sum + d.completion, 0) / chartData.length).toFixed(1)}%
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-sm text-pan-sinai-brown">Total Ingresos</p>
          <p className="text-xl font-bold text-pan-sinai-dark-brown">
            ${chartData.reduce((sum, d) => sum + d.revenue, 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Análisis de rendimiento */}
      <div className="mt-4 p-4 bg-pan-sinai-cream rounded-lg">
        <h5 className="text-sm font-semibold text-pan-sinai-dark-brown mb-2">Análisis de Rendimiento</h5>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-pan-sinai-brown">Mejor Vendedor</p>
            <p className="text-sm font-bold text-pan-sinai-dark-brown">
              {chartData.length > 0 ? chartData[0].name : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-pan-sinai-brown">Promedio por Vendedor</p>
            <p className="text-sm font-bold text-pan-sinai-dark-brown">
              ${chartData.length > 0 ? (chartData.reduce((sum, d) => sum + d.revenue, 0) / chartData.length).toFixed(2) : '0.00'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 