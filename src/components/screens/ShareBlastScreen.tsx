import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Rocket, 
  Check, 
  MessageCircle, 
  Instagram, 
  Music2, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CapturedMedia, AdMobConfig, PlatformStyle } from '../../types';
import { FILTERS } from '../../data/presets';
import { AdMobBanner } from '../AdMobBanner';
import { AdMobInterstitial } from '../AdMobInterstitial';
import { useHaptics } from '../../utils/haptics';
import { CollageView } from '../CollageView';

interface ShareBlastScreenProps {
  media: CapturedMedia;
  platformStyle: PlatformStyle;
  admobConfig: AdMobConfig;
  onBack: () => void;
}

export const ShareBlastScreen: React.FC<ShareBlastScreenProps> = ({
  media,
  platformStyle,
  admobConfig,
  onBack,
}) => {
  const haptics = useHaptics();
  const [selectedPlatforms, setSelectedPlatforms] = useState<Record<string, boolean>>({
    whatsapp: true,
    instagram: true,
    tiktok: true,
    telegram: false,
  });

  const [showInterstitial, setShowInterstitial] = useState(false);
  const [isBlasting, setIsBlasting] = useState(false);
  const [blastFinished, setBlastFinished] = useState(false);

  const activeFilter = FILTERS.find((f) => f.id === media.filterId) || FILTERS[0];

  const platformsList = [
    {
      id: 'whatsapp',
      name: 'WhatsApp Status',
      icon: MessageCircle,
      color: '#25D366',
      badge: 'Kontak Personal & Grup',
      format: 'Full HD 1080p',
    },
    {
      id: 'instagram',
      name: 'Instagram Story',
      icon: Instagram,
      color: '#E1306C',
      badge: 'Followers & Close Friends',
      format: 'Story Reels (9:16)',
    },
    {
      id: 'tiktok',
      name: 'TikTok Post / Story',
      icon: Music2,
      color: '#00F2FE',
      badge: 'Public FYP & Friends',
      format: 'Short Video Auto-Sync',
    },
    {
      id: 'telegram',
      name: 'Telegram Story',
      icon: Send,
      color: '#229ED9',
      badge: 'Channel & Contacts',
      format: 'Cloud Sync Instant',
    },
  ];

  const togglePlatform = (id: string) => {
    haptics.triggerSelection();
    setSelectedPlatforms((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const selectedCount = Object.values(selectedPlatforms).filter(Boolean).length;

  const handleShareToAllClick = () => {
    haptics.triggerMedium();
    // Interstitial AdMob muncul saat user menekan Share to All!
    setShowInterstitial(true);
  };

  const executeBlastShare = () => {
    setIsBlasting(true);
    setBlastFinished(false);

    // Multi-step simulated blast
    setTimeout(() => {
      setIsBlasting(false);
      setBlastFinished(true);
      haptics.triggerSuccess();

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
      });
    }, 1200);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-[#0F1015] select-none overflow-hidden">
      
      {/* Interstitial Ad Integration Modal */}
      <AdMobInterstitial
        isOpen={showInterstitial}
        onClose={() => setShowInterstitial(false)}
        config={admobConfig}
        platform={platformStyle === 'cupertino' ? 'ios' : 'android'}
        onAdFinished={executeBlastShare}
      />

      {/* Top Header */}
      <div className="w-full shrink-0 px-4 py-2.5 flex items-center justify-between border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md z-20">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm font-medium text-neutral-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        <h2 className="text-sm font-bold text-white tracking-wide">
          Share Blast
        </h2>

        <div className="w-6" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 p-3 flex flex-col justify-between gap-3 overflow-y-auto no-scrollbar">
        
        {/* Status "Ready to Share!" Banner (sesuai spesifikasi) */}
        <div className="w-full p-3.5 bg-gradient-to-r from-amber-500/20 via-neutral-900 to-amber-500/10 border border-amber-400/40 rounded-2xl flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-neutral-950 flex items-center justify-center shadow-md shrink-0">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-extrabold text-white">Ready to Share!</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <p className="text-[11px] text-neutral-300">
                {selectedCount} platform terpilih untuk blast serentak
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 bg-amber-400/20 text-amber-300 text-xs font-bold rounded-lg border border-amber-400/30">
            {selectedCount} / 4
          </span>
        </div>

        {/* Media Mini Preview Card */}
        <div className="w-full bg-neutral-900/80 border border-neutral-800 rounded-2xl p-2.5 flex items-center gap-3 shadow-md">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-neutral-950 border border-white/10 shrink-0 relative">
            {media.isCollage && media.collagePhotos && media.collagePhotos.length > 0 ? (
              <CollageView
                photos={media.collagePhotos}
                layout={media.collageLayout}
                cssFilterClass={activeFilter.cssClass}
              />
            ) : (
              <img
                src={media.url}
                alt="Media"
                className={`w-full h-full object-cover ${activeFilter.cssClass}`}
                crossOrigin="anonymous"
              />
            )}
            <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 bg-black/80 text-[8px] font-bold text-amber-400 rounded">
              {media.isCollage ? 'Kolase' : activeFilter.name.split(' ')[0]}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">
              {media.caption}
            </p>
            <p className="text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Auto-optimized caption & high resolution ready</span>
            </p>
          </div>
        </div>

        {/* Platform Checklist Cards (sesuai spesifikasi) */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-neutral-300 px-1">
            Checklist Platform Target:
          </p>

          <div className="space-y-2">
            {platformsList.map((platform) => {
              const Icon = platform.icon;
              const isChecked = selectedPlatforms[platform.id];

              return (
                <div
                  key={platform.id}
                  onClick={() => togglePlatform(platform.id)}
                  className={`w-full p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isChecked
                      ? 'bg-neutral-900 border-amber-400/80 shadow-md'
                      : 'bg-neutral-950/60 border-neutral-800/80 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
                      style={{ 
                        backgroundColor: isChecked ? platform.color : '#262626',
                        color: isChecked ? '#ffffff' : platform.color 
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-white leading-tight">
                        {platform.name}
                      </p>
                      <p className="text-[10px] text-neutral-400">
                        {platform.badge} • {platform.format}
                      </p>
                    </div>
                  </div>

                  {/* Custom Checkbox */}
                  <div
                    className={`w-6 h-6 rounded-xl border flex items-center justify-center transition-all ${
                      isChecked
                        ? 'bg-amber-400 border-amber-300 text-neutral-950 font-bold shadow-sm'
                        : 'border-neutral-700 bg-neutral-900'
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Blast Success Alert */}
        {blastFinished && (
          <div className="p-3 bg-emerald-950/90 border border-emerald-500/60 rounded-2xl text-emerald-200 text-xs flex items-center gap-2 shadow-lg animate-in zoom-in-95">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-white">Blast Sukses 100%! 🚀</p>
              <p className="text-[10px] text-emerald-300">Status telah diunggah ke {selectedCount} platform sekaligus.</p>
            </div>
          </div>
        )}

        {/* Tombol Besar "Share to All!" di bawah (sesuai spesifikasi) */}
        <div className="w-full pt-1">
          <button
            onClick={handleShareToAllClick}
            disabled={selectedCount === 0 || isBlasting}
            className={`w-full py-4 px-4 rounded-2xl text-sm font-black shadow-xl transition-all flex items-center justify-center gap-2 ${
              selectedCount > 0
                ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 text-neutral-950 shadow-amber-400/30 hover:brightness-110 active:scale-[0.98]'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
            }`}
          >
            {isBlasting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin"></span>
                <span>Mengirim Status ke Semua Platform...</span>
              </span>
            ) : (
              <>
                <Rocket className="w-5 h-5" />
                <span>Share to All! ({selectedCount} Platform) ⚡</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Banner AdMob di Bagian Bawah (sesuai spesifikasi) */}
      <AdMobBanner 
        config={admobConfig} 
        platform={platformStyle === 'cupertino' ? 'ios' : 'android'} 
      />
    </div>
  );
};
