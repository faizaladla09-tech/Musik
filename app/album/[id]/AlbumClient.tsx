'use client';

import { Play, Shuffle, MoreVertical, Heart, BookmarkPlus, BookmarkCheck } from 'lucide-react';
import { usePlayerStore } from '@/lib/store';
import { db } from '@/lib/db';
import { useState, useEffect } from 'react';

export default function AlbumClient({ album }: { album: any }) {
  const playTrack = usePlayerStore((state) => state.playTrack);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const checkSaved = async () => {
      if (album?.albumId) {
        const saved = await db.isAlbumSaved(album.albumId);
        setIsSaved(saved);
      }
    };
    checkSaved();
  }, [album?.albumId]);

  const handleSaveAlbum = async () => {
    if (!album?.albumId) return;
    
    if (isSaved) {
      await db.removeSavedAlbum(album.albumId);
      setIsSaved(false);
    } else {
      await db.addSavedAlbum({
        albumId: album.albumId,
        name: album.name,
        artist: album.artist?.name || 'Unknown Artist',
        thumbnails: album.thumbnails || [],
        savedAt: Date.now()
      });
      setIsSaved(true);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <button 
        onClick={handleSaveAlbum}
        className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
        title={isSaved ? "Hapus dari Koleksi" : "Simpan ke Koleksi"}
      >
        {isSaved ? <BookmarkCheck className="w-5 h-5 text-[#81B29A]" /> : <BookmarkPlus className="w-5 h-5 text-white" />}
      </button>
      <button 
        className="w-16 h-16 bg-[#A3C9A8] rounded-full flex items-center justify-center hover:scale-105 transition-transform"
        onClick={() => album.songs.length > 0 && playTrack(album.songs[0], album.songs)}
      >
        <Play className="w-8 h-8 text-black fill-current ml-1" />
      </button>
      <button className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
        <MoreVertical className="w-5 h-5 text-white" />
      </button>
    </div>
  );
}
