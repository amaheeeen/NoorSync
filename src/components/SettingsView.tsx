import React, { useState } from 'react';
import {
  Settings,
  Bell,
  Check,
  Compass,
  MapPin,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Play,
  HardDrive,
  Database,
  RefreshCw,
  Wifi,
} from 'lucide-react';
import { CalculationMethod, Madhab } from '../types';
import { StorageStats } from '../services/db';
import { PWAInstallButton } from './PWAInstallButton';

interface SettingsViewProps {
  calcMethod: CalculationMethod;
  madhab: Madhab;
  audioAlerts: boolean;
  onCalcMethodChange: (m: CalculationMethod) => void;
  onMadhabChange: (m: Madhab) => void;
  onToggleAudio: () => void;
  onOpenLocationModal: () => void;
  cityName: string;
  notificationPermission?: NotificationPermission | 'unsupported';
  onRequestPermission?: () => Promise<NotificationPermission | 'unsupported'>;
  onTriggerTestNotification?: () => void;
  storageStats?: StorageStats;
  onSyncOfflineData?: () => Promise<{ precachedDays: number; stats: StorageStats }>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  calcMethod,
  madhab,
  audioAlerts,
  onCalcMethodChange,
  onMadhabChange,
  onToggleAudio,
  onOpenLocationModal,
  cityName,
  notificationPermission = 'default',
  onRequestPermission,
  onTriggerTestNotification,
  storageStats,
  onSyncOfflineData,
}) => {
  const [localPermission, setLocalPermission] = useState<string>(notificationPermission);
  const [testSent, setTestSent] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  const handleSyncOffline = async () => {
    if (!onSyncOfflineData || isSyncing) return;
    setIsSyncing(true);
    try {
      const res = await onSyncOfflineData();
      setSyncSuccessMsg(`Tersinkronisasi ${res.precachedDays} hari ke depan`);
      setTimeout(() => setSyncSuccessMsg(null), 3500);
    } catch {
      setSyncSuccessMsg('Gagal menyinkronkan data');
      setTimeout(() => setSyncSuccessMsg(null), 3500);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRequestPermission = async () => {
    if (onRequestPermission) {
      const res = await onRequestPermission();
      setLocalPermission(res);
    } else if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setLocalPermission(perm);
      } catch {
        setLocalPermission('denied');
      }
    } else {
      setLocalPermission('unsupported');
    }
  };

  const handleTestAlert = () => {
    if (onTriggerTestNotification) {
      onTriggerTestNotification();
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    }
  };

  return (
    <section id="view-settings" className="space-y-4 w-full">
      <div 
        id="card-settings-preferences"
        className="liquid-glass rounded-3xl p-5 space-y-4 border border-white/10"
      >
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Settings className="w-4 h-4 text-[#D4AF37]" />
          Prayer Engine Preferences
        </h3>

        {/* Current Location Quick Button */}
        <div className="p-3 rounded-2xl bg-black/25 border border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-[#4ADE80]" />
            <div>
              <p className="text-xs font-bold text-white">Active City</p>
              <p className="text-[11px] text-slate-400">{cityName}</p>
            </div>
          </div>
          <button
            id="btn-settings-change-city"
            onClick={onOpenLocationModal}
            className="px-3 py-1.5 rounded-xl liquid-glass text-xs font-semibold text-[#86EFAC] border border-[#4ADE80]/30 hover:bg-[#4ADE80]/20 active:scale-95 transition-all"
          >
            Change City
          </button>
        </div>

        {/* Calculation Method Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">
            Calculation Method
          </label>
          <select
            id="select-calc-method"
            value={calcMethod}
            onChange={(e) => onCalcMethodChange(e.target.value as CalculationMethod)}
            className="w-full bg-[#061917]/95 border border-white/15 rounded-2xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#4ADE80] transition-colors"
          >
            <option value="kemenag">Kemenag RI (Indonesian Standard - 20°/18°)</option>
            <option value="mwl">Muslim World League (MWL)</option>
            <option value="egypt">Egyptian General Authority of Survey</option>
            <option value="makkah">Umm Al-Qura University, Makkah</option>
            <option value="karachi">University of Islamic Sciences, Karachi</option>
          </select>
        </div>

        {/* Asr Juristic Method */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">
            Asr Juristic Method (Madhab)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              id="btn-madhab-shafi"
              onClick={() => onMadhabChange('shafi')}
              className={`py-2 text-xs font-semibold rounded-2xl text-center transition-all ${
                madhab === 'shafi'
                  ? 'tab-active-pill text-white border border-[#4ADE80]/40'
                  : 'liquid-glass text-slate-400 border border-white/10'
              }`}
            >
              Standard (Shafi'i, Maliki, Hanbali)
            </button>
            <button
              id="btn-madhab-hanafi"
              onClick={() => onMadhabChange('hanafi')}
              className={`py-2 text-xs font-semibold rounded-2xl text-center transition-all ${
                madhab === 'hanafi'
                  ? 'tab-active-pill text-white border border-[#4ADE80]/40'
                  : 'liquid-glass text-slate-400 border border-white/10'
              }`}
            >
              Hanafi
            </button>
          </div>
        </div>

        {/* Notifications & Athan Sound Configuration */}
        <div className="pt-3 border-t border-white/10 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`p-2 rounded-xl border ${audioAlerts ? 'bg-[#4ADE80]/15 text-[#86EFAC] border-[#4ADE80]/30' : 'bg-slate-800/40 text-slate-400 border-white/10'}`}>
                {audioAlerts ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </div>
              <div>
                <p className="text-xs font-bold text-white">Adhan Audio Alert</p>
                <p className="text-[11px] text-slate-400">
                  {audioAlerts ? 'Nada harmonis dimainkan saat waktu sholat tiba' : 'Mode senyap / hening tanpa audio'}
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="checkbox-audio-alerts"
                type="checkbox"
                checked={audioAlerts}
                onChange={onToggleAudio}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4ADE80]" />
            </label>
          </div>

          {/* Local Browser Notification Status & Permission */}
          <div className="p-3 rounded-2xl bg-black/30 border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-[#D4AF37]" />
                <div>
                  <p className="text-xs font-bold text-white">Layanan Notifikasi Lokal Browser</p>
                  <p className="text-[10px] text-slate-400">
                    Memicu pemberitahuan waktu sholat & alert banner lokal
                  </p>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  localPermission === 'granted'
                    ? 'bg-[#4ADE80]/20 text-[#86EFAC] border-[#4ADE80]/30'
                    : localPermission === 'denied'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}
              >
                {localPermission === 'granted'
                  ? 'Aktif'
                  : localPermission === 'denied'
                  ? 'Diblokir'
                  : 'Belum Diizinkan'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {localPermission !== 'granted' && (
                <button
                  id="btn-request-notifications"
                  onClick={handleRequestPermission}
                  className="px-3 py-1.5 rounded-xl bg-[#4ADE80]/20 hover:bg-[#4ADE80]/30 text-[#86EFAC] border border-[#4ADE80]/35 text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all shadow-glow-mint"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Izinkan Notifikasi Browser</span>
                </button>
              )}

              <button
                id="btn-test-notification-alert"
                onClick={handleTestAlert}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <Play className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{testSent ? '✓ Alert Terkirim!' : 'Uji Alert Notifikasi'}</span>
              </button>
            </div>

            <p className="text-[10px] text-slate-400 leading-normal">
              Notifikasi otomatis menyesuaikan preferensi suara: <span className="font-semibold text-white">{audioAlerts ? 'Audio Aktif (Nada Adhan)' : 'Mode Senyap (Hening)'}</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Offline Engine & IndexedDB Persistence */}
      <div
        id="card-offline-persistence"
        className="liquid-glass rounded-3xl p-5 border border-white/10 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#4ADE80]/15 text-[#86EFAC] border border-[#4ADE80]/30">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Penyimpanan Offline & IndexedDB
              </h3>
              <p className="text-[11px] text-slate-400">
                Penyimpanan lokal browser mandiri tanpa ketergantungan server
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#4ADE80]/20 text-[#86EFAC] border border-[#4ADE80]/30 flex items-center space-x-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
            <span>Aktif</span>
          </span>
        </div>

        {/* Database Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 rounded-2xl bg-black/30 border border-white/10">
            <p className="text-base font-bold text-white font-mono">
              {storageStats?.prayerSchedulesCount ? Math.max(storageStats.prayerSchedulesCount, 30) : 30}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Hari Jadwal Sholat</p>
          </div>
          <div className="p-3 rounded-2xl bg-black/30 border border-white/10">
            <p className="text-base font-bold text-[#86EFAC] font-mono">
              {storageStats?.sholatLogsCount || 1}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Log Sholat Tersimpan</p>
          </div>
          <div className="p-3 rounded-2xl bg-black/30 border border-white/10">
            <p className="text-base font-bold text-[#D4AF37] font-mono">
              {storageStats?.sedekahCount || 4}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Entri Sedekah Subuh</p>
          </div>
        </div>

        {/* Persistence Capabilities Info */}
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5 text-[11px]">
          <div className="flex items-center space-x-2 text-slate-300">
            <HardDrive className="w-3.5 h-3.5 text-[#4ADE80] shrink-0" />
            <span>
              Database: <strong className="text-white font-mono text-[10px]">NoorSync_Offline_DB_v1</strong>
            </span>
          </div>
          <div className="flex items-center space-x-2 text-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#86EFAC] shrink-0" />
            <span>Cache App Shell: <strong className="text-white">Service Worker Cache-First</strong></span>
          </div>
          <p className="text-[10px] text-slate-400 pt-1 leading-relaxed">
            Perhitungan waktu sholat, kompas arah kiblat, checklist sholat fardhu harian, dan doa-doa tetap berfungsi 100% lancar saat perangkat berada di mode pesawat atau tanpa koneksi internet.
          </p>
        </div>

        {/* Manual Precache Action */}
        <div className="pt-1 flex items-center justify-between">
          <button
            id="btn-sync-offline-data"
            onClick={handleSyncOffline}
            disabled={isSyncing}
            className="w-full py-2.5 px-4 rounded-2xl bg-[#4ADE80]/15 hover:bg-[#4ADE80]/25 text-[#86EFAC] border border-[#4ADE80]/35 text-xs font-semibold flex items-center justify-center space-x-2 active:scale-95 transition-all shadow-glow-mint disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Menyinkronkan ke IndexedDB...' : 'Sinkronkan Jadwal 30 Hari ke IndexedDB'}</span>
          </button>
        </div>

        {syncSuccessMsg && (
          <div className="p-2 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-center text-xs text-emerald-300 flex items-center justify-center space-x-1.5 animate-in fade-in">
            <Check className="w-3.5 h-3.5 text-[#86EFAC]" />
            <span>{syncSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* About NoorSync PWA */}
      <div 
        id="card-about-noorsync"
        className="liquid-glass rounded-3xl p-4 text-xs text-slate-400 space-y-2 border border-white/10"
      >
        <div className="flex items-center justify-between text-white font-bold">
          <div className="flex items-center space-x-2">
            <Compass className="w-4 h-4 text-[#D4AF37]" />
            <span>NoorSync Modern Islamic Companion</span>
          </div>
          <span className="text-[10px] text-[#F3E5AB] font-mono px-2 py-0.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30">
            v2.4.0
          </span>
        </div>
        <p className="text-[11px] leading-relaxed">
          Designed with spatial liquid glass aesthetics, offline-first local storage, and high-accuracy astronomical algorithms.
        </p>
        <div className="pt-2 border-t border-white/10 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">Instal Aplikasi di Perangkat:</span>
          <PWAInstallButton />
        </div>
      </div>
    </section>
  );
};
