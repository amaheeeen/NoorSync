import React from 'react';
import { BookOpen, Flame, ChevronRight, CheckCircle, Plus } from 'lucide-react';
import { KhatamPlan } from '../../types';

interface KhatamWidgetProps {
  plan: KhatamPlan;
  onIncrementPage: (pages: number) => void;
  onOpenFullView: () => void;
}

export const KhatamWidget: React.FC<KhatamWidgetProps> = ({
  plan,
  onIncrementPage,
  onOpenFullView,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const pagesReadToday = plan.dailyLog[todayStr] || 0;
  const target = plan.pagesPerDayTarget || 4;
  const percentDaily = Math.min(100, Math.round((pagesReadToday / target) * 100));
  const percentTotal = Math.min(100, Math.round((plan.currentPage / 604) * 100));

  return (
    <div
      id="widget-khatam-planner"
      className="liquid-glass rounded-3xl p-4 border border-white/10 relative overflow-hidden transition-all duration-300 hover:border-[#4ADE80]/30 shadow-glass"
    >
      {/* Background ambient glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#4ADE80]/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-2xl bg-[#4ADE80]/15 border border-[#4ADE80]/30 text-[#86EFAC] shadow-glow-mint">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h3 className="text-xs font-bold text-white tracking-wide">KHATAM & READING HABIT</h3>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#D4AF37]/20 text-[#F3E5AB] font-mono font-semibold border border-[#D4AF37]/30">
                Juz {plan.currentJuz}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Surah {plan.currentSurah} • Hal {plan.currentPage}/604
            </p>
          </div>
        </div>

        {/* Streak Counter Badge */}
        <div className="flex items-center space-x-1 px-2.5 py-1 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold">
          <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{plan.streakDays} hari</span>
        </div>
      </div>

      {/* Progress Metric Bar */}
      <div className="space-y-1.5 my-3">
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-slate-300">Target Harian: <strong>{pagesReadToday}</strong>/{target} Halaman</span>
          <span className="text-[#86EFAC] font-mono font-bold">{percentDaily}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden border border-white/10">
          <div
            className="h-full bg-gradient-to-r from-[#059669] via-[#4ADE80] to-[#86EFAC] rounded-full transition-all duration-500 shadow-glow-mint"
            style={{ width: `${percentDaily}%` }}
          />
        </div>
      </div>

      {/* Action Quick Increments */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          <button
            id="btn-khatam-plus-one"
            onClick={() => onIncrementPage(1)}
            className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/15 text-[11px] font-bold text-white border border-white/10 flex items-center gap-1 active:scale-95 transition-all"
          >
            <Plus className="w-3 h-3 text-[#86EFAC]" />
            <span>+1 Hal</span>
          </button>
          <button
            id="btn-khatam-plus-four"
            onClick={() => onIncrementPage(4)}
            className="px-2.5 py-1 rounded-xl bg-[#4ADE80]/15 hover:bg-[#4ADE80]/25 text-[11px] font-bold text-[#86EFAC] border border-[#4ADE80]/30 flex items-center gap-1 active:scale-95 transition-all"
          >
            <CheckCircle className="w-3 h-3 text-[#4ADE80]" />
            <span>+4 Hal (1 Ruku&apos;)</span>
          </button>
        </div>

        <button
          id="btn-khatam-open-detail"
          onClick={onOpenFullView}
          className="text-[11px] font-bold text-[#F3E5AB] hover:text-white flex items-center gap-0.5 group"
        >
          <span>Planner</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
