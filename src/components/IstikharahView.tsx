import React, { useState } from 'react';
import {
  Compass,
  HelpCircle,
  ListOrdered,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle,
  Volume2,
  ChevronDown,
  Sparkles,
  HeartHandshake,
  Feather,
  Scroll,
} from 'lucide-react';
import { ISTIKHARAH_DUA, ISTIKHARAH_STEPS } from '../data/islamicData';
import { playAudioTone } from '../utils/audio';

interface IstikharahViewProps {
  onOpenEtiquetteModal: () => void;
}

export const IstikharahView: React.FC<IstikharahViewProps> = ({ onOpenEtiquetteModal }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [transliterationOpen, setTransliterationOpen] = useState(false);
  const [translationOpen, setTranslationOpen] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [completedMessage, setCompletedMessage] = useState(false);

  const step = ISTIKHARAH_STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < ISTIKHARAH_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCompletedMessage(true);
      setTimeout(() => setCompletedMessage(false), 5000);
      setCurrentStep(0);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleToggleDuaAudio = () => {
    setIsPlayingAudio(true);
    // Play warm melodic tone simulation
    playAudioTone(523.25, 0.35, 'triangle', 0.15);
    setTimeout(() => playAudioTone(659.25, 0.45, 'triangle', 0.15), 250);
    setTimeout(() => playAudioTone(783.99, 0.6, 'triangle', 0.15), 550);
    setTimeout(() => setIsPlayingAudio(false), 2000);
  };

  const getStepIcon = (iconName: string) => {
    switch (iconName) {
      case 'heart-handshake':
        return <HeartHandshake className="w-4 h-4 text-[#D4AF37]" />;
      case 'sparkles':
        return <Sparkles className="w-4 h-4 text-[#4ADE80]" />;
      case 'feather':
        return <Feather className="w-4 h-4 text-[#86EFAC]" />;
      case 'scroll':
        return <Scroll className="w-4 h-4 text-[#F3E5AB]" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#D4AF37]" />;
    }
  };

  return (
    <section id="view-istikharah" className="space-y-4 w-full">
      {/* Module Header Banner */}
      <div 
        id="istikharah-hero"
        className="liquid-glass-accent rounded-3xl p-5 relative overflow-hidden border border-[#D4AF37]/30 shadow-glass"
      >
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/20 text-[#F3E5AB] flex items-center justify-center border border-[#D4AF37]/30 shadow-glow-gold">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Sholat Istikharah</h2>
            <p className="text-xs text-[#F3E5AB]/90 font-medium">
              The Prayer of Seeking Counsel & Guidance
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed mt-2">
          A 2-rakaat voluntary prayer taught by the Prophet ﷺ for whenever one seeks clarity between permissible decisions.
        </p>
        <div className="mt-3 flex gap-2">
          <button
            id="btn-open-etiquette-modal"
            onClick={onOpenEtiquetteModal}
            className="px-3 py-1.5 rounded-xl liquid-glass text-xs font-semibold text-[#F3E5AB] border border-[#D4AF37]/30 flex items-center gap-1.5 active:scale-95 transition-all hover:bg-[#D4AF37]/10"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Etiquette & Dream Myths
          </button>
        </div>
      </div>

      {completedMessage && (
        <div className="p-3.5 rounded-2xl bg-[#4ADE80]/20 border border-[#4ADE80]/40 text-[#86EFAC] text-xs font-semibold flex items-center gap-2 animate-fade-in shadow-glow-mint">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>MashaAllah, you have completed the guide. May Allah grant you ease, peace of mind, and clarity!</span>
        </div>
      )}

      {/* Interactive Stepper Component */}
      <div 
        id="istikharah-stepper-card"
        className="liquid-glass rounded-3xl p-4 border border-white/10"
      >
        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ListOrdered className="w-4 h-4 text-[#4ADE80]" />
            Interactive Stepper
          </h3>
          <span 
            id="step-indicator-badge"
            className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#4ADE80]/20 text-[#86EFAC] border border-[#4ADE80]/30"
          >
            Step {currentStep + 1} of {ISTIKHARAH_STEPS.length}
          </span>
        </div>

        {/* Step Content Container */}
        <div className="min-h-[220px] flex flex-col justify-between">
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#D4AF37]/20 text-[#F3E5AB] flex items-center justify-center text-xs">
                {currentStep + 1}
              </span>
              {step.title}
            </h4>

            {step.niyyah && (
              <div className="p-3 rounded-2xl bg-black/30 border border-white/5 space-y-1">
                <span className="text-[10px] text-[#EAD8B1] font-bold uppercase tracking-wider">
                  Niyyah Formulation
                </span>
                <p className="font-arabic text-lg text-[#F3E5AB] text-right dir-rtl leading-relaxed">
                  {step.niyyah.split('\n')[0]}
                </p>
                <p className="text-xs italic text-slate-300 mt-1">
                  {step.niyyah.split('\n')[1]}
                </p>
              </div>
            )}

            {step.surahRecommendation && (
              <div className="p-3 rounded-2xl bg-[#4ADE80]/10 border border-[#4ADE80]/20 text-xs text-slate-200 space-y-1">
                <span className="text-[10px] text-[#4ADE80] font-bold uppercase tracking-wider">
                  Recommended Recitation
                </span>
                <p>{step.surahRecommendation}</p>
              </div>
            )}

            <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
              {step.body.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            {step.tip && (
              <p className="text-[11px] text-[#EAD8B1] italic border-l-2 border-[#D4AF37] pl-2.5 mt-2">
                Tip: {step.tip}
              </p>
            )}
          </div>

          {/* Stepper Controller Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-4">
            <button
              id="btn-prev-step"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="px-4 py-2 rounded-2xl liquid-glass text-xs font-semibold text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all hover:text-white"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Previous
            </button>

            {/* Pips */}
            <div className="flex space-x-1.5" id="step-pips-container">
              {ISTIKHARAH_STEPS.map((_, i) => (
                <span
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentStep
                      ? 'bg-[#4ADE80] shadow-glow-mint scale-125'
                      : 'bg-white/20'
                  }`}
                />
              ))}
            </div>

            <button
              id="btn-next-step"
              onClick={handleNext}
              className="px-4 py-2 rounded-2xl bg-[#4ADE80]/20 text-[#86EFAC] border border-[#4ADE80]/40 text-xs font-bold flex items-center gap-1 hover:bg-[#4ADE80]/30 active:scale-95 transition-all shadow-glow-mint"
            >
              {currentStep === ISTIKHARAH_STEPS.length - 1 ? (
                <>
                  <span>Finish</span>
                  <Check className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Du'a Al-Istikharah Complete Recitation Card */}
      <div 
        id="card-istikharah-dua"
        className="liquid-glass rounded-3xl p-5 border border-[#D4AF37]/30 space-y-3"
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#EAD8B1]">
              Official Supplication
            </span>
            <h4 className="text-base font-bold text-white">{ISTIKHARAH_DUA.title}</h4>
          </div>
          <button
            id="btn-play-dua-audio"
            onClick={handleToggleDuaAudio}
            className={`w-10 h-10 rounded-2xl liquid-glass flex items-center justify-center border border-[#D4AF37]/30 transition-all active:scale-95 shadow-glow-gold ${
              isPlayingAudio ? 'text-[#4ADE80] bg-[#4ADE80]/20 scale-105' : 'text-[#F3E5AB] hover:bg-[#D4AF37]/10'
            }`}
            title="Listen to prayer recitation simulation"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        {/* Arabic Text with Full Tashkeel */}
        <div className="bg-black/35 p-4 rounded-2xl border border-white/5 my-2">
          <p className="font-arabic text-xl sm:text-2xl leading-[2.6rem] text-right text-[#F3E5AB] dir-rtl select-text">
            {ISTIKHARAH_DUA.arabic}
          </p>
        </div>

        {/* Transliteration Accordion / Toggle */}
        <div className="border-t border-white/10 pt-2">
          <button
            id="toggle-latin-transliteration"
            onClick={() => setTransliterationOpen(!transliterationOpen)}
            className="w-full text-xs font-semibold text-[#86EFAC] flex items-center justify-between py-1 text-left"
          >
            <span>Latin Transliteration</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                transliterationOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
          {transliterationOpen && (
            <p className="text-xs text-slate-300 leading-relaxed mt-2 pt-2 border-t border-white/5 font-mono text-[11px] bg-black/20 p-2.5 rounded-xl">
              {ISTIKHARAH_DUA.latin}
            </p>
          )}
        </div>

        {/* Meaning Translation */}
        <div className="border-t border-white/10 pt-2">
          <button
            id="toggle-translation"
            onClick={() => setTranslationOpen(!translationOpen)}
            className="w-full text-xs font-semibold text-[#EAD8B1] flex items-center justify-between py-1 text-left"
          >
            <span>Indonesian & English Translation</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                translationOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
          {translationOpen && (
            <div className="text-xs text-slate-300 leading-relaxed mt-2 pt-2 border-t border-white/5 space-y-2">
              <p>
                <strong className="text-[#86EFAC]">ID:</strong> {ISTIKHARAH_DUA.translationId}
              </p>
              <p className="text-slate-400">
                <strong className="text-[#EAD8B1]">EN:</strong> {ISTIKHARAH_DUA.translationEn}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
