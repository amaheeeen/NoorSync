import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Heart,
  CheckCircle2,
  Clock,
  Trash2,
  Lock,
  Tag,
  ChevronLeft,
  BookOpen,
} from 'lucide-react';
import { ReflectionItem, ReflectionStatus, ReflectionCategory } from '../types';
import {
  getAllReflectionsFromIDB,
  saveReflectionToIDB,
  deleteReflectionFromIDB,
} from '../services/db';
import { playCompletionChime } from '../utils/audio';

interface ReflectionsViewProps {
  onBackToDashboard: () => void;
}

export const ReflectionsView: React.FC<ReflectionsViewProps> = ({
  onBackToDashboard,
}) => {
  const [reflections, setReflections] = useState<ReflectionItem[]>([]);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<ReflectionStatus | 'all'>('all');

  // Form State
  const [title, setTitle] = useState('');
  const [decisionOrDua, setDecisionOrDua] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState<ReflectionCategory>('istikharah');
  const [status, setStatus] = useState<ReflectionStatus>('active');

  // Load from IndexedDB on mount
  useEffect(() => {
    loadReflections();
  }, []);

  const loadReflections = async () => {
    const list = await getAllReflectionsFromIDB();
    setReflections(list);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !decisionOrDua.trim()) return;

    const newItem: ReflectionItem = {
      id: 'refl_' + Date.now(),
      title: title.trim(),
      decisionOrDua: decisionOrDua.trim(),
      notes: notes.trim(),
      category,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveReflectionToIDB(newItem);
    playCompletionChime();

    // Reset
    setTitle('');
    setDecisionOrDua('');
    setNotes('');
    setIsCreating(false);
    loadReflections();
  };

  const handleUpdateStatus = async (item: ReflectionItem, newStatus: ReflectionStatus) => {
    const updated: ReflectionItem = {
      ...item,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      answeredAt: newStatus === 'granted' ? new Date().toISOString() : item.answeredAt,
    };
    await saveReflectionToIDB(updated);
    if (newStatus === 'granted') {
      playCompletionChime();
    }
    loadReflections();
  };

  const handleDelete = async (id: string) => {
    await deleteReflectionFromIDB(id);
    loadReflections();
  };

  const filteredItems = reflections.filter((item) => {
    if (activeFilter === 'all') return true;
    return item.status === activeFilter;
  });

  const getStatusBadge = (st: ReflectionStatus) => {
    switch (st) {
      case 'active':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#4ADE80]/20 text-[#86EFAC] border border-[#4ADE80]/40 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
            <span>Active Du&apos;a</span>
          </span>
        );
      case 'granted':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37]/20 text-[#F3E5AB] border border-[#D4AF37]/40 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-[#D4AF37]" />
            <span>Alhamdulillah Terkabul</span>
          </span>
        );
      case 'reflecting':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-300" />
            <span>Still Reflecting</span>
          </span>
        );
    }
  };

  return (
    <section id="view-reflections-vault" className="space-y-4 w-full">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToDashboard}
          className="px-3 py-1.5 rounded-2xl liquid-glass border border-white/10 text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1 active:scale-95 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        <div className="flex items-center space-x-1.5 text-xs text-slate-400">
          <Lock className="w-3.5 h-3.5 text-[#86EFAC]" />
          <span className="text-[11px]">100% Private (IndexedDB Encrypted Local Vault)</span>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="liquid-glass rounded-3xl p-5 border border-[#D4AF37]/30 shadow-glass relative overflow-hidden">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-bold text-[#D4AF37] tracking-wider uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Personal Reflection Vault</span>
            </span>
            <h2 className="text-xl font-black text-white mt-1">Jurnal Doa &amp; Istikharah</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-md leading-relaxed">
              Catatan hajat, keputusan istikharah, dan riwayat doa yang tersimpan aman tanpa server eksternal.
            </p>
          </div>

          <button
            id="btn-new-reflection"
            onClick={() => setIsCreating(!isCreating)}
            className="px-3.5 py-2 rounded-2xl bg-[#4ADE80] hover:bg-[#86EFAC] text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-glow-mint active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{isCreating ? 'Batal' : 'Catat Doa'}</span>
          </button>
        </div>

        {/* Status Metrics Bar */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/10 text-center">
          <div className="p-2 rounded-2xl bg-black/30 border border-white/5">
            <span className="text-[10px] text-slate-400 block font-medium">Doa Aktif</span>
            <span className="text-sm font-bold text-[#86EFAC]">
              {reflections.filter((r) => r.status === 'active').length}
            </span>
          </div>
          <div className="p-2 rounded-2xl bg-black/30 border border-white/5">
            <span className="text-[10px] text-slate-400 block font-medium">Masih Ikhtiar</span>
            <span className="text-sm font-bold text-amber-300">
              {reflections.filter((r) => r.status === 'reflecting').length}
            </span>
          </div>
          <div className="p-2 rounded-2xl bg-black/30 border border-white/5">
            <span className="text-[10px] text-slate-400 block font-medium">Terkabul</span>
            <span className="text-sm font-bold text-[#F3E5AB]">
              {reflections.filter((r) => r.status === 'granted').length}
            </span>
          </div>
        </div>
      </div>

      {/* Creation Modal / Inline Form */}
      {isCreating && (
        <form
          onSubmit={handleCreate}
          className="liquid-glass rounded-3xl p-5 border border-[#4ADE80]/40 shadow-glass space-y-3 animate-in fade-in"
        >
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#86EFAC]" />
            <span>Tulis Hajat / Keputusan Istikharah Baru</span>
          </h3>

          <div className="space-y-1">
            <label className="text-[11px] text-slate-300 font-semibold block">Judul Doa / Pilihan</label>
            <input
              type="text"
              required
              placeholder="Contoh: Istikharah Karier / Doa Kesembuhan Orang Tua"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#4ADE80]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-slate-300 font-semibold block">Inti Permohonan / Petunjuk yang Dicari</label>
            <textarea
              required
              rows={2}
              placeholder="Ya Allah, jika urusan ini baik untuk agamaku, duniaku, dan akhiratku..."
              value={decisionOrDua}
              onChange={(e) => setDecisionOrDua(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#4ADE80]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] text-slate-300 font-semibold block">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ReflectionCategory)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-[#4ADE80]"
              >
                <option value="istikharah" className="bg-slate-900">Istikharah (Pilihan)</option>
                <option value="hajat" className="bg-slate-900">Sholat Hajat</option>
                <option value="syukur" className="bg-slate-900">Syukur &amp; Nikmat</option>
                <option value="kehidupan" className="bg-slate-900">Kehidupan &amp; Rezeki</option>
                <option value="keluarga" className="bg-slate-900">Keluarga</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-300 font-semibold block">Status Awal</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ReflectionStatus)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-[#4ADE80]"
              >
                <option value="active" className="bg-slate-900">Active Du&apos;a (Dipanjatkan)</option>
                <option value="reflecting" className="bg-slate-900">Still Reflecting (Istikharah)</option>
                <option value="granted" className="bg-slate-900">Granted (Alhamdulillah)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-slate-300 font-semibold block">Catatan Tambahan (Opsional)</label>
            <input
              type="text"
              placeholder="Tanda-tanda ketenangan hati atau ikhtiar yang dijalankan..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#4ADE80]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 rounded-xl bg-white/10 text-xs font-bold text-slate-300 hover:text-white"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#4ADE80] text-slate-950 text-xs font-extrabold shadow-glow-mint"
            >
              Simpan ke Vault
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
        {[
          { id: 'all', label: 'Semua Jurnal' },
          { id: 'active', label: 'Active Du\'a' },
          { id: 'reflecting', label: 'Still Reflecting' },
          { id: 'granted', label: 'Terkabul (Alhamdulillah)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as any)}
            className={`px-3 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap active:scale-95 transition-all ${
              activeFilter === tab.id
                ? 'tab-active-pill text-[#86EFAC] shadow-glow-mint border border-[#4ADE80]/40'
                : 'liquid-glass text-slate-400 hover:text-white border border-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reflections Card List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="p-8 rounded-3xl liquid-glass border border-white/10 text-center space-y-2">
            <Heart className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-xs text-slate-300 font-semibold">Belum ada jurnal doa pada kategori ini.</p>
            <p className="text-[11px] text-slate-400">
              Klik tombol &quot;Catat Doa&quot; di atas untuk mencatat hajat dan istikharah Anda.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="liquid-glass rounded-3xl p-4 border border-white/10 hover:border-white/20 transition-all space-y-3 shadow-glass"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusBadge(item.status)}
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      • {item.category}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{item.title}</h4>
                </div>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-slate-500 hover:text-rose-400 p-1 rounded-lg transition-colors"
                  title="Hapus Jurnal"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed bg-black/25 p-3 rounded-2xl border border-white/5 italic">
                &ldquo;{item.decisionOrDua}&rdquo;
              </p>

              {item.notes && (
                <p className="text-[11px] text-slate-400">
                  <strong>Catatan:</strong> {item.notes}
                </p>
              )}

              {/* Status Switcher Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
                <span className="text-[10px] text-slate-500">
                  {new Date(item.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>

                <div className="flex items-center gap-1">
                  {item.status !== 'granted' && (
                    <button
                      onClick={() => handleUpdateStatus(item, 'granted')}
                      className="px-2.5 py-1 rounded-xl bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#F3E5AB] font-bold border border-[#D4AF37]/30 text-[10px] flex items-center gap-1 active:scale-95 transition-all"
                    >
                      <CheckCircle2 className="w-3 h-3 text-[#D4AF37]" />
                      <span>Tandai Terkabul</span>
                    </button>
                  )}

                  {item.status !== 'active' && (
                    <button
                      onClick={() => handleUpdateStatus(item, 'active')}
                      className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold border border-white/10 text-[10px] active:scale-95 transition-all"
                    >
                      Aktifkan Lagi
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};
