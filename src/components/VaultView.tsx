import React, { useState } from 'react';
import { Copy, Check, Volume2, FileHeart, Headphones, Sparkles } from 'lucide-react';
import { VAULT_ITEMS } from '../data/islamicData';
import { playAudioTone } from '../utils/audio';
import { TabType } from '../types';

type CategoryKey = 'pagi' | 'petang' | 'sholat' | 'harian';

interface VaultViewProps {
  onNavigateTab?: (tab: TabType) => void;
}

export const VaultView: React.FC<VaultViewProps> = ({ onNavigateTab }) => {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('pagi');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const categories: { id: CategoryKey; label: string; icon: string }[] = [
    { id: 'pagi', label: 'Dzikir Pagi', icon: '🌅' },
    { id: 'petang', label: 'Dzikir Petang', icon: '🌇' },
    { id: 'sholat', label: "Ba'da Sholat", icon: '🕌' },
    { id: 'harian', label: 'Doa Harian', icon: '🤲' },
  ];

  const items = VAULT_ITEMS[activeCategory] || [];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePlayTone = (id: string) => {
    setPlayingId(id);
    playAudioTone(587.33, 0.4, 'sine', 0.15); // D5
    setTimeout(() => {
      playAudioTone(659.25, 0.45, 'triangle', 0.15); // E5
      setPlayingId(null);
    }, 280);
  };

  return (
    <section id="view-vault" className="space-y-4 w-full">
      {/* Quick Switch Sub-Navigation */}
      {onNavigateTab && (
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onNavigateTab('reflections')}
            className="p-2.5 rounded-2xl liquid-glass border border-white/10 hover:border-[#D4AF37]/30 text-left active:scale-95 transition-all group"
          >
            <div className="flex items-center space-x-1.5 text-xs font-bold text-[#F3E5AB]">
              <FileHeart className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Jurnal Doa</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Refleksi pribadi</p>
          </button>

          <button
            onClick={() => onNavigateTab('audio')}
            className="p-2.5 rounded-2xl liquid-glass border border-white/10 hover:border-[#4ADE80]/30 text-left active:scale-95 transition-all group"
          >
            <div className="flex items-center space-x-1.5 text-xs font-bold text-[#86EFAC]">
              <Headphones className="w-3.5 h-3.5 text-[#4ADE80]" />
              <span>Audio Hub</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Mulk, Kahf &amp; Adhkar</p>
          </button>

          <button
            onClick={() => onNavigateTab('istikharah')}
            className="p-2.5 rounded-2xl liquid-glass border border-white/10 hover:border-[#D4AF37]/30 text-left active:scale-95 transition-all group"
          >
            <div className="flex items-center space-x-1.5 text-xs font-bold text-[#EAD8B1]">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Istikharah</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Panduan keputusan</p>
          </button>
        </div>
      )}

      {/* Category Filter Tabs (Horizontal Liquid Scroll) */}
      <div 
        id="vault-category-tabs"
        className="flex space-x-2 overflow-x-auto no-scrollbar py-1 w-full"
      >
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              id={`tab-category-${cat.id}`}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap active:scale-95 transition-all flex items-center space-x-1.5 ${
                isActive
                  ? 'tab-active-pill text-white shadow-glow-mint border border-[#4ADE80]/40'
                  : 'liquid-glass text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dua Items List */}
      <div id="vault-items-list" className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            id={`adhkar-card-${item.id}`}
            className="liquid-glass rounded-3xl p-4 border border-white/10 space-y-2.5 transition-all hover:border-[#D4AF37]/30"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white max-w-[70%]">{item.title}</h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#F3E5AB] border border-[#D4AF37]/30">
                {item.count}
              </span>
            </div>

            {/* Arabic Text */}
            <p className="font-arabic text-lg sm:text-xl text-right text-[#F3E5AB] leading-relaxed dir-rtl select-text">
              {item.arabic}
            </p>

            {/* Transliteration */}
            <p className="text-[11px] text-[#86EFAC] font-mono italic">
              {item.latin}
            </p>

            {/* Meaning */}
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {item.meaning}
            </p>

            {/* Action buttons */}
            <div className="flex items-center justify-end space-x-2 pt-1 border-t border-white/5">
              <button
                id={`btn-play-tone-${item.id}`}
                onClick={() => handlePlayTone(item.id)}
                className={`p-1.5 rounded-xl liquid-glass text-xs transition-all active:scale-90 ${
                  playingId === item.id ? 'text-[#4ADE80] bg-[#4ADE80]/20' : 'text-slate-400 hover:text-[#EAD8B1]'
                }`}
                title="Play tone indicator"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
              <button
                id={`btn-copy-${item.id}`}
                onClick={() => handleCopy(item.id, `${item.arabic}\n\n${item.latin}\n\n${item.meaning}`)}
                className="p-1.5 rounded-xl liquid-glass text-xs text-slate-400 hover:text-white transition-all active:scale-90"
                title="Copy Du'a"
              >
                {copiedId === item.id ? (
                  <span className="flex items-center space-x-1 text-[#4ADE80] text-[10px] font-semibold">
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied</span>
                  </span>
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
