import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Sparkles, X, Check } from 'lucide-react';

interface EtiquetteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EtiquetteModal: React.FC<EtiquetteModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          id="modal-etiquette-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center p-4"
        >
          <motion.div 
            id="modal-etiquette-content"
            initial={{ opacity: 0, scale: 0.92, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ 
              type: 'spring', 
              damping: 28, 
              stiffness: 350,
              mass: 0.8
            }}
            onClick={(e) => e.stopPropagation()}
            className="liquid-glass rounded-3xl p-5 w-full max-w-sm space-y-4 border border-[#D4AF37]/30 max-h-[85vh] overflow-y-auto no-scrollbar shadow-glass"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                Istikharah Wisdom & Signs
              </h4>
              <button
                id="btn-close-etiquette-modal"
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
              <div className="p-3 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/25">
                <h5 className="font-bold text-[#F3E5AB] mb-1">Myth: You Must See a Dream</h5>
                <p>
                  It is a common misconception that Istikharah must yield a vivid dream or color signs (e.g. green for good, red for bad). Scholars clarify that the authentic outcome is generally felt as inner tranquility, facilitated doors of execution, or a natural closing of harmful paths.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-black/30 border border-white/5">
                <h5 className="font-bold text-white mb-1">When to Pray Istikharah?</h5>
                <p>
                  Whenever you stand at a crossroads between permissible choices (marriage proposals, career changes, business investments, major travel, education). It is not performed for obligatory acts (fard) or forbidden acts (haram).
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-black/30 border border-white/5">
                <h5 className="font-bold text-white mb-1">Consultation (Istisyarah) First</h5>
                <p>
                  The Sunnah unites two pillars: <strong>Istikharah</strong> (consulting the Creator) combined with <strong>Istisyarah</strong> (seeking counsel from trustworthy, experienced people).
                </p>
              </div>
            </div>

            <button
              id="btn-confirm-etiquette"
              onClick={onClose}
              className="w-full py-2.5 rounded-2xl tab-active-pill text-xs font-bold text-white border border-[#4ADE80]/40 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-glow-mint"
            >
              <Check className="w-4 h-4" />
              <span>Understood & Close</span>
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
