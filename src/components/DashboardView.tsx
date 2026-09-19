import React, { useState } from 'react';
import {
  Sparkles,
  CircleDot,
  ChevronRight,
  Monitor,
  Smartphone,
  Compass,
  BookOpen,
  Headphones,
  FileHeart,
} from 'lucide-react';
import { TabType, CuratedVerse } from '../types';
import { useNoorStore } from '../store/useNoorStore';
import { PrayerHorizonWidget } from './widgets/PrayerHorizonWidget';
import { SholatTrackerWidget } from './widgets/SholatTrackerWidget';
import { DailyVerseWidget } from './widgets/DailyVerseWidget';
import { SedekahSubuhWidget } from './widgets/SedekahSubuhWidget';
import { SunnahFastingWidget } from './widgets/SunnahFastingWidget';
import { QiblaCompassWidget } from './widgets/QiblaCompassWidget';
import { KhatamWidget } from './widgets/KhatamWidget';
import { SuhoorEngineWidget } from './widgets/SuhoorEngineWidget';
import { QRISModal } from './widgets/QRISModal';
import { VerseDetailModal } from './widgets/VerseDetailModal';
import { QiblaCompassModal } from './QiblaCompassModal';

interface DashboardViewProps {
  store: ReturnType<typeof useNoorStore>;
  calendarDateText: string;
  onNavigateTab: (tab: TabType) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  store,
  calendarDateText,
  onNavigateTab,
}) => {
  const [activeVerseForModal, setActiveVerseForModal] = useState<CuratedVerse | null>(null);
  const [isQRISOpen, setIsQRISOpen] = useState<boolean>(false);
  const [isQiblaOpen, setIsQiblaOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'mobile' | 'dashboard'>('mobile');

  return (
    <section id="view-dashboard" className="space-y-4 w-full">
      {/* Surface View Switcher Bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse" />
          <span className="text-[11px] font-bold text-white tracking-wide">NOORSYNC SUITE</span>
          <span className="text-[10px] text-slate-400">• {calendarDateText}</span>
        </div>

        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-2xl border border-white/10">
          <button
            onClick={() => setViewMode('mobile')}
            className={`px-2 py-0.5 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all ${
              viewMode === 'mobile'
                ? 'tab-active-pill text-[#86EFAC] shadow-glow-mint'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3 h-3" />
            <span>Mobile</span>
          </button>
          <button
            onClick={() => setViewMode('dashboard')}
            className={`px-2 py-0.5 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all ${
              viewMode === 'dashboard'
                ? 'tab-active-pill text-[#86EFAC] shadow-glow-mint'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3 h-3" />
            <span>12-Col</span>
          </button>
        </div>
      </div>

      {/* Responsive Container */}
      <div className={viewMode === 'dashboard' ? 'grid grid-cols-1 lg:grid-cols-12 gap-4' : 'space-y-4'}>
        
        {/* 1. Clock Engine & Dynamic Prayer Horizon Widget */}
        <div className={viewMode === 'dashboard' ? 'lg:col-span-7' : 'w-full'}>
          <PrayerHorizonWidget
            prayerTimes={store.prayerTimes}
            clockDetails={store.clockDetails}
            qiblaBearingText={store.qiblaInfo.compassText}
            useIhtiyat={store.useIhtiyat}
            onToggleIhtiyat={() => store.setUseIhtiyat(!store.useIhtiyat)}
            onOpenQibla={() => setIsQiblaOpen(true)}
          />
        </div>

        {/* 2. Circular Liquid-Glass Qibla Compass Widget */}
        <div className={viewMode === 'dashboard' ? 'lg:col-span-5' : 'w-full'}>
          <QiblaCompassWidget
            qiblaBearing={store.qiblaInfo.bearing}
            cityName={store.city}
            lat={store.coords.lat}
            lng={store.coords.lng}
            hapticEnabled={store.hapticEnabled}
            onOpenFullModal={() => setIsQiblaOpen(true)}
          />
        </div>

        {/* 3. Sholat Tracker Widget (Frictionless Momentum + Weekly Heat Grid) */}
        <div className={viewMode === 'dashboard' ? 'lg:col-span-6' : 'w-full'}>
          <SholatTrackerWidget
            todayLog={store.todayLog}
            onToggleSholat={store.toggleSholat}
            hapticEnabled={store.hapticEnabled}
          />
        </div>

        {/* 4. Daily Quran Verse & Audio Module */}
        <div className={viewMode === 'dashboard' ? 'lg:col-span-6' : 'w-full'}>
          <DailyVerseWidget
            onOpenDetailModal={(verse) => setActiveVerseForModal(verse)}
          />
        </div>

        {/* 5. Quranly-inspired Minimalist Khatam Planner & Reading Habit */}
        <div className={viewMode === 'dashboard' ? 'lg:col-span-6' : 'w-full'}>
          <KhatamWidget
            plan={store.khatamPlan}
            onIncrementPage={(pages) => store.incrementKhatamPage(pages)}
            onOpenFullView={() => onNavigateTab('khatam')}
          />
        </div>

        {/* 6. Smart Local Suhoor & Imsak Engine */}
        <div className={viewMode === 'dashboard' ? 'lg:col-span-6' : 'w-full'}>
          <SuhoorEngineWidget
            fajrTimeStr={store.prayerTimes.Fajr}
          />
        </div>

        {/* 7. Micro-Habits: Sedekah Subuh & Sunnah Fasting Planner */}
        <div className={viewMode === 'dashboard' ? 'lg:col-span-12 grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-4'}>
          <SedekahSubuhWidget
            records={store.sedekahRecords}
            onLogSedekah={store.logSedekah}
            onOpenQRIS={() => setIsQRISOpen(true)}
          />

          <SunnahFastingWidget
            fajrTimeStr={store.prayerTimes.Fajr}
          />
        </div>

      </div>

      {/* Featured Shortcut Hub: High-Value Tools */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        {/* Khatam Planner Shortcut */}
        <div
          id="btn-shortcut-khatam"
          onClick={() => onNavigateTab('khatam')}
          className="cursor-pointer liquid-glass hover:border-[#4ADE80]/40 p-3.5 rounded-3xl relative overflow-hidden transition-all active:scale-[0.98] group border border-white/10"
        >
          <div className="w-9 h-9 rounded-2xl bg-[#4ADE80]/20 text-[#86EFAC] flex items-center justify-center mb-2.5 border border-[#4ADE80]/30 group-hover:scale-110 transition-transform shadow-glow-mint">
            <BookOpen className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-white mb-0.5">Khatam Planner</h4>
          <p className="text-[10px] text-slate-400 line-clamp-2">
            Pelacak target baca harian &amp; 30 Juz
          </p>
        </div>

        {/* Reflection Vault Shortcut */}
        <div
          id="btn-shortcut-reflections"
          onClick={() => onNavigateTab('reflections')}
          className="cursor-pointer liquid-glass hover:border-[#D4AF37]/40 p-3.5 rounded-3xl relative overflow-hidden transition-all active:scale-[0.98] group border border-white/10"
        >
          <div className="w-9 h-9 rounded-2xl bg-[#D4AF37]/20 text-[#F3E5AB] flex items-center justify-center mb-2.5 border border-[#D4AF37]/30 group-hover:scale-110 transition-transform shadow-glow-gold">
            <FileHeart className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-white mb-0.5">Jurnal Doa</h4>
          <p className="text-[10px] text-slate-400 line-clamp-2">
            Catatan istikharah &amp; status terkabul
          </p>
        </div>

        {/* Smart Audio Hub Shortcut */}
        <div
          id="btn-shortcut-audio"
          onClick={() => onNavigateTab('audio')}
          className="cursor-pointer liquid-glass hover:border-[#4ADE80]/40 p-3.5 rounded-3xl relative overflow-hidden transition-all active:scale-[0.98] group border border-white/10"
        >
          <div className="w-9 h-9 rounded-2xl bg-[#4ADE80]/20 text-[#86EFAC] flex items-center justify-center mb-2.5 border border-[#4ADE80]/30 group-hover:scale-110 transition-transform shadow-glow-mint">
            <Headphones className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-white mb-0.5">Smart Audio</h4>
          <p className="text-[10px] text-slate-400 line-clamp-2">
            Mulk, Kahf, Yasin &amp; Al-Matsurat
          </p>
        </div>

        {/* Qibla Direction Finder Card */}
        <div
          id="btn-shortcut-qibla"
          onClick={() => setIsQiblaOpen(true)}
          className="cursor-pointer liquid-glass hover:border-[#D4AF37]/40 p-3.5 rounded-3xl relative overflow-hidden transition-all active:scale-[0.98] group border border-white/10"
        >
          <div className="w-9 h-9 rounded-2xl bg-[#D4AF37]/20 text-[#F3E5AB] flex items-center justify-center mb-2.5 border border-[#D4AF37]/30 group-hover:scale-110 transition-transform shadow-glow-gold">
            <Compass className="w-4 h-4 group-hover:rotate-45 transition-transform" />
          </div>
          <h4 className="text-xs font-bold text-white mb-0.5">Kompas Kiblat</h4>
          <p className="text-[10px] text-slate-400 line-clamp-2">
            Akurasi gyro 360° &amp; haptik Ka&apos;bah
          </p>
        </div>
      </div>

      {/* Modals for Widgets */}
      <QRISModal
        isOpen={isQRISOpen}
        onClose={() => setIsQRISOpen(false)}
        onDoneSedekah={(amount) => store.logSedekah(amount)}
      />

      <VerseDetailModal
        verse={activeVerseForModal}
        isOpen={!!activeVerseForModal}
        onClose={() => setActiveVerseForModal(null)}
      />

      {/* Interactive DeviceOrientation Qibla Compass Modal */}
      <QiblaCompassModal
        isOpen={isQiblaOpen}
        onClose={() => setIsQiblaOpen(false)}
        qiblaBearing={store.qiblaInfo.bearing}
        cityName={store.city}
        lat={store.coords.lat}
        lng={store.coords.lng}
        hapticEnabled={store.hapticEnabled}
      />
    </section>
  );
};
