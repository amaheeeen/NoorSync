import React, { useState } from 'react';
import { Calendar, Bell, BellRing, Moon, Clock } from 'lucide-react';
import { FastingPlan } from '../../types';
import { getFastingLookahead } from '../../data/widgetData';

interface SunnahFastingWidgetProps {
  fajrTimeStr: string;
}

export const SunnahFastingWidget: React.FC<SunnahFastingWidgetProps> = ({ fajrTimeStr }) => {
  const plans = getFastingLookahead(fajrTimeStr);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState<number>(0);
  const [alarms, setAlarms] = useState<Record<string, boolean>>({
    'fast-1': true,
    'fast-2': false,
    'fast-3': false,
  });

  const activePlan: FastingPlan = plans[selectedPlanIndex];
  const isAlarmOn = alarms[activePlan.id] || false;

  const toggleAlarm = (id: string) => {
    setAlarms((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div 
      id="widget-sunnah-fasting"
      className="liquid-glass rounded-3xl p-5 border border-white/10 shadow-glass relative overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/25 text-indigo-300">
            <Moon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-white">Perencana Puasa Sunnah</h4>
            <span className="text-[10px] text-slate-400">Shiyam Horizon 3-Hari</span>
          </div>
        </div>

        <button
          onClick={() => toggleAlarm(activePlan.id)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all ${
            isAlarmOn 
              ? 'bg-[#4ADE80]/15 text-[#86EFAC] border-[#4ADE80]/30 shadow-glow-mint' 
              : 'bg-white/5 text-slate-400 border-white/10'
          }`}
        >
          {isAlarmOn ? <BellRing className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
          <span>{isAlarmOn ? 'Alarm: ON' : 'Alarm: OFF'}</span>
        </button>
      </div>

      {/* 3-Lookahead Selector Pills */}
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        {plans.map((p, idx) => {
          const isSelected = selectedPlanIndex === idx;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedPlanIndex(idx)}
              className={`p-2 rounded-2xl border text-left transition-all ${
                isSelected 
                  ? 'tab-active-pill border-[#4ADE80]/40 text-white' 
                  : 'bg-black/20 border-white/5 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="block text-[9px] uppercase tracking-wider font-semibold text-slate-400">
                {p.daysAway === 1 ? 'Besok' : `${p.daysAway} Hari`}
              </span>
              <span className="block text-[11px] font-bold truncate text-slate-200 mt-0.5">
                {p.name.replace('Puasa Sunnah ', '')}
              </span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Imsak Calculation Card (Fajr - 10 mins) */}
      <div className="p-3.5 rounded-2xl bg-black/35 border border-white/5 space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-300 font-medium">{activePlan.name} ({activePlan.hijriDay})</span>
          <div className="flex items-center gap-1 text-[#86EFAC] font-bold tnum">
            <Clock className="w-3.5 h-3.5" />
            <span>Imsak: {activePlan.imsakTime} WIB</span>
          </div>
        </div>

        {/* Niat script preview */}
        <p className="font-arabic text-right text-[#F3E5AB] text-sm pt-1 leading-relaxed">
          {activePlan.niatArabic}
        </p>
        <p className="text-[10px] text-slate-400 italic">
          "{activePlan.niatLatin}"
        </p>
      </div>
    </div>
  );
};
