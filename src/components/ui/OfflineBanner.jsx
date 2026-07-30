import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3000);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline && !showReconnected) return null;

  return (
    <div className={`w-full text-center py-2 px-4 text-xs font-bold transition-all duration-300 ${
      isOffline ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
    }`}>
      <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
        {isOffline ? (
          <>
            <WifiOff className="w-4 h-4" />
            <span>Modo Sin Conexión — Trabajando con datos guardados localmente (PWA)</span>
          </>
        ) : (
          <>
            <Wifi className="w-4 h-4" />
            <span>Conexión restablecida — Datos sincronizados con la nube</span>
          </>
        )}
      </div>
    </div>
  );
}
