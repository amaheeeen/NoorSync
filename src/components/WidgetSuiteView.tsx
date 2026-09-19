import React, { useState } from 'react';
import { LayoutGrid, Smartphone, Monitor } from 'lucide-react';
import { PrayerHorizonWidget } from './widgets/PrayerHorizonWidget';
import { SholatTrackerWidget } from './widgets/SholatTrackerWidget';
import { DailyVerseWidget } from './widgets/DailyVerseWidget';
import { SedekahSubuhWidget } from './widgets/SedekahSubuhWidget';
import { SunnahFastingWidget } from './widgets/SunnahFastingWidget';
import { QiblaCompassWidget } from './widgets/QiblaCompassWidget';
import { QRISModal } from './widgets/QRISModal';
import { VerseDetailModal } from './widgets/VerseDetailModal';
import { QiblaCompassModal } from './QiblaCompassModal';
import { CuratedVerse } from '../types';
import { useNoorStore } from '../store/useNoorStore';

interface WidgetSuiteViewProps {
  store: ReturnType<typeof useNoorStore>;
  onNavigateToIstikharah?: () => void;
  onNavigateToTasbih?: () => void;
}

export const WidgetSuiteView: React.FC<WidgetSuiteViewProps> = ({
  store,
  onNavigateToIstikharah,
  onNavigateToTasbih,
}) => {
  const [activeVerseForModal, setActiveVerseForModal] = useState<CuratedVerse | null>(null);
  const [isQRISOpen, setIsQRISOpen] = useState(false);
  const [isQiblaOpen, setIsQiblaOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'mobile' | 'dashboard'>('dashboard');

  return (
    <div className="w-full space-y-4">
      {/* Surface Layout Toggle (Mobile Preview 430px vs 12-Column Responsive Dashboard) */}
      <div className="flex items-center justify-between px-1 py-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse" />
          <span className="font-bold text-white text-[11px] tracking-wide">ISLAMIC WIDGET SUITE</span>
          <span className="text-[10px] text-slate-400 hidden sm:inline">• Live Master Clock Engine</span>
        </div>

        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-2xl border border-white/10">
          <button
            onClick={() => setViewMode('mobile')}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all ${
              viewMode === 'mobile'
                ? 'tab-active-pill text-[#86EFAC] shadow-glow-mint'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3 h-3" />
            <span>Mobile (430px)</span>
          </button>
          <button
            onClick={() => setViewMode('dashboard')}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all ${
              viewMode === 'dashboard'
                ? 'tab-active-pill text-[#86EFAC] shadow-glow-mint'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3 h-3" />
            <span>12-Col Bento</span>
          </button>
        </div>
      </div>

      {/* Main Container: dynamically constrained to max-w-[430px] or fluid 12-col grid */}
      <div className={viewMode === 'mobile' ? 'max-w-[430px] mx-auto space-y-4' : 'w-full'}>
        <div className={viewMode === 'dashboard' ? 'grid grid-cols-1 lg:grid-cols-12 gap-4' : 'space-y-4'}>
          
          {/* 1. Prayer Horizon Widget (spans 7 cols on desktop) */}
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

          {/* 3. Sholat Tracker Widget (spans 6 cols on desktop) */}
          <div className={viewMode === 'dashboard' ? 'lg:col-span-6' : 'w-full'}>
            <SholatTrackerWidget
              todayLog={store.todayLog}
              onToggleSholat={store.toggleSholat}
              hapticEnabled={store.hapticEnabled}
            />
          </div>

          {/* 4. Daily Quran Verse & Audio Module (spans 6 cols on desktop) */}
          <div className={viewMode === 'dashboard' ? 'lg:col-span-6' : 'w-full'}>
            <DailyVerseWidget
              onOpenDetailModal={(verse) => setActiveVerseForModal(verse)}
            />
          </div>

          {/* 5. Micro-Habit Widgets: Sedekah Subuh & Sunnah Fasting (spans 12 cols on desktop) */}
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
      </div>

      {/* Modals */}
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

      <QiblaCompassModal
        isOpen={isQiblaOpen}
        onClose={() => setIsQiblaOpen(false)}
        qiblaBearing={store.qiblaInfo.bearing}
        cityName={store.city}
        lat={store.coords.lat}
        lng={store.coords.lng}
        hapticEnabled={store.hapticEnabled}
      />
    </div>
  );
};
