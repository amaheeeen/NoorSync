import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { QrCode, X, Heart, ShieldCheck, Download, Check } from 'lucide-react';

interface QRISModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDoneSedekah: (amount: number) => void;
}

export const QRISModal: React.FC<QRISModalProps> = ({ isOpen, onClose, onDoneSedekah }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="modal-qris-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4"
        >
          <motion.div
            id="modal-qris-content"
            initial={{ opacity: 0, scale: 0.92, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350, mass: 0.8 }}
            onClick={(e) => e.stopPropagation()}
            className="liquid-glass rounded-3xl p-5 w-full max-w-sm space-y-4 border border-[#D4AF37]/40 shadow-glass text-center"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-left">
                <Heart className="w-4 h-4 text-rose-400 fill-current" />
                <div>
                  <h4 className="text-sm font-bold text-white">QRIS Sedekah Subuh</h4>
                  <p className="text-[10px] text-slate-400">Infaq & Amal Jariyah Mikro</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Generated QRIS Canvas / SVG simulation */}
            <div className="p-4 bg-white rounded-2xl mx-auto w-56 h-56 flex flex-col items-center justify-center shadow-xl">
              <div className="border-4 border-[#061917] p-2 rounded-xl flex flex-col items-center justify-center">
                <QrCode className="w-36 h-36 text-slate-900" />
                <span className="text-[9px] font-black tracking-widest text-slate-900 mt-1">
                  QRIS STANDAR PEMBAYARAN
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Pindai melalui GoPay, OVO, ShopeePay, atau Mobile Banking pilihan Anda untuk sedekah subuh.
            </p>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  onDoneSedekah(5000);
                  onClose();
                }}
                className="py-2.5 rounded-xl bg-[#4ADE80]/20 text-[#86EFAC] border border-[#4ADE80]/40 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-glow-mint"
              >
                <Check className="w-4 h-4" />
                <span>Konfirmasi Donasi</span>
              </button>
              <button
                onClick={onClose}
                className="py-2.5 rounded-xl bg-white/5 text-slate-300 border border-white/10 text-xs font-semibold hover:bg-white/10"
              >
                Selesai
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
