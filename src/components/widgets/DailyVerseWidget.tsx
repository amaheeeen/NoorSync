import React, { useState, useEffect } from 'react';
import { BookOpen, Play, Pause, Volume2, Maximize2, Share2, Copy, Check, Sparkles } from 'lucide-react';
import { CuratedVerse, VerseTimeSlot } from '../../types';
import { CURATED_VERSES, getCurrentTimeSlot } from '../../data/widgetData';
import { playCompletionChime } from '../../utils/audio';

interface DailyVerseWidgetProps {
  onOpenDetailModal?: (verse: CuratedVerse) => void;
}

export const DailyVerseWidget: React.FC<DailyVerseWidgetProps> = ({ onOpenDetailModal }) => {
  const [activeSlot, setActiveSlot] = useState<VerseTimeSlot>(getCurrentTimeSlot());
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const verse: CuratedVerse = CURATED_VERSES[activeSlot];

  // Simulated audio playback progress
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      playCompletionChime();
      timer = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 5;
        });
      }, 500);
    } else {
      setAudioProgress(0);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleCopy = () => {
    const textToCopy = `${verse.arabic}\n\n"${verse.translation}"\n(QS. ${verse.surahName}: ${verse.ayahNumber})`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div 
      id="widget-daily-verse"
      className="liquid-glass rounded-3xl p-5 border border-white/10 shadow-glass relative overflow-hidden"
    >
      {/* Top Controls: Slot Selector & Surah Chip */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/5">
          {(['morning', 'afternoon', 'night'] as VerseTimeSlot[]).map((slot) => {
            const labels = { morning: 'Pagi', afternoon: 'Siang', night: 'Malam' };
            const isActive = activeSlot === slot;
            return (
              <button
                key={slot}
                onClick={() => {
                  setActiveSlot(slot);
                  setIsPlaying(false);
                }}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
                  isActive
                    ? 'tab-active-pill text-[#86EFAC] shadow-glow-mint'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {labels[slot]}
              </button>
            );
          })}
        </div>

        <span className="text-[11px] font-bold text-[#EAD8B1] px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30">
          QS. {verse.surahName}: {verse.ayahNumber}
        </span>
      </div>

      {/* Theme subtitle */}
      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-2 font-medium">
        <Sparkles className="w-3 h-3 text-[#D4AF37]" />
        <span>Tema: {verse.theme}</span>
      </div>

      {/* Arabic Script Card */}
      <div 
        onClick={() => onOpenDetailModal && onOpenDetailModal(verse)}
        className="p-3.5 rounded-2xl bg-black/30 border border-white/5 cursor-pointer hover:border-white/20 transition-all group"
      >
        <p className="font-arabic text-lg leading-loose text-[#F3E5AB] text-right font-medium dir-rtl">
          {verse.arabic}
        </p>

        <p className="text-xs text-slate-200 mt-2 line-clamp-2 leading-relaxed font-normal">
          "{verse.translation}"
        </p>
      </div>

      {/* Audio Progress Bar */}
      {isPlaying && (
        <div className="mt-3">
          <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-mono">
            <span>Audio Tilawah</span>
            <span>{Math.round((audioProgress / 100) * verse.durationSeconds)}s / {verse.durationSeconds}s</span>
          </div>
          <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#4ADE80] transition-all duration-300"
              style={{ width: `${audioProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Toolbar */}
      <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
        {/* Audio Player Button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            isPlaying
              ? 'bg-[#4ADE80]/20 text-[#86EFAC] border border-[#4ADE80]/40'
              : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
          }`}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          <span>{isPlaying ? 'Jeda' : 'Dengarkan'}</span>
        </button>

        {/* Copy & Detail Modal Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all active:scale-95"
            title="Salin Ayat & Terjemahan"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#4ADE80]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => onOpenDetailModal && onOpenDetailModal(verse)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#D4AF37]/15 text-[#EAD8B1] hover:bg-[#D4AF37]/25 border border-[#D4AF37]/30 text-xs font-semibold active:scale-95 transition-all"
          >
            <Maximize2 className="w-3 h-3" />
            <span>Tadabbur</span>
          </button>
        </div>
      </div>
    </div>
  );
};
