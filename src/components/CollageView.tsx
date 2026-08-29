import React from 'react';
import { CollageLayout } from '../types';

interface CollageViewProps {
  photos: string[];
  layout?: CollageLayout;
  className?: string;
  cssFilterClass?: string;
}

export const CollageView: React.FC<CollageViewProps> = ({
  photos,
  layout = 'grid2x2',
  className = '',
  cssFilterClass = '',
}) => {
  if (!photos || photos.length === 0) return null;
  if (photos.length === 1) {
    return (
      <img
        src={photos[0]}
        alt="Photo"
        className={`w-full h-full object-cover ${cssFilterClass} ${className}`}
        crossOrigin="anonymous"
      />
    );
  }

  const count = photos.length;

  if (layout === 'splitVertical' || count === 2) {
    return (
      <div className={`w-full h-full grid grid-rows-2 gap-1.5 p-1.5 bg-neutral-950 ${cssFilterClass} ${className}`}>
        <div className="relative rounded-2xl overflow-hidden border border-white/10">
          <img src={photos[0]} alt="1" className="w-full h-full object-cover" crossOrigin="anonymous" />
          <span className="absolute bottom-1.5 left-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded text-[9px] font-bold text-amber-300">1/2</span>
        </div>
        <div className="relative rounded-2xl overflow-hidden border border-white/10">
          <img src={photos[1] || photos[0]} alt="2" className="w-full h-full object-cover" crossOrigin="anonymous" />
          <span className="absolute bottom-1.5 left-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded text-[9px] font-bold text-amber-300">2/2</span>
        </div>
      </div>
    );
  }

  if (layout === 'tripleStory' || count === 3) {
    return (
      <div className={`w-full h-full flex flex-col gap-1.5 p-1.5 bg-neutral-950 ${cssFilterClass} ${className}`}>
        <div className="relative flex-[1.4] rounded-2xl overflow-hidden border border-white/10">
          <img src={photos[0]} alt="Main" className="w-full h-full object-cover" crossOrigin="anonymous" />
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-amber-400 text-neutral-950 font-extrabold text-[9px] rounded-md shadow">Story 1</span>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-1.5">
          <div className="relative rounded-xl overflow-hidden border border-white/10">
            <img src={photos[1]} alt="Sub 1" className="w-full h-full object-cover" crossOrigin="anonymous" />
          </div>
          <div className="relative rounded-xl overflow-hidden border border-white/10">
            <img src={photos[2] || photos[0]} alt="Sub 2" className="w-full h-full object-cover" crossOrigin="anonymous" />
          </div>
        </div>
      </div>
    );
  }

  if (layout === 'heroInset') {
    return (
      <div className={`relative w-full h-full p-1.5 bg-neutral-950 rounded-3xl overflow-hidden ${cssFilterClass} ${className}`}>
        <img src={photos[0]} alt="Hero" className="w-full h-full object-cover rounded-2xl" crossOrigin="anonymous" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        
        {photos[1] && (
          <div className="absolute bottom-3 right-3 w-28 h-36 rounded-xl overflow-hidden border-2 border-amber-400/90 shadow-2xl rotate-3">
            <img src={photos[1]} alt="Inset 1" className="w-full h-full object-cover" crossOrigin="anonymous" />
          </div>
        )}
        {photos[2] && (
          <div className="absolute bottom-4 right-28 w-20 h-24 rounded-xl overflow-hidden border-2 border-white/80 shadow-2xl -rotate-6">
            <img src={photos[2]} alt="Inset 2" className="w-full h-full object-cover" crossOrigin="anonymous" />
          </div>
        )}
      </div>
    );
  }

  // Standard 2x2 Grid
  return (
    <div className={`w-full h-full grid grid-cols-2 grid-rows-2 gap-1.5 p-1.5 bg-neutral-950 ${cssFilterClass} ${className}`}>
      {photos.slice(0, 4).map((url, idx) => (
        <div key={idx} className="relative rounded-xl overflow-hidden border border-white/10">
          <img src={url} alt={`Collage ${idx}`} className="w-full h-full object-cover" crossOrigin="anonymous" />
          <span className="absolute top-1.5 left-1.5 w-4 h-4 rounded-full bg-black/70 backdrop-blur-md flex items-center justify-center text-[9px] font-bold text-amber-300 border border-white/20">
            {idx + 1}
          </span>
        </div>
      ))}
    </div>
  );
};
