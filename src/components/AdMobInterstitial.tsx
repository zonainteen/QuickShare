import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Volume2, VolumeX, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';
import { AdMobConfig } from '../types';

interface AdMobInterstitialProps {
  isOpen: boolean;
  onClose: () => void;
  config: AdMobConfig;
  platform: 'android' | 'ios';
  onAdFinished: () => void;
}

export const AdMobInterstitial: React.FC<AdMobInterstitialProps> = ({
  isOpen,
  onClose,
  config,
  platform,
  onAdFinished,
}) => {
  const [countdown, setCountdown] = useState(5);
  const [isMuted, setIsMuted] = useState(false);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(5);
      setCanSkip(false);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanSkip(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const unitId = platform === 'android' ? config.interstitialIdAndroid : config.interstitialIdIos;

  const handleDismiss = () => {
    onClose();
    onAdFinished();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 bg-neutral-950 flex flex-col justify-between text-white p-4 select-none"
      >
        {/* Top Interstitial Header */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-2 bg-neutral-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-neutral-700">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span className="text-xs font-mono font-bold text-amber-400">Google AdMob Interstitial</span>
            {config.isTestMode && <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">TEST AD</span>}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-8 h-8 rounded-full bg-neutral-900/90 border border-neutral-700 flex items-center justify-center text-neutral-300 hover:text-white"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {canSkip ? (
              <button
                onClick={handleDismiss}
                className="flex items-center gap-1 bg-amber-400 text-neutral-950 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg hover:bg-amber-300 transition"
              >
                <span>Tutup Iklan</span>
                <X className="w-4 h-4" />
              </button>
            ) : (
              <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center text-xs font-bold font-mono text-amber-400">
                {countdown}s
              </div>
            )}
          </div>
        </div>

        {/* Center Ad Showcase */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full my-4 text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full bg-gradient-to-br from-amber-500/20 via-neutral-900 to-neutral-950 border border-amber-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none"></div>

            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-200 flex items-center justify-center text-neutral-950 shadow-xl mb-4">
              <Sparkles className="w-10 h-10" />
            </div>

            <span className="inline-block px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-semibold rounded-full mb-3">
              ★ Rekomendasi Hari Ini
            </span>

            <h3 className="text-xl font-extrabold text-white mb-2 leading-snug">
              QuickStatus Pro Pass
            </h3>
            
            <p className="text-xs text-neutral-300 mb-6 leading-relaxed">
              Dapatkan akses ke 50+ filter eksklusif, hapus semua iklan AdMob, dan unlock ekspor video 4K Ultra HD tanpa batas!
            </p>

            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-center gap-2 text-xs text-amber-200/90 font-medium">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Simulasi Interstitial Ad ID:</span>
              </div>
              <p className="font-mono text-[10px] bg-neutral-950/80 text-amber-400 py-1.5 px-3 rounded-lg border border-neutral-800 break-all">
                {unitId}
              </p>
            </div>

            <button
              onClick={() => {
                alert('Membuka tautan sponsor AdMob...');
                handleDismiss();
              }}
              className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-yellow-400 text-neutral-950 font-bold rounded-xl text-sm shadow-lg shadow-amber-400/20 hover:brightness-110 active:scale-[0.98] transition flex items-center justify-center gap-2"
            >
              <span>Install / Buka Sekarang</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </motion.div>
        </div>

        {/* Bottom Notice */}
        <div className="text-center text-[11px] text-neutral-500 font-mono pb-2">
          {canSkip ? (
            <span className="text-amber-400 font-semibold cursor-pointer" onClick={handleDismiss}>
              Klik tombol Tutup Iklan di pojok kanan atas untuk lanjut share 🚀
            </span>
          ) : (
            <span>Iklan dapat ditutup dalam {countdown} detik...</span>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
