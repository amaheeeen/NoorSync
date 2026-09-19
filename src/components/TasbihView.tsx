import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Smartphone, CheckCircle } from 'lucide-react';
import { TasbihItem } from '../types';
import { playTasbihClick, playCompletionChime } from '../utils/audio';

interface TasbihViewProps {
  hapticEnabled: boolean;
  onToggleHaptic: () => void;
}

const DEFAULT_DHIKR: TasbihItem[] = [
  { name: 'Subhanallah', arabic: 'سُبْحَانَ اللَّهِ', target: 33 },
  { name: 'Alhamdulillah', arabic: 'الْحَمْدُ لِلَّهِ', target: 33 },
  { name: 'Allahu Akbar', arabic: 'اللَّهُ أَكْبَرُ', target: 34 },
  { name: 'Astaghfirullah', arabic: 'أَسْتَغْفِرُ اللَّهَ', target: 33 },
  { name: 'La ilaha illallah', arabic: 'لَا إِلَهَ إِلَّا اللَّهُ', target: 100 },
];

export const TasbihView: React.FC<TasbihViewProps> = ({ hapticEnabled, onToggleHaptic }) => {
  const [dhikrIndex, setDhikrIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [dailyTotal, setDailyTotal] = useState(99);
  const [isPulsing, setIsPulsing] = useState(false);
  const [celebrationToast, setCelebrationToast] = useState<string | null>(null);

  const currentDhikr = DEFAULT_DHIKR[dhikrIndex];
  const target = currentDhikr.target;

  // Circumference of r=116 is ~728.8
  const circumference = 2 * Math.PI * 116;
  const progressRatio = Math.min(1, count / target);
  const strokeDashoffset = circumference - progressRatio * circumference;

  const handleTap = () => {
    const nextCount = count + 1;
    const nextTotal = dailyTotal + 1;
    setDailyTotal(nextTotal);

    // Audio tactile feedback
    playTasbihClick();

    // Haptic vibration
    if (hapticEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(35);
    }

    // Visual pulse
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 200);

    if (nextCount >= target) {
      // Completed current set!
      playCompletionChime();
      if (hapticEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([60, 50, 90]);
      }
      setCelebrationToast(`MashaAllah! Completed ${target}x ${currentDhikr.name}`);
      setTimeout(() => setCelebrationToast(null), 3000);

      // Advance to next dhikr
      setCount(0);
      setDhikrIndex((prev) => (prev + 1) % DEFAULT_DHIKR.length);
    } else {
      setCount(nextCount);
    }
  };

  const handleCycle = (direction: number) => {
    setCount(0);
    setDhikrIndex((prev) => (prev + direction + DEFAULT_DHIKR.length) % DEFAULT_DHIKR.length);
  };

  const handleReset = () => {
    setCount(0);
  };

  return (
    <section id="view-tasbih" className="space-y-4 w-full">
      {/* Target Dhikr Selector */}
      <div 
        id="tasbih-target-card"
        className="liquid-glass rounded-3xl p-4 border border-white/10"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
            Target Dhikr Selection
          </span>
          <span 
            id="tasbih-cycle-badge"
            className="text-[11px] font-semibold text-[#4ADE80] px-2 py-0.5 rounded-full bg-[#4ADE80]/15 border border-[#4ADE80]/30"
          >
            Set {dhikrIndex + 1} of {DEFAULT_DHIKR.length}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 id="tasbih-active-name" className="text-base font-bold text-white">
              {currentDhikr.name}
            </h3>
            <p id="tasbih-active-arabic" className="font-arabic text-xl text-[#F3E5AB]">
              {currentDhikr.arabic}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              id="btn-prev-dhikr"
              onClick={() => handleCycle(-1)}
              className="w-9 h-9 rounded-xl liquid-glass flex items-center justify-center text-slate-300 hover:text-white active:scale-95 transition-all border border-white/10"
              title="Previous dhikr"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              id="btn-next-dhikr"
              onClick={() => handleCycle(1)}
              className="w-9 h-9 rounded-xl liquid-glass flex items-center justify-center text-slate-300 hover:text-white active:scale-95 transition-all border border-white/10"
              title="Next dhikr"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {celebrationToast && (
        <div className="p-3 rounded-2xl bg-[#4ADE80]/20 border border-[#4ADE80]/40 text-[#86EFAC] text-xs font-semibold flex items-center gap-2 shadow-glow-mint animate-fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{celebrationToast}</span>
        </div>
      )}

      {/* Fluid Liquid Glass Interactive Counter Ring */}
      <div className="py-6 flex flex-col items-center justify-center relative select-none">
        {/* Ambient Glow under counter */}
        <div className="absolute w-56 h-56 rounded-full bg-[#4ADE80]/15 blur-3xl pointer-events-none" />

        {/* Main Clickable Counter Core */}
        <div
          id="tasbih-counter-ring-core"
          onClick={handleTap}
          className={`w-64 h-64 rounded-full liquid-glass border-2 border-[#4ADE80]/40 flex flex-col items-center justify-center cursor-pointer shadow-glass active:scale-[0.96] transition-transform select-none relative group ${
            isPulsing ? 'tasbih-pulsing scale-105 border-[#4ADE80]' : ''
          }`}
        >
          {/* Circular Progress Indicator Ring (SVG) */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 256 256">
            <circle
              cx="128"
              cy="128"
              r="116"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              id="tasbih-progress-circle"
              cx="128"
              cy="128"
              r="116"
              stroke="#4ADE80"
              strokeWidth="8"
              strokeLinecap="round"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-150"
            />
          </svg>

          {/* Counter Typography */}
          <span className="text-[11px] font-bold tracking-widest text-slate-400 uppercase mb-1">
            TAP ANYWHERE
          </span>
          <span
            id="tasbih-count-display"
            className="text-6xl font-black text-white tracking-tight"
          >
            {count}
          </span>
          <div className="flex items-center space-x-1.5 mt-2 text-xs font-semibold text-[#F3E5AB]">
            <span>Goal:</span>
            <span id="tasbih-goal-display">{target}</span>
          </div>
        </div>

        {/* Counter Actions (Reset, Haptic Toggle) */}
        <div className="flex items-center space-x-4 mt-6">
          <button
            id="btn-tasbih-reset"
            onClick={handleReset}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-2xl liquid-glass text-xs font-semibold text-slate-300 hover:text-white active:scale-95 transition-all border border-white/10"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            id="btn-tasbih-toggle-haptic"
            onClick={onToggleHaptic}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-2xl text-xs font-semibold active:scale-95 transition-all ${
              hapticEnabled
                ? 'tab-active-pill text-[#86EFAC]'
                : 'liquid-glass text-slate-400 border border-white/10'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Vibrate: {hapticEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Total Sessions Counter Summary */}
      <div 
        id="tasbih-daily-summary-card"
        className="liquid-glass rounded-3xl p-4 flex items-center justify-between text-xs border border-white/10"
      >
        <div>
          <p className="font-bold text-white">Daily Dhikr Total</p>
          <p className="text-slate-400">Total recitations recorded today</p>
        </div>
        <span id="tasbih-daily-total-badge" className="text-2xl font-black text-[#EAD8B1]">
          {dailyTotal}
        </span>
      </div>
    </section>
  );
};
