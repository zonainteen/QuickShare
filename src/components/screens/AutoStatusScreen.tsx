import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Send, 
  Edit3, 
  Check, 
  Sparkles, 
  MessageCircle, 
  Instagram, 
  Music2, 
  Layers, 
  Share2,
  CheckCircle2,
  Clock,
  FolderHeart,
  Calendar
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CapturedMedia, AdMobConfig, PlatformStyle, SharePlatform, ScheduledStatusItem } from '../../types';
import { SHARE_PLATFORMS, FILTERS } from '../../data/presets';
import { AdMobInterstitial } from '../AdMobInterstitial';
import { useHaptics } from '../../utils/haptics';
import { CollageView } from '../CollageView';
import { ScheduleModal } from '../ScheduleModal';
import { DraftsDrawer } from '../DraftsDrawer';
import { saveDraft } from '../../utils/draftsStorage';

interface AutoStatusScreenProps {
  media: CapturedMedia;
  platformStyle: PlatformStyle;
  admobConfig: AdMobConfig;
  onBackToEdit: () => void;
  onGoToBlast: () => void;
  onLoadDraft?: (media: CapturedMedia) => void;
}

export const AutoStatusScreen: React.FC<AutoStatusScreenProps> = ({
  media,
  platformStyle,
  admobConfig,
  onBackToEdit,
  onGoToBlast,
  onLoadDraft,
}) => {
  const haptics = useHaptics();
  const [selectedPlatformId, setSelectedPlatformId] = useState<'whatsapp' | 'instagram' | 'tiktok'>('whatsapp');
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showDraftsDrawer, setShowDraftsDrawer] = useState(false);
  const [draftSavedToast, setDraftSavedToast] = useState(false);

  const activeFilter = FILTERS.find((f) => f.id === media.filterId) || FILTERS[0];
  const selectedPlatform = SHARE_PLATFORMS.find((p) => p.id === selectedPlatformId) || SHARE_PLATFORMS[0];

  const handleShareNowClick = () => {
    haptics.triggerMedium();
    // Sesuai spesifikasi: Interstitial AdMob muncul sebelum proses share!
    setShowInterstitial(true);
  };

  const handleAfterAdShare = () => {
    haptics.triggerSuccess();
    // Confetti effect & success message
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    setShareSuccess(true);
    setTimeout(() => {
      setShareSuccess(false);
    }, 4000);
  };

  const handleSaveToDrafts = () => {
    haptics.triggerSuccess();
    saveDraft(media, media.isCollage ? 'Kolase Auto Status' : 'Auto Status Media');
    setDraftSavedToast(true);
    setTimeout(() => setDraftSavedToast(false), 3000);
  };

  const handleImmediatePostFromSchedule = (scheduledItem: ScheduledStatusItem) => {
    handleShareNowClick();
  };

  const getPlatformIcon = (id: string) => {
    switch (id) {
      case 'whatsapp': return <MessageCircle className="w-5 h-5" />;
      case 'instagram': return <Instagram className="w-5 h-5" />;
      case 'tiktok': return <Music2 className="w-5 h-5" />;
      default: return <Share2 className="w-5 h-5" />;
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-[#0F1015] select-none overflow-hidden">
      
      {/* Interstitial Ad Integration Modal */}
      <AdMobInterstitial
        isOpen={showInterstitial}
        onClose={() => setShowInterstitial(false)}
        config={admobConfig}
        platform={platformStyle === 'cupertino' ? 'ios' : 'android'}
        onAdFinished={handleAfterAdShare}
      />

      {/* Interactive Schedule Reminder Modal */}
      <ScheduleModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        media={media}
        initialPlatform={selectedPlatformId}
        onImmediatePost={handleImmediatePostFromSchedule}
      />

      {/* Local Storage Drafts Management Drawer */}
      <DraftsDrawer
        isOpen={showDraftsDrawer}
        onClose={() => setShowDraftsDrawer(false)}
        onSelectDraft={(draftMedia) => {
          if (onLoadDraft) {
            onLoadDraft(draftMedia);
          }
        }}
      />

      {/* Top Header */}
      <div className="w-full shrink-0 px-3 py-2.5 flex items-center justify-between border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md z-20">
        <button
          onClick={onBackToEdit}
          className="flex items-center gap-1 text-xs font-semibold text-neutral-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Edit</span>
        </button>

        <h2 className="text-sm font-bold text-white tracking-wide">
          Auto Status
        </h2>

        {/* Action Buttons Right: Schedule, Drafts & Blast Mode */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              haptics.triggerMedium();
              setShowScheduleModal(true);
            }}
            className="flex items-center gap-1 text-xs font-bold text-amber-300 hover:text-amber-200 bg-neutral-800/80 hover:bg-neutral-800 px-2 py-1 rounded-lg border border-neutral-700 transition"
            title="Jadwalkan Pengingat Status"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Jadwalkan</span>
          </button>

          <button
            onClick={() => {
              haptics.triggerLight();
              setShowDraftsDrawer(true);
            }}
            className="p-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 transition"
            title="Buka Draft Tersimpan"
          >
            <FolderHeart className="w-3.5 h-3.5 text-rose-400" />
          </button>

          <button
            onClick={() => {
              haptics.triggerLight();
              onGoToBlast();
            }}
            className="flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/30"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Blast</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {shareSuccess && (
        <div className="mx-3 mt-2 p-2.5 bg-emerald-950/90 border border-emerald-500/50 rounded-2xl text-emerald-200 flex items-center gap-2 text-xs shadow-lg animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Status berhasil dibagikan ke <strong>{selectedPlatform.name}</strong> secara instan! 🚀</span>
        </div>
      )}

      {/* Draft Saved Toast */}
      {draftSavedToast && (
        <div className="mx-3 mt-2 p-2.5 bg-amber-950/90 border border-amber-400/50 rounded-2xl text-amber-200 flex items-center gap-2 text-xs shadow-lg animate-in fade-in slide-in-from-top-2">
          <FolderHeart className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Status berhasil disimpan ke <strong>Drafts</strong>! Kamu bisa melanjutkannya kapan saja. 💾</span>
        </div>
      )}

      {/* Main Body Preview */}
      <div className="flex-1 min-h-0 p-3 flex flex-col justify-between gap-3 overflow-y-auto no-scrollbar">
        
        {/* Story Format Mock Preview */}
        <div className="relative w-full flex-1 min-h-[240px] rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-2xl flex flex-col justify-between p-3">
          
          {/* Background Image with Filter */}
          {media.isCollage && media.collagePhotos && media.collagePhotos.length > 0 ? (
            <div className="absolute inset-0 w-full h-full">
              <CollageView
                photos={media.collagePhotos}
                layout={media.collageLayout}
                cssFilterClass={activeFilter.cssClass}
              />
            </div>
          ) : (
            <img
              src={media.url}
              alt="Preview"
              className={`absolute inset-0 w-full h-full object-cover ${activeFilter.cssClass}`}
              crossOrigin="anonymous"
            />
          )}

          {/* Top Story Header & Caption di Atas (sesuai spec) */}
          <div className="relative z-10 space-y-2">
            {/* Story Progress Bars */}
            <div className="flex items-center gap-1 w-full">
              <div className="h-1 flex-1 bg-white rounded-full"></div>
              <div className="h-1 flex-1 bg-white/40 rounded-full"></div>
            </div>

            {/* Author Profile + Caption Top Overlay */}
            <div className="bg-neutral-950/80 backdrop-blur-md p-2.5 rounded-2xl border border-white/10 shadow-lg">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 flex items-center justify-center text-neutral-950 font-black text-[10px]">
                  QS
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-white truncate">You • QuickStatus</p>
                  <p className="text-[9px] text-neutral-400">Baru saja • {selectedPlatform.label}</p>
                </div>
                <span className="text-[10px] font-bold text-amber-400 px-2 py-0.5 bg-amber-400/20 rounded-full">
                  Instant
                </span>
              </div>
              
              {/* Caption di Atas Media */}
              <p className="text-xs font-semibold text-white leading-tight">
                {media.caption}
              </p>
            </div>
          </div>

          {/* Bottom Live Platform Target Tag */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md border border-white/15 text-[10px] text-neutral-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedPlatform.color }} />
              <span className="font-semibold text-white">{selectedPlatform.format}</span>
            </div>

            <div className="px-2 py-1 rounded-xl bg-amber-400/90 text-neutral-950 font-bold text-[10px] flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>{activeFilter.name}</span>
            </div>
          </div>
        </div>

        {/* Platform Selection & Scheduling Bar */}
        <div className="w-full bg-neutral-900/90 border border-neutral-800 rounded-2xl p-2.5 shrink-0 shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Pilih Platform Berbagi:</span>
            </p>

            {/* Quick Schedule Trigger Link */}
            <button
              onClick={() => {
                haptics.triggerLight();
                setShowScheduleModal(true);
              }}
              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 hover:underline"
            >
              <Calendar className="w-3 h-3" />
              <span>Atur Waktu Posting ⏰</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'whatsapp' as const, name: 'WhatsApp', icon: MessageCircle, color: '#25D366', label: 'WA Status' },
              { id: 'instagram' as const, name: 'Instagram', icon: Instagram, color: '#E1306C', label: 'IG Story' },
              { id: 'tiktok' as const, name: 'TikTok', icon: Music2, color: '#00F2FE', label: 'TikTok Post' },
            ].map((platform) => {
              const Icon = platform.icon;
              const isSelected = selectedPlatformId === platform.id;

              return (
                <button
                  key={platform.id}
                  onClick={() => {
                    haptics.triggerSelection();
                    setSelectedPlatformId(platform.id);
                  }}
                  className={`p-2 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-neutral-800 border-amber-400 shadow-md scale-102'
                      : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div 
                    className="w-7 h-7 rounded-xl flex items-center justify-center mb-1 shadow-sm"
                    style={{ 
                      backgroundColor: isSelected ? platform.color : '#262626',
                      color: isSelected ? '#ffffff' : platform.color 
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-[10px] font-bold ${isSelected ? 'text-white' : 'text-neutral-400'}`}>
                    {platform.label}
                  </span>
                  {isSelected && (
                    <span className="text-[8px] text-amber-400 font-bold mt-0.5 flex items-center gap-0.5">
                      <Check className="w-2 h-2" /> Terpilih
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button Row */}
        <div className="w-full flex items-center gap-2 shrink-0 pt-1">
          {/* Tombol "Edit" kecil di kiri bawah (sesuai spesifikasi) */}
          <button
            onClick={() => {
              haptics.triggerLight();
              onBackToEdit();
            }}
            className="w-11 h-11 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-amber-400/60 flex items-center justify-center text-neutral-300 hover:text-white transition shadow-md shrink-0"
            title="Edit Ulang Filter & Caption"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          {/* Tombol "Simpan Draft" */}
          <button
            onClick={handleSaveToDrafts}
            className="w-11 h-11 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-rose-400/60 flex items-center justify-center text-rose-300 hover:text-rose-200 transition shadow-md shrink-0 active:scale-95"
            title="Simpan ke Drafts"
          >
            <FolderHeart className="w-4 h-4" />
          </button>

          {/* Tombol "Jadwalkan Status" */}
          <button
            onClick={() => {
              haptics.triggerMedium();
              setShowScheduleModal(true);
            }}
            className="px-3 py-3 bg-neutral-900 hover:bg-neutral-800 border border-amber-400/40 text-amber-300 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md active:scale-95"
            title="Jadwalkan Pengingat Posting"
          >
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Jadwal</span>
          </button>

          {/* Tombol besar "Share Now" (sesuai spesifikasi) */}
          <button
            onClick={handleShareNowClick}
            className="flex-1 py-3.5 px-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 text-neutral-950 rounded-2xl text-xs font-extrabold shadow-xl shadow-amber-400/25 hover:brightness-110 active:scale-[0.98] transition flex items-center justify-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span className="truncate">Share Now ke {selectedPlatform.name} ⚡</span>
          </button>
        </div>
      </div>
    </div>
  );
};
