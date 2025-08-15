'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/types';

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateStock: (productId: string, quantity: number, type: 'add' | 'subtract') => void;
  searchProducts: (query: string) => Product[];
  getProductsByCategory: (category: string) => Product[];
  getLowStockProducts: () => Product[];
  addStockMovement: (productId: string, quantity: number, type: 'reception' | 'sale' | 'adjustment', notes?: string) => void;
  stockMovements: StockMovement[];
}

interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  type: 'reception' | 'sale' | 'adjustment';
  date: Date;
  notes?: string;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Datos de prueba para productos de panadería salvadoreña
const initialProducts: Product[] = [
  // Pan Básico
  { id: '1', code: 'PF001', name: 'Pan Francés', price: 0.25, stock: 150, category: 'Pan Básico', description: 'Pan francés tradicional' },
  { id: '2', code: 'PB002', name: 'Pan de Yema', price: 0.30, stock: 120, category: 'Pan Básico', description: 'Pan de yema artesanal' },
  { id: '3', code: 'PI003', name: 'Pan Integral', price: 0.35, stock: 80, category: 'Pan Básico', description: 'Pan integral saludable' },
  { id: '4', code: 'PC004', name: 'Pan de Coco', price: 0.40, stock: 60, category: 'Pan Básico', description: 'Pan de coco dulce' },
  
  // Pan Dulce
  { id: '5', code: 'PD005', name: 'Concha', price: 0.50, stock: 45, category: 'Pan Dulce', description: 'Concha tradicional' },
  { id: '6', code: 'PD006', name: 'Cuernito', price: 0.45, stock: 35, category: 'Pan Dulce', description: 'Cuernito de mantequilla' },
  { id: '7', code: 'PD007', name: 'Oreja', price: 0.55, stock: 25, category: 'Pan Dulce', description: 'Oreja de elefante' },
  { id: '8', code: 'PD008', name: 'Donut', price: 0.60, stock: 30, category: 'Pan Dulce', description: 'Donut glaseado' },
  
  // Pasteles
  { id: '9', code: 'PA009', name: 'Pastel de Chocolate', price: 2.50, stock: 15, category: 'Pasteles', description: 'Pastel de chocolate casero' },
  { id: '10', code: 'PA010', name: 'Pastel de Vainilla', price: 2.25, stock: 12, category: 'Pasteles', description: 'Pastel de vainilla suave' },
  { id: '11', code: 'PA011', name: 'Pastel de Tres Leches', price: 3.00, stock: 8, category: 'Pasteles', description: 'Pastel tres leches tradicional' },
  { id: '12', code: 'PA012', name: 'Pastel de Queso', price: 2.75, stock: 10, category: 'Pasteles', description: 'Pastel de queso cremoso' },
  
  // Galletas
  { id: '13', code: 'GA013', name: 'Galletas de Mantequilla', price: 0.75, stock: 100, category: 'Galletas', description: 'Galletas de mantequilla caseras' },
  { id: '14', code: 'GA014', name: 'Galletas de Chocolate', price: 0.80, stock: 85, category: 'Galletas', description: 'Galletas con chispas de chocolate' },
  { id: '15', code: 'GA015', name: 'Galletas de Avena', price: 0.70, stock: 70, category: 'Galletas', description: 'Galletas de avena saludables' },
  
  // Especialidades
  { id: '16', code: 'ES016', name: 'Empanada de Piña', price: 1.25, stock: 20, category: 'Especialidades', description: 'Empanada dulce de piña' },
  { id: '17', code: 'ES017', name: 'Empanada de Pollo', price: 1.50, stock: 18, category: 'Especialidades', description: 'Empanada salada de pollo' },
  { id: '18', code: 'ES018', name: 'Pan de Muerto', price: 1.00, stock: 25, category: 'Especialidades', description: 'Pan de muerto tradicional' },
];

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);

  useEffect(() => {
    // Cargar productos desde localStorage o usar datos iniciales
    const savedProducts = localStorage.getItem('pan-sinai-products');
    const savedMovements = localStorage.getItem('pan-sinai-stock-movements');
    
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      setProducts(initialProducts);
      localStorage.setItem('pan-sinai-products', JSON.stringify(initialProducts));
    }
    
    if (savedMovements) {
      setStockMovements(JSON.parse(savedMovements));
    }
  }, []);

  const saveProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    localStorage.setItem('pan-sinai-products', JSON.stringify(newProducts));
  };

  const saveMovements = (newMovements: StockMovement[]) => {
    setStockMovements(newMovements);
    localStorage.setItem('pan-sinai-stock-movements', JSON.stringify(newMovements));
  };

  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
    };
    saveProducts([...products, newProduct]);
  };

  const updateStock = (productId: string, quantity: number, type: 'add' | 'subtract') => {
    const updatedProducts = products.map(product => {
      if (product.id === productId) {
        const newStock = type === 'add' 
          ? product.stock + quantity 
          : Math.max(0, product.stock - quantity); // Prevenir stock negativo
        
        return { ...product, stock: newStock };
      }
      return product;
    });
    saveProducts(updatedProducts);
  };

  const searchProducts = (query: string): Product[] => {
    const lowercaseQuery = query.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.code.toLowerCase().includes(lowercaseQuery) ||
      product.category.toLowerCase().includes(lowercaseQuery)
    );
  };

  const getProductsByCategory = (category: string): Product[] => {
    return products.filter(product => product.category === category);
  };

  const getLowStockProducts = (): Product[] => {
    return products.filter(product => product.stock < 20);
  };

  const addStockMovement = (productId: string, quantity: number, type: 'reception' | 'sale' | 'adjustment', notes?: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const movement: StockMovement = {
      id: Date.now().toString(),
      productId,
      productName: product.name,
      quantity,
      type,
      date: new Date(),
      notes,
    };

    saveMovements([movement, ...stockMovements]);
  };

  return (
    <ProductContext.Provider value={{
      products,
      addProduct,
      updateStock,
      searchProducts,
      getProductsByCategory,
      getLowStockProducts,
      addStockMovement,
      stockMovements,
    }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
} 