'use client';

import { Play, Shuffle, BookmarkPlus, BookmarkCheck } from 'lucide-react';
import { usePlayerStore } from '@/lib/store';
import { db } from '@/lib/db';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

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

  const handleShuffle = () => {
    if (album?.songs?.length > 0) {
      const shuffled = [...album.songs].sort(() => Math.random() - 0.5);
      playTrack(shuffled[0], shuffled, 'playlist');
    }
  };

  return (
    <div className="flex items-center gap-3 justify-center">
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleSaveAlbum}
        className="w-12 h-12 rounded-full liquid-glass border border-white/15 flex items-center justify-center text-white shadow-md"
        title={isSaved ? "Hapus dari Koleksi" : "Simpan ke Koleksi"}
      >
        {isSaved ? <BookmarkCheck className="w-5 h-5 text-[#81B29A]" /> : <BookmarkPlus className="w-5 h-5 text-white" />}
      </motion.button>

      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="h-12 px-7 bg-white text-zinc-950 rounded-full font-bold text-xs flex items-center justify-center gap-2 shadow-xl"
        onClick={() => album?.songs?.length > 0 && playTrack(album.songs[0], album.songs, 'playlist')}
        title="Putar Album"
      >
        <Play className="w-4 h-4 fill-current ml-0.5" />
        <span>Putar Album</span>
      </motion.button>

      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleShuffle}
        className="w-12 h-12 rounded-full liquid-glass border border-white/15 flex items-center justify-center text-white shadow-md"
        title="Acak Album"
      >
        <Shuffle className="w-4 h-4" />
      </motion.button>
    </div>
  );
}
