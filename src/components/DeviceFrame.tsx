import React from 'react';
import { PlatformStyle } from '../types';
import { 
  Wifi, 
  Battery, 
  Signal
} from 'lucide-react';

interface DeviceFrameProps {
  platformStyle: PlatformStyle;
  children: React.ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  platformStyle,
  children,
}) => {
  const isCupertino = platformStyle === 'cupertino';
  const currentTime = '09:41';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full py-1 sm:py-4 px-1 sm:px-2 select-none overflow-x-hidden">
      {/* Outer Device Chassis */}
      <div 
        className={`relative w-full max-w-[400px] h-[820px] max-h-[96vh] sm:max-h-[92vh] bg-neutral-950 rounded-[36px] sm:rounded-[48px] p-2 sm:p-3 shadow-2xl border transition-all duration-300 flex flex-col ${
          isCupertino 
            ? 'border-neutral-700/80 shadow-amber-400/5' 
            : 'border-neutral-800 shadow-neutral-950'
        }`}
        style={{
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 35px -5px rgba(250, 204, 21, 0.08)'
        }}
      >
        {/* Device Side Buttons Accent (iPhone style vs Pixel style) */}
        {isCupertino ? (
          <>
            <div className="hidden sm:block absolute -left-[2px] top-28 w-[3px] h-10 bg-neutral-700 rounded-l-md"></div>
            <div className="hidden sm:block absolute -left-[2px] top-42 w-[3px] h-12 bg-neutral-700 rounded-l-md"></div>
            <div className="hidden sm:block absolute -left-[2px] top-58 w-[3px] h-12 bg-neutral-700 rounded-l-md"></div>
            <div className="hidden sm:block absolute -right-[2px] top-36 w-[3px] h-16 bg-neutral-700 rounded-r-md"></div>
          </>
        ) : (
          <>
            <div className="hidden sm:block absolute -right-[2px] top-36 w-[3px] h-14 bg-neutral-700 rounded-r-md"></div>
            <div className="hidden sm:block absolute -right-[2px] top-54 w-[3px] h-20 bg-neutral-700 rounded-r-md"></div>
          </>
        )}

        {/* Device Screen Area */}
        <div className="relative w-full h-full bg-neutral-950 rounded-[28px] sm:rounded-[38px] overflow-hidden flex flex-col border border-neutral-800/80">
          
          {/* Status Bar */}
          <div className="w-full h-10 sm:h-11 shrink-0 px-4 sm:px-6 flex items-center justify-between text-white text-xs font-semibold z-30 pointer-events-none select-none">
            <span className={isCupertino ? 'font-semibold tracking-tight text-xs' : 'font-mono text-[11px]'}>
              {currentTime}
            </span>

            {/* Dynamic Island (iOS) or Punch-hole (Android) */}
            {isCupertino ? (
              <div className="w-20 sm:w-24 h-4 sm:h-5 bg-black rounded-full flex items-center justify-between px-2 shadow-sm border border-neutral-900">
                <div className="w-1.5 h-1.5 rounded-full bg-neutral-800"></div>
                <div className="w-2 h-2 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-blue-900/60"></div>
                </div>
              </div>
            ) : (
              <div className="w-3.5 h-3.5 rounded-full bg-black border border-neutral-800 mx-auto"></div>
            )}

            {/* Status Icons */}
            <div className="flex items-center gap-1.5 text-neutral-300">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-amber-400" />
            </div>
          </div>

          {/* Screen Body */}
          <div className="flex-1 min-h-0 flex flex-col relative overflow-hidden bg-neutral-950 text-white">
            {children}
          </div>

          {/* Bottom Home Indicator / Gesture Bar */}
          <div className="w-full h-4 sm:h-5 shrink-0 flex items-center justify-center z-30 pointer-events-none bg-neutral-950/60 backdrop-blur-xs">
            <div 
              className={`h-1 rounded-full bg-white/40 ${
                isCupertino ? 'w-28 sm:w-32' : 'w-20 sm:w-24'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
