import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Bell, 
  BellRing, 
  X, 
  Check, 
  Send, 
  Trash2, 
  Sparkles, 
  MessageCircle, 
  Instagram, 
  Music2, 
  Share2, 
  AlertCircle,
  CheckCircle2,
  Layers
} from 'lucide-react';
import { CapturedMedia, ScheduledStatusItem } from '../types';
import { 
  getSavedScheduledStatuses, 
  saveScheduledStatus, 
  deleteScheduledStatus, 
  triggerSystemReminderNotification 
} from '../utils/scheduledStorage';
import { useHaptics } from '../utils/haptics';
import { FILTERS } from '../data/presets';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: CapturedMedia;
  initialPlatform?: 'whatsapp' | 'instagram' | 'tiktok' | 'telegram';
  onImmediatePost?: (item: ScheduledStatusItem) => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  media,
  initialPlatform = 'whatsapp',
  onImmediatePost,
}) => {
  const haptics = useHaptics();
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  const [scheduledList, setScheduledList] = useState<ScheduledStatusItem[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<'whatsapp' | 'instagram' | 'tiktok' | 'telegram'>(initialPlatform);
  
  // Default datetime local: 1 hour in the future
  const getDefaultDateTime = () => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    d.setMinutes(0);
    d.setSeconds(0);
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const [customDateTime, setCustomDateTime] = useState<string>(getDefaultDateTime());
  const [notificationPermission, setNotificationPermission] = useState<string>('default');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setScheduledList(getSavedScheduledStatuses());
      if (typeof window !== 'undefined' && 'Notification' in window) {
        setNotificationPermission(Notification.permission);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showBanner = (msg: string) => {
    setSuccessBanner(msg);
    setTimeout(() => setSuccessBanner(null), 3000);
  };

  const handleRequestPermission = async () => {
    haptics.triggerMedium();
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm);
        if (perm === 'granted') {
          showBanner('Izin notifikasi berhasil diaktifkan! 🔔');
        }
      } catch (err) {
        console.warn('Failed to request notification permission:', err);
      }
    }
  };

  const handleApplyPreset = (minutesToAdd: number, specificHour?: number) => {
    haptics.triggerSelection();
    const d = new Date();
    if (specificHour !== undefined) {
      if (d.getHours() >= specificHour) {
        // If hour passed today, set to tomorrow
        d.setDate(d.getDate() + 1);
      }
      d.setHours(specificHour, 0, 0, 0);
    } else {
      d.setMinutes(d.getMinutes() + minutesToAdd);
    }
    const tzOffset = d.getTimezoneOffset() * 60000;
    setCustomDateTime(new Date(d.getTime() - tzOffset).toISOString().slice(0, 16));
  };

  const handleScheduleSubmit = () => {
    haptics.triggerSuccess();
    const targetDate = new Date(customDateTime);
    
    if (isNaN(targetDate.getTime()) || targetDate.getTime() <= Date.now()) {
      alert('Pilih waktu dan tanggal di masa depan untuk pengingat jadwal status.');
      return;
    }

    const { list, item } = saveScheduledStatus(media, targetDate, selectedPlatform);
    setScheduledList(list);
    showBanner(`Pengingat status berhasil dijadwalkan untuk ${formatDateTimeDisplay(targetDate.toISOString())}! ⏰`);
    
    // Switch to list tab to view scheduled item
    setTimeout(() => {
      setActiveTab('list');
    }, 600);
  };

  const handleDelete = (id: string) => {
    haptics.triggerMedium();
    const updated = deleteScheduledStatus(id);
    setScheduledList(updated);
    showBanner('Jadwal pengingat berhasil dihapus');
  };

  const handleTestReminder = (item: ScheduledStatusItem) => {
    haptics.triggerSuccess();
    triggerSystemReminderNotification(item);
    showBanner(`🔔 Notifikasi Pengingat: Waktunya posting status ${item.platform.toUpperCase()}!`);
  };

  const formatDateTimeDisplay = (iso: string) => {
    try {
      const date = new Date(iso);
      return date.toLocaleDateString('id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  const formatCountdown = (iso: string) => {
    try {
      const target = new Date(iso).getTime();
      const diffMs = target - Date.now();
      if (diffMs <= 0) return 'Sudah waktunya posting!';
      
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 0) return `Dalam ${diffDays} hari lagi`;
      if (diffHours > 0) return `Dalam ${diffHours} jam ${diffMins % 60} menit`;
      return `Dalam ${diffMins} menit`;
    } catch {
      return 'Segera';
    }
  };

  const platforms = [
    { id: 'whatsapp' as const, name: 'WhatsApp Status', icon: MessageCircle, color: '#25D366' },
    { id: 'instagram' as const, name: 'Instagram Story', icon: Instagram, color: '#E1306C' },
    { id: 'tiktok' as const, name: 'TikTok Post', icon: Music2, color: '#00F2FE' },
    { id: 'telegram' as const, name: 'Telegram Story', icon: Share2, color: '#2AABEE' },
  ];

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col justify-end animate-in fade-in duration-200">
      
      {/* Success Alert Banner */}
      {successBanner && (
        <div className="absolute top-4 inset-x-6 z-55 py-2.5 px-3 bg-neutral-900/95 border border-emerald-500/60 rounded-2xl text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-2xl animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      <div className="w-full bg-neutral-900 border-t border-neutral-800 rounded-t-[32px] p-4 flex flex-col max-h-[90%] shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Jadwalkan Status</h3>
              <p className="text-[10px] text-neutral-400">
                Kirim pengingat otomatis saat jam terbaik untuk posting
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-neutral-800 text-neutral-400 hover:text-white rounded-full transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 pt-3 pb-1 shrink-0">
          <button
            onClick={() => {
              haptics.triggerSelection();
              setActiveTab('create');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'create'
                ? 'bg-amber-400 text-neutral-950 shadow-md shadow-amber-400/20'
                : 'bg-neutral-950 text-neutral-400 border border-neutral-800 hover:text-neutral-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Jadwalkan Waktu Baru</span>
          </button>

          <button
            onClick={() => {
              haptics.triggerSelection();
              setActiveTab('list');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'list'
                ? 'bg-amber-400 text-neutral-950 shadow-md shadow-amber-400/20'
                : 'bg-neutral-950 text-neutral-400 border border-neutral-800 hover:text-neutral-200'
            }`}
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>Jadwal Aktif ({scheduledList.length})</span>
          </button>
        </div>

        {/* Tab 1: Create New Schedule */}
        {activeTab === 'create' && (
          <div className="flex-1 min-h-0 py-2.5 overflow-y-auto space-y-3.5 no-scrollbar">
            
            {/* Quick Time Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                Pilih Preset Waktu Cepat:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: '⚡ Dalam 30 Menit', action: () => handleApplyPreset(30) },
                  { label: '🕒 Dalam 1 Jam', action: () => handleApplyPreset(60) },
                  { label: '🌆 Sore Ini (18:00)', action: () => handleApplyPreset(0, 18) },
                  { label: '🌙 Malam Ini (21:00)', action: () => handleApplyPreset(0, 21) },
                  { label: '🌅 Besok Pagi (08:00)', action: () => handleApplyPreset(0, 8) },
                  { label: '☕ Besok Siang (12:30)', action: () => handleApplyPreset(0, 12) },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={preset.action}
                    className="p-2 rounded-xl bg-neutral-950/70 hover:bg-neutral-800 border border-neutral-800 text-[11px] font-medium text-neutral-200 text-left transition active:scale-98"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Date & Time Picker */}
            <div className="space-y-1.5 bg-neutral-950/70 border border-neutral-800 rounded-2xl p-3">
              <label className="text-[11px] font-bold text-neutral-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Atur Tanggal & Jam Pengingat:</span>
                </span>
                <span className="text-[10px] text-amber-400 font-semibold">
                  {formatDateTimeDisplay(new Date(customDateTime).toISOString())}
                </span>
              </label>

              <input
                type="datetime-local"
                value={customDateTime}
                onChange={(e) => setCustomDateTime(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full bg-neutral-900 text-white text-xs p-2.5 rounded-xl border border-neutral-700 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Target Platform Picker */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                Target Platform:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {platforms.map((p) => {
                  const Icon = p.icon;
                  const isSelected = selectedPlatform === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        haptics.triggerSelection();
                        setSelectedPlatform(p.id);
                      }}
                      className={`p-2 rounded-xl border flex items-center gap-2 transition ${
                        isSelected
                          ? 'bg-neutral-800 border-amber-400 text-white shadow-sm'
                          : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <div 
                        className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${p.color}25`, color: p.color }}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold truncate">{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notification Permission Card if needed */}
            {notificationPermission !== 'granted' && (
              <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[11px] text-amber-200">
                  <Bell className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Aktifkan izin notifikasi agar pengingat berdering tepat waktu.</span>
                </div>
                <button
                  onClick={handleRequestPermission}
                  className="px-2.5 py-1 bg-amber-400 text-neutral-950 text-[10px] font-bold rounded-lg shrink-0"
                >
                  Aktifkan
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleScheduleSubmit}
              className="w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-300 text-neutral-950 rounded-2xl text-xs font-extrabold shadow-lg shadow-amber-400/20 active:scale-98 transition flex items-center justify-center gap-1.5"
            >
              <Bell className="w-4 h-4" />
              <span>Simpan Jadwal Pengingat Status ⏰</span>
            </button>
          </div>
        )}

        {/* Tab 2: Active Scheduled Reminders */}
        {activeTab === 'list' && (
          <div className="flex-1 min-h-0 py-2.5 overflow-y-auto space-y-2.5 no-scrollbar">
            {scheduledList.length === 0 ? (
              <div className="py-12 px-4 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-14 h-14 rounded-3xl bg-neutral-800/80 border border-neutral-700 flex items-center justify-center text-neutral-500">
                  <Bell className="w-7 h-7 stroke-[1.5]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Tidak Ada Jadwal Aktif</h4>
                  <p className="text-xs text-neutral-400 max-w-[240px] mt-1 leading-relaxed">
                    Kamu belum memiliki pengingat jadwal posting status mendatang.
                  </p>
                </div>
              </div>
            ) : (
              scheduledList.map((item) => {
                const activeFilter = FILTERS.find((f) => f.id === item.media.filterId) || FILTERS[0];
                const matchedPlatform = platforms.find((p) => p.id === item.platform) || platforms[0];
                const PIcon = matchedPlatform.icon;

                return (
                  <div
                    key={item.id}
                    className="bg-neutral-950/70 border border-neutral-800 rounded-2xl p-3 flex items-start gap-3 shadow-sm hover:border-amber-400/40 transition"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-neutral-900 shrink-0 border border-neutral-800">
                      <img
                        src={item.media.url}
                        alt="Scheduled"
                        className={`w-full h-full object-cover ${activeFilter.cssClass}`}
                        crossOrigin="anonymous"
                      />
                      <div 
                        className="absolute bottom-1 right-1 w-4 h-4 rounded-md flex items-center justify-center text-white text-[8px] font-bold"
                        style={{ backgroundColor: matchedPlatform.color }}
                      >
                        <PIcon className="w-2.5 h-2.5" />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-[10px] font-black text-amber-400 uppercase tracking-wide flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatCountdown(item.scheduledTime)}
                        </span>

                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-neutral-500 hover:text-rose-400 p-1 transition"
                          title="Hapus jadwal ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-xs font-bold text-white truncate">
                        {formatDateTimeDisplay(item.scheduledTime)}
                      </p>
                      
                      <p className="text-[11px] text-neutral-300 line-clamp-1 mt-0.5">
                        "{item.media.caption || 'Tanpa caption'}"
                      </p>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 mt-2">
                        <button
                          onClick={() => handleTestReminder(item)}
                          className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-semibold rounded-lg flex items-center gap-1"
                          title="Uji coba notifikasi"
                        >
                          <BellRing className="w-2.5 h-2.5 text-amber-400" />
                          <span>Tes Alarm</span>
                        </button>

                        {onImmediatePost && (
                          <button
                            onClick={() => {
                              haptics.triggerSuccess();
                              onImmediatePost(item);
                              onClose();
                            }}
                            className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-[10px] rounded-lg flex items-center gap-1 ml-auto transition active:scale-95"
                          >
                            <Send className="w-2.5 h-2.5" />
                            <span>Posting Sekarang</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-neutral-800 text-center">
          <p className="text-[10px] text-neutral-400">
            🔔 Pengingat akan memberi notifikasi saat waktu posting yang dijadwalkan tiba.
          </p>
        </div>
      </div>
    </div>
  );
};
