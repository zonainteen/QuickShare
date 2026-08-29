import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Video, 
  Eye, 
  Clock, 
  Zap, 
  Sparkles, 
  RefreshCw, 
  Play, 
  Pause,
  SwitchCamera,
  Layers,
  Film,
  Sliders,
  MoveRight,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QuickClipEffect, ClipTransition, CapturedMedia, AdMobConfig, PlatformStyle } from '../../types';
import { QUICKCLIP_EFFECTS, SAMPLE_PRESET_SCENES } from '../../data/presets';
import { AdMobBanner } from '../AdMobBanner';
import { useHaptics } from '../../utils/haptics';

interface VideoSegment {
  id: string;
  sceneIndex: number;
  duration: number;
  caption: string;
  url: string;
  category: string;
}

interface QuickClipScreenProps {
  platformStyle: PlatformStyle;
  admobConfig: AdMobConfig;
  onBack: () => void;
  onNextToBlast: (media: CapturedMedia) => void;
}

export const QuickClipScreen: React.FC<QuickClipScreenProps> = ({
  platformStyle,
  admobConfig,
  onBack,
  onNextToBlast,
}) => {
  const haptics = useHaptics();
  const [selectedEffect, setSelectedEffect] = useState<QuickClipEffect>('color_pop');
  const [selectedTransition, setSelectedTransition] = useState<ClipTransition>('slide_fade');
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0.0);
  const [hasRecordedClip, setHasRecordedClip] = useState(false);
  const [selectedVideoSceneIdx, setSelectedVideoSceneIdx] = useState(0);
  const [caption, setCaption] = useState('8-second aesthetic vibe ✨ #QuickClip #Story');
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');

  // Video segments timeline (supports combining multi-shot clips up to 8 seconds)
  const [segments, setSegments] = useState<VideoSegment[]>([
    {
      id: 'seg-1',
      sceneIndex: 0,
      duration: 2.8,
      caption: 'Morning Brew ☕',
      url: SAMPLE_PRESET_SCENES[0].url,
      category: SAMPLE_PRESET_SCENES[0].category,
    },
    {
      id: 'seg-2',
      sceneIndex: 1,
      duration: 2.7,
      caption: 'City Lights 🌃',
      url: SAMPLE_PRESET_SCENES[1].url,
      category: SAMPLE_PRESET_SCENES[1].category,
    },
    {
      id: 'seg-3',
      sceneIndex: 2,
      duration: 2.5,
      caption: 'Golden Hour Sunset 🌅',
      url: SAMPLE_PRESET_SCENES[2].url,
      category: SAMPLE_PRESET_SCENES[2].category,
    },
  ]);

  const maxDuration = 8.0;
  const timerRef = useRef<any>(null);
  const previewTimerRef = useRef<any>(null);
  const currentScene = SAMPLE_PRESET_SCENES[selectedVideoSceneIdx];

  const quickClipCaptions = [
    '8-second aesthetic vibe ✨ #QuickClip #Story',
    'Living fast, capturing magic in 8s ⚡🎬',
    'Vibe check: 100% aesthetic & fun 🥐☕',
    'Little moments, huge memories 🌟',
    'Short video, big mood today 🕺🎉',
  ];

  // Record timer loop
  useEffect(() => {
    if (isRecording) {
      const interval = 100;
      timerRef.current = setInterval(() => {
        setRecordSeconds((prev) => {
          const next = prev + 0.1;
          if (next >= maxDuration) {
            clearInterval(timerRef.current);
            haptics.triggerRecordStop();
            setIsRecording(false);
            setHasRecordedClip(true);
            return maxDuration;
          }
          return next;
        });
      }, interval);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  // Preview playback loop sequencing smoothly through segments with transitions
  useEffect(() => {
    if (isPlayingPreview) {
      const currentSeg = segments[activeSegmentIndex] || segments[0];
      const durationMs = (currentSeg.duration || 2.5) * 1000;

      previewTimerRef.current = setTimeout(() => {
        setSlideDirection('right');
        setActiveSegmentIndex((prev) => {
          const nextIdx = (prev + 1) % segments.length;
          setSelectedVideoSceneIdx(segments[nextIdx].sceneIndex);
          return nextIdx;
        });
      }, durationMs);
    } else {
      clearTimeout(previewTimerRef.current);
    }

    return () => clearTimeout(previewTimerRef.current);
  }, [isPlayingPreview, activeSegmentIndex, segments]);

  const handleStartRecording = () => {
    haptics.triggerRecordStart();
    setIsPlayingPreview(false);
    setRecordSeconds(0.0);
    setIsRecording(true);
    setHasRecordedClip(false);
  };

  const handleStopRecording = () => {
    if (isRecording) {
      haptics.triggerRecordStop();
    }
    setIsRecording(false);
    if (recordSeconds > 0.5) {
      setHasRecordedClip(true);
      // Append or update current segment
      const newSeg: VideoSegment = {
        id: `seg-${Date.now()}`,
        sceneIndex: selectedVideoSceneIdx,
        duration: Math.min(recordSeconds, 8.0),
        caption: currentScene.title,
        url: currentScene.url,
        category: currentScene.category,
      };
      setSegments((prev) => [newSeg, ...prev.slice(0, 2)]);
    }
  };

  const handleSelectScene = (idx: number) => {
    haptics.triggerSelection();
    setSlideDirection(idx > selectedVideoSceneIdx ? 'right' : 'left');
    setSelectedVideoSceneIdx(idx);
    setActiveSegmentIndex(idx % segments.length);
  };

  const handleNext = () => {
    haptics.triggerMedium();
    onNextToBlast({
      type: 'video',
      url: currentScene.url,
      filterId: currentScene.filterId,
      effectId: selectedEffect,
      transitionEffect: selectedTransition,
      caption: caption,
      timestamp: new Date(),
      duration: Math.max(recordSeconds, 4.5),
    });
  };

  const getEffectIcon = (iconName: string) => {
    switch (iconName) {
      case 'Eye': return Eye;
      case 'Clock': return Clock;
      case 'Zap': return Zap;
      default: return Sparkles;
    }
  };

  const getEffectCss = () => {
    if (selectedEffect === 'blur_lembut') return 'effect-soft-blur';
    if (selectedEffect === 'color_pop') return 'effect-color-pop';
    return '';
  };

  // Motion variants for subtle fade-in and slide transition between segments
  const transitionVariants = {
    slide_fade: {
      initial: (dir: 'left' | 'right') => ({
        opacity: 0.1,
        x: dir === 'right' ? 30 : -30,
        scale: 0.98,
      }),
      animate: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: {
          x: { type: 'spring', stiffness: 300, damping: 30 },
          opacity: { duration: 0.35, ease: 'easeOut' },
          scale: { duration: 0.4, ease: 'easeOut' },
        },
      },
      exit: (dir: 'left' | 'right') => ({
        opacity: 0.1,
        x: dir === 'right' ? -30 : 30,
        scale: 0.98,
        transition: { duration: 0.25, ease: 'easeIn' },
      }),
    },
    cross_dissolve: {
      initial: { opacity: 0.05, filter: 'blur(4px)' },
      animate: { 
        opacity: 1, 
        filter: 'blur(0px)',
        transition: { duration: 0.45, ease: 'easeInOut' } 
      },
      exit: { 
        opacity: 0.05, 
        filter: 'blur(4px)',
        transition: { duration: 0.3, ease: 'easeInOut' } 
      },
    },
    zoom_fade: {
      initial: { opacity: 0.1, scale: 1.06 },
      animate: { 
        opacity: 1, 
        scale: 1,
        transition: { duration: 0.4, ease: 'easeOut' } 
      },
      exit: { 
        opacity: 0.1, 
        scale: 0.95,
        transition: { duration: 0.25, ease: 'easeIn' } 
      },
    },
  };

  const currentVariant = transitionVariants[selectedTransition] || transitionVariants.slide_fade;

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-black select-none overflow-hidden">
      
      {/* Top Bar with 8s Progress Indicator */}
      <div className="w-full shrink-0 px-4 py-2 bg-gradient-to-b from-black/90 to-transparent z-20 space-y-1.5">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-xs font-semibold text-neutral-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kamera</span>
          </button>

          {/* Indikator Durasi 8 Detik & Preview Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                haptics.triggerMedium();
                setIsPlayingPreview(!isPlayingPreview);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition ${
                isPlayingPreview 
                  ? 'bg-emerald-500 text-neutral-950 border-emerald-400 shadow-md shadow-emerald-500/20' 
                  : 'bg-black/70 text-white border-white/20 hover:bg-black/90'
              }`}
              title="Putar Pratinjau Transisi Multi-Klip"
            >
              {isPlayingPreview ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-white" />}
              <span>{isPlayingPreview ? 'Pause' : 'Play Transisi'}</span>
            </button>

            <div className="flex items-center gap-1.5 px-3 py-1 bg-black/70 backdrop-blur-md rounded-full border border-white/15">
              <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : 'bg-amber-400'}`} />
              <span className="font-mono text-xs font-bold text-white">
                {recordSeconds > 0 ? recordSeconds.toFixed(1) : '8.0'}s
              </span>
            </div>
          </div>

          {/* Tombol Next -> Share Blast */}
          <button
            onClick={handleNext}
            className="flex items-center gap-1 px-3 py-1 bg-amber-400 text-neutral-950 rounded-xl text-xs font-extrabold shadow-md hover:bg-amber-300 transition"
          >
            <span>Next</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Multi-Segment Timeline Bar with Subtle Transition Connectors */}
        <div className="w-full space-y-1">
          <div className="w-full h-2 bg-neutral-900 rounded-full flex gap-1 overflow-hidden p-0.5 border border-neutral-800">
            {segments.map((seg, sIdx) => {
              const isActive = activeSegmentIndex === sIdx;
              return (
                <div 
                  key={seg.id}
                  onClick={() => {
                    haptics.triggerSelection();
                    setActiveSegmentIndex(sIdx);
                    setSelectedVideoSceneIdx(seg.sceneIndex);
                  }}
                  className={`relative flex-1 h-full rounded-full cursor-pointer transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 shadow-sm shadow-amber-400/50 ring-1 ring-white/60' 
                      : 'bg-neutral-800 hover:bg-neutral-700'
                  }`}
                />
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[9px] text-neutral-400 font-medium px-1">
            <span className="flex items-center gap-1">
              <Film className="w-2.5 h-2.5 text-amber-400" />
              <span>3 Segmen Klip (8.0s)</span>
            </span>
            <span className="text-amber-300 font-mono">
              Transisi: {selectedTransition === 'slide_fade' ? 'Slide & Fade' : selectedTransition === 'cross_dissolve' ? 'Cross Dissolve' : 'Zoom & Fade'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Video Viewfinder with Smooth Transition Animations */}
      <div className="relative flex-1 min-h-0 mx-2 my-1 rounded-3xl overflow-hidden bg-neutral-950 border border-neutral-800 shadow-inner flex items-center justify-center">
        
        {/* Animated Video Scene Container */}
        <AnimatePresence mode="wait" custom={slideDirection}>
          <motion.div
            key={selectedVideoSceneIdx}
            custom={slideDirection}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={currentVariant as any}
            className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden"
          >
            <img
              src={currentScene.url}
              alt="Video Scene"
              className={`w-full h-full object-cover select-none pointer-events-none ${getEffectCss()}`}
              crossOrigin="anonymous"
            />
          </motion.div>
        </AnimatePresence>

        {/* Video Scene Switcher Badges */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-md rounded-2xl p-1 border border-white/10 z-20">
          {SAMPLE_PRESET_SCENES.slice(0, 4).map((scene, idx) => (
            <button
              key={scene.id}
              onClick={() => handleSelectScene(idx)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition ${
                selectedVideoSceneIdx === idx ? 'bg-amber-400 text-neutral-950 font-bold shadow' : 'text-neutral-300 hover:text-white'
              }`}
            >
              {scene.category}
            </button>
          ))}
        </div>

        {/* Active Transition Badge indicator */}
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 text-[9px] text-neutral-300 z-20">
          <MoveRight className="w-2.5 h-2.5 text-amber-400" />
          <span className="font-medium capitalize">{selectedTransition.replace('_', ' ')}</span>
        </div>

        {/* Dynamic Auto-Caption Floating on Video */}
        <div className="absolute bottom-3 inset-x-3 bg-neutral-950/85 backdrop-blur-md border border-white/15 rounded-2xl p-2.5 shadow-xl z-20">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-400">
              <Sparkles className="w-3 h-3" />
              <span>Video Auto-Caption</span>
            </div>
            <button
              onClick={() => {
                haptics.triggerLight();
                const next = quickClipCaptions[(quickClipCaptions.indexOf(caption) + 1) % quickClipCaptions.length];
                setCaption(next);
              }}
              className="text-[9px] text-neutral-400 hover:text-white flex items-center gap-1 bg-neutral-800 px-1.5 py-0.5 rounded"
            >
              <RefreshCw className="w-2.5 h-2.5" />
              <span>Ganti</span>
            </button>
          </div>
          <p className="text-xs text-white font-medium truncate">
            "{caption}"
          </p>
        </div>
      </div>

      {/* Transition Style Selector & Effect Bar */}
      <div className="w-full shrink-0 px-3 py-1 space-y-1.5 z-20">
        
        {/* Transition Style Selector (Slide & Fade / Cross Dissolve / Zoom Fade) */}
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
            <Layers className="w-3 h-3 text-amber-400" />
            <span>Transisi Klip</span>
          </span>

          <div className="flex items-center gap-1 bg-neutral-900/90 p-0.5 rounded-xl border border-neutral-800">
            {(
              [
                { id: 'slide_fade', label: 'Slide & Fade' },
                { id: 'cross_dissolve', label: 'Cross Dissolve' },
                { id: 'zoom_fade', label: 'Zoom Fade' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  haptics.triggerLight();
                  setSelectedTransition(t.id);
                }}
                className={`px-2 py-0.5 text-[10px] font-bold rounded-lg transition ${
                  selectedTransition === t.id
                    ? 'bg-amber-400 text-neutral-950 shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pilihan Efek Ringan Video */}
        <div className="flex items-center justify-center gap-2">
          {QUICKCLIP_EFFECTS.map((effect) => {
            const Icon = getEffectIcon(effect.iconName);
            const isSelected = selectedEffect === effect.id;

            return (
              <button
                key={effect.id}
                onClick={() => {
                  haptics.triggerSelection();
                  setSelectedEffect(effect.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  isSelected
                    ? 'bg-amber-400 text-neutral-950 font-bold shadow-md shadow-amber-400/20'
                    : 'bg-neutral-900 text-neutral-300 border border-neutral-800 hover:bg-neutral-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{effect.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Large Record & Playback Control Bar */}
      <div className="w-full shrink-0 px-6 py-2 flex items-center justify-around z-20 bg-gradient-to-t from-black via-black/80 to-transparent">
        
        {/* Reset / Clear */}
        <button
          onClick={() => {
            haptics.triggerLight();
            setRecordSeconds(0.0);
            setIsPlayingPreview(false);
          }}
          className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white text-xs font-semibold"
          title="Reset Durasi"
        >
          0s
        </button>

        {/* Big Shutter Record Button */}
        <div className="relative flex items-center justify-center">
          {isRecording && (
            <div className="absolute w-22 h-22 rounded-full border-2 border-red-500 animate-ping opacity-75 pointer-events-none" />
          )}

          <button
            onMouseDown={handleStartRecording}
            onMouseUp={handleStopRecording}
            onTouchStart={handleStartRecording}
            onTouchEnd={handleStopRecording}
            onClick={() => {
              if (isRecording) {
                handleStopRecording();
              } else {
                handleStartRecording();
              }
            }}
            className={`w-18 h-18 rounded-full border-4 p-1 flex items-center justify-center transition-all ${
              isRecording 
                ? 'border-red-500 scale-110 shadow-lg shadow-red-500/40' 
                : 'border-amber-400 hover:border-amber-300'
            }`}
            title="Tekan & Tahan untuk Rekam Video 8s"
          >
            <div 
              className={`w-full h-full transition-all duration-200 flex items-center justify-center ${
                isRecording 
                  ? 'rounded-xl bg-red-600' 
                  : 'rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-neutral-950'
              }`}
            >
              <Video className="w-7 h-7" />
            </div>
          </button>
        </div>

        {/* Next Direct to Share Blast */}
        <button
          onClick={handleNext}
          className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-2xl flex flex-col items-center justify-center text-amber-400 active:scale-95 transition"
          title="Lanjut ke Share Blast"
        >
          <ArrowRight className="w-4 h-4" />
          <span className="text-[10px] font-bold mt-0.5">Blast</span>
        </button>
      </div>

      {/* Banner AdMob di Bawah */}
      <AdMobBanner 
        config={admobConfig} 
        platform={platformStyle === 'cupertino' ? 'ios' : 'android'} 
      />
    </div>
  );
};
