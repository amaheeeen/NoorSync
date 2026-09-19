import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BookOpen, X, Sparkles, Copy, Check, Share2, Volume2 } from 'lucide-react';
import { CuratedVerse } from '../../types';
import { playCompletionChime } from '../../utils/audio';

interface VerseDetailModalProps {
  verse: CuratedVerse | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VerseDetailModal: React.FC<VerseDetailModalProps> = ({ verse, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [exported, setExported] = useState(false);

  if (!verse) return null;

  const handleCopy = () => {
    const fullText = `QS. ${verse.surahName} (${verse.surahNumber}): Ayat ${verse.ayahNumber}\n\n${verse.arabic}\n\n"${verse.translation}"\n\nTadabbur: ${verse.tadabbur}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportCard = () => {
    playCompletionChime();
    setExported(true);
    setTimeout(() => setExported(false), 2500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="modal-verse-detail-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-4"
        >
          <motion.div
            id="modal-verse-detail-content"
            initial={{ opacity: 0, scale: 0.92, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350, mass: 0.8 }}
            onClick={(e) => e.stopPropagation()}
            className="liquid-glass rounded-3xl p-5 w-full max-w-md space-y-4 border border-[#D4AF37]/35 max-h-[85vh] overflow-y-auto no-scrollbar shadow-glass text-left"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#D4AF37]" />
                <div>
                  <h4 className="text-sm font-bold text-white">Tadabbur Ayat Harian</h4>
                  <p className="text-[10px] text-[#EAD8B1]">
                    QS. {verse.surahName} ({verse.surahNumber}): {verse.ayahNumber}
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

            {/* Arabic Script with Tashkeel */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
              <p className="font-arabic text-xl leading-loose text-[#F3E5AB] text-right font-medium dir-rtl">
                {verse.arabic}
              </p>
            </div>

            {/* Transliteration & Translation */}
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-wider block mb-0.5">
                  Transliterasi
                </span>
                <p className="text-slate-300 italic leading-relaxed">
                  {verse.transliteration}
                </p>
              </div>

              <div className="pt-2 border-t border-white/5">
                <span className="text-[10px] uppercase font-bold text-[#86EFAC] tracking-wider block mb-0.5">
                  Terjemahan
                </span>
                <p className="text-slate-200 leading-relaxed">
                  "{verse.translation}"
                </p>
              </div>
            </div>

            {/* Practical Tadabbur Paragraph */}
            <div className="p-3.5 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/25 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#F3E5AB]">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Refleksi Kontekstual ({verse.theme})</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {verse.tadabbur}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleCopy}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-[#4ADE80]" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Tersalin' : 'Salin Ayat'}</span>
              </button>

              <button
                onClick={handleExportCard}
                className="flex-1 py-2.5 rounded-xl bg-[#D4AF37]/20 text-[#F3E5AB] hover:bg-[#D4AF37]/30 border border-[#D4AF37]/30 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-glow-gold"
              >
                <Share2 className="w-4 h-4" />
                <span>{exported ? 'Kartu Siap!' : 'Bagikan'}</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
