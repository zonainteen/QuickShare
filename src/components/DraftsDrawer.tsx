import React, { useState, useEffect } from 'react';
import { 
  FolderHeart, 
  Trash2, 
  Sparkles, 
  X, 
  Clock, 
  Film, 
  Image as ImageIcon, 
  Layers, 
  Send, 
  ArrowRight, 
  Edit3,
  Check,
  Plus
} from 'lucide-react';
import { DraftItem, CapturedMedia } from '../types';
import { getSavedDrafts, deleteDraft, clearAllDrafts, saveDraft } from '../utils/draftsStorage';
import { useHaptics } from '../utils/haptics';
import { FILTERS } from '../data/presets';
import { CollageView } from './CollageView';

interface DraftsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDraft: (media: CapturedMedia) => void;
  onDirectShareDraft?: (media: CapturedMedia) => void;
}

export const DraftsDrawer: React.FC<DraftsDrawerProps> = ({
  isOpen,
  onClose,
  onSelectDraft,
  onDirectShareDraft,
}) => {
  const haptics = useHaptics();
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [tempCaption, setTempCaption] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const loaded = getSavedDrafts();
      setDrafts(loaded);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    haptics.triggerMedium();
    const updated = deleteDraft(id);
    setDrafts(updated);
    showToast('Draft berhasil dihapus');
  };

  const handleClearAll = () => {
    haptics.triggerSuccess();
    clearAllDrafts();
    setDrafts([]);
    showToast('Semua draft telah dibersihkan');
  };

  const handleSaveInlineEdit = (draft: DraftItem, e: React.MouseEvent) => {
    e.stopPropagation();
    haptics.triggerSuccess();
    const updatedMedia: CapturedMedia = {
      ...draft.media,
      caption: tempCaption,
    };
    const res = saveDraft(updatedMedia, draft.title, draft.id);
    setDrafts(res.drafts);
    setEditingDraftId(null);
    showToast('Caption draft diperbarui');
  };

  const formatTimestamp = (iso: string) => {
    try {
      const date = new Date(iso);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Baru saja';
      if (diffMins < 60) return `${diffMins} mnt lalu`;
      if (diffHours < 24) return `${diffHours} jam lalu`;
      if (diffDays === 1) return 'Kemarin';
      return `${date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • ${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return 'Tersimpan';
    }
  };

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col justify-end animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-4 inset-x-6 z-55 py-2 px-3 bg-neutral-900/95 border border-amber-400/50 rounded-2xl text-amber-300 text-xs font-bold text-center shadow-2xl animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      <div className="w-full bg-neutral-900 border-t border-neutral-800 rounded-t-[32px] p-4 flex flex-col max-h-[85%] shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <FolderHeart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Draft Tersimpan</h3>
              <p className="text-[10px] text-neutral-400">
                {drafts.length} status tersimpan di memori perangkat
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {drafts.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-2.5 py-1 text-[10px] font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl border border-rose-900/40 transition"
              >
                Hapus Semua
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 bg-neutral-800 text-neutral-400 hover:text-white rounded-full transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Drafts List */}
        <div className="flex-1 min-h-0 py-3 overflow-y-auto space-y-2.5 no-scrollbar">
          {drafts.length === 0 ? (
            <div className="py-12 px-4 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-14 h-14 rounded-3xl bg-neutral-800/80 border border-neutral-700 flex items-center justify-center text-neutral-500 shadow-inner">
                <FolderHeart className="w-7 h-7 stroke-[1.5]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Belum Ada Draft</h4>
                <p className="text-xs text-neutral-400 max-w-[240px] mt-1 leading-relaxed">
                  Edit foto atau video kamu dan tekan tombol <strong>"Simpan Draft"</strong> untuk melanjutkan nanti.
                </p>
              </div>
            </div>
          ) : (
            drafts.map((draft) => {
              const activeFilter = FILTERS.find((f) => f.id === draft.media.filterId) || FILTERS[0];
              const isCollage = draft.media.isCollage;
              const isVideo = draft.media.type === 'video';
              const isEditingThis = editingDraftId === draft.id;

              return (
                <div
                  key={draft.id}
                  onClick={() => {
                    if (!isEditingThis) {
                      haptics.triggerMedium();
                      onSelectDraft(draft.media);
                      onClose();
                    }
                  }}
                  className="group relative bg-neutral-950/70 hover:bg-neutral-950 border border-neutral-800 hover:border-amber-400/50 rounded-2xl p-2.5 flex items-start gap-3 transition shadow-sm cursor-pointer"
                >
                  {/* Thumbnail */}
                  <div className="relative w-18 h-18 rounded-xl overflow-hidden bg-neutral-900 shrink-0 border border-neutral-800">
                    {isCollage && draft.media.collagePhotos && draft.media.collagePhotos.length > 0 ? (
                      <div className="w-full h-full scale-100 pointer-events-none">
                        <CollageView
                          photos={draft.media.collagePhotos}
                          layout={draft.media.collageLayout}
                          cssFilterClass={activeFilter.cssClass}
                        />
                      </div>
                    ) : isVideo ? (
                      <div className="w-full h-full relative flex items-center justify-center bg-black">
                        <video
                          src={draft.media.url}
                          className="w-full h-full object-cover opacity-80"
                          muted
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Film className="w-4 h-4 text-amber-400" />
                        </div>
                      </div>
                    ) : (
                      <img
                        src={draft.media.url}
                        alt="Draft"
                        className={`w-full h-full object-cover ${activeFilter.cssClass}`}
                        crossOrigin="anonymous"
                      />
                    )}

                    {/* Media Type Badge */}
                    <div className="absolute bottom-1 right-1 px-1 py-0.2 bg-black/80 backdrop-blur-md rounded text-[8px] font-bold text-amber-300 flex items-center gap-0.5">
                      {isCollage ? (
                        <>
                          <Layers className="w-2 h-2" />
                          <span>Kolase</span>
                        </>
                      ) : isVideo ? (
                        <>
                          <Film className="w-2 h-2" />
                          <span>8s Clip</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-2 h-2" />
                          <span>Foto</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Content Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: activeFilter.accentColor }} />
                        <span className="text-[11px] font-bold text-white truncate">
                          {activeFilter.name}
                        </span>
                        <span className="text-[9px] text-neutral-400 shrink-0 flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {formatTimestamp(draft.updatedAt)}
                        </span>
                      </div>

                      {/* Delete Draft Button */}
                      <button
                        onClick={(e) => handleDelete(draft.id, e)}
                        className="p-1 text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 rounded-lg transition"
                        title="Hapus draft ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Editable or Static Caption */}
                    {isEditingThis ? (
                      <div className="space-y-1.5 my-1" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={tempCaption}
                          onChange={(e) => setTempCaption(e.target.value)}
                          className="w-full bg-neutral-900 text-white text-xs px-2 py-1 rounded-lg border border-amber-400 focus:outline-none"
                          placeholder="Edit caption..."
                          autoFocus
                        />
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => handleSaveInlineEdit(draft, e)}
                            className="px-2 py-0.5 bg-amber-400 text-neutral-950 rounded-md font-bold text-[10px] flex items-center gap-0.5"
                          >
                            <Check className="w-2.5 h-2.5" />
                            <span>Simpan</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingDraftId(null);
                            }}
                            className="px-2 py-0.5 bg-neutral-800 text-neutral-300 rounded-md font-semibold text-[10px]"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-neutral-200 line-clamp-2 leading-relaxed mb-2 font-medium">
                        "{draft.media.caption || 'Tanpa caption'}"
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          haptics.triggerLight();
                          setEditingDraftId(draft.id);
                          setTempCaption(draft.media.caption || '');
                        }}
                        className="px-2 py-1 bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-lg text-[10px] font-semibold flex items-center gap-1 transition"
                      >
                        <Edit3 className="w-2.5 h-2.5" />
                        <span>Edit Teks</span>
                      </button>

                      <button
                        onClick={() => {
                          haptics.triggerMedium();
                          onSelectDraft(draft.media);
                          onClose();
                        }}
                        className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-lg text-[10px] flex items-center gap-1 ml-auto shadow-sm transition active:scale-95"
                      >
                        <span>Buka & Edit</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </button>

                      {onDirectShareDraft && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            haptics.triggerSuccess();
                            onDirectShareDraft(draft.media);
                            onClose();
                          }}
                          className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-amber-400/30 font-bold rounded-lg text-[10px] flex items-center gap-1 shadow-sm transition active:scale-95"
                          title="Langsung Auto Status"
                        >
                          <Send className="w-2.5 h-2.5" />
                          <span>Share</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Tip */}
        <div className="pt-2 border-t border-neutral-800 text-center">
          <p className="text-[10px] text-neutral-400">
            💡 Ketuk draft untuk memuat kembali foto, filter, dan caption status kamu.
          </p>
        </div>
      </div>
    </div>
  );
};
