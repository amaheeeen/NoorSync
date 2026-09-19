import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  Navigation,
  CheckCircle2,
  AlertCircle,
  Sliders,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Maximize2,
  MapPin,
} from 'lucide-react';
import { calculateDistanceToKaaba } from '../../utils/prayerCalculator';
import { playCompletionChime } from '../../utils/audio';

interface QiblaCompassWidgetProps {
  qiblaBearing: number;
  cityName?: string;
  lat?: number;
  lng?: number;
  hapticEnabled?: boolean;
  onOpenFullModal?: () => void;
  className?: string;
}

export const QiblaCompassWidget: React.FC<QiblaCompassWidgetProps> = ({
  qiblaBearing,
  cityName = 'Jakarta',
  lat = -6.2088,
  lng = 106.8456,
  hapticEnabled = true,
  onOpenFullModal,
  className = '',
}) => {
  // Headings in continuous degrees to avoid 360 -> 0 degree wrapping jumps
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [rawHeadingDisplay, setRawHeadingDisplay] = useState<number>(0);
  const [sensorStatus, setSensorStatus] = useState<'detecting' | 'active' | 'unavailable' | 'permission_needed'>('detecting');
  const [manualSlider, setManualSlider] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [showSliderControl, setShowSliderControl] = useState<boolean>(false);

  const prevHeadingRef = useRef<number>(0);
  const lastVibrateRef = useRef<number>(0);
  const hasReceivedEventsRef = useRef<boolean>(false);

  const distanceKm = calculateDistanceToKaaba(lat, lng);

  // Active heading value (continuous degrees)
  const activeHeading = isSimulating ? manualSlider : deviceHeading;
  const activeHeadingDisplay = isSimulating ? manualSlider : rawHeadingDisplay;

  // Deviation to Kaaba (-180 to +180)
  const angleDiff = ((qiblaBearing - (activeHeadingDisplay % 360) + 540) % 360) - 180;
  const isAligned = Math.abs(angleDiff) <= 4;

  // Alignment feedback: subtle haptic & harmonic chime
  useEffect(() => {
    if (isAligned) {
      const now = Date.now();
      if (now - lastVibrateRef.current > 3500) {
        lastVibrateRef.current = now;
        playCompletionChime();
        if (hapticEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate([40, 50, 40]);
          } catch {}
        }
      }
    }
  }, [isAligned, hapticEnabled]);

  // Set up DeviceOrientation API
  useEffect(() => {
    let unmounted = false;

    // Check for iOS 13+ permission requirement
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      setSensorStatus('permission_needed');
      return;
    }

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (unmounted) return;

      let compassHeading: number | null = null;

      // iOS Safari (magnetic compass heading)
      if ((event as any).webkitCompassHeading !== undefined && (event as any).webkitCompassHeading !== null) {
        compassHeading = (event as any).webkitCompassHeading;
      } else if (event.alpha !== null) {
        // Android / standard: alpha is counter-clockwise rotation around Z
        compassHeading = (360 - event.alpha) % 360;
      }

      if (compassHeading !== null && !isNaN(compassHeading)) {
        hasReceivedEventsRef.current = true;
        setSensorStatus('active');

        const normalized = Math.round(compassHeading);
        setRawHeadingDisplay(normalized);

        // Shortest path angle accumulation to ensure continuous, non-snapping rotation
        let diff = normalized - (prevHeadingRef.current % 360);
        if (diff < -180) diff += 360;
        if (diff > 180) diff -= 360;

        const continuous = prevHeadingRef.current + diff;
        prevHeadingRef.current = continuous;
        setDeviceHeading(continuous);
      }
    };

    if (typeof window !== 'undefined' && 'ondeviceorientation' in window) {
      window.addEventListener('deviceorientation', handleOrientation, true);
      window.addEventListener('deviceorientationabsolute' as any, handleOrientation, true);

      // Grace period: if no events received within 1500ms, mark as unavailable (Desktop / non-sensor device)
      const timer = setTimeout(() => {
        if (!hasReceivedEventsRef.current && !unmounted) {
          setSensorStatus('unavailable');
          setIsSimulating(true);
        }
      }, 1500);

      return () => {
        unmounted = true;
        clearTimeout(timer);
        window.removeEventListener('deviceorientation', handleOrientation, true);
        window.removeEventListener('deviceorientationabsolute' as any, handleOrientation, true);
      };
    } else {
      setSensorStatus('unavailable');
      setIsSimulating(true);
    }
  }, []);

  const requestIOSPermission = async () => {
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          setSensorStatus('active');
          setIsSimulating(false);
        } else {
          setSensorStatus('unavailable');
          setIsSimulating(true);
        }
      } catch (err) {
        setSensorStatus('unavailable');
        setIsSimulating(true);
      }
    }
  };

  const handleManualSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setManualSlider(val);
    setRawHeadingDisplay(val);

    let diff = val - (prevHeadingRef.current % 360);
    if (diff < -180) diff += 360;
    if (diff > 180) diff -= 360;
    const continuous = prevHeadingRef.current + diff;
    prevHeadingRef.current = continuous;
    setDeviceHeading(continuous);
  };

  const ticks = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

  return (
    <div
      id="widget-qibla-compass"
      className={`liquid-glass rounded-3xl p-5 border relative overflow-hidden transition-all duration-300 ${
        isAligned ? 'border-[#4ADE80]/50 shadow-glow-mint' : 'border-white/10'
      } ${className}`}
    >
      {/* Background radial atmosphere */}
      <div
        className={`absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl pointer-events-none transition-opacity duration-700 ${
          isAligned ? 'bg-[#4ADE80]/20 opacity-100' : 'bg-[#D4AF37]/10 opacity-50'
        }`}
      />

      {/* Widget Header */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center space-x-2">
          <div
            className={`p-2 rounded-2xl border transition-all ${
              isAligned
                ? 'bg-[#4ADE80]/20 text-[#86EFAC] border-[#4ADE80]/40 shadow-glow-mint'
                : 'bg-[#D4AF37]/15 text-[#F3E5AB] border-[#D4AF37]/30'
            }`}
          >
            <Compass className={`w-4 h-4 ${isAligned ? 'animate-spin-slow' : ''}`} />
          </div>
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-1.5">
              <span>Qibla Compass</span>
              {isAligned && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#4ADE80]/20 text-[#86EFAC] text-[9px] font-bold border border-[#4ADE80]/30">
                  <Sparkles className="w-2.5 h-2.5" /> ALIGNED
                </span>
              )}
            </h3>
            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#EAD8B1]" />
              <span>{cityName} • {distanceKm.toLocaleString('id-ID')} km ke Makkah</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSliderControl(!showSliderControl)}
            className={`p-1.5 rounded-xl border transition-all ${
              showSliderControl
                ? 'bg-[#4ADE80]/20 text-[#86EFAC] border-[#4ADE80]/40'
                : 'bg-black/30 text-slate-400 hover:text-white border-white/10'
            }`}
            title="Pengaturan Simulasi"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
          {onOpenFullModal && (
            <button
              onClick={onOpenFullModal}
              className="p-1.5 rounded-xl bg-black/30 text-slate-400 hover:text-white border border-white/10 transition-colors"
              title="Buka Layar Penuh"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Alignment Status Pill */}
      <div
        className={`py-1.5 px-3 rounded-2xl border text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 mb-3 ${
          isAligned
            ? 'bg-[#4ADE80]/20 text-[#86EFAC] border-[#4ADE80]/50 shadow-glow-mint'
            : 'bg-black/40 text-[#EAD8B1] border-white/10'
        }`}
      >
        {isAligned ? (
          <>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#4ADE80] animate-bounce" />
            <span>Tepat Menghadap Ka'bah ({qiblaBearing}°)</span>
          </>
        ) : (
          <>
            <Navigation className="w-3 h-3 text-[#D4AF37] animate-pulse" />
            <span>
              Putar {Math.abs(Math.round(angleDiff))}° ke {angleDiff > 0 ? 'Kanan' : 'Kiri'}
            </span>
          </>
        )}
      </div>

      {/* CIRCULAR LIQUID-GLASS COMPASS STAGE */}
      <div className="relative w-56 h-56 sm:w-60 sm:h-60 mx-auto my-1 flex items-center justify-center select-none touch-none">
        
        {/* Outer Circular Aura / Glow Rings */}
        <div
          className={`absolute inset-0 rounded-full transition-all duration-700 pointer-events-none ${
            isAligned
              ? 'bg-[#4ADE80]/15 shadow-glow-mint scale-105 border border-[#4ADE80]/30'
              : 'bg-[#D4AF37]/5 border border-white/10'
          }`}
        />

        {/* Fixed Device Top Indicator Marker */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center">
          <div
            className={`w-3.5 h-3.5 rotate-45 border-t-2 border-l-2 transition-colors duration-300 ${
              isAligned ? 'border-[#4ADE80] bg-[#4ADE80]/80' : 'border-[#EAD8B1] bg-black/50'
            }`}
          />
        </div>

        {/* Rotating Circular Liquid Glass Bezel (Rotates counter to device heading) */}
        <div
          id="circular-compass-dial"
          className="w-full h-full rounded-full border-2 relative transition-transform duration-300 ease-out bg-[#061917]/85 backdrop-blur-xl shadow-glass flex items-center justify-center overflow-hidden"
          style={{
            transform: `rotate(${-activeHeading}deg)`,
            borderColor: isAligned ? 'rgba(74, 222, 128, 0.45)' : 'rgba(255, 255, 255, 0.12)',
            transition: 'transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
        >
          {/* Subtle Concentric Rings inside Glass Dial */}
          <div className="absolute w-44 h-44 rounded-full border border-white/5 pointer-events-none" />
          <div className="absolute w-32 h-32 rounded-full border border-white/5 pointer-events-none" />

          {/* Dial Tick Marks and Cardinal Labels */}
          {ticks.map((deg) => {
            const isNorth = deg === 0;
            const isCardinal = deg % 90 === 0;
            const cardinalLabel = isNorth ? 'N' : deg === 90 ? 'E' : deg === 180 ? 'S' : deg === 270 ? 'W' : null;

            return (
              <div
                key={deg}
                className="absolute w-full h-full top-0 left-0 flex justify-center pointer-events-none"
                style={{ transform: `rotate(${deg}deg)` }}
              >
                <div className="flex flex-col items-center mt-2">
                  <div
                    className={`w-0.5 ${
                      isNorth
                        ? 'h-3 bg-[#4ADE80]'
                        : isCardinal
                        ? 'h-2.5 bg-[#EAD8B1]'
                        : 'h-1.5 bg-slate-500/50'
                    }`}
                  />
                  {cardinalLabel ? (
                    <span
                      className={`text-[10px] font-black mt-1 ${
                        isNorth ? 'text-[#4ADE80]' : 'text-slate-300'
                      }`}
                    >
                      {cardinalLabel}
                    </span>
                  ) : (
                    <span className="text-[8px] text-slate-500 font-mono mt-0.5">
                      {deg}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* SMOOTH NEEDLE ROTATION TO KAABA BEARING */}
          <div
            id="qibla-kaaba-needle"
            className="absolute w-full h-full top-0 left-0 flex justify-center items-center pointer-events-none transition-transform"
            style={{
              transform: `rotate(${qiblaBearing}deg)`,
              transition: 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
            }}
          >
            {/* Front Pointer to Kaaba */}
            <div className="absolute top-5 flex flex-col items-center">
              {/* Kaaba Golden Emblem Badge */}
              <div
                className={`w-7 h-7 rounded-lg bg-gradient-to-b from-[#D4AF37] to-[#8C6D23] p-1 border shadow-lg flex flex-col items-center justify-center transition-transform duration-300 ${
                  isAligned ? 'scale-115 border-[#4ADE80] shadow-glow-mint' : 'border-[#F3E5AB]/70'
                }`}
              >
                <div className="w-full h-1 bg-[#F3E5AB] rounded-xs mb-0.5" />
                <div className="w-2.5 h-2.5 bg-black/75 rounded-xs" />
              </div>
              {/* Pointer Shaft */}
              <div className="w-1 h-14 bg-gradient-to-b from-[#D4AF37] via-[#D4AF37]/60 to-transparent rounded-full mt-1" />
            </div>

            {/* Rear Needle Counterweight */}
            <div className="absolute bottom-5 flex flex-col items-center">
              <div className="w-0.5 h-10 bg-gradient-to-t from-slate-500/40 to-transparent" />
              <div className="w-2 h-2 rounded-full bg-slate-500/40 border border-white/20" />
            </div>
          </div>

          {/* Center Glass Bezel Pivot */}
          <div className="w-16 h-16 rounded-full bg-[#041210]/95 border-2 border-[#D4AF37]/50 shadow-inner flex flex-col items-center justify-center z-20 backdrop-blur-md">
            <span className="text-xs font-black text-white tnum tracking-tight">
              {activeHeadingDisplay}°
            </span>
            <span className="text-[8px] font-bold text-[#EAD8B1] tracking-wider uppercase">
              Heading
            </span>
          </div>
        </div>
      </div>

      {/* Target Coordinates & Details Strip */}
      <div className="mt-3 p-2.5 rounded-2xl bg-black/30 border border-white/5 flex items-center justify-between text-xs">
        <div className="text-left">
          <span className="text-[10px] text-slate-400 block">Kiblat Target:</span>
          <span className="font-extrabold text-[#F3E5AB] text-xs tnum">
            {qiblaBearing}° Barat-Laut (NW)
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 block">Mode Orientasi:</span>
          <span className="text-[11px] font-medium text-slate-300 flex items-center gap-1 justify-end">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                sensorStatus === 'active' && !isSimulating
                  ? 'bg-[#4ADE80] animate-pulse'
                  : 'bg-[#D4AF37]'
              }`}
            />
            {sensorStatus === 'active' && !isSimulating ? 'Sensor Otomatis' : 'Mode Simulasi'}
          </span>
        </div>
      </div>

      {/* SENSOR UNAVAILABLE FALLBACK NOTIFICATION BANNER */}
      {sensorStatus === 'unavailable' && (
        <div
          id="sensor-fallback-notification"
          className="mt-3 p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-200/90 text-left space-y-1.5"
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-snug">
              <p className="font-bold text-amber-300">Sensor Kompas Tidak Terdeteksi</p>
              <p className="text-[10px] text-amber-200/80">
                Browser atau perangkat ini tidak memiliki sensor magnetometer/gyroscope aktif. Kompas menampilkan arah statis Kiblat Makkah ({qiblaBearing}° NW).
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-amber-500/15 text-[10px]">
            <span className="text-slate-400">Gunakan slider manual untuk simulasi putaran:</span>
            <button
              onClick={() => setShowSliderControl(true)}
              className="text-[#86EFAC] font-bold hover:underline"
            >
              Buka Slider
            </button>
          </div>
        </div>
      )}

      {/* iOS Permission Action */}
      {sensorStatus === 'permission_needed' && (
        <div className="mt-3 p-2.5 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#F3E5AB]" />
              <span className="text-[11px] text-[#F3E5AB] font-bold">Izin Sensor iOS Diperlukan</span>
            </div>
            <button
              onClick={requestIOSPermission}
              className="px-2.5 py-1 rounded-xl bg-[#D4AF37]/30 text-[#F3E5AB] border border-[#D4AF37]/40 text-[10px] font-bold active:scale-95 transition-transform"
            >
              Izinkan Sensor
            </button>
          </div>
        </div>
      )}

      {/* Expandable Manual Rotation Slider (For simulation or testing needle rotation smoothly) */}
      {showSliderControl && (
        <div className="mt-3 p-3 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-left">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#4ADE80]" />
              <span>Simulasi Putar Sudut Perangkat</span>
            </span>
            <button
              onClick={() => {
                setIsSimulating(!isSimulating);
              }}
              className="text-[10px] text-[#86EFAC] hover:underline"
            >
              {isSimulating ? 'Beralih ke Sensor' : 'Aktifkan Manual'}
            </button>
          </div>

          <input
            type="range"
            min="0"
            max="360"
            value={manualSlider}
            onChange={handleManualSliderChange}
            className="w-full accent-[#4ADE80] cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>0° (Utara)</span>
            <span className="text-[#F3E5AB] font-bold">Target: {qiblaBearing}°</span>
            <span>360°</span>
          </div>

          <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
            <span>Tip: Putar slider hingga {qiblaBearing}° untuk menguji getar & chime.</span>
            <button
              onClick={() => {
                setManualSlider(qiblaBearing);
                setRawHeadingDisplay(qiblaBearing);
                setDeviceHeading(qiblaBearing);
              }}
              className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-[9px] font-bold"
            >
              Auto-Align ({qiblaBearing}°)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
