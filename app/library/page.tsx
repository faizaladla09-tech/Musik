'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db, SubscribedArtist, SavedAlbum } from '@/lib/db';
import { Track } from '@/lib/store';
import { TrackItem } from '@/components/TrackItem';
import { Heart, Plus, ListMusic, Trash2, Play, Download, TrendingUp, Clock, UploadCloud, Radio, Music } from 'lucide-react';
import { SmoothImage } from '@/components/SmoothImage';
import { usePlayerStore } from '@/lib/store';
import { motion, AnimatePresence, Variants } from 'motion/react';
import { MarqueeText } from '@/components/MarqueeText';
import { ConfirmModal, AlertModal } from '@/components/FeedbackModals';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
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

export default function Library() {
  const router = useRouter();
  const [likedSongs, setLikedSongs] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [savedAlbums, setSavedAlbums] = useState<SavedAlbum[]>([]);
  const [subscribedArtists, setSubscribedArtists] = useState<SubscribedArtist[]>([]);
  const [activeTab, setActiveTab] = useState('Daftar putar');
  const [showCreate, setShowCreate] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistImg, setNewPlaylistImg] = useState('');
  const [importUrl, setImportUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<{ title?: string, message: string } | null>(null);
  const playTrack = usePlayerStore((state) => state.playTrack);

  const tabs = ['Daftar putar', 'Lagu', 'Album', 'Artis'];

  const loadLibrary = async () => {
    const liked = await db.getLikedSongs();
    const pl = await db.getPlaylists();
    const sa = await db.getSubscribedArtists();
    const albums = await db.getSavedAlbums();
    setLikedSongs(liked);
    setPlaylists(pl);
    setSubscribedArtists(sa);
    setSavedAlbums(albums);
  };

  useEffect(() => {
    loadLibrary();

    const handlePlaylistsUpdated = () => {
      loadLibrary();
    };

    window.addEventListener('playlistsUpdated', handlePlaylistsUpdated);
    
    return () => {
      window.removeEventListener('playlistsUpdated', handlePlaylistsUpdated);
    };
  }, []);

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    const newPlaylist = {
      id: Date.now().toString(),
      name: newPlaylistName,
      img: newPlaylistImg || 'https://picsum.photos/seed/playlist/200/200',
      tracks: [],
    };
    await db.addPlaylist(newPlaylist);
    setShowCreate(false);
    setNewPlaylistName('');
    setNewPlaylistImg('');
    loadLibrary();
  };

  const handleDeletePlaylist = async (id: string) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      await db.deletePlaylist(deleteTarget);
      loadLibrary();
      setDeleteTarget(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPlaylistImg(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const extractPlaylistId = (url: string) => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.searchParams.get('list');
    } catch {
      return url;
    }
  };

  const handleImportPlaylistUrl = async () => {
    if (!importUrl.trim()) return;
    setIsImporting(true);
    
    try {
      const listId = extractPlaylistId(importUrl);
      if (!listId) {
        setAlertMessage({ title: 'Gagal', message: 'Invalid playlist URL atau ID tidak ditemukan.' });
        setIsImporting(false);
        return;
      }

      const res = await fetch(`/api/ytplaylist?id=${encodeURIComponent(listId)}`);
      if (!res.ok) throw new Error('Failed to fetch playlist');
      
      const data = await res.json();
      
      const newPlaylist = {
        id: Date.now().toString(),
        name: data.name || data.title || 'Imported Playlist',
        img: data.thumbnails?.[data.thumbnails.length - 1]?.url || 'https://picsum.photos/seed/playlist/200/200',
        tracks: data.videos || data.tracks || [],
      };
      
      await db.addPlaylist(newPlaylist);
      setShowImport(false);
      setImportUrl('');
      loadLibrary();
      setAlertMessage({ title: 'Sukses', message: 'Playlist berhasil diimpor ke Musicfly!' });
    } catch (error) {
      console.error(error);
      setAlertMessage({ title: 'Gagal', message: 'Gagal mengimpor playlist. Pastikan link valid dan dapat diakses publik.' });
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsImporting(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const data = JSON.parse(reader.result as string);
          
          let tracks = [];
          let name = 'Imported JSON Playlist';
          let img = 'https://picsum.photos/seed/playlist/200/200';
          
          if (Array.isArray(data)) {
             tracks = data;
          } else if (data.tracks || data.videos) {
             tracks = data.tracks || data.videos;
             name = data.name || data.title || name;
             if (data.thumbnails && data.thumbnails.length > 0) {
                 img = data.thumbnails[data.thumbnails.length - 1].url;
             } else if (data.img) {
                 img = data.img;
             }
          }
          
          const newPlaylist = {
            id: Date.now().toString(),
            name,
            img,
            tracks: tracks,
          };
          
          await db.addPlaylist(newPlaylist);
          setShowImport(false);
          loadLibrary();
          setAlertMessage({ title: 'Sukses', message: 'Playlist berhasil diimpor dari file JSON!' });
        } catch {
          setAlertMessage({ title: 'Gagal', message: 'Format JSON tidak valid atau gagal dibaca.' });
        } finally {
          setIsImporting(false);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <main className="min-h-screen pt-4 px-4 pb-32 overflow-x-hidden">
      {/* Header Tabs */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 mb-5 snap-x snap-mandatory scroll-smooth -mx-4 px-4 pr-12 w-[calc(100%+2rem)]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab)}
              whileTap={{ scale: 0.94 }}
              className={`relative whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all snap-center shadow-sm ${
                isActive 
                  ? 'bg-white text-zinc-950 shadow-md shadow-white/10' 
                  : 'liquid-glass-pill text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="libraryActiveTabIndicator"
                  className="absolute inset-0 bg-white rounded-full -z-10"
                  transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                />
              )}
              <span className="relative z-10">{tab}</span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'Daftar putar' && (
          <motion.div 
            key="tab-playlists"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {/* Quick Access Badges */}
            <div className="grid grid-cols-2 gap-2.5">
              <motion.div 
                variants={itemVariants}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 p-3 rounded-2xl liquid-glass border border-white/10 hover:bg-white/10 cursor-pointer transition-all group" 
                onClick={() => setActiveTab('Lagu')}
              >
                <div className="w-10 h-10 rounded-xl liquid-glass-icon flex items-center justify-center shrink-0 text-[#FA243C]">
                  <Heart className="w-5 h-5 fill-current" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-white font-bold text-xs">Lagu Disukai</h3>
                  <p className="text-white/50 text-[11px] truncate">{likedSongs.length} lagu</p>
                </div>
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push('/top50')}
                className="flex items-center gap-3 p-3 rounded-2xl liquid-glass border border-white/10 hover:bg-white/10 cursor-pointer transition-all group"
              >
                <div className="w-10 h-10 rounded-xl liquid-glass-icon flex items-center justify-center shrink-0 text-[#81B29A]">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-white font-bold text-xs">Top 50 Saya</h3>
                  <p className="text-white/50 text-[11px] truncate">Paling sering diputar</p>
                </div>
              </motion.div>
            </div>

            <motion.div 
              variants={itemVariants}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/history')}
              className="flex items-center gap-3 p-3 rounded-2xl liquid-glass-subtle border border-white/10 hover:bg-white/10 cursor-pointer transition-all"
            >
              <div className="w-10 h-10 rounded-xl liquid-glass-icon flex items-center justify-center shrink-0 text-white">
                <Clock className="w-5 h-5 text-white/80" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-xs">Riwayat Putar / Cache</h3>
                <p className="text-white/50 text-[11px]">Trek yang baru saja diputar</p>
              </div>
            </motion.div>

            {/* Action Buttons: Create & Import */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <motion.button
                variants={itemVariants}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowCreate(true)}
                className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-100 transition-all shadow-lg"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Buat Playlist</span>
              </motion.button>

              <motion.button
                variants={itemVariants}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowImport(true)}
                className="flex items-center justify-center gap-2 p-3 rounded-2xl liquid-glass border border-white/15 text-white font-bold text-xs hover:bg-white/15 transition-all shadow-sm"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Impor Playlist</span>
              </motion.button>
            </div>

            {/* Playlists List */}
            <div className="space-y-2 pt-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-white/70 px-1">Daftar Putar Anda ({playlists.length})</h2>
              {playlists.map((pl) => (
                <motion.div 
                  key={pl.id} 
                  variants={itemVariants}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="flex items-center gap-3.5 p-3 rounded-2xl liquid-glass border border-white/10 hover:bg-white/10 cursor-pointer transition-all group shadow-sm"
                  onClick={() => router.push(`/playlist/${pl.id}`)}
                >
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-white/5 shadow-md">
                    <SmoothImage src={pl.img} alt={pl.name} fill sizes="144px" className="object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (pl.tracks.length > 0) playTrack(pl.tracks[0], pl.tracks, 'playlist');
                        }}
                        className="w-8 h-8 liquid-glass-button bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                      >
                        <Play className="w-4 h-4 ml-0.5 fill-current" />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <MarqueeText text={pl.name} className="text-white font-bold text-sm" />
                    <p className="text-white/50 text-xs mt-0.5">{pl.tracks.length} lagu</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const cleanPl = {
                        id: pl.id,
                        name: pl.name,
                        img: pl.img,
                        tracks: pl.tracks?.map((t: any) => ({
                          videoId: t.videoId,
                          name: t.name,
                          artist: t.artist,
                          duration: t.duration,
                          thumbnails: t.thumbnails
                        })) || []
                      };
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cleanPl));
                      const downloadAnchorNode = document.createElement('a');
                      downloadAnchorNode.setAttribute("href", dataStr);
                      downloadAnchorNode.setAttribute("download", `${pl.name}.json`);
                      document.body.appendChild(downloadAnchorNode);
                      downloadAnchorNode.click();
                      downloadAnchorNode.remove();
                    }}
                    className="w-8 h-8 rounded-full liquid-glass-icon flex items-center justify-center text-white/50 hover:text-white transition-all"
                    title="Ekspor Playlist"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePlaylist(pl.id);
                    }}
                    className="w-8 h-8 rounded-full liquid-glass-icon flex items-center justify-center text-white/50 hover:text-red-400 transition-all"
                    title="Hapus Playlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}

              {playlists.length === 0 && (
                <div className="text-center py-10 rounded-2xl liquid-glass-subtle border border-dashed border-white/10 p-6">
                  <ListMusic className="w-10 h-10 text-white/30 mx-auto mb-2" />
                  <p className="text-sm font-bold text-white">Belum ada daftar putar</p>
                  <p className="text-xs text-white/50 mt-1">Buat daftar putar pertama Anda atau impor dari YouTube.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'Lagu' && (
          <motion.div 
            key="tab-songs"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white">Lagu Disukai</h2>
                <p className="text-xs text-white/50">{likedSongs.length} lagu tersimpan di perangkat</p>
              </div>
              {likedSongs.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => playTrack(likedSongs[0], likedSongs, 'playlist')}
                  className="w-10 h-10 bg-white text-zinc-950 rounded-full flex items-center justify-center shadow-xl"
                >
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </motion.button>
              )}
            </div>
            <div className="space-y-1">
              {likedSongs.map((track) => (
                <motion.div key={track.videoId} variants={itemVariants}>
                  <TrackItem track={track} queue={likedSongs} />
                </motion.div>
              ))}
              {likedSongs.length === 0 && (
                <div className="text-center py-14 text-white/50">
                  <Heart className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <p className="font-bold text-white">Belum ada lagu yang disukai</p>
                  <p className="text-xs text-white/50 mt-1">Ketuk ikon hati pada lagu favorit Anda untuk menyimpannya di sini.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'Album' && (
          <motion.div 
            key="tab-albums"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <h2 className="text-lg font-black text-white">Album Disimpan ({savedAlbums.length})</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
              {savedAlbums.map((album) => (
                <motion.div 
                  key={album.albumId} 
                  variants={itemVariants}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex flex-col p-3 rounded-2xl liquid-glass border border-white/10 hover:bg-white/10 cursor-pointer transition-all group shadow-sm"
                  onClick={() => router.push(`/album/${album.albumId}`)}
                >
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2.5 shadow-md bg-white/5">
                    <SmoothImage 
                      src={album.thumbnails?.[album.thumbnails.length - 1]?.url || '/placeholder.png'} 
                      alt={album.name} 
                      fill 
                      sizes="(max-width: 640px) 50vw, 200px" 
                      className="object-cover" 
                    />
                  </div>
                  <MarqueeText text={album.name} className="text-white font-bold text-xs" />
                  <p className="text-white/50 text-[11px] mt-0.5 truncate">{album.artist}</p>
                </motion.div>
              ))}
              {savedAlbums.length === 0 && (
                <div className="col-span-full text-center py-14 text-white/50">
                  <Music className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <p className="font-bold text-white">Belum ada album yang disimpan</p>
                  <p className="text-xs text-white/50 mt-1">Jelajahi album dan simpan untuk mendengarkannya dengan mudah.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'Artis' && (
          <motion.div 
            key="tab-artists"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <h2 className="text-lg font-black text-white">Artis yang Disubscribe ({subscribedArtists.length})</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
              {subscribedArtists.map((artist) => (
                <motion.div 
                  key={artist.artistId} 
                  variants={itemVariants}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex flex-col items-center p-4 rounded-2xl liquid-glass border border-white/10 hover:bg-white/10 cursor-pointer transition-all shadow-sm"
                  onClick={() => router.push(`/artist/${artist.artistId}`)}
                >
                  <div className="relative w-24 h-24 rounded-full overflow-hidden mb-3 shadow-lg bg-white/10 border-2 border-white/10">
                    <SmoothImage 
                      src={artist.thumbnails?.[artist.thumbnails.length - 1]?.url || '/placeholder.png'} 
                      alt={artist.name} 
                      fill 
                      sizes="96px" 
                      className="object-cover" 
                    />
                  </div>
                  <MarqueeText text={artist.name} className="text-white font-bold text-xs text-center" />
                  <p className="text-[#81B29A] text-[10px] font-semibold mt-1 uppercase tracking-wider">Artis</p>
                </motion.div>
              ))}
              {subscribedArtists.length === 0 && (
                <div className="col-span-full text-center py-14 text-white/50">
                  <Radio className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <p className="font-bold text-white">Belum ada artis yang disubscribe</p>
                  <p className="text-xs text-white/50 mt-1">Ikuti artis favorit Anda untuk mendapatkan rekomendasi dan rilisan terbaru.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Playlist Modal with Liquid Glass */}
      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="liquid-glass rounded-3xl p-6 w-full max-w-sm border border-white/15 shadow-2xl"
            >
              <h2 className="text-xl font-black text-white mb-5">Buat Playlist Baru</h2>
              
              <div className="flex justify-center mb-5">
                <label className="relative w-28 h-28 rounded-2xl overflow-hidden cursor-pointer group liquid-glass-subtle flex items-center justify-center border border-dashed border-white/30 hover:border-white transition-all shadow-inner">
                  {newPlaylistImg ? (
                    <SmoothImage src={newPlaylistImg} alt="Preview" fill sizes="112px" className="object-cover" />
                  ) : (
                    <ListMusic className="w-8 h-8 text-white/50" />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">Unggah Gambar</span>
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>

              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Nama Playlist..."
                className="w-full liquid-glass-subtle text-white rounded-2xl py-3 px-4 mb-5 focus:outline-none focus:ring-1 focus:ring-white/40 border border-white/10 text-sm placeholder:text-white/40"
              />

              <div className="flex gap-2.5">
                <button
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-3 rounded-2xl font-bold text-xs text-white liquid-glass-pill hover:bg-white/15 transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleCreatePlaylist}
                  disabled={!newPlaylistName.trim()}
                  className="flex-1 py-3 rounded-2xl font-bold text-xs text-zinc-950 bg-white hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  Buat
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Import Playlist Modal with Liquid Glass */}
      <AnimatePresence>
        {showImport && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="liquid-glass rounded-3xl p-6 w-full max-w-sm border border-white/15 shadow-2xl"
            >
              <h2 className="text-xl font-black text-white mb-5">Impor Playlist</h2>
              
              <div className="mb-5">
                <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">Impor dari Link YouTube</label>
                <input
                  type="text"
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  placeholder="https://youtube.com/playlist?list=..."
                  className="w-full liquid-glass-subtle text-white rounded-2xl py-3 px-4 mb-2.5 focus:outline-none focus:ring-1 focus:ring-white/40 border border-white/10 text-xs placeholder:text-white/40"
                  disabled={isImporting}
                />
                <button
                  onClick={handleImportPlaylistUrl}
                  disabled={!importUrl.trim() || isImporting}
                  className="w-full py-3 rounded-2xl font-bold text-xs text-zinc-950 bg-white hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  {isImporting ? 'Mengimpor...' : 'Impor dari URL'}
                </button>
              </div>

              <div className="relative flex items-center py-1 mb-5 text-white/30 text-xs">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink-0 mx-3 font-semibold">ATAU</span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>

              <div className="mb-5">
                <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">Impor dari File JSON</label>
                <label className="w-full flex items-center justify-center py-3 rounded-2xl font-bold text-xs text-white liquid-glass-pill hover:bg-white/15 cursor-pointer transition-all border border-dashed border-white/20">
                  <UploadCloud className="w-4 h-4 mr-2 text-[#81B29A]" />
                  {isImporting ? 'Mengimpor...' : 'Pilih File JSON'}
                  <input type="file" accept=".json" onChange={handleImportJson} className="hidden" disabled={isImporting} />
                </label>
              </div>

              <button
                onClick={() => {
                  setShowImport(false);
                  setImportUrl('');
                }}
                disabled={isImporting}
                className="w-full py-3 rounded-2xl font-bold text-xs text-white/80 liquid-glass-subtle hover:bg-white/10 transition-all"
              >
                Batal
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Hapus Playlist"
        message="Apakah Anda yakin ingin menghapus playlist ini?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <AlertModal
        isOpen={!!alertMessage}
        title={alertMessage?.title}
        message={alertMessage?.message || ''}
        onClose={() => setAlertMessage(null)}
      />
    </main>
  );
}
