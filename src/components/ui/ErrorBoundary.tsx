'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-pan-sinai-cream to-pan-sinai-light-brown flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-pan-sinai-dark-brown mb-2">
              Algo salió mal
            </h2>
            
            <p className="text-pan-sinai-brown mb-6">
              Ha ocurrido un error inesperado. Por favor, intenta de nuevo.
            </p>

            {this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-pan-sinai-brown hover:text-pan-sinai-dark-brown">
                  Ver detalles del error
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs text-gray-700 font-mono overflow-auto">
                  {this.state.error.message}
                </div>
              </details>
            )}

            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full bg-pan-sinai-gold text-pan-sinai-dark-brown py-3 px-4 rounded-lg hover:bg-pan-sinai-yellow transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Intentar de nuevo</span>
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="w-full bg-gray-100 text-pan-sinai-dark-brown py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <Home className="w-4 h-4" />
                <span>Ir al inicio</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 