'use client';

import React, { memo } from 'react';
import { Track, usePlayerStore } from '@/lib/store';
import { SmoothImage } from '@/components/SmoothImage';
import { getHighResImage } from '@/lib/utils';
import { Play, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { MarqueeText } from './MarqueeText';
import { useRouter } from 'next/navigation';

interface HorizontalScrollProps {
  title: string;
  tracks: Track[];
}

function HorizontalScrollComponent({ title, tracks }: HorizontalScrollProps) {
  const playTrack = usePlayerStore((state) => state.playTrack);
  const router = useRouter();

  let headerContent = (
    <div className="flex items-center justify-between mb-3.5 px-4">
      <h2 className="text-xl font-extrabold text-white tracking-tight">{title}</h2>
    </div>
  );

  if (title.startsWith('Serupa dengan ')) {
    const mainTitle = title.replace('Serupa dengan ', '');
    const headerImage = getHighResImage(tracks[0]?.thumbnails?.[0]?.url, 100);
    
    let artistId = '';
    for (const track of tracks) {
      if (track.artist && !Array.isArray(track.artist) && track.artist.artistId) {
        artistId = track.artist.artistId;
        break;
      } else if (Array.isArray(track.artist) && track.artist[0]?.artistId) {
        artistId = track.artist[0].artistId;
        break;
      }
    }

    const handleHeaderClick = () => {
      if (artistId) {
        router.push(`/artist/${artistId}`);
      } else {
        router.push(`/search?q=${encodeURIComponent(mainTitle)}`);
      }
    };

    headerContent = (
      <div 
        className="flex items-center justify-between mb-4 px-4 cursor-pointer group"
        onClick={handleHeaderClick}
      >
        <div className="flex items-center gap-3.5">
          {headerImage && (
            <div className="w-13 h-13 rounded-2xl overflow-hidden relative shrink-0 bg-white/5 border border-white/15 shadow-md">
              <SmoothImage src={headerImage} alt={mainTitle} fill className="object-cover" />
            </div>
          )}
          <div className="flex flex-col justify-center">
            <span className="text-xs text-[#81B29A] font-bold uppercase tracking-wider">Serupa dengan</span>
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight tracking-tight group-hover:text-[#81B29A] transition-colors">{mainTitle}</h2>
          </div>
        </div>
        <button className="w-10 h-10 rounded-full liquid-glass-icon text-white/80 group-hover:text-white shadow-md">
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="mb-8">
      {headerContent}
      <div className="flex overflow-x-auto no-scrollbar gap-3.5 px-4 pr-8 pb-3 snap-x snap-mandatory scroll-smooth w-full">
        {tracks.map((track, i) => {
          const thumbnail = getHighResImage(track.thumbnails?.[track.thumbnails.length - 1]?.url, 400);
          const artistName = Array.isArray(track.artist) ? track.artist.map(a => a.name).join(', ') : track.artist?.name || 'Unknown Artist';

          return (
            <motion.div
              key={`${track.videoId}-${i}`}
              initial={{ opacity: 0, scale: 0.94 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.05 }}
              whileTap={{ scale: 0.94 }}
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', damping: 20, stiffness: 260 }}
              className="flex-none w-36 sm:w-40 cursor-pointer group snap-start"
              onClick={() => playTrack(track, tracks)}
            >
              <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-2xl overflow-hidden mb-2.5 shadow-lg bg-white/5 border border-white/10 group-hover:border-white/20 transition-all">
                <SmoothImage src={thumbnail} alt={track.name} fill sizes="160px" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                  <div className="w-12 h-12 bg-white text-zinc-950 rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>
              </div>
              <MarqueeText text={track.name} className="text-xs sm:text-sm font-bold text-white leading-tight" />
              <MarqueeText text={artistName} className="text-[11px] sm:text-xs text-white/60 mt-0.5" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export const HorizontalScroll = memo(HorizontalScrollComponent);
