import React from 'react';
import {
  Compass,
  Play,
  Clock,
  SunDim,
  Sunrise,
  Sun,
  CloudSun,
  Sunset,
  Moon,
  Volume2,
  BellOff,
  Radio,
  ChevronRight,
} from 'lucide-react';
import { PrayerTimes, SholatSlot } from '../../types';
import { ClockDetails } from '../../store/useNoorStore';
import { playSampleAthan } from '../../utils/audio';

interface PrayerHorizonWidgetProps {
  prayerTimes: PrayerTimes;
  clockDetails: ClockDetails;
  qiblaBearingText: string;
  useIhtiyat: boolean;
  onToggleIhtiyat: () => void;
  onOpenQibla?: () => void;
}

export const PrayerHorizonWidget: React.FC<PrayerHorizonWidgetProps> = ({
  prayerTimes,
  clockDetails,
  qiblaBearingText,
  useIhtiyat,
  onToggleIhtiyat,
  onOpenQibla,
}) => {
  const scheduleItems: { key: SholatSlot | 'Sunrise'; label: string; time: string; icon: React.ElementType }[] = [
    { key: 'Fajr', label: 'Fajr', time: prayerTimes.Fajr, icon: SunDim },
    { key: 'Sunrise', label: 'Syuruq', time: prayerTimes.Sunrise, icon: Sunrise },
    { key: 'Dhuhr', label: 'Dhuhr', time: prayerTimes.Dhuhr, icon: Sun },
    { key: 'Asr', label: 'Asr', time: prayerTimes.Asr, icon: CloudSun },
    { key: 'Maghrib', label: 'Maghrib', time: prayerTimes.Maghrib, icon: Sunset },
    { key: 'Isha', label: 'Isha', time: prayerTimes.Isha, icon: Moon },
  ];

  return (
    <div 
      id="widget-prayer-horizon"
      className="liquid-glass-accent rounded-3xl p-5 relative overflow-hidden border border-[#D4AF37]/30 shadow-glass transition-all"
    >
      {/* Dynamic Circadian Ambient Glow */}
      <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-[#D4AF37]/15 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header Row */}
      <div className="flex justify-between items-start mb-3">
        <div>
          {clockDetails.status === 'adzan' ? (
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#4ADE80]/20 text-[#86EFAC] text-[11px] font-bold tracking-wide border border-[#4ADE80]/40 shadow-glow-mint animate-pulse">
              {/* 3-Bar Minimalist Equalizer Wave */}
              <div className="flex items-end space-x-0.5 h-3">
                <span className="w-1 bg-[#4ADE80] rounded-full wave-bar-1" />
                <span className="w-1 bg-[#4ADE80] rounded-full wave-bar-2" />
                <span className="w-1 bg-[#4ADE80] rounded-full wave-bar-3" />
              </div>
              <span>ADZAN SEDANG BERKUMANDANG</span>
            </div>
          ) : clockDetails.status === 'iqamah_dnd' ? (
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-[#F3E5AB] text-[11px] font-bold tracking-wide border border-amber-400/40">
              <BellOff className="w-3.5 h-3.5 text-[#EAD8B1]" />
              <span>MODE SENYAP IBADAH</span>
            </div>
          ) : (
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#F3E5AB] text-[11px] font-semibold tracking-wide border border-[#D4AF37]/30">
              <span className={`w-1.5 h-1.5 rounded-full bg-[#D4AF37] ${clockDetails.isUrgent5Min ? 'animate-ping bg-[#4ADE80]' : ''}`} />
              <span>UPCOMING PRAYER</span>
            </span>
          )}

          <h2 id="widget-next-prayer-name" className="text-2xl font-black tracking-tight text-white mt-1.5 flex items-center gap-2">
            {clockDetails.nextPrayerName}
            <span className="text-sm font-arabic font-normal text-[#F3E5AB]">
              ({clockDetails.nextPrayerArabic})
            </span>
          </h2>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400">Adhan at</span>
          <p id="widget-next-prayer-time" className="text-lg font-bold text-[#4ADE80] tnum">
            {clockDetails.nextPrayerTime}
          </p>
        </div>
      </div>

      {/* Dynamic Circadian Sun Elevation Horizon */}
      <div className="my-3 px-1">
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium mb-1">
          <span>Subuh</span>
          <span>Dhuhr</span>
          <span>Ashar</span>
          <span>Maghrib</span>
          <span>Isya</span>
        </div>
        <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/10 relative">
          <div 
            className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-[#113632] via-[#EAD8B1] to-[#4ADE80]"
            style={{ width: `${clockDetails.progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Countdown Clock Display */}
      {clockDetails.status === 'adzan' ? (
        <div className="my-3 py-3 px-4 rounded-2xl bg-black/40 border border-[#4ADE80]/30 flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <Radio className="w-5 h-5 text-[#4ADE80] animate-spin" />
            <div>
              <p className="text-xs font-bold text-white">Waktu Ibadah Telah Masuk</p>
              <p className="text-[11px] text-slate-400">Dianjurkan menjawab adzan & mempersiapkan sholat.</p>
            </div>
          </div>
          <button
            onClick={playSampleAthan}
            className="px-3 py-1.5 rounded-xl bg-[#4ADE80]/20 text-[#86EFAC] border border-[#4ADE80]/40 text-xs font-bold flex items-center gap-1 active:scale-95 transition-all shadow-glow-mint"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Adzan</span>
          </button>
        </div>
      ) : clockDetails.status === 'iqamah_dnd' ? (
        <div className="my-3 py-3 px-4 rounded-2xl bg-black/40 border border-amber-400/30 flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center space-x-2.5">
            <BellOff className="w-4 h-4 text-[#F3E5AB]" />
            <div>
              <p className="text-xs font-bold text-white">Iqamah Grace Period (DND)</p>
              <p className="text-[11px] text-[#EAD8B1]">Mode senyap aktif hingga {clockDetails.iqamahEndTimeStr} WIB</p>
            </div>
          </div>
        </div>
      ) : (
        <div 
          id="horizon-countdown-box"
          className="my-3 py-3 px-4 rounded-2xl bg-black/35 border border-white/10 flex items-center justify-around backdrop-blur-md shadow-inner"
        >
          <div className="text-center">
            <span id="horizon-countdown-hours" className="text-3xl font-black tracking-wider text-white tnum">
              {clockDetails.countdownHours}
            </span>
            <span className="block text-[10px] tracking-wider uppercase text-slate-400 font-semibold mt-0.5">
              Hours
            </span>
          </div>
          <span className="text-2xl font-bold text-[#F3E5AB]/70 pb-3">:</span>
          <div className="text-center">
            <span id="horizon-countdown-mins" className="text-3xl font-black tracking-wider text-white tnum">
              {clockDetails.countdownMins}
            </span>
            <span className="block text-[10px] tracking-wider uppercase text-slate-400 font-semibold mt-0.5">
              Mins
            </span>
          </div>
          <span className="text-2xl font-bold text-[#F3E5AB]/70 pb-3">:</span>
          <div className="text-center">
            <span 
              id="horizon-countdown-secs" 
              className={`text-3xl font-black tracking-wider text-[#4ADE80] tnum ${
                clockDetails.isUrgent5Min ? 'animate-pulse text-[#86EFAC]' : ''
              }`}
            >
              {clockDetails.countdownSecs}
            </span>
            <span className="block text-[10px] tracking-wider uppercase text-slate-400 font-semibold mt-0.5">
              Secs
            </span>
          </div>
        </div>
      )}

      {/* Footer Details: Qibla & Test Athan & Ihtiyat Buffer toggle */}
      <div className="flex items-center justify-between pt-1 text-xs text-slate-300">
        <button
          id="btn-open-qibla-compass"
          onClick={onOpenQibla}
          className="flex items-center space-x-1.5 text-slate-300 hover:text-white px-2.5 py-1 rounded-xl bg-black/25 hover:bg-black/40 border border-white/10 hover:border-[#D4AF37]/35 transition-all active:scale-95 group"
          title="Buka Kompas Arah Kiblat Interaktif"
        >
          <Compass className="w-3.5 h-3.5 text-[#EAD8B1] group-hover:rotate-45 transition-transform" />
          <span>Qibla: {qiblaBearingText}</span>
          <ChevronRight className="w-3 h-3 text-[#4ADE80]" />
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleIhtiyat}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border transition-all ${
              useIhtiyat 
                ? 'bg-[#4ADE80]/15 text-[#86EFAC] border-[#4ADE80]/30' 
                : 'bg-white/5 text-slate-400 border-white/10'
            }`}
            title="Kemenag RI +2 min safety ihtiyat buffer"
          >
            {useIhtiyat ? 'Ihtiyat +2m: ON' : 'Ihtiyat: OFF'}
          </button>

          <button
            onClick={playSampleAthan}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-[#D4AF37]/20 text-[#F3E5AB] hover:bg-[#D4AF37]/30 border border-[#D4AF37]/30 transition-all active:scale-95 shadow-glow-gold"
          >
            <Play className="w-3 h-3 fill-current" />
            <span className="text-[10px] font-semibold">Athan</span>
          </button>
        </div>
      </div>

      {/* 6-Column Prayer Schedule Grid */}
      <div className="mt-4 pt-3 border-t border-white/10">
        <div className="grid grid-cols-6 gap-1.5 text-center text-xs">
          {scheduleItems.map((item) => {
            const Icon = item.icon;
            const isNext = item.key === clockDetails.nextPrayerName;
            return (
              <div
                key={item.key}
                id={`horizon-card-${item.key}`}
                className={`p-2 rounded-2xl transition-all ${
                  isNext
                    ? 'tab-active-pill border border-[#4ADE80]/50 shadow-glow-mint scale-[1.02]'
                    : 'liquid-glass border border-white/5 hover:border-white/15'
                }`}
              >
                <span className={`block text-[11px] font-semibold ${isNext ? 'text-[#86EFAC]' : 'text-slate-400'}`}>
                  {item.label}
                </span>
                <Icon className={`w-4 h-4 mx-auto my-1.5 ${isNext ? 'text-[#4ADE80]' : 'text-slate-300'}`} />
                <span className={`block font-bold text-[11px] tnum ${isNext ? 'text-white font-extrabold' : 'text-slate-200'}`}>
                  {item.time}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
