'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { usePlayerStore, Track } from '@/lib/store';
import { Play, ArrowLeft, Radio, Music, Trash2, BookmarkPlus, BookmarkCheck, Shuffle } from 'lucide-react';
import { SmoothImage } from '@/components/SmoothImage';
import { TrackItem } from '@/components/TrackItem';
import { PlaylistSkeleton } from '@/components/PlaylistSkeleton';
import { MarqueeText } from '@/components/MarqueeText';
import { ConfirmModal } from '@/components/FeedbackModals';
import { motion, Variants } from 'motion/react';

interface Playlist {
  id: string;
  name: string;
  img: string;
  tracks: Track[];
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', damping: 24, stiffness: 280 },
  },
};

export default function PlaylistPage() {
  const params = useParams();
  const router = useRouter();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [deletePlaylistTarget, setDeletePlaylistTarget] = useState(false);
  const [removeSongTarget, setRemoveSongTarget] = useState<Track | null>(null);
  const [savePlaylistTarget, setSavePlaylistTarget] = useState(false);
  const playTrack = usePlayerStore((state) => state.playTrack);

  useEffect(() => {
    const loadPlaylist = async () => {
      if (!params.id) return;
      try {
        const id = String(params.id);
        const data = await db.getPlaylist(id);
        if (data) {
          setPlaylist(data as Playlist);
          setIsSaved(true);
        } else {
          // Try fetching from YouTube Music API
          const res = await fetch(`/api/ytplaylist?id=${encodeURIComponent(id)}`);
          if (res.ok) {
            const ytData = await res.json();
            const tracks = ytData.videos || ytData.songs || [];
            if (tracks.length > 0 || ytData.name) {
              setPlaylist({
                id: ytData.playlistId || ytData.id || id,
                name: ytData.name || ytData.title || 'Playlist',
                img: ytData.thumbnails?.[ytData.thumbnails.length - 1]?.url || '',
                tracks: tracks
              });
              setIsSaved(false);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load playlist:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPlaylist();

    const handlePlaylistsUpdated = () => {
      loadPlaylist();
    };

    window.addEventListener('playlistsUpdated', handlePlaylistsUpdated);
    
    return () => {
      window.removeEventListener('playlistsUpdated', handlePlaylistsUpdated);
    };
  }, [params.id]);

  if (loading) {
    return <PlaylistSkeleton />;
  }

  if (!playlist) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white p-4 text-center">
        <p className="font-bold text-lg mb-2">Playlist tidak ditemukan</p>
        <button 
          onClick={() => router.back()} 
          className="mt-2 px-6 py-2.5 bg-white text-zinc-950 rounded-full font-bold text-xs hover:bg-zinc-100 transition-all shadow-lg"
        >
          Kembali
        </button>
      </div>
    );
  }

  const handlePlayAll = () => {
    if (playlist.tracks.length > 0) {
      playTrack(playlist.tracks[0], playlist.tracks, 'playlist');
    }
  };

  const handleShuffle = () => {
    if (playlist.tracks.length > 0) {
      const shuffled = [...playlist.tracks].sort(() => Math.random() - 0.5);
      playTrack(shuffled[0], shuffled, 'playlist');
    }
  };

  const handleRadio = () => {
    if (playlist.tracks.length > 0) {
      playTrack(playlist.tracks[0], [], 'similar');
    }
  };

  const handleDeletePlaylist = async () => {
    setDeletePlaylistTarget(true);
  };

  const confirmDeletePlaylist = async () => {
    if (playlist) {
      await db.deletePlaylist(playlist.id);
      router.back();
    }
  };

  const handleRemoveSong = async (trackToRemove: Track) => {
    setRemoveSongTarget(trackToRemove);
  };

  const confirmRemoveSong = async () => {
    if (playlist && removeSongTarget) {
      const updatedTracks = playlist.tracks.filter(t => t.videoId !== removeSongTarget.videoId);
      const updatedPlaylist = { ...playlist, tracks: updatedTracks };
      await db.addPlaylist(updatedPlaylist);
      setPlaylist(updatedPlaylist);
      setRemoveSongTarget(null);
    }
  };

  const handleSavePlaylist = async () => {
    if (isSaved) {
      setSavePlaylistTarget(true);
    } else {
      if (playlist) {
        await db.addPlaylist(playlist);
        setIsSaved(true);
      }
    }
  };

  const confirmSavePlaylist = async () => {
    if (playlist) {
      await db.deletePlaylist(playlist.id);
      setIsSaved(false);
    }
    setSavePlaylistTarget(false);
  };

  const isSelfCreated = /^\d+$/.test(playlist.id);

  return (
    <main className="min-h-screen pb-32 overflow-x-hidden">
      {/* Sticky Glass Top Header */}
      <div className="sticky top-0 z-10 bg-black/50 backdrop-blur-md px-4 py-4 flex items-center justify-between">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.back()} 
          className="w-10 h-10 rounded-full liquid-glass-icon flex items-center justify-center text-white shadow-md"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
        <span className="text-xs font-bold uppercase tracking-wider text-white/50">Playlist</span>
        <div className="w-10" />
      </div>

      {/* Hero Header */}
      <div className="px-4 pt-2 pb-6 flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 24, stiffness: 260 }}
          className="w-48 h-48 sm:w-60 sm:h-60 rounded-3xl overflow-hidden shadow-2xl mb-5 relative bg-white/5 flex items-center justify-center border border-white/10"
        >
          {playlist.img ? (
            <SmoothImage src={playlist.img} alt={playlist.name} fill sizes="(max-width: 640px) 100vw, 300px" priority className="object-cover" />
          ) : (
            <Music className="w-20 h-20 text-white/20" />
          )}
        </motion.div>
        
        <div className="w-full max-w-md mb-1.5">
          <MarqueeText text={playlist.name} className="text-2xl sm:text-3xl font-black text-white text-center tracking-tight" />
        </div>
        <p className="text-white/60 text-xs sm:text-sm mb-6">{playlist.tracks.length} lagu di Musicfly</p>

        {/* Action Controls */}
        <div className="flex items-center gap-3 w-full justify-center flex-wrap">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayAll}
            disabled={playlist.tracks.length === 0}
            className="h-12 px-6 bg-white text-zinc-950 rounded-full font-bold text-xs flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
            title="Putar Semua"
          >
            <Play className="w-4 h-4 fill-current ml-0.5" />
            <span>Putar Semua</span>
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShuffle}
            disabled={playlist.tracks.length === 0}
            className="w-12 h-12 rounded-full liquid-glass border border-white/15 flex items-center justify-center text-white disabled:opacity-50 shadow-md"
            title="Acak Lagu"
          >
            <Shuffle className="w-4 h-4 text-white" />
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRadio}
            disabled={playlist.tracks.length === 0}
            className="w-12 h-12 rounded-full liquid-glass border border-white/15 flex items-center justify-center text-white disabled:opacity-50 shadow-md"
            title="Radio Playlist"
          >
            <Radio className="w-4 h-4 text-[#81B29A]" />
          </motion.button>

          {!isSelfCreated && (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSavePlaylist}
              className="w-12 h-12 rounded-full liquid-glass border border-white/15 flex items-center justify-center text-white shadow-md"
              title={isSaved ? "Hapus dari Koleksi" : "Simpan ke Koleksi"}
            >
              {isSaved ? <BookmarkCheck className="w-5 h-5 text-[#81B29A]" /> : <BookmarkPlus className="w-5 h-5 text-white" />}
            </motion.button>
          )}

          {isSelfCreated && isSaved && (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDeletePlaylist}
              className="w-12 h-12 rounded-full liquid-glass border border-white/15 flex items-center justify-center text-white hover:text-red-400 shadow-md"
              title="Hapus Playlist"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Tracks List with Spring Animations */}
      <div className="px-4 max-w-3xl mx-auto">
        {playlist.tracks.length === 0 ? (
          <div className="text-center text-white/50 py-12 rounded-2xl liquid-glass-subtle border border-dashed border-white/10 p-6">
            <Music className="w-10 h-10 text-white/20 mx-auto mb-2" />
            <p className="font-bold text-white text-sm">Belum ada lagu di playlist ini</p>
            <p className="text-xs text-white/50 mt-1">Cari lagu dan ketuk tombol menu untuk menambahkannya ke sini.</p>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-1 border-t border-white/10 pt-4"
          >
            {playlist.tracks.map((track, index) => (
              <motion.div key={`${track.videoId}-${index}`} variants={itemVariants}>
                <TrackItem 
                  track={track} 
                  queue={playlist.tracks} 
                  onRemove={isSelfCreated ? handleRemoveSong : undefined}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <ConfirmModal
        isOpen={deletePlaylistTarget}
        title="Hapus Playlist"
        message="Apakah Anda yakin ingin menghapus playlist ini?"
        onConfirm={confirmDeletePlaylist}
        onCancel={() => setDeletePlaylistTarget(false)}
      />

      <ConfirmModal
        isOpen={!!removeSongTarget}
        title="Hapus Lagu"
        message="Hapus lagu ini dari playlist?"
        onConfirm={confirmRemoveSong}
        onCancel={() => setRemoveSongTarget(null)}
      />

      <ConfirmModal
        isOpen={savePlaylistTarget}
        title="Hapus dari Koleksi"
        message="Apakah Anda yakin ingin menghapus playlist ini dari koleksi?"
        onConfirm={confirmSavePlaylist}
        onCancel={() => setSavePlaylistTarget(false)}
      />
    </main>
  );
}
