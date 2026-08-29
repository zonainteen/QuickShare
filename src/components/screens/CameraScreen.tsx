import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  SwitchCamera, 
  Zap, 
  ZapOff, 
  Grid, 
  Video, 
  Sparkles, 
  Image as ImageIcon, 
  Send, 
  Coffee, 
  Film, 
  Sun, 
  Moon,
  MoonStar,
  Utensils, 
  Smile, 
  UploadCloud,
  Check,
  X,
  Clock,
  Images,
  ShieldCheck,
  FolderHeart,
  Lock,
  ChevronDown,
  SlidersHorizontal,
  Wand2,
  Layers,
  LayoutGrid,
  Columns,
  SquareDashedBottom,
  Plus,
  HelpCircle
} from 'lucide-react';
import { 
  FilterId, 
  FilterItem, 
  CapturedMedia, 
  AdMobConfig, 
  PlatformStyle,
  BeautyFilterConfig,
  BeautyFilterStyle,
  CollageLayout,
  ShutterTimer,
  NightModeState
} from '../../types';
import { FILTERS, SAMPLE_PRESET_SCENES } from '../../data/presets';
import { AdMobBanner } from '../AdMobBanner';
import { 
  getSavedPhotosFromLibrary, 
  savePhotoToLibrary, 
  getGalleryPermissionState,
  setGalleryPermissionState,
  GalleryPhotoItem,
  GalleryPermissionState
} from '../../utils/galleryStorage';
import { useHaptics } from '../../utils/haptics';
import { BeautyFaceOverlay } from '../BeautyFaceOverlay';
import { generateCollageComposite } from '../../utils/collageBuilder';
import { CollageView } from '../CollageView';
import { QuickStartTutorial, TUTORIAL_STORAGE_KEY } from '../QuickStartTutorial';
import { DraftsDrawer } from '../DraftsDrawer';
import { getSavedDrafts } from '../../utils/draftsStorage';

interface CameraScreenProps {
  platformStyle: PlatformStyle;
  admobConfig: AdMobConfig;
  onCapture: (media: CapturedMedia) => void;
  onDirectAutoStatus: (media: CapturedMedia) => void;
  onGoToQuickClip: () => void;
  onLoadDraft?: (media: CapturedMedia) => void;
}

