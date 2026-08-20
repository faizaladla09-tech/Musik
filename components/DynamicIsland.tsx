'use client';

import React, { useState, useRef, useEffect, memo } from 'react';
import { usePlayerStore } from '@/lib/store';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Heart, 
  Maximize2,
  ChevronUp
} from 'lucide-react';
import { cn, getHighResImage, formatTime } from '@/lib/utils';
import { SmoothImage } from '@/components/SmoothImage';
import { db } from '@/lib/db';

function IslandProgressBar({ duration }: { duration: number }) {
  const progress = usePlayerStore((state) => state.progress);
  const setProgress = usePlayerStore((state) => state.setProgress);

  const percentage = duration > 0 ? Math.min(Math.max((progress / duration) * 100, 0), 100) : 0;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const ratio = clickX / rect.width;
    const newTime = ratio * duration;
    setProgress(newTime);
  };

  return (
    <div className="space-y-1">
      <div
        onClick={handleSeek}
        className="relative h-4 flex items-center cursor-pointer group"
      >
        <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-75"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <div className="flex justify-between text-[10px] text-white/50 font-mono tracking-tight px-0.5">
        <span>{formatTime(progress)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}

const MemoizedIslandProgressBar = memo(IslandProgressBar);

export function DynamicIsland() {
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const isExpanded = usePlayerStore((state) => state.isExpanded);
  const duration = usePlayerStore((state) => state.duration);
  const togglePlay = usePlayerStore((state) => state.togglePlay);
  const playNext = usePlayerStore((state) => state.playNext);
  const playPrev = usePlayerStore((state) => state.playPrev);
  const setExpanded = usePlayerStore((state) => state.setExpanded);

  const [isIslandExpanded, setIsIslandExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const islandRef = useRef<HTMLDivElement>(null);

  // Check liked state
  useEffect(() => {
    if (currentTrack) {
      db.isLiked(currentTrack.videoId).then(setIsLiked);
    }
  }, [currentTrack]);

  // Click outside to collapse expanded island
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (islandRef.current && !islandRef.current.contains(e.target as Node)) {
        setIsIslandExpanded(false);
      }
    };
    if (isIslandExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isIslandExpanded]);

  if (!currentTrack || isExpanded) return null;

  const thumbnail = getHighResImage(currentTrack.thumbnails?.[currentTrack.thumbnails.length - 1]?.url, 200);
  const artistName = Array.isArray(currentTrack.artist)
    ? currentTrack.artist.map((a) => a.name).join(', ')
    : currentTrack.artist?.name || 'Artis';

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentTrack) return;
    if (isLiked) {
      await db.removeLikedSong(currentTrack.videoId);
      setIsLiked(false);
    } else {
      await db.addLikedSong(currentTrack);
      setIsLiked(true);
    }
  };

  return (
    <div className="fixed top-2.5 left-0 right-0 z-[80] flex justify-center pointer-events-none px-4 select-none">
      <motion.div
        ref={islandRef}
        layout
        transition={{ type: 'spring', damping: 26, stiffness: 340 }}
        onClick={() => {
          if (!isIslandExpanded) setIsIslandExpanded(true);
        }}
        className={cn(
          'pointer-events-auto bg-black/95 backdrop-blur-2xl text-white border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.85)] cursor-pointer overflow-hidden transition-all duration-300',
          isIslandExpanded 
            ? 'w-full max-w-[370px] rounded-[36px] p-4.5 pt-4 pb-4' 
            : 'w-auto min-w-[190px] max-w-[240px] h-[38px] rounded-full px-2.5 py-1.5 flex items-center justify-between gap-2.5 hover:scale-[1.03] active:scale-[0.98]'
        )}
      >
        <AnimatePresence mode="wait">
          {isIslandExpanded ? (
            /* Expanded Dynamic Island (iPhone 17 Pro style) */
            <motion.div
              key="expanded-island"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full flex flex-col gap-3.5"
            >
              {/* Top Row: Artwork, Song Info & Actions */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="relative w-12 h-12 rounded-2xl overflow-hidden shrink-0 shadow-md border border-white/15 bg-white/5">
                    <SmoothImage
                      src={thumbnail}
                      alt={currentTrack.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-white truncate tracking-tight">
                      {currentTrack.name}
                    </h4>
                    <p className="text-xs text-white/60 truncate font-medium mt-0.5">
                      {artistName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={handleLike}
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <Heart className={cn('w-4 h-4', isLiked ? 'fill-[#FA243C] text-[#FA243C]' : 'text-white/80')} />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsIslandExpanded(false);
                      setExpanded(true);
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors"
                    title="Buka Pemutar Penuh"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </div>

              {/* Middle Row: Progress Bar & Timestamps */}
              <MemoizedIslandProgressBar duration={duration} />

              {/* Bottom Row: Control Buttons */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsIslandExpanded(false);
                  }}
                  className="text-[11px] font-semibold text-white/50 hover:text-white flex items-center gap-1 transition-colors px-2 py-1 rounded-lg"
                >
                  <ChevronUp className="w-3.5 h-3.5" /> Tutup
                </button>

                <div className="flex items-center gap-3">
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      playPrev();
                    }}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-colors"
                  >
                    <SkipBack className="w-4 h-4 fill-current" />
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlay();
                    }}
                    className="w-11 h-11 rounded-full flex items-center justify-center bg-white text-zinc-950 shadow-md font-bold"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 fill-current" />
                    ) : (
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    )}
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      playNext();
                    }}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-colors"
                  >
                    <SkipForward className="w-4 h-4 fill-current" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Compact Dynamic Island Pill */
            <motion.div
              key="compact-island"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full flex items-center justify-between gap-2"
            >
              {/* Left: Mini Spinning Album Art */}
              <div className="flex items-center gap-2 min-w-0">
                <div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0 border border-white/20">
                  <SmoothImage
                    src={thumbnail}
                    alt={currentTrack.name}
                    fill
                    sizes="24px"
                    className={cn('object-cover', isPlaying && 'animate-[spin_12s_linear_infinite]')}
                  />
                </div>
                <span className="text-[11px] font-bold text-white truncate max-w-[90px] sm:max-w-[120px]">
                  {currentTrack.name}
                </span>
              </div>

              {/* Right: Audio Wave Equalizer & Mini Play/Pause */}
              <div className="flex items-center gap-1.5 shrink-0">
                {isPlaying && (
                  <div className="flex items-end gap-0.5 h-3 px-1">
                    <div className="w-0.5 bg-[#81B29A] rounded-full eq-bar-1" />
                    <div className="w-0.5 bg-[#81B29A] rounded-full eq-bar-2" />
                    <div className="w-0.5 bg-[#81B29A] rounded-full eq-bar-3" />
                  </div>
                )}

                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                  className="w-6 h-6 rounded-full flex items-center justify-center bg-white/15 text-white hover:bg-white/25 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-3 h-3 fill-current" />
                  ) : (
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
