'use client';

import React, { useState, useMemo } from 'react';
import { useProducts } from '@/contexts/ProductContext';
import { Search, Filter, Package, AlertTriangle, CheckCircle } from 'lucide-react';

export default function StockView() {
  const { products, searchProducts, getProductsByCategory } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Categorías únicas
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category))];
    return uniqueCategories.sort();
  }, [products]);

  // Filtrar productos
  const filteredProducts = useMemo(() => {
    let filtered = products;
    
    if (searchQuery) {
      filtered = searchProducts(searchQuery);
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (showLowStockOnly) {
      filtered = filtered.filter(p => p.stock < 20);
    }
    
    return filtered;
  }, [products, searchQuery, selectedCategory, showLowStockOnly, searchProducts]);

  const getStockStatus = (stock: number) => {
    if (stock < 20) return { 
      color: 'text-red-600 bg-red-50 border-red-200', 
      text: 'Bajo',
      icon: AlertTriangle,
      bgColor: 'bg-red-50'
    };
    if (stock < 50) return { 
      color: 'text-yellow-600 bg-yellow-50 border-yellow-200', 
      text: 'Medio',
      icon: Package,
      bgColor: 'bg-yellow-50'
    };
    return { 
      color: 'text-green-600 bg-green-50 border-green-200', 
      text: 'Alto',
      icon: CheckCircle,
      bgColor: 'bg-green-50'
    };
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Pan Básico': return '🍞';
      case 'Pan Dulce': return '🥐';
      case 'Pasteles': return '🎂';
      case 'Galletas': return '🍪';
      case 'Especialidades': return '⭐';
      default: return '📦';
    }
  };

  const lowStockCount = products.filter(p => p.stock < 20).length;

  return (
    <div className="space-y-4">
      {/* Header con estadísticas rápidas */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-pan-sinai-dark-brown">Stock Disponible</h2>
          {lowStockCount > 0 && (
            <div className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">{lowStockCount} con stock bajo</span>
            </div>
          )}
        </div>
        
        {/* Filtros móviles */}
        <div className="space-y-3">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pan-sinai-gold focus:border-transparent transition-all text-sm"
            />
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pan-sinai-gold focus:border-transparent transition-all text-sm bg-white"
            >
              <option value="">Todas las categorías</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowLowStockOnly(!showLowStockOnly)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showLowStockOnly 
                  ? 'bg-red-100 text-red-700 border border-red-200' 
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              Solo stock bajo
            </button>
          </div>
        </div>
      </div>

      {/* Lista de productos optimizada para móvil */}
      <div className="space-y-3">
        {filteredProducts.map((product) => {
          const stockStatus = getStockStatus(product.stock);
          const StatusIcon = stockStatus.icon;
          
          return (
            <div key={product.id} className={`bg-white rounded-xl shadow-lg p-4 border-l-4 ${stockStatus.color}`}>
              <div className="flex items-start space-x-3">
                {/* Icono de categoría */}
                <div className="text-2xl flex-shrink-0">
                  {getCategoryIcon(product.category)}
                </div>

                {/* Información del producto */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-pan-sinai-dark-brown text-base truncate">
                        {product.name}
                      </h3>
                      <p className="text-sm text-pan-sinai-brown">{product.code}</p>
                    </div>
                    <div className="flex items-center space-x-2 ml-2">
                      <StatusIcon className="w-4 h-4" />
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                        {stockStatus.text}
                      </span>
                    </div>
                  </div>

                  {/* Detalles adicionales */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-pan-sinai-brown">
                        <Package className="w-4 h-4 inline mr-1" />
                        {product.stock} unidades
                      </span>
                      <span className="text-pan-sinai-dark-brown font-semibold">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>
                    
                    {/* Categoría */}
                    <span className="text-xs text-pan-sinai-brown bg-pan-sinai-cream px-2 py-1 rounded-full">
                      {product.category}
                    </span>
                  </div>

                  {/* Barra de progreso visual */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-pan-sinai-brown mb-1">
                      <span>Stock</span>
                      <span>{product.stock} / {Math.max(product.stock * 2, 100)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          product.stock < 20 ? 'bg-red-500' : 
                          product.stock < 50 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ 
                          width: `${Math.min((product.stock / Math.max(product.stock * 2, 100)) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mensaje cuando no hay productos */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-pan-sinai-dark-brown mb-2">
            No se encontraron productos
          </h3>
          <p className="text-pan-sinai-brown">
            {searchQuery || selectedCategory || showLowStockOnly 
              ? 'Intenta ajustar los filtros de búsqueda' 
              : 'No hay productos disponibles'
            }
          </p>
        </div>
      )}

      {/* Resumen */}
      {filteredProducts.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between text-sm text-pan-sinai-brown">
            <span>
              {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} mostrado{filteredProducts.length !== 1 ? 's' : ''}
            </span>
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Alto</span>
              </span>
              <span className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Medio</span>
              </span>
              <span className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Bajo</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 