export const CameraScreen: React.FC<CameraScreenProps> = ({
  platformStyle,
  admobConfig,
  onCapture,
  onDirectAutoStatus,
  onGoToQuickClip,
  onLoadDraft,
}) => {
  const haptics = useHaptics();

  // Primary Camera States
  const [selectedFilterId, setSelectedFilterId] = useState<FilterId>('coffee_glow');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [useLiveCamera, setUseLiveCamera] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('environment');
  const [flashMode, setFlashMode] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // 1. Auto-Night Mode & Bright Screen Flash States
  const [nightModeState, setNightModeState] = useState<NightModeState>('auto');
  const [detectedLux, setDetectedLux] = useState<number>(14); // Simulated ambient light level in lux
  const [isBrightScreenFlashActive, setIsBrightScreenFlashActive] = useState(false);

  // Quick Start Coach Mark Tutorial State
  const [showTutorial, setShowTutorial] = useState(false);

  // Drafts drawer state & count
  const [showDraftsDrawer, setShowDraftsDrawer] = useState(false);
  const [draftsCount, setDraftsCount] = useState(0);

  // 2. Beauty / AR Face Filter States
  const [showBeautyPanel, setShowBeautyPanel] = useState(false);
  const [beautyConfig, setBeautyConfig] = useState<BeautyFilterConfig>({
    enabled: true,
    style: 'natural',
    smoothing: 60,
    blush: 40,
    lipGloss: 45,
    sparkles: true,
  });

  // 3. Hands-Free Countdown Shutter Timer States
  const [shutterTimer, setShutterTimer] = useState<ShutterTimer>(0); // 0 (Off), 3s, 10s
  const [countdownRemaining, setCountdownRemaining] = useState<number | null>(null);
  const countdownIntervalRef = useRef<any>(null);
  const pendingAutoStatusRef = useRef<boolean>(false);

  // 4. Device Library & Multi-Photo Collage Selection States
  const [recentPhotos, setRecentPhotos] = useState<GalleryPhotoItem[]>([]);
  const [showGalleryDrawer, setShowGalleryDrawer] = useState(false);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedPhotoUrls, setSelectedPhotoUrls] = useState<string[]>([]);
  const [selectedCollageLayout, setSelectedCollageLayout] = useState<CollageLayout>('grid2x2');
  const [isGeneratingCollage, setIsGeneratingCollage] = useState(false);
  const [permissionState, setPermissionState] = useState<GalleryPermissionState>('prompt');
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const filterDropdownRef = useRef<HTMLDivElement | null>(null);
  const quickMenuRef = useRef<HTMLDivElement | null>(null);

  const currentPreset = SAMPLE_PRESET_SCENES[selectedPresetIndex];
  const activeFilter = FILTERS.find((f) => f.id === selectedFilterId) || FILTERS[0];

  // Ambient light evaluation: Auto triggers when lux < 25 or when forced 'on'
  const isNightModeActive = nightModeState === 'on' || (nightModeState === 'auto' && detectedLux < 25);

  // Close dropdowns and menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setIsFilterDropdownOpen(false);
      }
      if (quickMenuRef.current && !quickMenuRef.current.contains(event.target as Node)) {
        setIsQuickMenuOpen(false);
      }
    };
    if (isFilterDropdownOpen || isQuickMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterDropdownOpen, isQuickMenuOpen]);

  // Ambient light fluctuation simulation (simulating camera exposure sensor)
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate subtle ambient light shifts
      setDetectedLux((prev) => {
        const drift = (Math.random() - 0.5) * 4;
        return Math.max(5, Math.min(85, Math.round(prev + drift)));
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Load photos and permission state on mount
  useEffect(() => {
    const currentPerm = getGalleryPermissionState();
    setPermissionState(currentPerm);

    const loaded = getSavedPhotosFromLibrary();
    if (loaded.length === 0) {
      // Seed with initial high-res preset samples as device library items
      SAMPLE_PRESET_SCENES.forEach((scene) => {
        savePhotoToLibrary({
          url: scene.url,
          category: scene.category,
          caption: scene.title,
        });
      });
      setRecentPhotos(getSavedPhotosFromLibrary());
    } else {
      setRecentPhotos(loaded);
    }

    // First launch detection for Quick Start coach mark tutorial
    try {
      setDraftsCount(getSavedDrafts().length);
      const tutorialSeen = localStorage.getItem(TUTORIAL_STORAGE_KEY);
      if (!tutorialSeen) {
        const timer = setTimeout(() => {
          setShowTutorial(true);
        }, 400);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.warn('LocalStorage error reading tutorial key', e);
    }
  }, []);

  // Most recent photo for thumbnail preview in gallery button
  const latestPhoto = recentPhotos.length > 0 ? recentPhotos[0] : null;

  // Handle clicking the gallery button
  const handleOpenGalleryClick = () => {
    haptics.triggerLight();
    if (permissionState === 'granted') {
      setShowGalleryDrawer(true);
    } else {
      setShowPermissionPrompt(true);
    }
  };

  // Grant persistent photo library access
  const handleGrantPermission = () => {
    haptics.triggerSuccess();
    setGalleryPermissionState('granted');
    setPermissionState('granted');
    setShowPermissionPrompt(false);
    setShowGalleryDrawer(true);
  };

  // Deny photo library access
  const handleDenyPermission = () => {
    haptics.triggerLight();
    setGalleryPermissionState('denied');
    setPermissionState('denied');
    setShowPermissionPrompt(false);
  };

  // Start / Stop live webcam stream
  useEffect(() => {
    let stream: MediaStream | null = null;

    if (useLiveCamera) {
      navigator.mediaDevices?.getUserMedia({
        video: { facingMode: cameraFacing },
        audio: false,
      })
      .then((s) => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
        setCameraError(null);
      })
      .catch((err) => {
        console.warn('Camera access not granted or unavailable:', err);
        setCameraError('Kamera tidak dapat diakses di browser ini. Menggunakan sampel HD.');
        setUseLiveCamera(false);
      });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [useLiveCamera, cameraFacing]);

  // Execute the actual snapshot photo capture after countdown / timer
  const executeFinalCapture = (directAutoStatus = false) => {
    haptics.triggerShutter();
    setIsCapturing(true);

    // If night mode or flash is active, trigger Bright Screen Flash soft illumination
    if (isNightModeActive || flashMode) {
      setIsBrightScreenFlashActive(true);
    }

    setTimeout(() => {
      setIsCapturing(false);
      setIsBrightScreenFlashActive(false);

      const capturedData: CapturedMedia = {
        type: 'photo',
        url: currentPreset.url,
        filterId: selectedFilterId,
        caption: activeFilter.defaultCaption,
        timestamp: new Date(),
        category: currentPreset.category,
        nightModeApplied: isNightModeActive,
        beautyFilterApplied: beautyConfig.enabled,
      };

      // Automatically store captured photo into device library and update preview thumbnail
      const updatedLibrary = savePhotoToLibrary({
        url: currentPreset.url,
        category: currentPreset.category,
        caption: activeFilter.defaultCaption,
      });
      setRecentPhotos(updatedLibrary);

      if (directAutoStatus) {
        onDirectAutoStatus(capturedData);
      } else {
        onCapture(capturedData);
      }
    }, 280);
  };

  // Trigger capture or start timer countdown if timer > 0
  const handleCapturePhoto = (directAutoStatus = false) => {
    if (shutterTimer > 0) {
      haptics.triggerLight();
      pendingAutoStatusRef.current = directAutoStatus;
      setCountdownRemaining(shutterTimer);

      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }

      let currentSec = shutterTimer;
      countdownIntervalRef.current = setInterval(() => {
        currentSec -= 1;
        if (currentSec > 0) {
          setCountdownRemaining(currentSec);
          haptics.triggerLight();
          // If in night mode, warm up bright screen flash on last second
          if (currentSec === 1 && (isNightModeActive || flashMode)) {
            setIsBrightScreenFlashActive(true);
          }
        } else {
          clearInterval(countdownIntervalRef.current);
          setCountdownRemaining(null);
          executeFinalCapture(pendingAutoStatusRef.current);
        }
      }, 1000);
    } else {
      executeFinalCapture(directAutoStatus);
    }
  };

  const handleCancelCountdown = () => {
    haptics.triggerMedium();
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    setCountdownRemaining(null);
    setIsBrightScreenFlashActive(false);
  };

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      haptics.triggerMedium();
      const url = URL.createObjectURL(file);
      
      // Save uploaded photo to library
      const updatedLibrary = savePhotoToLibrary({
        url: url,
        category: 'Custom Upload',
        caption: activeFilter.defaultCaption,
      });
      setRecentPhotos(updatedLibrary);

      onCapture({
        type: 'photo',
        url: url,
        filterId: selectedFilterId,
        caption: activeFilter.defaultCaption,
        timestamp: new Date(),
        category: 'Custom Upload',
        nightModeApplied: isNightModeActive,
        beautyFilterApplied: beautyConfig.enabled,
      });
    }
  };

  const handleSelectFromLibrary = (photo: GalleryPhotoItem) => {
    haptics.triggerMedium();
    setShowGalleryDrawer(false);
    onCapture({
      type: 'photo',
      url: photo.url,
      filterId: selectedFilterId,
      caption: photo.caption || activeFilter.defaultCaption,
      timestamp: new Date(photo.timestamp || Date.now()),
      category: photo.category || 'Galeri',
      nightModeApplied: false,
    });
  };

  // Multi-photo selection toggle in gallery
  const togglePhotoSelection = (url: string) => {
    haptics.triggerSelection();
    setSelectedPhotoUrls((prev) => {
      if (prev.includes(url)) {
        return prev.filter((u) => u !== url);
      }
      if (prev.length >= 4) {
        return prev; // Max 4 photos for collage
      }
      return [...prev, url];
    });
  };

  // Create multi-photo collage from selected items
  const handleCreateCollage = async (directStatus = false) => {
    if (selectedPhotoUrls.length < 2) return;
    haptics.triggerSuccess();
    setIsGeneratingCollage(true);

    try {
      const compositeUrl = await generateCollageComposite(selectedPhotoUrls, selectedCollageLayout);
      setIsGeneratingCollage(false);
      setShowGalleryDrawer(false);

      const collageMedia: CapturedMedia = {
        type: 'photo',
        url: compositeUrl,
        filterId: selectedFilterId,
        caption: `Kolase ${selectedPhotoUrls.length} Momen Spesial ✨`,
        timestamp: new Date(),
        category: 'Kolase Multi-Foto',
        isCollage: true,
        collagePhotos: selectedPhotoUrls,
        collageLayout: selectedCollageLayout,
      };

      // Save composite to library
      savePhotoToLibrary({
        url: compositeUrl,
        category: 'Kolase',
        caption: collageMedia.caption,
      });

      if (directStatus) {
        onDirectAutoStatus(collageMedia);
      } else {
        onCapture(collageMedia);
      }
    } catch (err) {
      console.error('Failed to build collage composite:', err);
      setIsGeneratingCollage(false);
    }
  };

  // Toggle Shutter Timer: 0s -> 3s -> 10s
  const handleCycleTimer = () => {
    haptics.triggerSelection();
    setShutterTimer((prev) => {
      if (prev === 0) return 3;
      if (prev === 3) return 10;
      return 0;
    });
  };

  // Toggle Auto-Night Mode: Auto -> On -> Off
  const handleCycleNightMode = () => {
    haptics.triggerSelection();
    setNightModeState((prev) => {
      if (prev === 'auto') return 'on';
      if (prev === 'on') return 'off';
      return 'auto';
    });
  };

  const getFilterIcon = (iconName: string) => {
    switch (iconName) {
      case 'Coffee': return Coffee;
      case 'Sparkles': return Sparkles;
      case 'Smile': return Smile;
      case 'Utensils': return Utensils;
      case 'Film': return Film;
      case 'Sun': return Sun;
      default: return Sparkles;
    }
  };

  const beautyStyles: { id: BeautyFilterStyle; label: string; desc: string; icon: string }[] = [
    { id: 'natural', label: 'Natural Soft', desc: 'Halus natural + glow sejuk', icon: '🌿' },
    { id: 'rosy', label: 'Rosy Blush', desc: 'Pipi merona + bibir segar', icon: '🌸' },
    { id: 'glam', label: 'Glam Sparkle', desc: 'Riasan cerah + kilau berlian', icon: '✨' },
    { id: 'golden', label: 'Golden Hour', desc: 'Kehangatan sinar matahari', icon: '🌅' },
  ];

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-black overflow-hidden select-none">
      
      {/* Hidden File Input for Custom Media */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleCustomUpload} 
        accept="image/*" 
        className="hidden" 
      />

      {/* 1. BRIGHT SCREEN FLASH SOFT LIGHT ILLUMINATION (Auto-Night Mode & Flash) */}
      {isBrightScreenFlashActive && (
        <div className="absolute inset-0 bg-[#FFFDF0] z-45 flex flex-col items-center justify-center pointer-events-none animate-in fade-in duration-200">
          <div className="w-48 h-48 rounded-full bg-amber-200/40 blur-3xl" />
          <p className="text-amber-900/60 font-bold text-xs tracking-widest uppercase mt-4">
            Bright Screen Flash Active
          </p>
        </div>
      )}

      {/* Shutter White Flash Snapshot Overlay */}
      {isCapturing && (
        <div className="absolute inset-0 bg-white z-50 animate-out fade-out duration-300 pointer-events-none" />
      )}

      {/* 4. HANDS-FREE COUNTDOWN TIMER OVERLAY */}
      {countdownRemaining !== null && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-md z-45 flex flex-col items-center justify-center p-6 animate-in fade-in duration-150">
          {/* Animated Circular Countdown Ring */}
          <div className="relative flex items-center justify-center">
            <div className="w-36 h-36 rounded-full border-4 border-amber-400/30 flex items-center justify-center animate-pulse">
              <div className="w-32 h-32 rounded-full border-4 border-amber-400 border-t-transparent animate-spin flex items-center justify-center" />
            </div>

            <div className="absolute text-6xl font-black text-amber-400 drop-shadow-2xl scale-125 transition-transform duration-300">
              {countdownRemaining}
            </div>
          </div>

          <div className="mt-8 text-center space-y-1">
            <h4 className="text-sm font-bold text-white tracking-wide">
              {pendingAutoStatusRef.current ? 'Auto Status Siap Meluncur...' : 'Tersenyum untuk Kamera! ✨'}
            </h4>
            <p className="text-xs text-neutral-400">
              {isNightModeActive ? '🌙 Mode Malam Aktif • Layar Menerangi Objek' : 'Hands-Free Shutter Countdown'}
            </p>
          </div>

          <button
            onClick={handleCancelCountdown}
            className="mt-8 px-5 py-2 rounded-full bg-neutral-800/90 text-neutral-300 hover:text-white border border-neutral-700 text-xs font-bold transition flex items-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" />
            <span>Batalkan Timer</span>
          </button>
        </div>
      )}

      {/* Top Camera Controls Bar - Clean, Minimal & Responsive */}
      <div className="w-full shrink-0 px-3.5 py-2 flex items-center justify-between z-20 bg-gradient-to-b from-black/90 via-black/50 to-transparent">
        
        {/* Left: Flash & Live Ambient Indicator */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              haptics.triggerMedium();
              setFlashMode(!flashMode);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition active:scale-95 shadow-md ${
              flashMode ? 'bg-amber-400 text-neutral-950 shadow-amber-400/20' : 'bg-black/50 text-white/90 border border-white/15 hover:bg-black/70'
            }`}
            title="Flashlight / Screen Flash"
          >
            {flashMode ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
          </button>

          {isNightModeActive && (
            <button 
              onClick={handleCycleNightMode}
              className="px-2.5 py-1 rounded-full bg-indigo-950/80 border border-indigo-400/50 text-amber-300 text-[10px] font-bold flex items-center gap-1 hover:bg-indigo-900/80 transition"
              title={`Night Boost Aktif (${detectedLux} lux). Ketuk untuk siklus: AUTO / ON / OFF`}
            >
              <MoonStar className="w-3 h-3 text-amber-400 animate-pulse" />
              <span className="hidden xs:inline">Night</span>
            </button>
          )}
        </div>

        {/* Center: Interactive Filter Dropdown Selector Menu */}
        <div className="relative" ref={filterDropdownRef}>
          <button
            onClick={() => {
              haptics.triggerLight();
              setIsFilterDropdownOpen(!isFilterDropdownOpen);
              setIsQuickMenuOpen(false);
            }}
            className={`px-3 py-1.5 backdrop-blur-md rounded-full flex items-center gap-1.5 shadow-md border transition-all active:scale-95 ${
              isFilterDropdownOpen 
                ? 'bg-amber-400 text-neutral-950 border-amber-300 shadow-amber-400/20' 
                : 'bg-black/60 text-white border-white/20 hover:bg-black/80'
            }`}
            title="Pilih Filter Foto"
          >
            <span 
              className="w-2 h-2 rounded-full ring-1 ring-white/30 shrink-0" 
              style={{ backgroundColor: activeFilter.accentColor }}
            />
            <span className="text-xs font-bold tracking-wide max-w-[85px] truncate">
              {activeFilter.name}
            </span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isFilterDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Floating Dropdown Popover */}
          {isFilterDropdownOpen && (
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-52 bg-neutral-900/95 backdrop-blur-xl border border-neutral-700/80 rounded-2xl p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2 py-1 mb-1 border-b border-neutral-800 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-neutral-400">Pilih Filter Foto</span>
                <SlidersHorizontal className="w-3 h-3 text-amber-400" />
              </div>

              <div className="flex flex-col gap-0.5 max-h-60 overflow-y-auto no-scrollbar">
                {FILTERS.map((filter) => {
                  const Icon = getFilterIcon(filter.iconName);
                  const isSelected = filter.id === selectedFilterId;

                  return (
                    <button
                      key={filter.id}
                      onClick={() => {
                        haptics.triggerSelection();
                        setSelectedFilterId(filter.id);
                        const matchedSceneIdx = SAMPLE_PRESET_SCENES.findIndex((s) => s.filterId === filter.id);
                        if (matchedSceneIdx !== -1) {
                          setSelectedPresetIndex(matchedSceneIdx);
                        }
                        setIsFilterDropdownOpen(false);
                      }}
                      className={`w-full px-2.5 py-2 rounded-xl flex items-center justify-between text-left transition-all ${
                        isSelected
                          ? 'bg-amber-400 text-neutral-950 font-bold shadow-sm'
                          : 'text-neutral-200 hover:bg-neutral-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div 
                          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-neutral-950/20 text-neutral-950' : 'bg-neutral-800 text-amber-300'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-semibold truncate leading-tight">{filter.name}</p>
                          <p className={`text-[9px] truncate ${isSelected ? 'text-neutral-800' : 'text-neutral-400'}`}>
                            {filter.description}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <Check className="w-4 h-4 text-neutral-950 shrink-0 stroke-[3]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Quick Menu Toggle Button */}
        <div className="relative" ref={quickMenuRef}>
          <button
            onClick={() => {
              haptics.triggerLight();
              setIsQuickMenuOpen(!isQuickMenuOpen);
              setIsFilterDropdownOpen(false);
            }}
            className={`relative p-2 rounded-full backdrop-blur-md border transition active:scale-95 shadow-md ${
              isQuickMenuOpen || shutterTimer > 0 || draftsCount > 0
                ? 'bg-amber-400 text-neutral-950 border-amber-300 shadow-amber-400/20'
                : 'bg-black/50 text-white/90 border-white/15 hover:bg-black/70'
            }`}
            title="Pengaturan Cepat Kamera (Timer, Drafts, Night, Beauty, dll)"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {draftsCount > 0 && !isQuickMenuOpen && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center border border-black shadow">
                {draftsCount > 9 ? '9+' : draftsCount}
              </span>
            )}
          </button>

          {/* Quick Settings Floating Popover / Drawer */}
          {isQuickMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-neutral-900/95 backdrop-blur-2xl border border-neutral-700/80 rounded-2xl p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                  <span>Pengaturan Kamera</span>
                </span>
                <button
                  onClick={() => setIsQuickMenuOpen(false)}
                  className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 1. Timer Shutter */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-300 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>Timer Shutter</span>
                  </span>
                  <span className="text-amber-400 font-bold text-[10px]">
                    {shutterTimer === 0 ? 'Mati' : `${shutterTimer} detik`}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {([0, 3, 10] as ShutterTimer[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        haptics.triggerSelection();
                        setShutterTimer(t);
                      }}
                      className={`py-1 rounded-lg text-[10px] font-bold transition ${
                        shutterTimer === t 
                          ? 'bg-amber-400 text-neutral-950 shadow-sm' 
                          : 'bg-neutral-800/80 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      {t === 0 ? 'OFF' : `${t}s`}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Night Mode */}
              <div className="space-y-1 pt-1 border-t border-neutral-800/60">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-300 font-medium flex items-center gap-1">
                    <MoonStar className="w-3 h-3 text-indigo-400" />
                    <span>Mode Malam</span>
                  </span>
                  <span className="text-indigo-300 font-bold text-[10px] uppercase">
                    {nightModeState} ({detectedLux} lux)
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {(['off', 'auto', 'on'] as NightModeState[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        haptics.triggerSelection();
                        setNightModeState(m);
                      }}
                      className={`py-1 rounded-lg text-[10px] font-bold uppercase transition ${
                        nightModeState === m 
                          ? 'bg-indigo-600 text-white shadow-sm' 
                          : 'bg-neutral-800/80 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Beauty Retouch & Drafts Action Row */}
              <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-neutral-800/60">
                <button
                  onClick={() => {
                    haptics.triggerLight();
                    setShowBeautyPanel(!showBeautyPanel);
                    setIsQuickMenuOpen(false);
                  }}
                  className={`p-2 rounded-xl border text-left flex items-center gap-2 transition ${
                    beautyConfig.enabled
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-neutral-800/80 text-neutral-400 border-neutral-700'
                  }`}
                >
                  <Wand2 className="w-4 h-4 text-rose-400 shrink-0" />
                  <div className="truncate">
                    <p className="text-[10px] font-bold text-white leading-tight">Beauty Filter</p>
                    <p className="text-[9px] text-rose-300">{beautyConfig.enabled ? 'Aktif' : 'Mati'}</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    haptics.triggerLight();
                    setDraftsCount(getSavedDrafts().length);
                    setShowDraftsDrawer(true);
                    setIsQuickMenuOpen(false);
                  }}
                  className="p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700 text-left flex items-center gap-2 transition"
                >
                  <FolderHeart className="w-4 h-4 text-rose-400 shrink-0" />
                  <div className="truncate">
                    <p className="text-[10px] font-bold text-white leading-tight">Drafts</p>
                    <p className="text-[9px] text-amber-300">{draftsCount} tersimpan</p>
                  </div>
                </button>
              </div>

              {/* 4. Tutorial Coach Mark trigger */}
              <div className="pt-1 border-t border-neutral-800/60">
                <button
                  onClick={() => {
                    haptics.triggerLight();
                    setShowTutorial(true);
                    setIsQuickMenuOpen(false);
                  }}
                  className="w-full py-1.5 px-2.5 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 text-amber-300 hover:text-amber-200 text-[10px] font-bold flex items-center justify-between transition"
                >
                  <span className="flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Panduan Fitur (Coach Marks)</span>
                  </span>
                  <span className="text-[9px] text-neutral-400">Buka →</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Camera Viewfinder */}
      <div className="relative flex-1 min-h-0 mx-2 my-1 rounded-3xl overflow-hidden bg-neutral-950 border border-neutral-800 shadow-inner flex items-center justify-center">
        
        {/* Media Background (Preset Image or Live Webcam) with Night Mode boosted exposure */}
        {useLiveCamera ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transition-all duration-300 ${activeFilter.cssClass} ${
              isNightModeActive ? 'brightness-125 contrast-105 saturate-110' : ''
            }`}
          />
        ) : (
          <img
            src={currentPreset.url}
            alt={currentPreset.title}
            className={`w-full h-full object-cover transition-all duration-300 ${activeFilter.cssClass} ${
              isNightModeActive ? 'brightness-125 contrast-105 saturate-110' : ''
            }`}
            crossOrigin="anonymous"
          />
        )}

        {/* 2. BEAUTY / AR FACE FILTER OVERLAY CANVAS LAYER */}
        <BeautyFaceOverlay
          config={beautyConfig}
          isActive={beautyConfig.enabled}
          videoElement={useLiveCamera ? videoRef.current : null}
          presetImageUrl={currentPreset.url}
        />

        {/* Grid Guides Overlay */}
        {showGrid && (
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none z-10">
            <div className="border-r border-b border-white/20"></div>
            <div className="border-r border-b border-white/20"></div>
            <div className="border-b border-white/20"></div>
            <div className="border-r border-b border-white/20"></div>
            <div className="border-r border-b border-white/20"></div>
            <div className="border-b border-white/20"></div>
            <div className="border-r border-b border-white/20"></div>
            <div className="border-r border-b border-white/20"></div>
            <div></div>
          </div>
        )}

        {/* Active Night Mode / Low Light Indicator Pill (Top Left of Viewfinder) */}
        {isNightModeActive && (
          <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-full bg-indigo-950/85 backdrop-blur-md border border-indigo-500/40 text-indigo-200 text-[10px] font-bold flex items-center gap-1.5 shadow-lg animate-in fade-in">
            <MoonStar className="w-3 h-3 text-amber-300 animate-pulse" />
            <span>Night Boost • {detectedLux} lux</span>
          </div>
        )}

        {/* Viewfinder Controls (Top Right): Grid & Flip Camera */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
          <button
            onClick={() => {
              haptics.triggerLight();
              setShowGrid(!showGrid);
            }}
            className={`p-2 rounded-full backdrop-blur-md border transition ${
              showGrid ? 'bg-amber-400 text-neutral-950 border-amber-300' : 'bg-black/60 text-white/90 border-white/20'
            }`}
            title="Grid Guide"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              haptics.triggerMedium();
              if (useLiveCamera) {
                setCameraFacing(cameraFacing === 'user' ? 'environment' : 'user');
              } else {
                setUseLiveCamera(true);
              }
            }}
            className={`p-2 rounded-full backdrop-blur-md border shadow-lg transition active:scale-95 ${
              useLiveCamera 
                ? 'bg-amber-400 text-neutral-950 border-amber-300 shadow-amber-400/20' 
                : 'bg-black/60 text-white border-white/20 hover:bg-black/80'
            }`}
            title={useLiveCamera ? 'Flip Kamera' : 'Gunakan Kamera HP / Webcam Asli'}
          >
            <SwitchCamera className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Interactive Beauty AR Adjustment Floater Panel */}
        {showBeautyPanel && (
          <div className="absolute bottom-3 inset-x-3 bg-neutral-950/90 backdrop-blur-xl border border-rose-500/30 rounded-2xl p-3 z-30 shadow-2xl animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800">
              <div className="flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-xs font-bold text-white">Beauty & AR Makeup</span>
                <span className="px-1.5 py-0.2 bg-rose-500/20 text-rose-300 text-[9px] font-bold rounded-full">
                  Canvas AI
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    haptics.triggerSelection();
                    setBeautyConfig((prev) => ({ ...prev, enabled: !prev.enabled }));
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                    beautyConfig.enabled ? 'bg-rose-500 text-white' : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {beautyConfig.enabled ? 'ON' : 'OFF'}
                </button>
                <button 
                  onClick={() => setShowBeautyPanel(false)}
                  className="text-neutral-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Beauty Style Presets */}
            <div className="grid grid-cols-4 gap-1 mb-2.5">
              {beautyStyles.map((st) => (
                <button
                  key={st.id}
                  onClick={() => {
                    haptics.triggerSelection();
                    setBeautyConfig((prev) => ({
                      ...prev,
                      enabled: true,
                      style: st.id,
                      smoothing: st.id === 'glam' ? 80 : 60,
                      blush: st.id === 'rosy' ? 65 : 40,
                      lipGloss: st.id === 'glam' ? 70 : 45,
                    }));
                  }}
                  className={`p-1.5 rounded-xl flex flex-col items-center justify-center text-center transition ${
                    beautyConfig.enabled && beautyConfig.style === st.id
                      ? 'bg-rose-500/30 border border-rose-400 text-white font-bold'
                      : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <span className="text-sm leading-none mb-1">{st.icon}</span>
                  <span className="text-[9px] truncate w-full">{st.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>

            {/* Sliders for Smoothing, Blush, Lip Gloss */}
            <div className="space-y-1.5 text-[10px]">
              <div className="flex items-center gap-2">
                <span className="w-16 text-neutral-300 font-medium">Smooth</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={beautyConfig.smoothing}
                  onChange={(e) => setBeautyConfig({ ...beautyConfig, smoothing: Number(e.target.value) })}
                  className="flex-1 accent-rose-500 h-1 bg-neutral-800 rounded-lg cursor-pointer"
                />
                <span className="w-6 text-right text-rose-300 font-bold">{beautyConfig.smoothing}%</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-16 text-neutral-300 font-medium">Blush</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={beautyConfig.blush}
                  onChange={(e) => setBeautyConfig({ ...beautyConfig, blush: Number(e.target.value) })}
                  className="flex-1 accent-rose-500 h-1 bg-neutral-800 rounded-lg cursor-pointer"
                />
                <span className="w-6 text-right text-rose-300 font-bold">{beautyConfig.blush}%</span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => setBeautyConfig({ ...beautyConfig, sparkles: !beautyConfig.sparkles })}
                  className={`px-2 py-0.5 rounded-lg border text-[9px] font-bold flex items-center gap-1 ${
                    beautyConfig.sparkles ? 'bg-amber-400/20 text-amber-300 border-amber-400/40' : 'bg-neutral-900 text-neutral-500 border-neutral-800'
                  }`}
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>AR Sparkles {beautyConfig.sparkles ? 'Active' : 'Off'}</span>
                </button>

                <span className="text-[9px] text-neutral-500">Live Canvas Mesh</span>
              </div>
            </div>
          </div>
        )}

        {/* Notification Toast if Camera Warning */}
        {cameraError && (
          <div className="absolute bottom-3 inset-x-4 bg-amber-950/90 text-amber-200 border border-amber-500/40 p-2 rounded-xl text-[11px] text-center backdrop-blur-md z-20">
            {cameraError}
          </div>
        )}
      </div>

      {/* Bottom Shutter & Quick Share Bar */}
      <div className="w-full shrink-0 px-6 py-2 flex items-center justify-between z-20 bg-gradient-to-t from-black via-black/80 to-transparent">
        
        {/* Gallery / Recent Captured Photos Button (Kiri Bawah) */}
        <button
          onClick={handleOpenGalleryClick}
          className="relative w-12 h-12 rounded-2xl bg-neutral-900 border-2 border-amber-400/80 flex flex-col items-center justify-center text-white/90 hover:border-amber-400 active:scale-95 transition overflow-hidden shadow-lg shadow-amber-400/10 group"
          title="Lihat Foto & Buat Kolase dari Galeri Perangkat"
        >
          {latestPhoto ? (
            <img 
              src={latestPhoto.url} 
              alt="Recent Photo" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
            />
          ) : (
            <img 
              src={currentPreset.url} 
              alt="Thumb" 
              className="absolute inset-0 w-full h-full object-cover opacity-60" 
            />
          )}

          {/* Subdued overlay with icon and counter */}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
          
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-1">
            <span className="self-end px-1 py-0.2 bg-amber-400 text-neutral-950 font-black text-[8px] rounded-full shadow-sm">
              {recentPhotos.length}
            </span>
            <ImageIcon className="w-4 h-4 text-white drop-shadow" />
          </div>
        </button>

        {/* Shutter Capture Button (Tengah Bawah) with Timer Badge */}
        <div className="relative">
          <button
            onClick={() => handleCapturePhoto(false)}
            className="w-18 h-18 rounded-full border-4 border-amber-400 p-1 flex items-center justify-center bg-transparent active:scale-90 transition-transform shadow-xl shadow-amber-400/20 relative"
            title={shutterTimer > 0 ? `Ambil Foto (${shutterTimer}s Timer)` : 'Ambil Foto (Shutter)'}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-neutral-950">
              <Camera className="w-7 h-7" />
            </div>

            {/* Timer Badge indicator */}
            {shutterTimer > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-neutral-900 border border-amber-400 text-amber-300 text-[9px] font-black rounded-full shadow">
                {shutterTimer}s
              </span>
            )}
          </button>
        </div>

        {/* Tombol "Auto Status" (Kanan Bawah) */}
        <button
          onClick={() => handleCapturePhoto(true)}
          className="px-3 py-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-400 hover:to-yellow-400 hover:text-neutral-950 border border-amber-400/60 rounded-2xl flex flex-col items-center justify-center text-amber-300 active:scale-95 transition shadow-lg group"
          title="Langsung Auto Status (Share Instan)"
        >
          <Zap className="w-4 h-4 mb-0.5 fill-current" />
          <span className="text-[10px] font-extrabold whitespace-nowrap">Auto Status</span>
        </button>
      </div>

      {/* 3. MULTI-PHOTO GALLERY & COLLAGE DRAWER */}
      {showGalleryDrawer && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-40 flex flex-col justify-end animate-in fade-in duration-200">
          <div className="w-full bg-neutral-900 border-t border-neutral-800 rounded-t-[32px] p-4 flex flex-col max-h-[82%] shadow-2xl overflow-hidden">
            
            {/* Drawer Header with Multi-Select Toggle */}
            <div className="flex items-center justify-between pb-2.5 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
                  <Images className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Galeri & Pembuat Kolase</h3>
                  <p className="text-[10px] text-neutral-400">
                    {isMultiSelectMode 
                      ? `${selectedPhotoUrls.length} foto dipilih (maks 4)` 
                      : `${recentPhotos.length} foto tersimpan di memori`}
                  </p>
                </div>
              </div>

              {/* Mode Toggle & Close */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    haptics.triggerSelection();
                    setIsMultiSelectMode(!isMultiSelectMode);
                    if (!isMultiSelectMode && selectedPhotoUrls.length === 0 && recentPhotos.length > 0) {
                      setSelectedPhotoUrls([recentPhotos[0].url]);
                    }
                  }}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-xl border flex items-center gap-1 transition ${
                    isMultiSelectMode
                      ? 'bg-amber-400 text-neutral-950 border-amber-300 shadow-sm'
                      : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-3 h-3" />
                  <span>{isMultiSelectMode ? 'Mode Kolase Aktif' : 'Pilih Banyak'}</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-300 rounded-xl border border-neutral-700 transition"
                  title="Upload Foto Baru"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setShowGalleryDrawer(false)}
                  className="p-1.5 bg-neutral-800 text-neutral-400 hover:text-white rounded-full transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Collage Layout Picker (Visible in Multi-Select Mode) */}
            {isMultiSelectMode && (
              <div className="py-2 border-b border-neutral-800/80 flex items-center justify-between">
                <span className="text-[10px] font-bold text-neutral-400 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-amber-400" />
                  <span>Tata Letak Kolase:</span>
                </span>

                <div className="flex items-center gap-1">
                  {[
                    { id: 'grid2x2' as CollageLayout, label: 'Grid 2x2', icon: LayoutGrid },
                    { id: 'splitVertical' as CollageLayout, label: 'Split 2', icon: Columns },
                    { id: 'tripleStory' as CollageLayout, label: 'Triple 3', icon: SquareDashedBottom },
                    { id: 'heroInset' as CollageLayout, label: 'Hero Inset', icon: Layers },
                  ].map((lay) => {
                    const Icon = lay.icon;
                    const isSelected = selectedCollageLayout === lay.id;
                    return (
                      <button
                        key={lay.id}
                        onClick={() => {
                          haptics.triggerSelection();
                          setSelectedCollageLayout(lay.id);
                        }}
                        className={`px-2 py-1 rounded-lg text-[9px] font-bold flex items-center gap-1 transition ${
                          isSelected
                            ? 'bg-amber-400 text-neutral-950 shadow-sm'
                            : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        <Icon className="w-2.5 h-2.5" />
                        <span>{lay.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Grid of Recent Library Photos with Checkbox Selectors */}
            <div className="grid grid-cols-3 gap-2 py-2.5 overflow-y-auto max-h-60 no-scrollbar">
              {recentPhotos.map((photo, index) => {
                const isSelected = selectedPhotoUrls.includes(photo.url);
                const selectionIndex = selectedPhotoUrls.indexOf(photo.url) + 1;

                return (
                  <button
                    key={photo.id || index}
                    onClick={() => {
                      if (isMultiSelectMode) {
                        togglePhotoSelection(photo.url);
                      } else {
                        handleSelectFromLibrary(photo);
                      }
                    }}
                    className={`group relative aspect-square rounded-xl overflow-hidden border bg-neutral-950 transition ${
                      isSelected 
                        ? 'border-amber-400 ring-2 ring-amber-400 shadow-md scale-98' 
                        : 'border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <img
                      src={photo.url}
                      alt={`Gallery ${index}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    
                    {/* Badge selection counter for collage */}
                    {isMultiSelectMode && (
                      <div className="absolute top-1.5 right-1.5">
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-amber-400 text-neutral-950 font-black text-[10px] flex items-center justify-center shadow">
                            {selectionIndex}
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-black/60 border border-white/50 flex items-center justify-center text-white/70">
                            <Plus className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    )}

                    {!isMultiSelectMode && index === 0 && (
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-amber-400 text-neutral-950 text-[8px] font-black rounded-md shadow">
                        Terbaru
                      </span>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-1.5 text-left">
                      <span className="text-[9px] text-white font-medium truncate">{photo.category || 'Foto'}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions based on mode */}
            {isMultiSelectMode ? (
              <div className="pt-2 border-t border-neutral-800 flex items-center gap-2">
                <button
                  disabled={selectedPhotoUrls.length < 2 || isGeneratingCollage}
                  onClick={() => handleCreateCollage(false)}
                  className={`flex-1 py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition ${
                    selectedPhotoUrls.length >= 2 && !isGeneratingCollage
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-neutral-950 active:scale-98'
                      : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {isGeneratingCollage 
                      ? 'Menyusun Kolase...' 
                      : `Buat Kolase (${selectedPhotoUrls.length} Foto)`}
                  </span>
                </button>

                <button
                  disabled={selectedPhotoUrls.length < 2 || isGeneratingCollage}
                  onClick={() => handleCreateCollage(true)}
                  className={`px-3 py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-1 border transition ${
                    selectedPhotoUrls.length >= 2 && !isGeneratingCollage
                      ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 hover:bg-amber-400/30'
                      : 'bg-neutral-900 text-neutral-600 border-neutral-800 cursor-not-allowed'
                  }`}
                  title="Langsung Auto Status Kolase"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Auto Status</span>
                </button>
              </div>
            ) : (
              <p className="text-[10px] text-neutral-500 text-center pt-1">
                Ketuk foto mana saja untuk langsung menerapkan filter dan caption status.
              </p>
            )}
          </div>
        </div>
      )}

      {/* AdMob Banner di Bagian Bawah Layar */}
      <AdMobBanner 
        config={admobConfig} 
        platform={platformStyle === 'cupertino' ? 'ios' : 'android'} 
      />

      {/* Permission Request Prompt Modal for Persistent Photo Library Access */}
      {showPermissionPrompt && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-[28px] p-5 flex flex-col items-center text-center shadow-2xl shadow-black/80">
            
            {/* Animated Icon Emblem */}
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-neutral-950 shadow-lg shadow-amber-400/20">
                <FolderHeart className="w-8 h-8 stroke-[2.2]" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-neutral-900 flex items-center justify-center text-white">
                <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>

            {/* Title & Description */}
            <h3 className="text-base font-bold text-white mb-1.5 tracking-tight">
              Akses Galeri Foto Perangkat
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed mb-4">
              Izinkan <span className="text-amber-400 font-semibold">QuickStatus</span> mengakses galeri foto secara persisten agar tombol pratinjau kamera dapat otomatis menampilkan foto-foto terbaru Anda dan membuat kolase multi-foto secara instan.
            </p>

            {/* Privacy note */}
            <div className="w-full bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-2.5 mb-5 flex items-start gap-2 text-left">
              <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-neutral-400 leading-tight">
                Privasi terjaga 100%. Foto disimpan secara lokal di ruang aman perangkat Anda dan tidak dibagikan ke server mana pun.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="w-full flex flex-col gap-2">
              <button
                onClick={handleGrantPermission}
                className="w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-neutral-950 font-extrabold text-xs rounded-2xl shadow-md active:scale-98 transition flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Izinkan Akses Galeri</span>
              </button>

              <button
                onClick={handleDenyPermission}
                className="w-full py-2.5 bg-neutral-800/80 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 font-semibold text-xs rounded-2xl transition"
              >
                Nanti Saja
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Lightweight Interactive Quick Start Coach Mark Tutorial */}
      <QuickStartTutorial
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        onSelectFilterSample={(filterId) => {
          setSelectedFilterId(filterId);
          const matchedSceneIdx = SAMPLE_PRESET_SCENES.findIndex((s) => s.filterId === filterId);
          if (matchedSceneIdx !== -1) {
            setSelectedPresetIndex(matchedSceneIdx);
          }
        }}
        onGoToQuickClip={onGoToQuickClip}
      />

      {/* Local Storage Drafts Management Drawer */}
      <DraftsDrawer
        isOpen={showDraftsDrawer}
        onClose={() => {
          setShowDraftsDrawer(false);
          setDraftsCount(getSavedDrafts().length);
        }}
        onSelectDraft={(draftMedia) => {
          setShowDraftsDrawer(false);
          if (onLoadDraft) {
            onLoadDraft(draftMedia);
          } else {
            onCapture(draftMedia);
          }
        }}
      />
    </div>
  );
};
