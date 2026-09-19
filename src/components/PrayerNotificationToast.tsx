import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Bell,
  Volume2,
  VolumeX,
  X,
  Check,
  Sparkles,
  MapPin,
  Clock,
} from 'lucide-react';
import { PrayerNotificationPayload } from '../services/notificationService';

interface PrayerNotificationToastProps {
  notification: PrayerNotificationPayload | null;
  onClose: () => void;
  onLogPrayer?: (prayerName: string) => void;
  onToggleAudio?: () => void;
}

export const PrayerNotificationToast: React.FC<PrayerNotificationToastProps> = ({
  notification,
  onClose,
  onLogPrayer,
  onToggleAudio,
}) => {
  useEffect(() => {
    if (!notification) return;

    // Auto dismiss after 9 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 9000);

    return () => clearTimeout(timer);
  }, [notification, onClose]);

  if (!notification) return null;

  return (
    <AnimatePresence>
      <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <motion.div
          id="toast-prayer-notification"
          initial={{ opacity: 0, y: -28, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 26, stiffness: 350, mass: 0.8 }}
          className="pointer-events-auto liquid-glass rounded-3xl p-3.5 sm:p-4 max-w-md w-full border border-[#D4AF37]/40 shadow-glass space-y-3 relative overflow-hidden backdrop-blur-xl"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#4ADE80]/15 rounded-full blur-2xl pointer-events-none" />

          {/* Top Banner Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-[#4ADE80]/20 text-[#86EFAC] border border-[#4ADE80]/40 shadow-glow-mint">
                <Bell className="w-4 h-4 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-[#86EFAC] uppercase tracking-wider">
                    {notification.isTest ? 'PENGUJIAN NOTIFIKASI' : 'WAKTU SHOLAT TIBA'}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-ping" />
                </div>
                <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                  <span>Waktu Sholat {notification.prayerName}</span>
                  {notification.prayerArabic && (
                    <span className="font-arabic font-normal text-[#F3E5AB] text-xs">
                      ({notification.prayerArabic})
                    </span>
                  )}
                </h4>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-xl transition-colors"
              title="Tutup Notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Details Row: Time, City, Audio Mode */}
          <div className="p-2.5 rounded-2xl bg-black/35 border border-white/5 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 text-slate-300 font-medium">
                <Clock className="w-3.5 h-3.5 text-[#4ADE80]" />
                <span className="font-bold text-white tnum">{notification.prayerTime}</span>
              </div>
              <div className="flex items-center space-x-1 text-slate-400 text-[11px]">
                <MapPin className="w-3 h-3 text-[#EAD8B1]" />
                <span>{notification.cityName}</span>
              </div>
            </div>

            <div
              className={`flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                notification.audioAlerts
                  ? 'bg-[#4ADE80]/15 text-[#86EFAC] border-[#4ADE80]/30'
                  : 'bg-slate-700/40 text-slate-300 border-white/10'
              }`}
            >
              {notification.audioAlerts ? (
                <>
                  <Volume2 className="w-3 h-3" />
                  <span>Audio: Aktif</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3 h-3" />
                  <span>Mode Hening</span>
                </>
              )}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-0.5 gap-2">
            <p className="text-[10px] text-slate-400 italic">
              "Hayya 'alash Shalah — Mari tunaikan sholat"
            </p>

            <div className="flex items-center gap-1.5 shrink-0">
              {onLogPrayer && (
                <button
                  onClick={() => {
                    onLogPrayer(notification.prayerName);
                    onClose();
                  }}
                  className="px-2.5 py-1 rounded-xl bg-[#4ADE80]/25 hover:bg-[#4ADE80]/35 text-[#86EFAC] border border-[#4ADE80]/40 text-[11px] font-bold flex items-center gap-1 active:scale-95 transition-all shadow-glow-mint"
                >
                  <Check className="w-3 h-3" />
                  <span>Catat</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-[11px] font-semibold active:scale-95 transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
