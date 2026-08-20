'use client';

import React, { useState, useEffect, memo } from 'react';
import { Play, Radio, Check, PlusSquare } from 'lucide-react';
import { SmoothImage } from '@/components/SmoothImage';
import { useRouter } from 'next/navigation';
import { usePlayerStore, Track } from '@/lib/store';
import { db } from '@/lib/db';
import { MarqueeText } from './MarqueeText';

interface PlaylistData {
  playlistId: string;
  name: string;
  thumbnails: { url: string; width: number; height: number }[];
  videos: Track[];
}

function CommunityPlaylistCardComponent({ playlistId }: { playlistId: string }) {
  const [playlist, setPlaylist] = useState<PlaylistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const router = useRouter();
  const playTrack = usePlayerStore((state) => state.playTrack);

  useEffect(() => {
    const controller = new AbortController();
    
    const fetchPlaylist = async () => {
      try {
        const res = await fetch(`/api/ytplaylist?id=${encodeURIComponent(playlistId)}`, {
          signal: controller.signal
        });
        if (!res.ok) {
          setPlaylist(null);
          return;
        }
        
        const data = await res.json();
        const videos = data.videos || data.songs || [];
        if (videos.length === 0) {
          setPlaylist(null);
          return;
        }

        setPlaylist({
          ...data,
          videos
        });
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.warn('Failed to fetch community playlist:', error?.message || error);
          setPlaylist(null);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlaylist();

    return () => {
      controller.abort();
    };
  }, [playlistId]);

  if (loading) {
    return (
      <div className="w-[320px] bg-[#1C1C1E] rounded-3xl p-5 shrink-0 snap-center flex flex-col animate-pulse">
        <div className="flex gap-4 mb-6">
          <div className="w-24 h-24 rounded-2xl bg-white/10 shrink-0" />
          <div className="flex flex-col justify-center flex-1">
            <div className="h-5 w-3/4 bg-white/10 rounded-md mb-2" />
            <div className="h-4 w-1/2 bg-white/10 rounded-md" />
          </div>
        </div>

        <div className="flex-1 space-y-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-white/10 shrink-0" />
              <div className="flex flex-col flex-1 gap-2">
                <div className="h-4 w-full bg-white/10 rounded-md" />
                <div className="h-3 w-2/3 bg-white/10 rounded-md" />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex gap-3">
            <div className="w-12 h-12 rounded-full bg-white/10" />
            <div className="w-12 h-12 rounded-full bg-white/10" />
          </div>
          <div className="w-12 h-12 rounded-full bg-white/10" />
        </div>
      </div>
    );
  }

  if (!playlist) {
    return null;
  }

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playlist.videos && playlist.videos.length > 0) {
      playTrack(playlist.videos[0], playlist.videos, 'playlist');
    }
  };

  const handleAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!added) {
      await db.addPlaylist({
        id: playlist.playlistId,
        name: playlist.name,
        img: playlist.thumbnails?.[playlist.thumbnails.length - 1]?.url || '',
        tracks: playlist.videos || []
      });
      setAdded(true);
    }
  };

  const handleRadio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playlist.videos && playlist.videos.length > 0) {
      playTrack(playlist.videos[0], [], 'similar');
    }
  };

  const handleClick = () => {
    router.push(`/playlist/${playlist.playlistId}`);
  };

  const displayTracks = playlist.videos?.slice(0, 3) || [];

  return (
    <div 
      onClick={handleClick}
      className="w-[320px] bg-[#1C1C1E] rounded-3xl p-5 shrink-0 snap-center cursor-pointer hover:bg-[#2C2C2E] transition-colors flex flex-col"
    >
      <div className="flex gap-4 mb-6">
        <div className="w-24 h-24 rounded-2xl overflow-hidden relative shrink-0 shadow-lg bg-black/20">
          {playlist.videos && playlist.videos.length >= 4 ? (
            <div className="grid grid-cols-2 grid-rows-2 w-full h-full">
              {playlist.videos.slice(0, 4).map((track, i) => (
                <div key={i} className="relative w-full h-full bg-white/5">
                  <SmoothImage 
                    src={track.thumbnails?.[track.thumbnails.length - 1]?.url || '/placeholder.png'} 
                    alt={track.name} 
                    fill 
                    sizes="48px" 
                    className="object-cover" 
                  />
                </div>
              ))}
            </div>
          ) : (
            <SmoothImage 
              src={playlist.thumbnails?.[playlist.thumbnails.length - 1]?.url || '/placeholder.png'} 
              alt={playlist.name} 
              fill 
              sizes="96px" 
              className="object-cover" 
            />
          )}
        </div>
        <div className="flex flex-col justify-center min-w-0 flex-1">
          <MarqueeText text={playlist.name} className="text-white font-bold text-lg leading-tight mb-1" />
          <p className="text-white/50 text-sm">{playlist.videos?.length || 0} lagu</p>
        </div>
      </div>

      <div className="flex-1 space-y-4 mb-6">
        {displayTracks.map((track, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden relative shrink-0 bg-white/5">
              <SmoothImage 
                src={track.thumbnails?.[track.thumbnails.length - 1]?.url || '/placeholder.png'} 
                alt={track.name} 
                fill 
                sizes="48px" 
                className="object-cover" 
              />
            </div>
            <div className="flex flex-col overflow-hidden min-w-0 flex-1">
              <MarqueeText text={track.name} className="text-white text-[15px] font-medium" />
              <MarqueeText 
                text={Array.isArray(track.artist) ? track.artist.map(a => a.name).join(', ') : track.artist?.name || 'Unknown Artist'} 
                className="text-white/50 text-sm" 
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mt-auto">
        <button 
          onClick={handlePlay}
          className="w-13 h-13 liquid-glass-green rounded-full flex items-center justify-center hover:scale-105 transition-all shadow-lg"
          title="Putar Playlist"
        >
          <Play className="w-6 h-6 text-zinc-950 fill-current ml-0.5" />
        </button>
        <button 
          onClick={handleRadio}
          className="w-13 h-13 rounded-full liquid-glass-icon flex items-center justify-center hover:scale-105 transition-all text-white"
          title="Radio Playlist"
        >
          <Radio className="w-5 h-5 text-white" />
        </button>
        <button 
          onClick={handleAdd}
          className="w-13 h-13 rounded-full liquid-glass-icon flex items-center justify-center hover:scale-105 transition-all text-white"
          title={added ? "Tersimpan" : "Simpan Playlist"}
        >
          {added ? <Check className="w-5 h-5 text-[#81B29A]" /> : <PlusSquare className="w-5 h-5 text-white" />}
        </button>
      </div>
    </div>
  );
}

export const CommunityPlaylistCard = memo(CommunityPlaylistCardComponent);
