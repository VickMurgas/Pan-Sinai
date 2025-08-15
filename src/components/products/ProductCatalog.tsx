'use client';

import React, { useState, useMemo } from 'react';
import { useProducts } from '@/contexts/ProductContext';
import { Search, Filter, Package, Plus, Eye } from 'lucide-react';

interface ProductCatalogProps {
  onProductSelect?: (product: any) => void;
  showStock?: boolean;
  showActions?: boolean;
}

export default function ProductCatalog({ 
  onProductSelect, 
  showStock = true, 
  showActions = true 
}: ProductCatalogProps) {
  const { products, searchProducts, getProductsByCategory } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Categorías únicas
  const categories = useMemo(() => {
    const categoryMap = new Map();
    products.forEach(p => {
      if (!categoryMap.has(p.category)) {
        categoryMap.set(p.category, true);
      }
    });
    return Array.from(categoryMap.keys()).sort();
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
    
    return filtered;
  }, [products, searchQuery, selectedCategory, searchProducts]);

  const getStockStatus = (stock: number) => {
    if (stock < 20) return { color: 'text-red-600 bg-red-50', text: 'Bajo' };
    if (stock < 50) return { color: 'text-yellow-600 bg-yellow-50', text: 'Medio' };
    return { color: 'text-green-600 bg-green-50', text: 'Alto' };
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

  return (
    <div className="space-y-6">
      {/* Búsqueda y filtros */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por código, nombre o categoría..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pan-sinai-gold focus:border-transparent transition-all"
            />
          </div>

          {/* Filtro por categoría */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pan-sinai-gold focus:border-transparent transition-all appearance-none bg-white"
            >
              <option value="">Todas las categorías</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Resultados de búsqueda */}
        {searchQuery && (
          <div className="mt-4 text-sm text-pan-sinai-brown">
            {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Lista de productos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const stockStatus = getStockStatus(product.stock);
          
          return (
            <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {/* Header del producto */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getCategoryIcon(product.category)}</div>
                    <div>
                      <h3 className="font-semibold text-pan-sinai-dark-brown text-lg">{product.name}</h3>
                      <p className="text-sm text-pan-sinai-brown">{product.code}</p>
                    </div>
                  </div>
                  {showActions && onProductSelect && (
                    <button
                      onClick={() => onProductSelect(product)}
                      className="p-2 text-pan-sinai-gold hover:text-pan-sinai-dark-brown transition-colors"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Descripción */}
                {product.description && (
                  <p className="text-sm text-pan-sinai-brown mb-4">{product.description}</p>
                )}

                {/* Categoría */}
                <div className="mb-4">
                  <span className="inline-block px-2 py-1 bg-pan-sinai-cream text-pan-sinai-dark-brown text-xs font-medium rounded-full">
                    {product.category}
                  </span>
                </div>

                {/* Precio y stock */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-pan-sinai-dark-brown">
                      ${product.price.toFixed(2)}
                    </p>
                    <p className="text-sm text-pan-sinai-brown">por unidad</p>
                  </div>
                  
                  {showStock && (
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-1">
                        <Package className="w-4 h-4 text-pan-sinai-brown" />
                        <span className="font-semibold text-pan-sinai-dark-brown">{product.stock}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                        {stockStatus.text}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Acciones */}
              {showActions && (
                <div className="px-6 pb-6">
                  <div className="flex space-x-2">
                    {onProductSelect && (
                      <button
                        onClick={() => onProductSelect(product)}
                        className="flex-1 bg-pan-sinai-gold text-pan-sinai-dark-brown py-2 px-4 rounded-lg hover:bg-pan-sinai-yellow transition-colors font-medium"
                      >
                        Seleccionar
                      </button>
                    )}
                    <button className="p-2 text-pan-sinai-brown hover:text-pan-sinai-dark-brown transition-colors">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mensaje cuando no hay productos */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-pan-sinai-dark-brown mb-2">
            No se encontraron productos
          </h3>
          <p className="text-pan-sinai-brown">
            {searchQuery ? 'Intenta con otros términos de búsqueda' : 'No hay productos disponibles'}
          </p>
        </div>
      )}
    </div>
  );
} 