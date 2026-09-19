import React, { useState } from 'react';
import { Download, Check, Share } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);

  if (isInstalled) {
    return (
      <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-medium ${className}`}>
        <Check className="w-3.5 h-3.5 text-[#86EFAC]" />
        <span>Terpasang di Perangkat</span>
      </div>
    );
  }

  if (isIOS) {
    return (
      <div className="relative inline-block">
        <button
          id="btn-install-pwa-ios"
          onClick={() => setShowIOSPrompt(!showIOSPrompt)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl bg-[#4ADE80]/15 hover:bg-[#4ADE80]/25 text-[#86EFAC] border border-[#4ADE80]/30 text-xs font-semibold active:scale-95 transition-all ${className}`}
        >
          <Share className="w-3.5 h-3.5 text-[#86EFAC]" />
          <span>Pasang di iOS</span>
        </button>

        {showIOSPrompt && (
          <div className="absolute right-0 bottom-full mb-2 w-64 p-3 rounded-2xl liquid-glass border border-white/20 text-[11px] text-slate-300 z-50 shadow-2xl animate-in fade-in">
            <p className="font-semibold text-white mb-1">Cara Pasang di iPhone/iPad:</p>
            <p>1. Tekan tombol <strong>Share</strong> di browser Safari.</p>
            <p>2. Pilih <strong>&apos;Add to Home Screen&apos;</strong> (Tambah ke Layar Utama).</p>
          </div>
        )}
      </div>
    );
  }

  if (!isInstallable) {
    return null;
  }

  return (
    <button
      id="btn-install-pwa"
      onClick={install}
      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl bg-[#4ADE80]/20 hover:bg-[#4ADE80]/30 text-[#86EFAC] border border-[#4ADE80]/40 text-xs font-semibold shadow-glow-mint active:scale-95 transition-all ${className}`}
    >
      <Download className="w-3.5 h-3.5 text-[#86EFAC]" />
      <span>Pasang Aplikasi</span>
    </button>
  );
};
