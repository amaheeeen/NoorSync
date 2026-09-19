import React, { useEffect, useState } from 'react';
import { WifiOff, CheckCircle2, HardDrive } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [wasOffline, setWasOffline] = useState<boolean>(false);
  const [showReconnectedToast, setShowReconnectedToast] = useState<boolean>(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      setShowReconnectedToast(false);
    } else if (wasOffline) {
      setShowReconnectedToast(true);
      const timer = setTimeout(() => {
        setShowReconnectedToast(false);
        setWasOffline(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (isOnline && !showReconnectedToast) {
    return null;
  }

  if (showReconnectedToast) {
    return (
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-3 duration-300">
        <div className="px-4 py-2 rounded-full bg-emerald-950/90 border border-emerald-400/40 backdrop-blur-xl shadow-glow-mint flex items-center space-x-2 text-xs text-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-[#86EFAC]" />
          <span className="font-semibold">Kembali Online</span>
          <span className="text-emerald-300/70 text-[11px]">— Data tersinkronisasi otomatis</span>
        </div>
      </div>
    );
  }

  return (
    <aside aria-label="Status Mode Offline" className="fixed top-3 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-3 duration-300 max-w-[92vw] w-max">
      <div className="px-4 py-2 rounded-full bg-amber-950/85 border border-amber-500/40 backdrop-blur-xl shadow-2xl flex items-center space-x-2.5 text-xs text-amber-200">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
        </span>
        <WifiOff className="w-3.5 h-3.5 text-amber-300 shrink-0" />
        <span className="font-semibold text-amber-100">Mode Offline Aktif</span>
        <span className="text-amber-200/80 text-[11px] hidden sm:inline">
          Jadwal sholat & log tersimpan aman di IndexedDB
        </span>
        <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-900/60 border border-amber-500/30 text-[10px] font-mono text-amber-300">
          <HardDrive className="w-3 h-3" />
          <span>Local Cache</span>
        </div>
      </div>
    </aside>
  );
};
