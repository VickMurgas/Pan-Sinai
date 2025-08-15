'use client';

import React from 'react';
import { useReports } from '@/contexts/ReportsContext';

interface ProductChartProps {
  period: string;
}

export default function ProductChart({ period }: ProductChartProps) {
  const { getProductChartData } = useReports();
  
  const chartData = getProductChartData(period);
  const totalRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0);

  // Colores para el gráfico
  const colors = [
    'bg-pan-sinai-gold',
    'bg-pan-sinai-brown',
    'bg-green-500',
    'bg-blue-500',
    'bg-purple-500',
    'bg-red-500',
    'bg-yellow-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500'
  ];

  return (
    <div className="w-full h-full">
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-pan-sinai-dark-brown">Productos Más Vendidos</h4>
        <p className="text-sm text-pan-sinai-brown">Distribución de ventas por producto</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-80">
        {/* Gráfico de torta */}
        <div className="flex items-center justify-center">
          <div className="relative w-48 h-48">
            {chartData.map((data, index) => {
              const percentage = (data.revenue / totalRevenue) * 100;
              const rotation = chartData
                .slice(0, index)
                .reduce((sum, d) => sum + (d.revenue / totalRevenue) * 360, 0);
              
              return (
                <div
                  key={index}
                  className={`absolute w-full h-full rounded-full ${colors[index % colors.length]} opacity-80`}
                  style={{
                    clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((rotation * Math.PI) / 180)}% ${50 + 50 * Math.sin((rotation * Math.PI) / 180)}%, ${50 + 50 * Math.cos(((rotation + percentage * 3.6) * Math.PI) / 180)}% ${50 + 50 * Math.sin(((rotation + percentage * 3.6) * Math.PI) / 180)}%)`
                  }}
                />
              );
            })}
            <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-pan-sinai-brown">Total</p>
                <p className="text-lg font-bold text-pan-sinai-dark-brown">
                  ${totalRevenue.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de productos */}
        <div className="space-y-3 overflow-y-auto">
          {chartData.map((data, index) => {
            const percentage = (data.revenue / totalRevenue) * 100;
            
            return (
              <div key={index} className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${colors[index % colors.length]}`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-pan-sinai-dark-brown truncate">
                    {data.name}
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${colors[index % colors.length]}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-pan-sinai-brown w-12 text-right">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-pan-sinai-dark-brown">
                    ${data.revenue.toFixed(2)}
                  </p>
                  <p className="text-xs text-pan-sinai-brown">
                    {data.sales} vendidos
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-sm text-pan-sinai-brown">Productos</p>
          <p className="text-xl font-bold text-pan-sinai-dark-brown">{chartData.length}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-sm text-pan-sinai-brown">Total Vendido</p>
          <p className="text-xl font-bold text-pan-sinai-dark-brown">
            {chartData.reduce((sum, d) => sum + d.sales, 0)}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-sm text-pan-sinai-brown">Promedio</p>
          <p className="text-xl font-bold text-pan-sinai-dark-brown">
            ${(totalRevenue / chartData.length).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
} 