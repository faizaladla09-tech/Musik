'use client';

import { useState, useEffect } from 'react';
import { usePlayerStore } from '@/lib/store';
import { db } from '@/lib/db';
import { X, Plus, Music, ListPlus, Check, FolderPlus, Sparkles, Search } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { getHighResImage } from '@/lib/utils';
import { MarqueeText } from './MarqueeText';

interface Playlist {
  id: string;
  name: string;
  img: string;
  tracks: any[];
}

export function AddToPlaylistModal() {
  const trackToAdd = usePlayerStore((state) => state.trackToAdd);
  const setTrackToAdd = usePlayerStore((state) => state.setTrackToAdd);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedPlaylistId, setAddedPlaylistId] = useState<string | null>(null);

  const loadPlaylists = async () => {
    const data = await db.getPlaylists();
    setPlaylists(data as Playlist[]);
  };

  useEffect(() => {
    if (trackToAdd) {
      loadPlaylists();
      setIsCreating(false);
      setNewPlaylistName('');
      setSearchQuery('');
      setAddedPlaylistId(null);
    }
  }, [trackToAdd]);

  const handleAddToPlaylist = async (playlist: Playlist) => {
    if (!trackToAdd) return;
    
    // Check if track already exists
    const alreadyExists = playlist.tracks.some(t => t.videoId === trackToAdd.videoId);
    if (alreadyExists) {
      setAddedPlaylistId(playlist.id);
      setTimeout(() => setTrackToAdd(null), 600);
      return;
    }

    const updatedPlaylist = {
      ...playlist,
      tracks: [...playlist.tracks, trackToAdd]
    };

    await db.addPlaylist(updatedPlaylist);
    setAddedPlaylistId(playlist.id);
    setTimeout(() => {
      setTrackToAdd(null);
    }, 500);
  };

  const handleCreateAndAdd = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newPlaylistName.trim() || !trackToAdd) return;

    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name: newPlaylistName.trim(),
      img: getHighResImage(trackToAdd.thumbnails?.[trackToAdd.thumbnails.length - 1]?.url, 400),
      tracks: [trackToAdd]
    };

    await db.addPlaylist(newPlaylist);
    setAddedPlaylistId(newPlaylist.id);
    setNewPlaylistName('');
    setIsCreating(false);
    setTimeout(() => {
      setTrackToAdd(null);
    }, 500);
  };

  if (!trackToAdd) return null;

  const filteredPlaylists = searchQuery.trim()
    ? playlists.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : playlists;

  const artistDisplay = Array.isArray(trackToAdd.artist)
    ? trackToAdd.artist.map(a => a.name).join(', ')
    : trackToAdd.artist?.name || 'Unknown Artist';

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md p-0 sm:p-4"
        onClick={() => setTrackToAdd(null)}
      >
        <motion.div 
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="liquid-glass w-full sm:max-w-md max-h-[85vh] rounded-t-[32px] sm:rounded-[32px] flex flex-col overflow-hidden border border-white/20 shadow-[0_-15px_50px_rgba(0,0,0,0.8)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top handle pill for mobile swipe affordance */}
          <div className="w-12 h-1.5 rounded-full bg-white/25 mx-auto mt-3 mb-1 sm:hidden" />

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-3 pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl liquid-glass-icon flex items-center justify-center text-[#81B29A]">
                <ListPlus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Tambahkan ke Playlist</h2>
                <p className="text-[11px] text-white/50">Simpan ke koleksi musik Anda</p>
              </div>
            </div>
            
            <button 
              onClick={() => setTrackToAdd(null)}
              className="w-9 h-9 rounded-full liquid-glass-icon flex items-center justify-center text-white/70 hover:text-white hover:rotate-90 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Selected Track Preview Card */}
          <div className="px-5 pt-3.5 pb-2">
            <div className="liquid-glass-subtle rounded-2xl p-3 flex items-center gap-3 border border-white/15 shadow-md">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/20 shadow-inner">
                <Image 
                  src={getHighResImage(trackToAdd.thumbnails?.[trackToAdd.thumbnails.length - 1]?.url, 200)} 
                  alt={trackToAdd.name} 
                  fill 
                  className="object-cover" 
                />
              </div>
              <div className="flex-1 min-w-0">
                <MarqueeText text={trackToAdd.name} className="text-white font-bold text-sm" />
                <MarqueeText 
                  text={artistDisplay} 
                  className="text-white/60 text-xs mt-0.5" 
                />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full bg-white/10 text-white/70 border border-white/10 shrink-0">
                Lagu Dipilih
              </span>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto px-5 py-2 space-y-3 no-scrollbar">
            {isCreating ? (
              <motion.form 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleCreateAndAdd}
                className="liquid-glass-subtle rounded-2xl p-4 space-y-3.5 border border-white/15 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <FolderPlus className="w-4 h-4 text-[#81B29A]" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Playlist Baru</span>
                </div>

                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Beri judul playlist..."
                  className="w-full liquid-glass rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#81B29A] transition-all border border-white/20"
                  autoFocus
                />

                <div className="flex gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white/70 liquid-glass-subtle hover:bg-white/10 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={!newPlaylistName.trim()}
                    className="flex-1 py-2.5 liquid-glass-green text-zinc-950 rounded-xl text-xs font-bold disabled:opacity-40 transition-all flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Buat & Simpan</span>
                  </button>
                </div>
              </motion.form>
            ) : (
              <button
                onClick={() => setIsCreating(true)}
                className="w-full flex items-center gap-3.5 p-3.5 liquid-glass-subtle hover:bg-white/15 rounded-2xl transition-all text-left group border border-white/15"
              >
                <div className="w-11 h-11 rounded-2xl liquid-glass-green flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-md">
                  <Plus className="w-5 h-5 text-zinc-950 stroke-[2.5]" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-white font-bold text-sm block">Buat Playlist Baru</span>
                  <span className="text-white/50 text-xs">Simpan ke playlist khusus</span>
                </div>
              </button>
            )}

            {/* Playlist search if multiple playlists */}
            {playlists.length > 3 && !isCreating && (
              <div className="relative">
                <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari playlist..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-white/20 transition-all"
                />
              </div>
            )}

            {/* Existing Playlists list */}
            <div className="space-y-2 pb-4">
              {playlists.length === 0 ? (
                <div className="liquid-glass-subtle rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3 border border-white/10 my-2">
                  <div className="w-12 h-12 rounded-2xl liquid-glass-icon flex items-center justify-center text-white/40">
                    <Music className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Belum Ada Playlist</h3>
                    <p className="text-xs text-white/50 mt-1 max-w-[240px]">
                      Klik tombol &ldquo;Buat Playlist Baru&rdquo; di atas untuk membuat koleksi pertamamu.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCreating(true)}
                    className="liquid-glass-button px-4 py-2 rounded-xl text-xs font-bold text-white mt-1"
                  >
                    + Buat Sekarang
                  </button>
                </div>
              ) : filteredPlaylists.length === 0 ? (
                <div className="text-center py-6 text-white/40 text-xs">
                  Tidak ditemukan playlist &ldquo;{searchQuery}&rdquo;
                </div>
              ) : (
                filteredPlaylists.map(playlist => {
                  const isTrackInThisPlaylist = playlist.tracks.some(t => t.videoId === trackToAdd.videoId);
                  const isJustAdded = addedPlaylistId === playlist.id;

                  return (
                    <button
                      key={playlist.id}
                      onClick={() => handleAddToPlaylist(playlist)}
                      className={`w-full flex items-center gap-3.5 p-3 rounded-2xl transition-all text-left border ${
                        isTrackInThisPlaylist || isJustAdded
                          ? 'bg-[#81B29A]/15 border-[#81B29A]/40'
                          : 'liquid-glass-subtle hover:bg-white/10 border-white/10'
                      }`}
                    >
                      <div className="relative w-12 h-12 bg-white/5 rounded-xl overflow-hidden flex items-center justify-center shrink-0 border border-white/10">
                        {playlist.img ? (
                          <Image src={playlist.img} alt={playlist.name} fill className="object-cover" />
                        ) : (
                          <Music className="w-5 h-5 text-white/40" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <MarqueeText text={playlist.name} className="text-white font-bold text-sm" />
                        <div className="text-white/50 text-xs mt-0.5">{playlist.tracks.length} lagu</div>
                      </div>

                      {isJustAdded || isTrackInThisPlaylist ? (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#81B29A] text-zinc-950 text-[11px] font-bold shrink-0 shadow-sm animate-in zoom-in-50 duration-200">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Tersimpan</span>
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full liquid-glass-icon flex items-center justify-center text-white/70 hover:text-white shrink-0">
                          <Plus className="w-4 h-4" />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
