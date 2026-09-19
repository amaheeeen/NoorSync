import React, { useState } from 'react';
import { Check, CheckCircle2, Clock, Users, User, ArrowRightLeft, ShieldAlert } from 'lucide-react';
import { DaySholatLog, SholatSlot, SholatStatusType } from '../../types';
import { playTasbihClick } from '../../utils/audio';

interface SholatTrackerWidgetProps {
  todayLog: DaySholatLog;
  onToggleSholat: (slot: SholatSlot, forceType?: SholatStatusType) => void;
  hapticEnabled?: boolean;
}

const SLOTS: SholatSlot[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const STATUS_LABELS: Record<SholatStatusType, { label: string; icon: React.ElementType; color: string }> = {
  jamaah: { label: 'Jama’ah', icon: Users, color: 'text-[#4ADE80] bg-[#4ADE80]/15 border-[#4ADE80]/30' },
  munfarid: { label: 'Munfarid', icon: User, color: 'text-[#EAD8B1] bg-[#EAD8B1]/15 border-[#EAD8B1]/30' },
  masbuq: { label: 'Masbuq', icon: ArrowRightLeft, color: 'text-sky-300 bg-sky-400/15 border-sky-400/30' },
  udzur: { label: 'Udzur', icon: ShieldAlert, color: 'text-amber-300 bg-amber-400/15 border-amber-400/30' },
};

export const SholatTrackerWidget: React.FC<SholatTrackerWidgetProps> = ({
  todayLog,
  onToggleSholat,
  hapticEnabled = true,
}) => {
  const [selectedSlotForDetail, setSelectedSlotForDetail] = useState<SholatSlot | null>(null);

  // Calculate positive affirmative completion
  const completedCount = SLOTS.filter((s) => todayLog[s]?.completed).length;

  const handleTapSlot = (slot: SholatSlot) => {
    playTasbihClick();
    if (hapticEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(25); } catch {}
    }
    onToggleSholat(slot);
  };

  const handleChangeType = (slot: SholatSlot, type: SholatStatusType) => {
    onToggleSholat(slot, type);
    setSelectedSlotForDetail(null);
  };

  // Mock 7-day heat-dot data (7 rows/days, 5 columns/prayers)
  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const mockHeatGrid = [
    [true, true, true, true, true],
    [true, true, true, true, false],
    [true, true, true, true, true],
    [true, true, true, false, true],
    [true, true, true, true, true],
    [true, true, true, true, true],
    SLOTS.map((s) => todayLog[s]?.completed || false),
  ];

  return (
    <div 
      id="widget-sholat-tracker"
      className="liquid-glass rounded-3xl p-5 border border-white/10 shadow-glass relative touch-manipulation select-none"
    >
      {/* Header with Positive Affirmative Metric */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-[#86EFAC] uppercase">
            Frictionless Habit
          </span>
          <h3 className="text-base font-extrabold text-white flex items-center gap-1.5 mt-0.5">
            Sholat Tracker
          </h3>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 block font-medium">Capaian Hari Ini</span>
          <span className="text-xs font-bold text-[#4ADE80] tnum px-2.5 py-0.5 rounded-full bg-[#4ADE80]/15 border border-[#4ADE80]/30 inline-block mt-0.5">
            {completedCount} dari 5 waktu
          </span>
        </div>
      </div>

      {/* 5-Slot Interactive Buttons */}
      <div className="grid grid-cols-5 gap-2 my-3">
        {SLOTS.map((slot) => {
          const entry = todayLog[slot];
          const isDone = entry?.completed;
          const statusConfig = STATUS_LABELS[entry?.type || 'munfarid'];
          const TypeIcon = statusConfig.icon;

          return (
            <div key={slot} className="flex flex-col items-center">
              <button
                id={`btn-track-${slot.toLowerCase()}`}
                onClick={() => handleTapSlot(slot)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setSelectedSlotForDetail(slot);
                }}
                className={`w-full aspect-square rounded-2xl flex flex-col items-center justify-center p-2 transition-all duration-200 active:scale-90 touch-manipulation relative overflow-hidden ${
                  isDone
                    ? 'bg-[#4ADE80]/20 border border-[#4ADE80]/60 shadow-glow-mint text-white'
                    : 'bg-black/30 border border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-[#4ADE80] mb-0.5" />
                ) : (
                  <div className="w-5 h-5 rounded-full border border-dashed border-slate-500 mb-0.5" />
                )}
                <span className={`text-[11px] font-bold ${isDone ? 'text-white' : 'text-slate-300'}`}>
                  {slot}
                </span>
                {entry?.timestamp && (
                  <span className="text-[9px] text-[#86EFAC] tnum mt-0.5">
                    {entry.timestamp}
                  </span>
                )}
              </button>

              {/* Status Tag Pill (Clickable for quick customization) */}
              <button
                onClick={() => setSelectedSlotForDetail(slot)}
                className={`mt-1.5 px-2 py-0.5 rounded-md text-[9px] font-semibold border flex items-center gap-1 transition-all ${
                  isDone ? statusConfig.color : 'text-slate-400 border-white/5 bg-black/20'
                }`}
              >
                <TypeIcon className="w-2.5 h-2.5" />
                <span>{isDone ? statusConfig.label : 'Pilih'}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Detail Selector Modal (Bottom Dropdown / Sheet) */}
      {selectedSlotForDetail && (
        <div className="mt-3 p-3 rounded-2xl bg-[#061917]/95 border border-[#4ADE80]/30 space-y-2 animate-in fade-in zoom-in-95">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-white">Status Sholat {selectedSlotForDetail}:</span>
            <button 
              onClick={() => setSelectedSlotForDetail(null)} 
              className="text-[10px] text-slate-400 hover:text-white"
            >
              Tutup
            </button>
          </div>
          <div className="grid grid-cols-4 gap-1.5 text-xs pt-1">
            {(['jamaah', 'munfarid', 'masbuq', 'udzur'] as SholatStatusType[]).map((type) => {
              const cfg = STATUS_LABELS[type];
              const Icon = cfg.icon;
              return (
                <button
                  key={type}
                  onClick={() => handleChangeType(selectedSlotForDetail, type)}
                  className={`py-1.5 px-2 rounded-xl border text-[10px] font-semibold flex flex-col items-center gap-1 active:scale-95 transition-all ${cfg.color}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cfg.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 7x5 Weekly Heat-Dot Matrix */}
      <div className="mt-4 pt-3 border-t border-white/10">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[11px] font-bold text-slate-300">Konsistensi Mingguan (7x5)</span>
          <span className="text-[10px] text-slate-400">92% Momentum Score</span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center">
          {daysOfWeek.map((d, dIdx) => (
            <div key={d} className="space-y-1">
              <span className="text-[9px] text-slate-400 block font-medium">{d}</span>
              <div className="flex flex-col gap-1 items-center">
                {mockHeatGrid[dIdx].map((done, sIdx) => (
                  <span
                    key={sIdx}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      done 
                        ? 'bg-[#4ADE80] shadow-glow-mint' 
                        : 'bg-white/10 border border-white/5'
                    }`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
