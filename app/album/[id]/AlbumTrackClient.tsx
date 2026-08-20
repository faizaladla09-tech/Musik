'use client';

import { MoreVertical } from 'lucide-react';
import { usePlayerStore } from '@/lib/store';
import { MarqueeText } from '@/components/MarqueeText';

export default function AlbumTrackClient({ track, index, album, artistName }: { track: any, index: number, album: any, artistName: string }) {
  const playTrack = usePlayerStore((state) => state.playTrack);

  return (
    <div 
      className="flex items-center gap-4 py-2 cursor-pointer hover:bg-white/5 px-4 rounded-xl transition-colors"
      onClick={() => playTrack(track, album.songs)}
    >
      <div className="w-6 text-center text-white/60 font-medium">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <MarqueeText text={track.name} className="text-white font-medium text-base" />
        <MarqueeText 
          text={`${artistName}${track.duration ? ` • ${Math.floor(track.duration / 60)}:${Math.floor(track.duration % 60).toString().padStart(2, '0')}` : ''}`} 
          className="text-white/60 text-sm" 
        />
      </div>
      <button className="w-8 h-8 rounded-full liquid-glass-icon flex items-center justify-center text-white/60 hover:text-white transition-all">
        <MoreVertical className="w-4 h-4" />
      </button>
    </div>
  );
}
