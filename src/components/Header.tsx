import React from 'react';
import { MoonStar, Volume2, VolumeX, MapPin, WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface HeaderProps {
  city: string;
  hijriDate: string;
  audioAlerts: boolean;
  onToggleAudio: () => void;
  onOpenLocationModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  city,
  hijriDate,
  audioAlerts,
  onToggleAudio,
  onOpenLocationModal,
}) => {
  const isOnline = useOnlineStatus();

  return (
    <header id="app-header" className="flex items-center justify-between py-2 mb-4 w-full">
      <div className="flex items-center space-x-3">
        <div 
          id="brand-logo-icon"
          className="w-10 h-10 rounded-2xl liquid-glass flex items-center justify-center text-[#EAD8B1] border border-[#EAD8B1]/30 shadow-glow-gold transition-transform hover:scale-105"
        >
          <MoonStar className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center space-x-1.5">
            <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-[#F3E5AB] via-white to-[#4ADE80] bg-clip-text text-transparent">
              NoorSync
            </h1>
            {isOnline ? (
              <span
                id="badge-sync-status"
                title="Service Worker & IndexedDB Aktif"
                className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-[#4ADE80]/20 text-[#86EFAC] border border-[#4ADE80]/30 flex items-center space-x-1"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#4ADE80]" />
                <span>PWA</span>
              </span>
            ) : (
              <span
                id="badge-offline-status"
                title="Mode Offline: IndexedDB Aktif"
                className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center space-x-1"
              >
                <WifiOff className="w-2.5 h-2.5" />
                <span>Offline</span>
              </span>
            )}
          </div>
          <p id="hijri-date-label" className="text-xs text-slate-400 font-medium">
            {hijriDate}
          </p>
        </div>
      </div>

      {/* Quick Location & Audio Alert Toggle */}
      <div className="flex items-center space-x-2">
        <button
          id="btn-toggle-audio-header"
          onClick={onToggleAudio}
          title={audioAlerts ? 'Audio alert active' : 'Audio muted'}
          className={`w-9 h-9 rounded-2xl liquid-glass flex items-center justify-center transition-all active:scale-95 border border-white/10 ${
            audioAlerts ? 'text-[#EAD8B1] shadow-glow-gold' : 'text-slate-400'
          }`}
        >
          {audioAlerts ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        <button
          id="btn-open-location-header"
          onClick={onOpenLocationModal}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl liquid-glass text-xs font-semibold text-slate-200 border border-white/10 active:scale-95 transition-all hover:border-[#4ADE80]/40"
        >
          <MapPin className="w-3.5 h-3.5 text-[#4ADE80]" />
          <span className="truncate max-w-[90px]">{city}</span>
        </button>
      </div>
    </header>
  );
};
