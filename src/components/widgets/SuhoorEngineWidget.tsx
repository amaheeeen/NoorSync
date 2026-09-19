import React, { useState } from 'react';
import { Moon, Bell, Volume2, Clock, Check, Sparkles } from 'lucide-react';
import { playSuhoorChime } from '../../utils/audio';

interface SuhoorEngineWidgetProps {
  fajrTimeStr: string;
  onOpenFastingPlan?: () => void;
}

export const SuhoorEngineWidget: React.FC<SuhoorEngineWidgetProps> = ({
  fajrTimeStr,
}) => {
  const [isPlayingChime, setIsPlayingChime] = useState<boolean>(false);
  const [alarmEnabled, setAlarmEnabled] = useState<boolean>(true);
  const [showNiat, setShowNiat] = useState<boolean>(false);

  // Compute Imsak (Fajr - 10 minutes)
  const calculateImsakTime = (fajr: string): string => {
    try {
      const [h, m] = fajr.split(':').map(Number);
      let totalM = h * 60 + m - 10;
      if (totalM < 0) totalM += 1440;
      const ih = Math.floor(totalM / 60);
      const im = totalM % 60;
      return `${String(ih).padStart(2, '0')}:${String(im).padStart(2, '0')}`;
    } catch {
      return '04:25';
    }
  };

  const imsakTime = calculateImsakTime(fajrTimeStr);

  const handleTestChime = () => {
    setIsPlayingChime(true);
    playSuhoorChime();
    setTimeout(() => setIsPlayingChime(false), 2000);
  };

  return (
    <div
      id="widget-suhoor-engine"
      className="liquid-glass rounded-3xl p-4 border border-white/10 relative overflow-hidden transition-all duration-300 hover:border-[#D4AF37]/30 shadow-glass"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#F3E5AB] shadow-glow-gold">
            <Moon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
              <span>SUHOOR & IMSAK ENGINE</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#4ADE80]/20 text-[#86EFAC] font-mono border border-[#4ADE80]/30">
                Imsakiah
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Waktu Imsak: <strong className="text-white font-mono">{imsakTime}</strong> • Subuh: <span className="text-slate-300 font-mono">{fajrTimeStr}</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleTestChime}
          className={`p-2 rounded-xl border transition-all ${
            isPlayingChime
              ? 'bg-[#4ADE80]/20 text-[#86EFAC] border-[#4ADE80]/40 shadow-glow-mint scale-95'
              : 'bg-white/5 text-slate-300 hover:text-white border-white/10'
          }`}
          title="Uji Nada Chime Bangun Sahur"
        >
          <Volume2 className={`w-3.5 h-3.5 ${isPlayingChime ? 'animate-bounce' : ''}`} />
        </button>
      </div>

      {/* Timing Cards */}
      <div className="grid grid-cols-2 gap-2 my-2">
        <div className="p-2.5 rounded-2xl bg-black/30 border border-white/5 text-center">
          <span className="text-[10px] text-slate-400 block font-medium">Batas Sahur (Imsak)</span>
          <span className="text-lg font-black text-[#F3E5AB] font-mono">{imsakTime}</span>
          <span className="text-[9px] text-slate-400 block">Fajr - 10 Menit</span>
        </div>
        <div className="p-2.5 rounded-2xl bg-black/30 border border-white/5 text-center">
          <span className="text-[10px] text-slate-400 block font-medium">Fajar Shodiq (Subuh)</span>
          <span className="text-lg font-black text-white font-mono">{fajrTimeStr}</span>
          <span className="text-[9px] text-[#86EFAC] block font-medium">Awal Mulai Puasa</span>
        </div>
      </div>

      {/* Niat & Controls */}
      <div className="space-y-2 pt-2 border-t border-white/5">
        <div className="flex items-center justify-between text-xs">
          <button
            onClick={() => setShowNiat(!showNiat)}
            className="text-[11px] font-bold text-[#86EFAC] hover:underline flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            <span>{showNiat ? 'Tutup Niat Puasa' : 'Lafaz Niat Puasa Sunnah'}</span>
          </button>

          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <span className="text-[10px] text-slate-400">Alarm Sahur:</span>
            <input
              type="checkbox"
              checked={alarmEnabled}
              onChange={(e) => setAlarmEnabled(e.target.checked)}
              className="accent-[#4ADE80] rounded"
            />
          </label>
        </div>

        {showNiat && (
          <div className="p-3 rounded-2xl bg-teal-950/40 border border-teal-500/20 text-xs space-y-1.5 animate-in fade-in">
            <p className="font-arabic text-sm text-right text-[#F3E5AB] leading-relaxed">
              نَوَيْتُ صَوْمَ يَوْمَ اْلاِثْنَيْنِ / الْخَمِيْسِ سُنَّةً لِلَّهِ تَعَالَى
            </p>
            <p className="text-[10px] text-slate-300 italic">
              Nawaitu shauma yaumal itsnaini / khamiisi sunnatan lillaahi ta&apos;aala.
            </p>
            <p className="text-[10px] text-slate-400">
              &quot;Saya niat puasa sunnah hari Senin / Kamis karena Allah Ta&apos;ala.&quot;
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
