import React, { useState } from 'react';
import { X, ExternalLink, Sparkles } from 'lucide-react';
import { AdMobConfig } from '../types';

interface AdMobBannerProps {
  config: AdMobConfig;
  platform: 'android' | 'ios';
}

export const AdMobBanner: React.FC<AdMobBannerProps> = ({ config, platform }) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [adIndex, setAdIndex] = useState(0);

  const sampleAds = [
    {
      title: '☕ Kopi Kenangan Mantan Promo 50%',
      sponsor: 'Kopi Kenangan Official',
      cta: 'Pesan Sekarang',
      color: 'bg-amber-950/80 border-amber-500/30 text-amber-200',
      btnColor: 'bg-amber-400 text-neutral-950',
      icon: '☕'
    },
    {
      title: '🎧 Spotify Premium 3 Bulan Cuma Rp19rb!',
      sponsor: 'Spotify Indonesia',
      cta: 'Dapatkan Promo',
      color: 'bg-emerald-950/80 border-emerald-500/30 text-emerald-200',
      btnColor: 'bg-emerald-400 text-neutral-950',
      icon: '🎵'
    },
    {
      title: '✈️ Tiket Pesawat Murah Liburan Akhir Pekan',
      sponsor: 'Traveloka App',
      cta: 'Cek Tiket',
      color: 'bg-sky-950/80 border-sky-500/30 text-sky-200',
      btnColor: 'bg-sky-400 text-neutral-950',
      icon: '✈️'
    }
  ];

  if (isDismissed) return null;

  const currentAd = sampleAds[adIndex];
  const unitId = platform === 'android' ? config.bannerIdAndroid : config.bannerIdIos;

  return (
    <div className="w-full shrink-0 px-2 py-1.5 bg-neutral-950/95 border-t border-neutral-800/80 z-20">
      <div className={`relative flex items-center justify-between p-2 rounded-xl border backdrop-blur-md transition-all ${currentAd.color}`}>
        {/* AdMob Badge Header */}
        <div className="absolute -top-2.5 left-3 px-1.5 py-0.5 bg-neutral-900 border border-neutral-700/60 rounded text-[9px] font-mono font-medium text-neutral-400 flex items-center gap-1 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
          <span>Ad by Google</span>
          {config.isTestMode && <span className="text-amber-400 font-bold">[TEST]</span>}
        </div>

        {/* Ad Content */}
        <div 
          className="flex items-center gap-2.5 flex-1 min-w-0 pr-2 cursor-pointer pt-1"
          onClick={() => setAdIndex((prev) => (prev + 1) % sampleAds.length)}
          title="Klik untuk rotasi iklan simulasi"
        >
          <div className="w-8 h-8 rounded-lg bg-neutral-900/80 flex items-center justify-center text-base shrink-0 border border-white/10 shadow-inner">
            {currentAd.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate text-white leading-tight">
              {currentAd.title}
            </p>
            <p className="text-[10px] text-neutral-400 flex items-center gap-1 truncate mt-0.5">
              <span>{currentAd.sponsor}</span>
              <span className="text-neutral-500">•</span>
              <span className="font-mono text-[9px] text-neutral-400 truncate max-w-[120px]">{unitId}</span>
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => alert(`Simulasi iklan AdMob berhasil dibuka! Target link: ${currentAd.sponsor}`)}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg shadow-sm transition hover:opacity-90 active:scale-95 whitespace-nowrap ${currentAd.btnColor}`}
          >
            {currentAd.cta}
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 text-neutral-400 hover:text-white rounded-md transition"
            title="Sembunyikan Iklan (Preview)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
