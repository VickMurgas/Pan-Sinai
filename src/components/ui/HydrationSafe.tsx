'use client';

import React, { useState, useEffect } from 'react';

interface HydrationSafeProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function HydrationSafe({ children, fallback }: HydrationSafeProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return fallback || (
      <div className="animate-pulse">
        <div className="bg-gray-200 rounded-lg h-8 mb-4"></div>
        <div className="bg-gray-200 rounded-lg h-6 mb-2"></div>
        <div className="bg-gray-200 rounded-lg h-6 mb-2"></div>
        <div className="bg-gray-200 rounded-lg h-6"></div>
      </div>
    );
  }

  return <>{children}</>;
} 