'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

interface SecurityLog {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'auth' | 'data' | 'system' | 'security';
}

interface SessionConfig {
  timeoutMinutes: number;
  warningMinutes: number;
  maxLoginAttempts: number;
  lockoutDurationMinutes: number;
  requirePasswordChange: boolean;
  passwordExpiryDays: number;
}

interface SecurityContextType {
  // Configuración de sesión
  sessionConfig: SessionConfig;
  updateSessionConfig: (config: Partial<SessionConfig>) => void;
  
  // Estado de sesión
  sessionActive: boolean;
  sessionTimeRemaining: number;
  showSessionWarning: boolean;
  
  // Seguridad
  loginAttempts: number;
  isAccountLocked: boolean;
  lockoutEndTime: Date | null;
  
  // Auditoría
  securityLogs: SecurityLog[];
  addSecurityLog: (log: Omit<SecurityLog, 'id' | 'timestamp' | 'ipAddress' | 'userAgent'>) => void;
  getSecurityLogs: (userId?: string, period?: string) => SecurityLog[];
  
  // Acciones de seguridad
  extendSession: () => void;
  lockAccount: (durationMinutes?: number) => void;
  unlockAccount: () => void;
  resetLoginAttempts: () => void;
  validatePassword: (password: string) => boolean;
  generateSecureToken: () => string;
  
