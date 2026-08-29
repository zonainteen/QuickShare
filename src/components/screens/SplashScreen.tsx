import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Zap, Sparkles, CheckCircle2 } from 'lucide-react';
import { PlatformStyle } from '../../types';

interface SplashScreenProps {
  platformStyle: PlatformStyle;
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ platformStyle, onFinish }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 3000;
    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step;
        return next >= 100 ? 100 : next;
      });
    }, intervalTime);

    const finishTimeout = setTimeout(() => {
      onFinish();
    }, duration);

    return () => {
      clearInterval(timer);
      clearTimeout(finishTimeout);
    };
  }, [onFinish]);

  return (
    <div 
      onClick={onFinish}
      className="relative w-full h-full flex flex-col items-center justify-between p-6 bg-gradient-to-b from-[#0F1015] via-[#12141D] to-[#0A0B0E] cursor-pointer select-none"
    >
      {/* Background Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-400/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Tag */}
      <div className="pt-4 z-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-1.5 px-3 py-1 bg-amber-400/10 border border-amber-400/20 rounded-full text-[11px] font-medium text-amber-300"
        >
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Flutter {platformStyle === 'cupertino' ? 'Cupertino iOS' : 'Material 3 Android'}</span>
        </motion.div>
      </div>

      {/* Center Logo & Title with Fade-in Animation */}
      <div className="flex flex-col items-center justify-center text-center z-10">
        {/* Animated Brand Logo Icon */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0, rotate: -15 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 0.9, ease: [0.34, 1.56, 0.64, 1] }}
          className="relative mb-6"
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-300 flex items-center justify-center text-neutral-950 shadow-2xl shadow-amber-400/40 relative">
            <Zap className="w-13 h-13 fill-neutral-950 stroke-neutral-950 stroke-[2.5]" />
            <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-neutral-950 border-2 border-amber-400 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-3xl font-extrabold tracking-tight text-white mb-2"
        >
          Quick<span className="text-amber-400">Status</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-xs text-neutral-400 tracking-wide font-medium max-w-[230px]"
        >
          Instant Share • Smart Filters • Multi-Platform Blast
        </motion.p>
      </div>

      {/* Bottom Progress & AdMob Status */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="w-full pb-4 flex flex-col items-center gap-3 z-10"
      >
        {/* AdMob SDK Status */}
        <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-mono">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>Google Mobile Ads SDK Initialized</span>
        </div>

        {/* 3-Second Loading Bar */}
        <div className="w-full max-w-[200px] h-1.5 bg-neutral-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-75 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="text-[10px] text-neutral-500 hover:text-amber-400 transition">
          Ketuk layar untuk langsung masuk (3 detik)
        </span>
      </motion.div>
    </div>
  );
};
