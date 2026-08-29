import React, { useState } from 'react';
import { 
  Sparkles, 
  SlidersHorizontal, 
  Camera, 
  Zap, 
  Video, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  HelpCircle,
  Clock,
  Moon,
  Layers,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { useHaptics } from '../utils/haptics';
import { FilterId } from '../types';
import { FILTERS } from '../data/presets';

interface QuickStartTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFilterSample?: (filterId: FilterId) => void;
  onGoToQuickClip?: () => void;
}

interface TutorialStep {
  id: string;
  stepNumber: number;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  spotlightPosition: 'top_filter' | 'bottom_shutter' | 'top_quickclip';
  actionPrompt?: string;
  highlights: { icon: React.ComponentType<{ className?: string }>; text: string }[];
}

export const TUTORIAL_STORAGE_KEY = 'quickstatus_coach_tutorial_seen';

export const QuickStartTutorial: React.FC<QuickStartTutorialProps> = ({
  isOpen,
  onClose,
  onSelectFilterSample,
  onGoToQuickClip,
}) => {
  const haptics = useHaptics();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const steps: TutorialStep[] = [
    {
      id: 'filter_dropdown',
      stepNumber: 1,
      badge: 'Filter Estetik',
      title: 'Pilih Filter Status Favorit',
      subtitle: 'Menu Dropdown di Bagian Atas',
      description: 'Ketuk menu filter di atas untuk memilih beragam preset warna estetik seperti Coffee Glow, Cyber Neon, Film Retro, hingga Sunset Warm.',
      icon: SlidersHorizontal,
      spotlightPosition: 'top_filter',
      actionPrompt: 'Coba pilih preset warna instan:',
      highlights: [
        { icon: Sparkles, text: '6+ Preset estetik siap pakai' },
        { icon: SlidersHorizontal, text: 'Ganti tone foto dalam 1 ketukan' },
      ],
    },
    {
      id: 'camera_and_auto_status',
      stepNumber: 2,
      badge: 'Kamera & Auto Status',
      title: 'Jepret & Bagikan Seketika',
      subtitle: 'Tombol Shutter & Auto Status di Bawah',
      description: 'Tekan Shutter untuk mengambil foto dan edit caption, atau gunakan tombol Auto Status (kanan bawah) untuk langsung memproses dan siap kirim tanpa ribet!',
      icon: Zap,
      spotlightPosition: 'bottom_shutter',
      actionPrompt: 'Fitur kamera cerdas yang tersedia:',
      highlights: [
        { icon: Moon, text: 'Auto-Night Mode & Bright Screen Flash' },
        { icon: Clock, text: 'Hands-free Shutter Timer (3s & 10s)' },
        { icon: Layers, text: 'Pembuat Kolase Foto dari Galeri' },
      ],
    },
    {
      id: 'quickclip_recording',
      stepNumber: 3,
      badge: 'Video Pendek 8s',
      title: 'Rekam Video QuickClip 8 Detik',
      subtitle: 'Tombol 8s Clip di Sudut Kanan Atas',
      description: 'Ingin video status yang lebih hidup? Beralih ke mode QuickClip untuk merekam video pendek 8 detik dengan multi-segmen, transisi, dan template musik.',
      icon: Video,
      spotlightPosition: 'top_quickclip',
      actionPrompt: 'Kemampuan QuickClip:',
      highlights: [
        { icon: Video, text: 'Perekaman multi-segmen instan' },
        { icon: Sparkles, text: 'Transisi sinematik & Auto-Trim' },
      ],
    },
  ];

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleNext = () => {
    haptics.triggerMedium();
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    haptics.triggerLight();
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    haptics.triggerSuccess();
    try {
      localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
    } catch (e) {
      console.warn('Unable to write to localStorage', e);
    }
    onClose();
  };

  const handleSkip = () => {
    haptics.triggerLight();
    try {
      localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
    } catch (e) {
      console.warn('Unable to write to localStorage', e);
    }
    onClose();
  };

  const handleTryQuickClip = () => {
    haptics.triggerSuccess();
    try {
      localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
    } catch (e) {
      console.warn('Unable to write to localStorage', e);
    }
    onClose();
    if (onGoToQuickClip) {
      onGoToQuickClip();
    }
  };

  const IconComponent = currentStep.icon;

  return (
    <div className="absolute inset-0 z-50 overflow-hidden select-none pointer-events-auto animate-in fade-in duration-200">
      
      {/* Semi-transparent dark overlay */}
      <div 
        onClick={handleSkip} 
        className="absolute inset-0 bg-black/80 backdrop-blur-[2px] transition-all duration-300" 
      />

      {/* 1. DYNAMIC SPOTLIGHT CUTOUT / HIGHLIGHT RINGS */}
      
      {/* Spotlight: Top Filter Dropdown (Step 1) */}
      {currentStep.spotlightPosition === 'top_filter' && (
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-10 pointer-events-none flex flex-col items-center animate-in zoom-in-95 duration-200">
          <div className="relative">
            {/* Glowing animated pulsing ring around Filter Dropdown button */}
            <div className="w-36 h-10 rounded-full border-2 border-amber-400 bg-amber-400/15 shadow-[0_0_25px_rgba(251,191,36,0.6)] animate-pulse" />
            
            {/* Pointer Indicator Arrow */}
            <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <ArrowUp className="w-5 h-5 text-amber-400 animate-bounce" />
            </div>
          </div>
        </div>
      )}

      {/* Spotlight: Bottom Shutter & Auto Status (Step 2) */}
      {currentStep.spotlightPosition === 'bottom_shutter' && (
        <div className="absolute bottom-3 inset-x-4 z-10 pointer-events-none flex items-center justify-between px-2 animate-in zoom-in-95 duration-200">
          {/* Spotlight over Central Shutter and Auto Status */}
          <div className="w-full flex items-center justify-between">
            {/* Mini indicator left */}
            <div className="w-12 h-12 rounded-2xl border border-white/20 opacity-40" />

            {/* Shutter Spotlight */}
            <div className="relative flex flex-col items-center">
              <div className="absolute -top-7 left-1/2 -translate-x-1/2">
                <ArrowDown className="w-5 h-5 text-amber-400 animate-bounce" />
              </div>
              <div className="w-20 h-20 rounded-full border-2 border-amber-400 bg-amber-400/20 shadow-[0_0_30px_rgba(251,191,36,0.6)] animate-pulse" />
            </div>

            {/* Auto Status Spotlight */}
            <div className="relative">
              <div className="w-24 h-12 rounded-2xl border-2 border-amber-400 bg-amber-400/20 shadow-[0_0_20px_rgba(251,191,36,0.5)] animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* Spotlight: Top Right QuickClip Button (Step 3) */}
      {currentStep.spotlightPosition === 'top_quickclip' && (
        <div className="absolute top-2 right-2 z-10 pointer-events-none flex flex-col items-end animate-in zoom-in-95 duration-200">
          <div className="relative">
            {/* Glowing animated ring around 8s Clip button */}
            <div className="w-24 h-9 rounded-full border-2 border-amber-400 bg-amber-400/20 shadow-[0_0_25px_rgba(251,191,36,0.7)] animate-pulse" />
            
            {/* Pointer Indicator Arrow */}
            <div className="absolute -bottom-7 right-6 flex flex-col items-center">
              <ArrowUp className="w-5 h-5 text-amber-400 animate-bounce" />
            </div>
          </div>
        </div>
      )}

      {/* 2. INTERACTIVE COACH MARK CARD (Positioned in Center Viewport) */}
      <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center">
        <div className="w-full max-w-sm bg-neutral-900/95 border border-amber-400/40 backdrop-blur-2xl rounded-3xl p-4 sm:p-5 shadow-2xl shadow-black/90 flex flex-col relative animate-in zoom-in-95 duration-200">
          
          {/* Top Row: Badge, Steps indicator, and Skip Button */}
          <div className="flex items-center justify-between pb-2.5 mb-1 border-b border-neutral-800">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-neutral-950 font-black text-[10px] uppercase tracking-wider shadow-sm">
                {currentStep.badge}
              </span>
              <span className="text-[11px] font-bold text-neutral-400">
                {currentStepIndex + 1} / {steps.length}
              </span>
            </div>

            <button
              onClick={handleSkip}
              className="text-[11px] font-bold text-neutral-400 hover:text-white px-2 py-0.5 rounded-lg hover:bg-neutral-800 transition"
            >
              Lewati Panduan
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-neutral-800 h-1 rounded-full overflow-hidden mb-3.5">
            <div 
              className="bg-amber-400 h-full transition-all duration-300 rounded-full"
              style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>

          {/* Icon & Title Heading */}
          <div className="flex items-start gap-3 mb-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-neutral-950 shrink-0 shadow-md shadow-amber-400/20">
              <IconComponent className="w-5 h-5 stroke-[2.2]" />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug">
                {currentStep.title}
              </h3>
              <p className="text-[11px] font-semibold text-amber-300/90 leading-tight">
                {currentStep.subtitle}
              </p>
            </div>
          </div>

          {/* Body Description */}
          <p className="text-xs text-neutral-300 leading-relaxed mb-3">
            {currentStep.description}
          </p>

          {/* Highlights or Interactive Sample Pill Picker for Step 1 */}
          {currentStep.id === 'filter_dropdown' && (
            <div className="w-full bg-neutral-950/70 border border-neutral-800 rounded-2xl p-2.5 mb-3.5 space-y-2">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                {currentStep.actionPrompt}
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {FILTERS.slice(0, 4).map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      haptics.triggerSelection();
                      if (onSelectFilterSample) {
                        onSelectFilterSample(f.id);
                      }
                    }}
                    className="px-2.5 py-1 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-[10px] font-bold text-neutral-200 flex items-center gap-1 shrink-0 active:scale-95 transition"
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: f.accentColor }} />
                    <span>{f.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Highlights for Step 2 & Step 3 */}
          {currentStep.id !== 'filter_dropdown' && (
            <div className="w-full bg-neutral-950/70 border border-neutral-800 rounded-2xl p-2.5 mb-3.5 space-y-1.5">
              {currentStep.highlights.map((hl, idx) => {
                const HIcon = hl.icon;
                return (
                  <div key={idx} className="flex items-center gap-2 text-[11px] text-neutral-300 font-medium">
                    <div className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
                      <HIcon className="w-2.5 h-2.5" />
                    </div>
                    <span className="truncate">{hl.text}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom Nav Actions */}
          <div className="flex items-center justify-between gap-2 pt-1">
            {!isFirstStep ? (
              <button
                onClick={handlePrev}
                className="px-3 py-2 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white font-bold text-xs flex items-center gap-1 transition active:scale-95"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </button>
            ) : (
              <div className="text-[10px] text-neutral-500 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Panduan Cepat</span>
              </div>
            )}

            <div className="flex items-center gap-1.5 ml-auto">
              {isLastStep ? (
                <>
                  {onGoToQuickClip && (
                    <button
                      onClick={handleTryQuickClip}
                      className="px-3 py-2 rounded-2xl bg-neutral-800 hover:bg-neutral-700 border border-amber-400/30 text-amber-300 font-bold text-xs flex items-center gap-1 transition active:scale-95"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Coba QuickClip</span>
                    </button>
                  )}

                  <button
                    onClick={handleComplete}
                    className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-neutral-950 font-black text-xs flex items-center gap-1 shadow-md shadow-amber-400/20 transition active:scale-95"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Mulai Sekarang</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-neutral-950 font-black text-xs flex items-center gap-1 shadow-md shadow-amber-400/20 transition active:scale-95"
                >
                  <span>Lanjut</span>
                  <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
