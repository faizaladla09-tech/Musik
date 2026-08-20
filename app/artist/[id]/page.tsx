'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SmoothImage } from '@/components/SmoothImage';
import { ArrowLeft, Share2, Play, Radio, Film, Disc } from 'lucide-react';
import { getHighResImage } from '@/lib/utils';
import { TrackItem } from '@/components/TrackItem';
import { usePlayerStore } from '@/lib/store';
import { db } from '@/lib/db';
import { MarqueeText } from '@/components/MarqueeText';
import { motion, Variants } from 'motion/react';
import { ArtistSkeleton } from '@/components/ArtistSkeleton';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', damping: 24, stiffness: 280 },
  },
};

export default function ArtistPage() {
  const params = useParams();
  const router = useRouter();
  const [artist, setArtist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const playTrack = usePlayerStore((state) => state.playTrack);

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        const res = await fetch(`/api/artist?id=${params.id}`);
        const data = await res.json();
        setArtist(data);
        
        if (data && data.artistId) {
          const subscribed = await db.isSubscribed(data.artistId);
          setIsSubscribed(subscribed);
        }
      } catch (error) {
        console.error('Failed to fetch artist:', error);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) {
      fetchArtist();
    }
  }, [params.id]);

  const handleSubscribe = async () => {
    if (!artist) return;
    
    if (isSubscribed) {
      await db.removeSubscribedArtist(artist.artistId);
      setIsSubscribed(false);
    } else {
      await db.addSubscribedArtist({
        artistId: artist.artistId,
        name: artist.name,
        thumbnails: artist.thumbnails || [],
        subscribedAt: Date.now()
      });
      setIsSubscribed(true);
    }
  };

  if (loading) {
    return <ArtistSkeleton />;
  }

  if (!artist) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white p-4 text-center">
        <p className="font-bold text-lg">Artis tidak ditemukan</p>
        <button 
          onClick={() => router.back()} 
          className="mt-4 px-6 py-2.5 bg-white text-zinc-950 rounded-full font-bold text-xs hover:bg-zinc-100 transition-all shadow-lg"
        >
          Kembali
        </button>
      </div>
    );
  }

  const headerImage = getHighResImage(artist.thumbnails?.[artist.thumbnails.length - 1]?.url, 1000);
  const videosList = (artist.topVideos && artist.topVideos.length > 0) 
    ? artist.topVideos 
    : (artist.livePerformances || []);

  return (
    <main className="min-h-screen pb-32 overflow-x-hidden">
      {/* Header Banner */}
      <div className="relative h-[42vh] min-h-[320px] w-full bg-white/5">
        <SmoothImage 
          src={headerImage || '/placeholder.png'} 
          alt={artist.name} 
          fill 
          className="object-cover opacity-85"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/50 to-black/30" />
        
        {/* Top Floating Nav */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()} 
            className="w-10 h-10 rounded-full liquid-glass-icon flex items-center justify-center text-white shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: artist.name, url: window.location.href }).catch(() => {});
              }
            }}
            className="w-10 h-10 rounded-full liquid-glass-icon flex items-center justify-center text-white shadow-lg"
          >
            <Share2 className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Artist Header Info */}
        <div className="absolute bottom-0 left-0 p-5 w-full">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight drop-shadow-md"
          >
            {artist.name}
          </motion.h1>
          <div className="flex items-center gap-2.5 flex-wrap">
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={handleSubscribe}
              className={`px-5 py-2.5 rounded-full font-bold text-xs tracking-wide transition-all shadow-md ${
                isSubscribed 
                  ? 'bg-white text-zinc-950 shadow-white/20' 
                  : 'liquid-glass-pill text-white hover:bg-white/15'
              }`}
            >
              {isSubscribed ? 'Disubscribe ✓' : 'Subscribe'}
            </motion.button>

            {artist.topSongs && artist.topSongs.length > 0 && (
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => playTrack(artist.topSongs[0], artist.topSongs, 'similar')}
                className="px-4 py-2.5 rounded-full liquid-glass-pill text-white text-xs font-bold flex items-center gap-1.5 hover:bg-white/15 transition-all shadow-sm"
              >
                <Radio className="w-3.5 h-3.5 text-[#81B29A]" />
                <span>Radio Artis</span>
              </motion.button>
            )}

            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-11 h-11 rounded-full bg-white text-zinc-950 flex items-center justify-center ml-auto shadow-xl"
              onClick={() => {
                if (artist.topSongs?.length > 0) {
                  playTrack(artist.topSongs[0], artist.topSongs);
                }
              }}
              title="Putar Populer"
            >
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </motion.button>
          </div>
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="px-4 mt-6 space-y-8"
      >
        {/* Tentang Section */}
        <motion.section variants={sectionVariants} className="liquid-glass rounded-3xl p-5 border border-white/10 shadow-lg">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white/70 mb-2">Tentang Artis</h2>
          <div className="text-white/80 text-xs sm:text-sm leading-relaxed">
            <p className={isBioExpanded ? "" : "line-clamp-3"}>
              Dengarkan karya-karya terbaik dari {artist.name} di Musicfly. Jelajahi berbagai lagu populer, video musik resmi, album terbaru, single, dan kolaborasi yang telah dirilis dengan tata suara jernih tanpa iklan.
            </p>
            <button 
              onClick={() => setIsBioExpanded(!isBioExpanded)}
              className="text-[#81B29A] mt-2 text-xs font-bold hover:underline"
            >
              {isBioExpanded ? "Tampilkan lebih sedikit" : "Selengkapnya"}
            </button>
          </div>
        </motion.section>

        {/* Top Songs */}
        {artist.topSongs && artist.topSongs.length > 0 && (
          <motion.section variants={sectionVariants}>
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-lg font-black text-white">Lagu Terpopuler</h2>
              <span className="text-xs text-white/50">{artist.topSongs.length} lagu</span>
            </div>
            <div className="space-y-1">
              {artist.topSongs.slice(0, 6).map((song: any, index: number) => (
                <TrackItem key={`song-${song.videoId}-${index}`} track={song} queue={artist.topSongs} />
              ))}
            </div>
          </motion.section>
        )}

        {/* Music Videos Section */}
        {videosList && videosList.length > 0 && (
          <motion.section variants={sectionVariants}>
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-[#81B29A]" />
                <h2 className="text-lg font-black text-white">Video Musik & Pertunjukan</h2>
              </div>
              <span className="text-xs text-white/50">{videosList.length} video</span>
            </div>
            <div className="flex overflow-x-auto no-scrollbar gap-3.5 snap-x snap-mandatory pb-2 -mx-4 px-4 pr-12">
              {videosList.map((video: any, index: number) => {
                const vidThumb = getHighResImage(video.thumbnails?.[video.thumbnails.length - 1]?.url, 600);
                const vidTitle = video.name || video.title || 'Music Video';
                const vidViews = video.views || video.year || 'Video';

                return (
                  <motion.div 
                    key={`video-${video.videoId}-${index}`} 
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-60 sm:w-68 shrink-0 snap-start p-2.5 rounded-2xl liquid-glass border border-white/10 hover:bg-white/10 cursor-pointer transition-all shadow-md group"
                    onClick={() => playTrack(video, videosList, 'similar')}
                  >
                    <div className="relative aspect-video rounded-xl overflow-hidden mb-2.5 bg-white/5 shadow-md">
                      <SmoothImage 
                        src={vidThumb || '/placeholder.png'} 
                        alt={vidTitle} 
                        fill 
                        sizes="260px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                        <div className="w-11 h-11 rounded-full bg-white text-zinc-950 flex items-center justify-center shadow-xl">
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>
                      </div>
                      {video.duration && (
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono text-white">
                          {video.duration}
                        </span>
                      )}
                    </div>
                    <MarqueeText text={vidTitle} className="text-white font-bold text-xs sm:text-sm" />
                    <p className="text-white/50 text-[11px] mt-0.5 truncate">{vidViews}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* Albums */}
        {artist.topAlbums && artist.topAlbums.length > 0 && (
          <motion.section variants={sectionVariants}>
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-lg font-black text-white">Album</h2>
            </div>
            <div className="flex overflow-x-auto no-scrollbar gap-3.5 snap-x snap-mandatory pb-2 -mx-4 px-4 pr-12">
              {artist.topAlbums.map((album: any, index: number) => (
                <motion.div 
                  key={`album-${album.albumId}-${index}`} 
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-36 shrink-0 snap-start p-2.5 rounded-2xl liquid-glass border border-white/10 hover:bg-white/10 cursor-pointer transition-all shadow-sm group"
                  onClick={() => router.push(`/album/${album.albumId}`)}
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-2 bg-white/5 shadow-md">
                    <SmoothImage 
                      src={getHighResImage(album.thumbnails?.[album.thumbnails.length - 1]?.url, 400) || '/placeholder.png'} 
                      alt={album.name} 
                      fill 
                      sizes="144px"
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-white text-zinc-950 flex items-center justify-center shadow-lg">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <MarqueeText text={album.name} className="text-white font-bold text-xs" />
                  <p className="text-white/50 text-[10px] mt-0.5 truncate">{album.year || 'Album'}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Singles & EPs */}
        {artist.topSingles && artist.topSingles.length > 0 && (
          <motion.section variants={sectionVariants}>
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-lg font-black text-white">Single & EP</h2>
            </div>
            <div className="flex overflow-x-auto no-scrollbar gap-3.5 snap-x snap-mandatory pb-2 -mx-4 px-4 pr-12">
              {artist.topSingles.map((single: any, index: number) => (
                <motion.div 
                  key={`single-${single.albumId}-${index}`} 
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-36 shrink-0 snap-start p-2.5 rounded-2xl liquid-glass border border-white/10 hover:bg-white/10 cursor-pointer transition-all shadow-sm group"
                  onClick={() => router.push(`/album/${single.albumId}`)}
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-2 bg-white/5 shadow-md">
                    <SmoothImage 
                      src={getHighResImage(single.thumbnails?.[single.thumbnails.length - 1]?.url, 400) || '/placeholder.png'} 
                      alt={single.name} 
                      fill 
                      sizes="144px"
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-white text-zinc-950 flex items-center justify-center shadow-lg">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <MarqueeText text={single.name} className="text-white font-bold text-xs" />
                  <p className="text-white/50 text-[10px] mt-0.5 truncate">{single.year || 'Single'}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Featured On Playlists */}
        {artist.featuredOn && artist.featuredOn.filter((f: any) => f.playlistId && !f.playlistId.startsWith('RD')).length > 0 && (
          <motion.section variants={sectionVariants}>
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <Disc className="w-4 h-4 text-[#81B29A]" />
                <h2 className="text-lg font-black text-white">Menampilkan {artist.name}</h2>
              </div>
            </div>
            <div className="flex overflow-x-auto no-scrollbar gap-3.5 snap-x snap-mandatory pb-2 -mx-4 px-4 pr-12">
              {artist.featuredOn.filter((f: any) => f.playlistId && !f.playlistId.startsWith('RD')).map((playlist: any, index: number) => (
                <motion.div 
                  key={`feat-${playlist.playlistId}-${index}`} 
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-36 shrink-0 snap-start p-2.5 rounded-2xl liquid-glass border border-white/10 hover:bg-white/10 cursor-pointer transition-all shadow-sm group"
                  onClick={() => router.push(`/playlist/${playlist.playlistId}`)}
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-2 bg-white/5 shadow-md">
                    <SmoothImage 
                      src={getHighResImage(playlist.thumbnails?.[playlist.thumbnails.length - 1]?.url, 400) || '/placeholder.png'} 
                      alt={playlist.name} 
                      fill 
                      sizes="144px"
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-white text-zinc-950 flex items-center justify-center shadow-lg">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <MarqueeText text={playlist.name} className="text-white font-bold text-xs" />
                  <p className="text-white/50 text-[10px] mt-0.5 truncate">Playlist</p>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Similar Artists */}
        {artist.similarArtists && artist.similarArtists.filter((a: any) => a.artistId?.startsWith('UC') || a.artistId?.startsWith('HC')).length > 0 && (
          <motion.section variants={sectionVariants}>
            <h2 className="text-lg font-black text-white mb-3 px-1">Penggemar Juga Menyukai</h2>
            <div className="flex overflow-x-auto no-scrollbar gap-4 snap-x snap-mandatory pb-2 -mx-4 px-4 pr-12">
              {artist.similarArtists.filter((a: any) => a.artistId?.startsWith('UC') || a.artistId?.startsWith('HC')).map((similar: any, index: number) => (
                <motion.div 
                  key={`similar-${similar.artistId}-${index}`} 
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="w-28 shrink-0 snap-start flex flex-col items-center text-center cursor-pointer group"
                  onClick={() => router.push(`/artist/${similar.artistId}`)}
                >
                  <div className="relative w-24 h-24 rounded-full overflow-hidden mb-2 shadow-lg bg-white/10 border border-white/10 group-hover:border-white/40 transition-colors">
                    {similar.thumbnails?.[similar.thumbnails.length - 1]?.url && (
                      <SmoothImage 
                        src={getHighResImage(similar.thumbnails[similar.thumbnails.length - 1].url, 400)} 
                        alt={similar.name} 
                        fill 
                        sizes="96px" 
                        className="object-cover" 
                      />
                    )}
                  </div>
                  <MarqueeText text={similar.name} className="text-white font-bold text-xs" />
                  <span className="text-[10px] text-[#81B29A] font-semibold">Artis</span>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </motion.div>
    </main>
  );
}
