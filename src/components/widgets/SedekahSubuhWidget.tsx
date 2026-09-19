import React, { useState } from 'react';
import { Heart, QrCode, Sparkles, Plus, Check } from 'lucide-react';
import { SedekahRecord } from '../../types';
import { playCompletionChime } from '../../utils/audio';

interface SedekahSubuhWidgetProps {
  records: SedekahRecord[];
  onLogSedekah: (amount: number) => void;
  onOpenQRIS: () => void;
}

export const SedekahSubuhWidget: React.FC<SedekahSubuhWidgetProps> = ({
  records,
  onLogSedekah,
  onOpenQRIS,
}) => {
  const [showParticle, setShowParticle] = useState(false);
  const weeklyTarget = 7;
  const completedThisWeek = Math.min(weeklyTarget, records.length);
  const totalAmount = records.reduce((acc, curr) => acc + curr.amount, 0);

  const handleQuickLog = (amount: number) => {
    playCompletionChime();
    setShowParticle(true);
    setTimeout(() => setShowParticle(false), 1200);
    onLogSedekah(amount);
  };

  return (
    <div 
      id="widget-sedekah-subuh"
      className="liquid-glass rounded-3xl p-5 border border-white/10 shadow-glass relative overflow-hidden"
    >
      {/* Light particle elevation effect */}
      {showParticle && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 flex flex-col items-center animate-particle-elevation">
          <Sparkles className="w-8 h-8 text-[#EAD8B1] drop-shadow-md" />
          <span className="text-xs font-bold text-[#F3E5AB]">Alhamdulillah! +Rp5.000</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/25 text-rose-300">
            <Heart className="w-4 h-4 fill-current" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-white">Sedekah Subuh</h4>
            <span className="text-[10px] text-slate-400">Pemberkah Awal Hari</span>
          </div>
        </div>

        <button
          onClick={onOpenQRIS}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#D4AF37]/15 text-[#EAD8B1] hover:bg-[#D4AF37]/25 border border-[#D4AF37]/30 text-[11px] font-bold active:scale-95 transition-all"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>QRIS Mikro</span>
        </button>
      </div>

      {/* Progress & Human Metric */}
      <div className="my-3 p-3 rounded-2xl bg-black/30 border border-white/5 space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-300 font-medium">Target Rutinitas:</span>
          <span className="font-bold text-[#86EFAC] tnum">{completedThisWeek} dari {weeklyTarget} hari</span>
        </div>
        <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/10">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-[#113632] via-[#4ADE80] to-[#86EFAC] transition-all duration-500"
            style={{ width: `${(completedThisWeek / weeklyTarget) * 100}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-400">
          Terkumpul <strong className="text-white">Rp {totalAmount.toLocaleString('id-ID')}</strong> minggu ini untuk kencleng subuh / mustahiq.
        </p>
      </div>

      {/* Quick Log Buttons */}
      <div className="flex items-center gap-2">
        <button
          id="btn-log-sedekah-5k"
          onClick={() => handleQuickLog(5000)}
          className="flex-1 py-2 px-3 rounded-xl bg-[#4ADE80]/15 hover:bg-[#4ADE80]/25 text-[#86EFAC] border border-[#4ADE80]/30 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-glow-mint"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Catat Rp 5.000</span>
        </button>

        <button
          id="btn-log-sedekah-10k"
          onClick={() => handleQuickLog(10000)}
          className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-bold active:scale-95 transition-all"
        >
          <span>Rp 10.000</span>
        </button>
      </div>
    </div>
  );
};
