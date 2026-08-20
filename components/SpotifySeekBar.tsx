'use client';

import { useState, useRef, useEffect } from 'react';
import { formatTime } from '@/lib/utils';

interface SpotifySeekBarProps {
  progress: number;
  duration: number;
  onSeek: (time: number) => void;
}

export function SpotifySeekBar({ progress, duration, onSeek }: SpotifySeekBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const currentProgress = isDragging ? dragProgress : progress;
  const percentage = duration > 0 ? Math.min(Math.max((currentProgress / duration) * 100, 0), 100) : 0;

  const calculateTimeFromEvent = (e: React.PointerEvent<HTMLDivElement> | PointerEvent) => {
    if (!barRef.current || duration <= 0) return 0;
    const rect = barRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const ratio = clickX / rect.width;
    return ratio * duration;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (duration <= 0) return;
    const newTime = calculateTimeFromEvent(e);
    setIsDragging(true);
    setDragProgress(newTime);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const newTime = calculateTimeFromEvent(e);
    setDragProgress(newTime);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    onSeek(dragProgress);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  return (
    <div 
      className="w-full select-none py-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Interactive Bar Container */}
      <div
        ref={barRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative h-6 flex items-center cursor-pointer touch-none group"
      >
        {/* Background Track */}
        <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden transition-all duration-150 group-hover:h-1.5">
          {/* Played Progress Bar */}
          <div
            className="h-full bg-white transition-all duration-75 group-hover:bg-white"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Scrubber Thumb (Spotify style) */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-md transition-all duration-150 pointer-events-none ${
            isDragging || isHovered ? 'scale-125 opacity-100' : 'opacity-100 scale-100'
          }`}
          style={{ left: `${percentage}%` }}
        />
      </div>

      {/* Elapsed and Total Time */}
      <div className="flex justify-between text-xs text-white/60 -mt-1 font-mono tracking-tight px-0.5">
        <span className="font-semibold text-white/80">{formatTime(currentProgress)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}
