import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-top-10 fade-in duration-300">
      <div className="flex items-center gap-2 bg-slate-800/90 backdrop-blur text-white px-4 py-2 rounded-full shadow-lg border border-slate-700/50">
        <WifiOff size={16} className="text-amber-400" />
        <span className="text-sm font-medium">Modo Offline ativado</span>
      </div>
    </div>
  );
}
