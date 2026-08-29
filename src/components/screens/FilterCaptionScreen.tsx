import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Edit3, 
  Sparkles, 
  ArrowRight, 
  Check, 
  RefreshCw, 
  Smile, 
  Hash, 
  Sliders, 
  Layers,
  FolderHeart
} from 'lucide-react';
import { CapturedMedia, AdMobConfig, PlatformStyle, FilterId } from '../../types';
import { FILTERS, SMART_CAPTIONS_BY_CATEGORY } from '../../data/presets';
import { AdMobBanner } from '../AdMobBanner';
import { CollageView } from '../CollageView';
import { DraftsDrawer } from '../DraftsDrawer';
import { saveDraft } from '../../utils/draftsStorage';
import { useHaptics } from '../../utils/haptics';

interface FilterCaptionScreenProps {
  media: CapturedMedia;
  platformStyle: PlatformStyle;
  admobConfig: AdMobConfig;
  onBack: () => void;
  onNext: (updatedMedia: CapturedMedia) => void;
  onLoadDraft?: (media: CapturedMedia) => void;
}

export const FilterCaptionScreen: React.FC<FilterCaptionScreenProps> = ({
  media,
  platformStyle,
  admobConfig,
  onBack,
  onNext,
  onLoadDraft,
}) => {
  const haptics = useHaptics();
  const [currentFilterId, setCurrentFilterId] = useState<FilterId>(media.filterId);
  const [caption, setCaption] = useState(media.caption);
  const [isEditing, setIsEditing] = useState(false);
  const [captionVibeIndex, setCaptionVibeIndex] = useState(0);
  const [showDraftsDrawer, setShowDraftsDrawer] = useState(false);
  const [draftToast, setDraftToast] = useState<string | null>(null);

  const activeFilter = FILTERS.find((f) => f.id === currentFilterId) || FILTERS[0];
  const suggestedCaptions = SMART_CAPTIONS_BY_CATEGORY[activeFilter.name] || [
    'Living my best life right now! ✨',
    'Good vibes, great memories 💛',
    'Moment created with QuickStatus 🚀',
  ];

  const handleNext = () => {
    onNext({
      ...media,
      filterId: currentFilterId,
      caption: caption,
    });
  };

  const handleShuffleCaption = () => {
    const nextIdx = (captionVibeIndex + 1) % suggestedCaptions.length;
    setCaptionVibeIndex(nextIdx);
    setCaption(suggestedCaptions[nextIdx]);
  };

  const handleSaveDraft = () => {
    haptics.triggerSuccess();
    const updatedMedia: CapturedMedia = {
      ...media,
      filterId: currentFilterId,
      caption: caption,
    };
    saveDraft(updatedMedia, media.isCollage ? 'Kolase Momen' : 'Foto Filter Status');
    setDraftToast('Status berhasil disimpan ke Drafts! 💾');
    setTimeout(() => setDraftToast(null), 3000);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-[#0F1015] select-none overflow-hidden">
      
      {/* Drafts Drawer */}
      <DraftsDrawer
        isOpen={showDraftsDrawer}
        onClose={() => setShowDraftsDrawer(false)}
        onSelectDraft={(draftMedia) => {
          if (onLoadDraft) {
            onLoadDraft(draftMedia);
          } else {
            setCurrentFilterId(draftMedia.filterId);
            setCaption(draftMedia.caption);
          }
        }}
      />

      {/* Top App Bar (Cupertino vs Material style) */}
      <div className="w-full shrink-0 px-3 py-2.5 flex items-center justify-between border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md z-20">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-semibold text-neutral-300 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        <h2 className="text-sm font-bold text-white tracking-wide">
          Filter & Caption
        </h2>

        <div className="flex items-center gap-1.5">
          {/* Open Drafts */}
          <button
            onClick={() => {
              haptics.triggerLight();
              setShowDraftsDrawer(true);
            }}
            className="p-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white transition border border-neutral-700"
            title="Buka Draft"
          >
            <FolderHeart className="w-3.5 h-3.5 text-rose-400" />
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-1 px-3 py-1 bg-amber-400 text-neutral-950 rounded-xl text-xs font-extrabold shadow-md hover:bg-amber-300 transition"
          >
            <span>Next</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Draft Toast */}
      {draftToast && (
        <div className="mx-3 mt-2 p-2.5 bg-amber-950/90 border border-amber-400/50 rounded-2xl text-amber-200 flex items-center gap-2 text-xs shadow-lg animate-in fade-in slide-in-from-top-2">
          <FolderHeart className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{draftToast}</span>
        </div>
      )}

      {/* Main Content Preview */}
      <div className="flex-1 min-h-0 p-3 flex flex-col justify-between gap-3 overflow-y-auto no-scrollbar">
        
        {/* Photo Preview Container with Applied Filter */}
        <div className="relative w-full flex-1 min-h-[220px] rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-xl flex items-center justify-center">
          {media.isCollage && media.collagePhotos && media.collagePhotos.length > 0 ? (
            <CollageView
              photos={media.collagePhotos}
              layout={media.collageLayout}
              cssFilterClass={activeFilter.cssClass}
            />
          ) : (
            <img
              src={media.url}
              alt="Preview"
              className={`w-full h-full object-cover transition-all duration-300 ${activeFilter.cssClass}`}
              crossOrigin="anonymous"
            />
          )}

          {/* Filter Badge Overlay */}
          <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/70 backdrop-blur-md border border-white/10 rounded-xl flex items-center gap-1.5 shadow-md">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeFilter.accentColor }} />
            <span className="text-[11px] font-semibold text-white">
              {activeFilter.name}
              {media.isCollage ? ' • Kolase' : ''}
            </span>
          </div>

          {/* Auto Caption Floating Box on Media */}
          <div className="absolute bottom-3 inset-x-3 bg-neutral-950/85 backdrop-blur-md border border-white/15 rounded-2xl p-3 shadow-2xl">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
                <Sparkles className="w-3 h-3" />
                <span>AI Auto-Caption</span>
              </div>
              <button
                onClick={handleShuffleCaption}
                className="flex items-center gap-1 text-[10px] text-neutral-400 hover:text-white transition px-2 py-0.5 rounded-lg bg-neutral-800/80"
                title="Ganti caption otomatis"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                <span>Vibe Baru</span>
              </button>
            </div>

            <p className="text-xs text-white leading-relaxed font-medium">
              "{caption}"
            </p>
          </div>
        </div>

        {/* Quick Filter Switching Bar */}
        <div className="w-full bg-neutral-900/90 border border-neutral-800 rounded-2xl p-2 shrink-0 shadow-md">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-[11px] font-bold text-neutral-400 flex items-center gap-1">
              <Layers className="w-3 h-3 text-amber-400" />
              <span>Ganti Filter:</span>
            </span>
            <span className="text-[10px] text-amber-300 font-medium">{activeFilter.category}</span>
          </div>
          
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {FILTERS.map((f) => {
              const isSelected = f.id === currentFilterId;
              return (
                <button
                  key={f.id}
                  onClick={() => {
                    setCurrentFilterId(f.id);
                    // auto adapt caption based on chosen filter
                    const newSuggestions = SMART_CAPTIONS_BY_CATEGORY[f.name] || [f.defaultCaption];
                    setCaption(newSuggestions[0]);
                  }}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-semibold shrink-0 transition ${
                    isSelected
                      ? 'bg-amber-400 text-neutral-950 font-bold shadow-sm'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  {f.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Caption Editor & Action Row */}
        <div className="w-full bg-neutral-900/90 border border-neutral-800 rounded-2xl p-3 shrink-0 shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Personalisasi Caption</span>
            </span>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-[11px] font-semibold text-amber-400 hover:underline"
            >
              {isEditing ? 'Selesai' : 'Edit Teks'}
            </button>
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={2}
                className="w-full bg-neutral-950 text-white text-xs p-2.5 rounded-xl border border-amber-400/50 focus:outline-none focus:ring-1 focus:ring-amber-400"
                placeholder="Tulis caption status kamu di sini..."
              />
              <div className="flex items-center gap-1 text-[11px] overflow-x-auto no-scrollbar">
                {['☕', '✨', '🍕', '🔥', '🌅', '💛', '🎉', '#QuickStatus'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setCaption((prev) => `${prev} ${emoji}`)}
                    className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-neutral-200"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveDraft}
                className="p-2 bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700/60 rounded-xl text-rose-300 hover:text-rose-200 transition shrink-0 active:scale-95"
                title="Simpan ke Drafts"
              >
                <FolderHeart className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 py-2 px-2.5 bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700/60 rounded-xl text-xs font-semibold text-neutral-200 flex items-center justify-center gap-1.5 transition"
              >
                <Edit3 className="w-3 h-3 text-amber-400" />
                <span>Ubah Caption</span>
              </button>

              <button
                onClick={handleNext}
                className="flex-1 py-2 px-2.5 bg-gradient-to-r from-amber-400 to-yellow-300 text-neutral-950 rounded-xl text-xs font-bold shadow-md hover:opacity-95 transition flex items-center justify-center gap-1"
              >
                <span>Lanjut Auto Status</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* AdMob Banner di Bagian Bawah Layar */}
      <AdMobBanner 
        config={admobConfig} 
        platform={platformStyle === 'cupertino' ? 'ios' : 'android'} 
      />
    </div>
  );
};
