'use client';

import React, { memo } from 'react';
import { Track, usePlayerStore } from '@/lib/store';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { SmoothImage } from '@/components/SmoothImage';
import { getHighResImage } from '@/lib/utils';
import { MarqueeText } from './MarqueeText';
import { motion } from 'motion/react';

interface TrackItemProps {
  track: Track;
  queue?: Track[];
  onRemove?: (track: Track) => void;
}

function TrackItemComponent({ track, queue, onRemove }: TrackItemProps) {
  const playTrack = usePlayerStore((state) => state.playTrack);
  const isCurrent = usePlayerStore((state) => state.currentTrack?.videoId === track.videoId);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const setTrackToAdd = usePlayerStore((state) => state.setTrackToAdd);

  const thumbnail = getHighResImage(track.thumbnails?.[track.thumbnails.length - 1]?.url, 200);
  const artistName = Array.isArray(track.artist) 
    ? track.artist.map(a => a.name).join(', ') 
    : track.artist?.name || 'Unknown Artist';

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className={`flex items-center p-2.5 rounded-2xl cursor-pointer group transition-all border ${
        isCurrent 
          ? 'bg-[#81B29A]/12 border-[#81B29A]/30 shadow-md' 
          : 'border-transparent hover:bg-white/5 hover:border-white/10'
      }`}
      onClick={() => playTrack(track, queue)}
    >
      {/* Thumbnail with Equalizer Overlay */}
      <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-white/5 border border-white/10 shadow-sm">
        <SmoothImage src={thumbnail} alt={track.name} fill sizes="48px" className="object-cover" />
        {isCurrent && isPlaying && (
          <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] flex items-center justify-center">
            <div className="flex gap-0.5 items-end h-4">
              <div className="w-1 bg-[#81B29A] rounded-full eq-bar-1" />
              <div className="w-1 bg-[#81B29A] rounded-full eq-bar-2" />
              <div className="w-1 bg-[#81B29A] rounded-full eq-bar-3" />
              <div className="w-1 bg-[#81B29A] rounded-full eq-bar-4" />
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="ml-3.5 flex-1 min-w-0">
        <MarqueeText 
          text={track.name} 
          className={`font-bold text-sm ${isCurrent ? 'text-[#81B29A]' : 'text-white'}`} 
        />
        <MarqueeText 
          text={artistName} 
          className="text-xs text-white/60 mt-0.5" 
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 shrink-0 ml-2">
        {onRemove && (
          <button 
            className="w-8 h-8 rounded-full liquid-glass-icon text-white/60 hover:text-red-400 transition-all"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(track);
            }}
            title="Hapus lagu"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
        <button 
          className="w-8 h-8 rounded-full liquid-glass-icon text-white/70 hover:text-white transition-all"
          onClick={(e) => {
            e.stopPropagation();
            setTrackToAdd(track);
          }}
          title="Opsi lagu"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

export const TrackItem = memo(TrackItemComponent);
