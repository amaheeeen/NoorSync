import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  Flame,
  Award,
  CheckCircle2,
  TrendingUp,
  BookmarkCheck,
  ChevronLeft,
  RotateCcw,
} from 'lucide-react';
import { KhatamPlan, KhatamTargetMode } from '../types';
import { getSurahAndJuzForPage, SURAH_DIRECTORY } from '../data/khatamData';
import { playCompletionChime } from '../utils/audio';

interface KhatamViewProps {
  plan: KhatamPlan;
  onUpdatePlan: (newPlan: KhatamPlan) => void;
  onBackToDashboard: () => void;
}

export const KhatamView: React.FC<KhatamViewProps> = ({
  plan,
  onUpdatePlan,
  onBackToDashboard,
}) => {
  const [inputPage, setInputPage] = useState<number>(plan.currentPage);
  const [selectedMode, setSelectedMode] = useState<KhatamTargetMode>(plan.targetMode);
  const [targetPages, setTargetPages] = useState<number>(plan.pagesPerDayTarget);

  const todayStr = new Date().toISOString().split('T')[0];
  const pagesReadToday = plan.dailyLog[todayStr] || 0;
  const remainingPages = Math.max(0, 604 - plan.currentPage);
  const estimatedDaysToKhatam = Math.ceil(remainingPages / (targetPages || 1));

  const handleSavePage = (newPage: number) => {
    const clampedPage = Math.min(604, Math.max(1, newPage));
    const { surah, juz } = getSurahAndJuzForPage(clampedPage);
    const added = Math.max(0, clampedPage - plan.currentPage);

    const updatedLog = { ...plan.dailyLog };
    updatedLog[todayStr] = (updatedLog[todayStr] || 0) + added;

    const updated: KhatamPlan = {
      ...plan,
      currentPage: clampedPage,
      currentSurah: surah,
      currentJuz: juz,
      lastReadDate: todayStr,
      dailyLog: updatedLog,
      targetMode: selectedMode,
      pagesPerDayTarget: targetPages,
    };

    if (clampedPage >= 604) {
      playCompletionChime();
    }

    onUpdatePlan(updated);
    setInputPage(clampedPage);
  };

  const handleQuickAdd = (pages: number) => {
    handleSavePage(plan.currentPage + pages);
  };

  // 30 Juz completion helper: Juz N corresponds to roughly ~20 pages each
  const isJuzCompleted = (juzNum: number) => {
    return plan.currentPage >= juzNum * 20.13;
  };

  return (
    <section id="view-khatam-planner" className="space-y-4 w-full">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToDashboard}
          className="px-3 py-1.5 rounded-2xl liquid-glass border border-white/10 text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1 active:scale-95 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        <div className="flex items-center space-x-2">
          <div className="px-3 py-1 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 fill-amber-400" />
            <span>Streak {plan.streakDays} Hari</span>
          </div>
        </div>
      </div>

      {/* Hero Overview Glass Card */}
      <div className="liquid-glass rounded-3xl p-5 border border-[#4ADE80]/30 shadow-glass relative overflow-hidden">
        <div className="absolute top-0 right-0 w-44 h-44 bg-[#4ADE80]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[11px] font-bold text-[#86EFAC] tracking-wider uppercase flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Minimalist Khatam Engine</span>
            </span>
            <h2 className="text-2xl font-black text-white mt-1">
              Halaman {plan.currentPage} <span className="text-slate-400 text-sm font-normal">/ 604</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Surah <strong>{plan.currentSurah}</strong> • Juz {plan.currentJuz}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-medium">Estimasi Khatam:</span>
              <span className="text-sm font-extrabold text-[#F3E5AB]">~{estimatedDaysToKhatam} Hari lagi</span>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-[#4ADE80]/15 border border-[#4ADE80]/30 flex flex-col items-center justify-center text-center shadow-glow-mint">
              <span className="text-xs font-black text-[#86EFAC]">
                {Math.round((plan.currentPage / 604) * 100)}%
              </span>
              <span className="text-[9px] text-slate-400">Total</span>
            </div>
          </div>
        </div>

        {/* Global Progress Line */}
        <div className="w-full h-3 rounded-full bg-black/40 overflow-hidden border border-white/10 mt-4">
          <div
            className="h-full bg-gradient-to-r from-[#059669] via-[#4ADE80] to-[#86EFAC] rounded-full transition-all duration-500 shadow-glow-mint"
            style={{ width: `${(plan.currentPage / 604) * 100}%` }}
          />
        </div>

        {/* Daily Target Sub-tracker */}
        <div className="flex justify-between items-center text-xs mt-3 pt-3 border-t border-white/10">
          <span className="text-slate-300">
            Dibaca hari ini: <strong>{pagesReadToday}</strong> / {targetPages} Hal
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleQuickAdd(1)}
              className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white border border-white/10 active:scale-95 transition-all"
            >
              +1 Hal
            </button>
            <button
              onClick={() => handleQuickAdd(4)}
              className="px-2.5 py-1 rounded-xl bg-[#4ADE80]/20 hover:bg-[#4ADE80]/30 text-xs font-bold text-[#86EFAC] border border-[#4ADE80]/40 active:scale-95 transition-all"
            >
              +4 Hal
            </button>
          </div>
        </div>
      </div>

      {/* Target & Reading Pace Customizer */}
      <div className="liquid-glass rounded-3xl p-4 border border-white/10 space-y-3">
        <h3 className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
          <span>TARGET & RITME BACAAN</span>
        </h3>

        <div className="grid grid-cols-3 gap-2">
          {[
            { target: 2, label: 'Santai', sub: '2 Hal / hari' },
            { target: 4, label: 'Konsisten', sub: '4 Hal / hari (1 Ruku)' },
            { target: 20, label: 'Khatam 1 Bulan', sub: '20 Hal (1 Juz/hari)' },
          ].map((item) => (
            <button
              key={item.target}
              onClick={() => {
                setTargetPages(item.target);
                onUpdatePlan({ ...plan, pagesPerDayTarget: item.target });
              }}
              className={`p-2.5 rounded-2xl border text-center transition-all ${
                targetPages === item.target
                  ? 'bg-[#4ADE80]/20 border-[#4ADE80]/50 text-[#86EFAC] shadow-glow-mint'
                  : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <p className="text-xs font-bold">{item.label}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{item.sub}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Direct Page Updater Slider / Manual Input */}
      <div className="liquid-glass rounded-3xl p-4 border border-white/10 space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
            <BookmarkCheck className="w-4 h-4 text-[#86EFAC]" />
            <span>UPDATE PENANDA BACAAN (Bookmark)</span>
          </h3>
          <span className="text-xs font-mono font-bold text-[#86EFAC]">
            Hal {inputPage}
          </span>
        </div>

        <input
          type="range"
          min="1"
          max="604"
          value={inputPage}
          onChange={(e) => setInputPage(Number(e.target.value))}
          className="w-full accent-[#4ADE80] cursor-pointer"
        />

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="604"
              value={inputPage}
              onChange={(e) => setInputPage(Number(e.target.value))}
              className="w-20 px-3 py-1.5 rounded-xl bg-black/50 border border-white/20 text-center font-mono text-xs font-bold text-white focus:outline-none focus:border-[#4ADE80]"
            />
            <span className="text-xs text-slate-400">dari 604</span>
          </div>

          <button
            onClick={() => handleSavePage(inputPage)}
            className="px-4 py-1.5 rounded-xl bg-[#4ADE80] hover:bg-[#86EFAC] text-slate-950 text-xs font-extrabold shadow-glow-mint active:scale-95 transition-all"
          >
            Simpan Bookmark
          </button>
        </div>
      </div>

      {/* 30 Juz Milestone Visual Grid */}
      <div className="liquid-glass rounded-3xl p-4 border border-white/10 space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#D4AF37]" />
            <span>PETA 30 JUZ AL-QUR&apos;AN</span>
          </h3>
          <span className="text-[11px] text-slate-400">
            {Array.from({ length: 30 }).filter((_, i) => isJuzCompleted(i + 1)).length} / 30 Juz Selesai
          </span>
        </div>

        <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5">
          {Array.from({ length: 30 }).map((_, idx) => {
            const juzNum = idx + 1;
            const completed = isJuzCompleted(juzNum);
            const isCurrent = plan.currentJuz === juzNum;

            return (
              <div
                key={juzNum}
                onClick={() => {
                  const targetPage = Math.min(604, Math.round(juzNum * 20.13 - 10));
                  setInputPage(targetPage);
                }}
                className={`cursor-pointer p-2 rounded-xl text-center border transition-all ${
                  completed
                    ? 'bg-[#4ADE80]/20 border-[#4ADE80]/50 text-[#86EFAC] shadow-glow-mint'
                    : isCurrent
                    ? 'bg-[#D4AF37]/20 border-[#D4AF37]/50 text-[#F3E5AB] animate-pulse'
                    : 'bg-black/30 border-white/5 text-slate-500 hover:text-slate-300'
                }`}
              >
                <span className="text-[11px] font-bold block">{juzNum}</span>
                {completed ? (
                  <CheckCircle2 className="w-2.5 h-2.5 mx-auto text-[#4ADE80] mt-0.5" />
                ) : (
                  <span className="text-[8px] opacity-60 block">Juz</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
