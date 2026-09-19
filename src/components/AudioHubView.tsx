import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  ChevronLeft,
  Music,
  Clock,
  Repeat,
  Gauge,
  Info,
} from 'lucide-react';
import { AudioTrack } from '../types';
import { AUDIO_CATALOG } from '../data/audioData';
import { playRecitationTadabburChord, playAudioTone } from '../utils/audio';

interface AudioHubViewProps {
  onBackToDashboard: () => void;
}

export const AudioHubView: React.FC<AudioHubViewProps> = ({ onBackToDashboard }) => {
  const [activeTrack, setActiveTrack] = useState<AudioTrack>(AUDIO_CATALOG[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackProgress, setPlaybackProgress] = useState<number>(0); // in seconds
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Playback timer simulation for offline recitation ambient playback
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setPlaybackProgress((prev) => {
          const next = prev + playbackSpeed;
          if (next >= activeTrack.durationSeconds) {
            if (isLooping) {
              return 0;
            } else {
              setIsPlaying(false);
              return activeTrack.durationSeconds;
            }
          }
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed, isLooping, activeTrack]);

  const handleTogglePlay = () => {
    if (!isPlaying) {
      if (!isMuted) {
        playRecitationTadabburChord();
      }
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const handleSelectTrack = (track: AudioTrack) => {
    setActiveTrack(track);
    setPlaybackProgress(0);
    setIsPlaying(true);
    if (!isMuted) {
      playRecitationTadabburChord();
    }
  };

  const handleSeek = (seconds: number) => {
    setPlaybackProgress(seconds);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <section id="view-audio-hub" className="space-y-4 w-full">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToDashboard}
          className="px-3 py-1.5 rounded-2xl liquid-glass border border-white/10 text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1 active:scale-95 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse" />
          <span className="text-[11px] font-bold text-[#86EFAC]">Zero-Dependency Offline Audio</span>
        </div>
      </div>

      {/* Hero Now-Playing Player */}
      <div className="liquid-glass rounded-3xl p-5 border border-[#4ADE80]/30 shadow-glass relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#4ADE80]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-bold text-[#4ADE80] tracking-wider uppercase flex items-center gap-1">
            <Music className="w-3 h-3" />
            <span>Smart Recitation Hub</span>
          </span>

          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#F3E5AB] font-mono border border-[#D4AF37]/30">
            {activeTrack.category === 'surah' ? `Surah Ke-${activeTrack.surahNumber}` : 'Al-Matsurat'}
          </span>
        </div>

        {/* Track Title & Arabic Calligraphy header */}
        <div className="text-center py-2 space-y-1">
          <p className="font-arabic text-2xl text-[#86EFAC] tracking-wide">
            {activeTrack.arabicTitle}
          </p>
          <h2 className="text-lg font-black text-white">{activeTrack.title}</h2>
          <p className="text-xs text-slate-400">
            Qari: <strong className="text-slate-200">{activeTrack.qari}</strong>
          </p>
        </div>

        {/* Progress Timeline Slider */}
        <div className="space-y-1 my-3">
          <input
            type="range"
            min="0"
            max={activeTrack.durationSeconds}
            value={playbackProgress}
            onChange={(e) => handleSeek(Number(e.target.value))}
            className="w-full accent-[#4ADE80] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>{formatTime(playbackProgress)}</span>
            <span>{activeTrack.durationText}</span>
          </div>
        </div>

        {/* Primary Controls */}
        <div className="flex items-center justify-between pt-1">
          {/* Speed Selector */}
          <button
            onClick={() => {
              const speeds = [1.0, 1.25, 1.5];
              const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
              setPlaybackSpeed(speeds[nextIdx]);
            }}
            className="px-2.5 py-1 rounded-xl bg-black/40 border border-white/10 text-[10px] font-mono font-bold text-slate-300 hover:text-white flex items-center gap-1 active:scale-95 transition-all"
            title="Kecepatan Pemutaran"
          >
            <Gauge className="w-3 h-3 text-[#86EFAC]" />
            <span>{playbackSpeed}x</span>
          </button>

          {/* Center Play/Pause Group */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSeek(Math.max(0, playbackProgress - 10))}
              className="p-2 text-slate-400 hover:text-white rounded-xl active:scale-95 transition-all"
              title="Mundur 10 Detik"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              id="btn-toggle-audio-play"
              onClick={handleTogglePlay}
              className="w-12 h-12 rounded-2xl bg-[#4ADE80] hover:bg-[#86EFAC] text-slate-950 flex items-center justify-center shadow-glow-mint active:scale-95 transition-all"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-current" />
              ) : (
                <Play className="w-6 h-6 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={() => setIsLooping(!isLooping)}
              className={`p-2 rounded-xl transition-all ${
                isLooping
                  ? 'bg-[#4ADE80]/20 text-[#86EFAC] border border-[#4ADE80]/30'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Ulangi Audio"
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Mute / Unmute Toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-xl bg-black/40 border border-white/10 text-slate-300 hover:text-white active:scale-95 transition-all"
            title={isMuted ? 'Nyalakan Suara' : 'Senyapkan'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Virtue Note */}
        <div className="mt-4 p-3 rounded-2xl bg-teal-950/40 border border-teal-500/20 text-xs text-left space-y-1">
          <p className="font-bold text-[#F3E5AB] flex items-center gap-1.5 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Fadhilah &amp; Keutamaan</span>
          </p>
          <p className="text-[11px] text-slate-300 leading-relaxed">{activeTrack.virtue}</p>
        </div>
      </div>

      {/* Playlist Catalog */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-white tracking-wide px-1">
          DAFTAR SURAH &amp; ADHKAR PILIHAN
        </h3>

        <div className="space-y-2">
          {AUDIO_CATALOG.map((track) => {
            const isCurrent = track.id === activeTrack.id;
            return (
              <div
                key={track.id}
                onClick={() => handleSelectTrack(track)}
                className={`p-3.5 rounded-3xl cursor-pointer border transition-all flex items-center justify-between ${
                  isCurrent
                    ? 'bg-[#4ADE80]/15 border-[#4ADE80]/40 shadow-glow-mint'
                    : 'liquid-glass border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-colors ${
                      isCurrent
                        ? 'bg-[#4ADE80] text-slate-950 shadow-glow-mint'
                        : 'bg-white/10 text-slate-300'
                    }`}
                  >
                    {isCurrent && isPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{track.title}</h4>
                    <p className="text-[10px] text-slate-400">
                      {track.description.slice(0, 52)}...
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-arabic text-sm text-[#86EFAC] block">
                    {track.arabicTitle}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {track.durationText}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
