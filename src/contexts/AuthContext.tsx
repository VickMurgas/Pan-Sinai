'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Datos de prueba para usuarios
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Carlos Vanegas',
    email: 'vendedor@pan-sinai.com',
    role: 'vendedor',
  },
  {
    id: '2',
    name: 'María Escobar',
    email: 'bodeguero@pan-sinai.com',
    role: 'bodeguero',
  },
  {
    id: '3',
    name: 'Roberto Valiente',
    email: 'gerente@pan-sinai.com',
    role: 'gerente',
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un usuario guardado en localStorage
    const savedUser = localStorage.getItem('pan-sinai-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    // Simular delay de autenticación
    await new Promise(resolve => setTimeout(resolve, 30));

    // Buscar usuario en datos de prueba
    const foundUser = mockUsers.find(u => u.email === email);

    if (foundUser && password === '123456') { // Contraseña de prueba
      setUser(foundUser);
      localStorage.setItem('pan-sinai-user', JSON.stringify(foundUser));
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pan-sinai-user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
