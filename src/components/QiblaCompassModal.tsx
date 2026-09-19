import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Compass,
  X,
  Navigation,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Sliders,
  Smartphone,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { calculateDistanceToKaaba } from '../utils/prayerCalculator';
import { playCompletionChime, playQiblaAlignedHapticSound } from '../utils/audio';

interface QiblaCompassModalProps {
  isOpen: boolean;
  onClose: () => void;
  qiblaBearing: number;
  cityName: string;
  lat: number;
  lng: number;
  hapticEnabled?: boolean;
}

export const QiblaCompassModal: React.FC<QiblaCompassModalProps> = ({
  isOpen,
  onClose,
  qiblaBearing,
  cityName,
  lat,
  lng,
  hapticEnabled = true,
}) => {
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [sensorAvailable, setSensorAvailable] = useState<boolean>(false);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');
  const [manualSlider, setManualSlider] = useState<number>(0);
  const [useSimulation, setUseSimulation] = useState<boolean>(false);
  const lastVibratedRef = useRef<number>(0);

  const distanceKm = calculateDistanceToKaaba(lat, lng);

  // Active heading used for calculation
  const currentHeading = useSimulation ? manualSlider : deviceHeading;

  // Calculate deviation between phone orientation and Qibla
  // When deviation is 0 (or close to 0), the top of the phone points directly to Kaaba
  const angleDiff = ((qiblaBearing - currentHeading + 540) % 360) - 180;
  const isAligned = Math.abs(angleDiff) <= 4;
  const isPreciseAligned = Math.abs(angleDiff) <= 2;
  const [showCalibrationCue, setShowCalibrationCue] = useState<boolean>(false);

  // Haptic & sound trigger upon alignment
  useEffect(() => {
    if (isAligned && isOpen) {
      const now = Date.now();
      if (now - lastVibratedRef.current > 3000) {
        lastVibratedRef.current = now;
        if (isPreciseAligned) {
          playQiblaAlignedHapticSound();
        } else {
          playCompletionChime();
        }
        if (hapticEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate(isPreciseAligned ? [30, 40, 60] : [40, 50, 40]);
          } catch {}
        }
      }
    }
  }, [isAligned, isPreciseAligned, isOpen, hapticEnabled]);

  // Handle DeviceOrientation API
  useEffect(() => {
    if (!isOpen) return;

    let hasOrientationSupport = false;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      hasOrientationSupport = true;
      setSensorAvailable(true);
      setPermissionState('granted');

      let heading: number | null = null;

      // iOS compass heading (0 - 360 magnetic heading)
      if ((event as any).webkitCompassHeading !== undefined) {
        heading = (event as any).webkitCompassHeading;
      } else if (event.alpha !== null) {
        // Android standard heading: 360 - alpha
        heading = (360 - event.alpha) % 360;
      }

      if (heading !== null) {
        setDeviceHeading(Math.round(heading));
      }
    };

    // Check if permission request needed (iOS 13+)
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      setPermissionState('prompt');
    } else if (typeof window !== 'undefined' && 'ondeviceorientation' in window) {
      // Test orientation listener
      window.addEventListener('deviceorientation', handleOrientation, true);
      window.addEventListener('deviceorientationabsolute' as any, handleOrientation, true);

      // Fallback timeout if no sensor data received (e.g. desktop)
      const timeout = setTimeout(() => {
        if (!hasOrientationSupport) {
          setSensorAvailable(false);
          setUseSimulation(true);
        }
      }, 1200);

      return () => {
        clearTimeout(timeout);
        window.removeEventListener('deviceorientation', handleOrientation, true);
        window.removeEventListener('deviceorientationabsolute' as any, handleOrientation, true);
      };
    } else {
      setPermissionState('unsupported');
      setUseSimulation(true);
    }
  }, [isOpen]);

  const requestIOSPermission = async () => {
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      try {
        const res = await (DeviceOrientationEvent as any).requestPermission();
        if (res === 'granted') {
          setPermissionState('granted');
          setUseSimulation(false);
        } else {
          setPermissionState('denied');
          setUseSimulation(true);
        }
      } catch (e) {
        setPermissionState('denied');
        setUseSimulation(true);
      }
    }
  };

  // Cardinal direction ticks
  const compassDegreeTicks = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="modal-qibla-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-3 sm:p-4"
        >
          <motion.div
            id="modal-qibla-content"
            initial={{ opacity: 0, scale: 0.92, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350, mass: 0.8 }}
            onClick={(e) => e.stopPropagation()}
            className="liquid-glass rounded-3xl p-5 w-full max-w-sm space-y-4 border border-[#D4AF37]/35 max-h-[92vh] overflow-y-auto no-scrollbar shadow-glass text-center relative"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-left">
                <div className={`p-2 rounded-xl border transition-colors ${
                  isAligned 
                    ? 'bg-[#4ADE80]/20 border-[#4ADE80]/40 text-[#86EFAC] shadow-glow-mint' 
                    : 'bg-[#D4AF37]/15 border-[#D4AF37]/30 text-[#EAD8B1]'
                }`}>
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white">Qibla Direction Finder</h4>
                  <p className="text-[10px] text-slate-400">
                    {cityName} • {distanceKm.toLocaleString('id-ID')} km ke Ka’bah
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Alignment Status Banner */}
            <div className={`py-2 px-3 rounded-2xl border text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
              isAligned
                ? 'bg-[#4ADE80]/20 text-[#86EFAC] border-[#4ADE80]/50 shadow-glow-mint'
                : 'bg-black/40 text-[#EAD8B1] border-white/10'
            }`}>
              {isAligned ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#4ADE80] animate-bounce" />
                  <span>TERALIN DENGAN KIBLAT (Aligned)</span>
                </>
              ) : (
                <>
                  <Navigation className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
                  <span>
                    Putar {Math.round(Math.abs(angleDiff))}° ke {angleDiff > 0 ? 'Kanan' : 'Kiri'}
                  </span>
                </>
              )}
            </div>

            {/* Compass Stage Area */}
            <div className="relative w-64 h-64 mx-auto my-2 flex items-center justify-center">
              {/* Outer Glow Halo when aligned */}
              <div className={`absolute inset-0 rounded-full transition-all duration-700 pointer-events-none ${
                isAligned 
                  ? 'bg-[#4ADE80]/15 shadow-glow-mint scale-105' 
                  : 'bg-[#D4AF37]/5'
              }`} />

              {/* Fixed Phone Reference Marker (Top Indicator) */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20 flex flex-col items-center">
                <div className={`w-3 h-3 rotate-45 border-t-2 border-l-2 transition-colors ${
                  isAligned ? 'border-[#4ADE80] bg-[#4ADE80]' : 'border-[#EAD8B1]'
                }`} />
              </div>

              {/* Rotating Compass Ring: Rotates counter to device heading */}
              <div
                id="compass-dial-ring"
                className="w-full h-full rounded-full border-2 border-white/15 relative transition-transform duration-300 ease-out bg-black/40 backdrop-blur-md shadow-inner flex items-center justify-center"
                style={{ transform: `rotate(${-currentHeading}deg)` }}
              >
                {/* Degree tick markers around ring */}
                {compassDegreeTicks.map((deg) => (
                  <div
                    key={deg}
                    className="absolute w-full h-full top-0 left-0 flex justify-center pointer-events-none"
                    style={{ transform: `rotate(${deg}deg)` }}
                  >
                    <span className={`text-[9px] font-bold mt-1.5 ${
                      deg === 0 ? 'text-[#4ADE80] text-[11px]' : 'text-slate-500'
                    }`}>
                      {deg === 0 ? 'N' : deg === 90 ? 'E' : deg === 180 ? 'S' : deg === 270 ? 'W' : deg}
                    </span>
                  </div>
                ))}

                {/* Needle to Qibla (Kaaba Bearing) */}
                <div
                  id="compass-qibla-needle"
                  className="absolute w-full h-full top-0 left-0 flex justify-center items-center pointer-events-none transition-transform"
                  style={{ transform: `rotate(${qiblaBearing}deg)` }}
                >
                  {/* Golden Kaaba Pointer Needle */}
                  <div className="absolute top-6 flex flex-col items-center">
                    {/* Kaaba Golden Icon Emblem */}
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-b from-[#D4AF37] to-[#8C6D23] p-1 border-2 shadow-lg flex flex-col items-center justify-center transition-transform ${
                      isAligned ? 'scale-125 border-[#4ADE80] shadow-glow-mint' : 'border-[#F3E5AB]'
                    }`}>
                      {/* Stylized Kaaba Gold Kiswah Band */}
                      <div className="w-full h-1 bg-[#F3E5AB] rounded-xs mb-0.5" />
                      <div className="w-2 h-2.5 bg-black/60 rounded-xs" />
                    </div>
                    <div className="w-0.5 h-16 bg-gradient-to-b from-[#D4AF37] to-transparent" />
                  </div>
                </div>

                {/* Center Pivot Bezel */}
                <div className="w-20 h-20 rounded-full bg-[#061917] border-2 border-[#D4AF37]/50 shadow-md flex flex-col items-center justify-center z-10">
                  <span className="text-xs font-black text-white tnum">{currentHeading}°</span>
                  <span className="text-[9px] font-bold text-[#EAD8B1] tracking-wider uppercase">
                    Heading
                  </span>
                </div>
              </div>
            </div>

            {/* Target Qibla Bearing Details */}
            <div className="p-3 rounded-2xl bg-black/30 border border-white/5 flex items-center justify-between text-xs">
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block font-medium">Arah Kiblat Target:</span>
                <span className="font-extrabold text-[#F3E5AB] text-sm tnum">
                  {qiblaBearing}° Barat-Laut (NW)
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-medium">Koordinat:</span>
                <span className="font-mono text-[11px] text-slate-300">
                  {lat.toFixed(2)}°, {lng.toFixed(2)}°
                </span>
              </div>
            </div>

            {/* Figure-8 Calibration Cue Banner */}
            <div className="flex items-center justify-between p-2 rounded-2xl bg-white/[0.04] border border-white/10 text-left text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-base">♾️</span>
                <div>
                  <p className="font-semibold text-white text-[11px]">Kalibrasi Gerakan Angka 8</p>
                  <p className="text-[10px] text-slate-400">Putar HP seperti angka 8 di udara jika arah melenceng</p>
                </div>
              </div>
              <button
                onClick={() => setShowCalibrationCue(!showCalibrationCue)}
                className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/15 text-[10px] font-bold text-slate-200"
              >
                {showCalibrationCue ? 'Tutup' : 'Panduan'}
              </button>
            </div>

            {showCalibrationCue && (
              <div className="p-3 rounded-2xl bg-teal-950/40 border border-teal-500/30 text-xs text-left space-y-2 animate-in fade-in">
                <p className="font-bold text-[#86EFAC] text-[11px] flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Kalibrasi Sensor Magnetometer (Zero-Lag Gyro)</span>
                </p>
                <p className="text-[10px] text-slate-300 leading-relaxed">
                  1. Pegang perangkat Anda mendatar menghadap ke atas.<br />
                  2. Ayunkan perlahan membentuk lintasan <strong>angka 8 (∞)</strong> sebanyak 3–5 kali.<br />
                  3. Indikator hijau & nada haptik akan terkunci saat tepat menghadap Ka&apos;bah.
                </p>
              </div>
            )}

            {/* iOS Permission Prompt */}
            {permissionState === 'prompt' && (
              <button
                onClick={requestIOSPermission}
                className="w-full py-2.5 px-4 rounded-xl bg-[#D4AF37]/20 text-[#F3E5AB] border border-[#D4AF37]/40 text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-glow-gold"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Izinkan Sensor Kompas (iOS)</span>
              </button>
            )}

            {/* Simulation / Manual Rotation Slider (For Desktop or Non-Sensor Environments) */}
            <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#86EFAC]" />
                  <span>{useSimulation ? 'Rotasi Manual (Simulasi Desktop)' : 'Sensor Kompas Otomatis'}</span>
                </span>
                <button
                  onClick={() => setUseSimulation(!useSimulation)}
                  className="text-[10px] text-[#86EFAC] hover:underline"
                >
                  {useSimulation ? 'Gunakan Sensor' : 'Mode Simulasi'}
                </button>
              </div>

              {useSimulation && (
                <div className="space-y-1 pt-1">
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={manualSlider}
                    onChange={(e) => setManualSlider(Number(e.target.value))}
                    className="w-full accent-[#4ADE80] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>0°</span>
                    <span>Putar hingga {qiblaBearing}°</span>
                    <span>360°</span>
                  </div>
                </div>
              )}

              <p className="text-[10px] text-slate-400 text-left leading-relaxed">
                Tip: Letakkan perangkat di permukaan datar horizontal dan jauhkan dari benda berbahan magnet logam.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
