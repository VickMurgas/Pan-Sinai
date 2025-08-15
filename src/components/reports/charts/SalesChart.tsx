'use client';

import React from 'react';
import { useReports } from '@/contexts/ReportsContext';

interface SalesChartProps {
  period: string;
}

export default function SalesChart({ period }: SalesChartProps) {
  const { getSalesChartData } = useReports();
  
  const chartData = getSalesChartData(period, 'day');
  
  const maxRevenue = Math.max(...chartData.map(d => d.revenue));
  const maxSales = Math.max(...chartData.map(d => d.sales));

  return (
    <div className="w-full h-full">
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-pan-sinai-dark-brown">Tendencia de Ventas</h4>
        <p className="text-sm text-pan-sinai-brown">Ventas y ingresos por período</p>
      </div>

      <div className="h-80 overflow-x-auto">
        <div className="flex items-end space-x-2 h-64 min-w-max">
          {chartData.map((data, index) => (
            <div key={index} className="flex flex-col items-center space-y-2">
              {/* Gráfico de barras para ingresos */}
              <div className="relative">
                <div
                  className="w-8 bg-gradient-to-t from-pan-sinai-gold to-pan-sinai-yellow rounded-t"
                  style={{ height: `${(data.revenue / maxRevenue) * 200}px` }}
                />
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-pan-sinai-dark-brown font-medium">
                  ${data.revenue.toFixed(0)}
                </div>
              </div>
              
              {/* Gráfico de barras para ventas */}
              <div className="relative">
                <div
                  className="w-6 bg-gradient-to-t from-pan-sinai-brown to-pan-sinai-dark-brown rounded-t"
                  style={{ height: `${(data.sales / maxSales) * 100}px` }}
                />
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-pan-sinai-dark-brown font-medium">
                  {data.sales}
                </div>
              </div>
              
              {/* Etiqueta de fecha */}
              <div className="text-xs text-pan-sinai-brown text-center w-12">
                {data.date}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex items-center justify-center space-x-6 mt-4">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gradient-to-t from-pan-sinai-gold to-pan-sinai-yellow rounded"></div>
          <span className="text-sm text-pan-sinai-dark-brown">Ingresos ($)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gradient-to-t from-pan-sinai-brown to-pan-sinai-dark-brown rounded"></div>
          <span className="text-sm text-pan-sinai-dark-brown">Ventas (#)</span>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-pan-sinai-brown">Total Ingresos</p>
          <p className="text-xl font-bold text-pan-sinai-dark-brown">
            ${chartData.reduce((sum, d) => sum + d.revenue, 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-pan-sinai-brown">Total Ventas</p>
          <p className="text-xl font-bold text-pan-sinai-dark-brown">
            {chartData.reduce((sum, d) => sum + d.sales, 0)}
          </p>
        </div>
      </div>
    </div>
  );
} 