  // Timeouts
  startSessionTimer: () => void;
  stopSessionTimer: () => void;
  resetSessionTimer: () => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export function SecurityProvider({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  
  const [sessionConfig, setSessionConfig] = useState<SessionConfig>({
    timeoutMinutes: 30,
    warningMinutes: 5,
    maxLoginAttempts: 5,
    lockoutDurationMinutes: 15,
    requirePasswordChange: false,
    passwordExpiryDays: 90
  });

  const [sessionActive, setSessionActive] = useState(false);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(0);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isAccountLocked, setAccountLocked] = useState(false);
  const [lockoutEndTime, setLockoutEndTime] = useState<Date | null>(null);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);

  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cargar configuración guardada
  useEffect(() => {
    const savedConfig = localStorage.getItem('pan-sinai-security-config');
    if (savedConfig) {
      try {
        setSessionConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error('Error loading security config:', error);
      }
    }

    const savedLogs = localStorage.getItem('pan-sinai-security-logs');
    if (savedLogs) {
      try {
        const parsed = JSON.parse(savedLogs);
        setSecurityLogs(parsed.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        })));
      } catch (error) {
        console.error('Error loading security logs:', error);
      }
    }

    const savedLoginAttempts = localStorage.getItem('pan-sinai-login-attempts');
    if (savedLoginAttempts) {
      setLoginAttempts(parseInt(savedLoginAttempts));
    }

    const savedLockoutTime = localStorage.getItem('pan-sinai-lockout-time');
    if (savedLockoutTime) {
      const lockoutTime = new Date(savedLockoutTime);
      if (lockoutTime > new Date()) {
        setAccountLocked(true);
        setLockoutEndTime(lockoutTime);
      }
    }
  }, []);

  // Guardar configuración
  useEffect(() => {
    localStorage.setItem('pan-sinai-security-config', JSON.stringify(sessionConfig));
  }, [sessionConfig]);

  // Guardar logs
  useEffect(() => {
    localStorage.setItem('pan-sinai-security-logs', JSON.stringify(securityLogs));
  }, [securityLogs]);

  // Guardar intentos de login
  useEffect(() => {
    localStorage.setItem('pan-sinai-login-attempts', loginAttempts.toString());
  }, [loginAttempts]);

  // Verificar lockout
  useEffect(() => {
    if (lockoutEndTime && new Date() >= lockoutEndTime) {
      unlockAccount();
    }
  }, [lockoutEndTime]);

  // Iniciar sesión cuando el usuario se autentica
  useEffect(() => {
    if (user) {
      startSessionTimer();
      setSessionActive(true);
      resetLoginAttempts();
      addSecurityLog({
        userId: user.id,
        userName: user.name,
        action: 'LOGIN_SUCCESS',
        details: 'Usuario autenticado exitosamente',
        severity: 'low',
        category: 'auth'
      });
    } else {
      stopSessionTimer();
      setSessionActive(false);
    }
  }, [user]);

  const updateSessionConfig = (newConfig: Partial<SessionConfig>) => {
    setSessionConfig(prev => ({ ...prev, ...newConfig }));
  };

  const startSessionTimer = () => {
    stopSessionTimer();
    
    const timeoutMs = sessionConfig.timeoutMinutes * 60 * 1000;
    const warningMs = sessionConfig.warningMinutes * 60 * 1000;
    
    setSessionTimeRemaining(timeoutMs);

    sessionTimerRef.current = setInterval(() => {
      setSessionTimeRemaining(prev => {
        const newTime = prev - 1000;
        
        if (newTime <= warningMs && newTime > 0 && !showSessionWarning) {
          setShowSessionWarning(true);
          addSecurityLog({
            userId: user?.id || 'unknown',
            userName: user?.name || 'unknown',
            action: 'SESSION_WARNING',
            details: 'Sesión próxima a expirar',
            severity: 'medium',
            category: 'auth'
          });
        }
        
        if (newTime <= 0) {
          handleSessionTimeout();
          return 0;
        }
        
        return newTime;
      });
    }, 1000);
  };

  const stopSessionTimer = () => {
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    setSessionTimeRemaining(0);
    setShowSessionWarning(false);
  };

  const resetSessionTimer = () => {
    if (sessionActive) {
      startSessionTimer();
    }
  };

  const handleSessionTimeout = () => {
    stopSessionTimer();
    setSessionActive(false);
    
    addSecurityLog({
      userId: user?.id || 'unknown',
      userName: user?.name || 'unknown',
      action: 'SESSION_TIMEOUT',
      details: 'Sesión expirada por inactividad',
      severity: 'medium',
      category: 'auth'
    });

    logout();
  };

  const extendSession = () => {
    resetSessionTimer();
    setShowSessionWarning(false);
    
    addSecurityLog({
      userId: user?.id || 'unknown',
      userName: user?.name || 'unknown',
      action: 'SESSION_EXTENDED',
      details: 'Sesión extendida por el usuario',
      severity: 'low',
      category: 'auth'
    });
  };

  const lockAccount = (durationMinutes: number = sessionConfig.lockoutDurationMinutes) => {
    const lockoutEnd = new Date();
    lockoutEnd.setMinutes(lockoutEnd.getMinutes() + durationMinutes);
    
    setAccountLocked(true);
    setLockoutEndTime(lockoutEnd);
    localStorage.setItem('pan-sinai-lockout-time', lockoutEnd.toISOString());
    
    addSecurityLog({
      userId: user?.id || 'unknown',
      userName: user?.name || 'unknown',
      action: 'ACCOUNT_LOCKED',
      details: `Cuenta bloqueada por ${durationMinutes} minutos`,
      severity: 'high',
      category: 'security'
    });
  };

  const unlockAccount = () => {
    setAccountLocked(false);
    setLockoutEndTime(null);
    localStorage.removeItem('pan-sinai-lockout-time');
    
    addSecurityLog({
      userId: user?.id || 'unknown',
      userName: user?.name || 'unknown',
      action: 'ACCOUNT_UNLOCKED',
      details: 'Cuenta desbloqueada',
      severity: 'medium',
      category: 'security'
    });
  };

  const resetLoginAttempts = () => {
    setLoginAttempts(0);
  };

  const validatePassword = (password: string): boolean => {
    // Validaciones básicas de contraseña
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return password.length >= minLength && 
           hasUpperCase && 
           hasLowerCase && 
           hasNumbers && 
           hasSpecialChar;
  };

  const generateSecureToken = (): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  const addSecurityLog = (log: Omit<SecurityLog, 'id' | 'timestamp' | 'ipAddress' | 'userAgent'>) => {
    const newLog: SecurityLog = {
      ...log,
      id: Date.now().toString(),
      timestamp: new Date(),
      ipAddress: '127.0.0.1', // En producción obtener IP real
      userAgent: navigator.userAgent
    };

    setSecurityLogs(prev => [newLog, ...prev.slice(0, 999)]); // Mantener máximo 1000 logs
  };

  const getSecurityLogs = (userId?: string, period: string = 'week'): SecurityLog[] => {
    let filtered = userId ? securityLogs.filter(log => log.userId === userId) : securityLogs;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (period) {
      case 'today':
        return filtered.filter(log => {
          const logDate = new Date(log.timestamp);
          return logDate >= today;
        });
      case 'week':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return filtered.filter(log => new Date(log.timestamp) >= weekAgo);
      case 'month':
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        return filtered.filter(log => new Date(log.timestamp) >= monthAgo);
      default:
        return filtered;
    }
  };

  // Detectar actividad del usuario
  useEffect(() => {
    const handleUserActivity = () => {
      if (sessionActive) {
        resetSessionTimer();
      }
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true);
      });
    };
  }, [sessionActive]);

  return (
    <SecurityContext.Provider value={{
      sessionConfig,
      updateSessionConfig,
      sessionActive,
      sessionTimeRemaining,
      showSessionWarning,
      loginAttempts,
      isAccountLocked,
      lockoutEndTime,
      securityLogs,
      addSecurityLog,
      getSecurityLogs,
      extendSession,
      lockAccount,
      unlockAccount,
      resetLoginAttempts,
      validatePassword,
      generateSecureToken,
      startSessionTimer,
      stopSessionTimer,
      resetSessionTimer,
    }}>
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurity() {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
} 