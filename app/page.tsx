'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Track, usePlayerStore } from '@/lib/store';
import { 
  Play, 
  MoreVertical, 
  Radio, 
  Sparkles, 
  RefreshCw, 
  Compass, 
  Flame, 
  TrendingUp,
  Disc3
} from 'lucide-react';
import { SmoothImage } from '@/components/SmoothImage';
import { HorizontalScroll } from '@/components/HorizontalScroll';
import { MixedScroll } from '@/components/MixedScroll';
import { CommunityPlaylistCard } from '@/components/CommunityPlaylistCard';
import { MarqueeText } from '@/components/MarqueeText';
import { getHighResImage } from '@/lib/utils';
import { motion, Variants } from 'motion/react';
import Link from 'next/link';
import { HomeSkeleton } from '@/components/HomeSkeleton';

interface MoodCategory {
  id: string;
  name: string;
  query: string;
  icon?: string;
}

const METROLIST_MOODS: MoodCategory[] = [
  { id: 'all', name: 'Semua', query: '' },
  { id: 'chill', name: 'Santai', query: 'lagu santai akustik chill indonesia' },
  { id: 'focus', name: 'Fokus', query: 'lofi study focus deep instrumental' },
  { id: 'commute', name: 'Perjalanan', query: 'roadtrip music commute songs indonesia' },
  { id: 'workout', name: 'Olahraga', query: 'workout gym pump up energy hits' },
  { id: 'energize', name: 'Energi', query: 'upbeat pop dance semangat hits' },
  { id: 'party', name: 'Pesta', query: 'party dance club remix songs' },
  { id: 'romance', name: 'Romantis', query: 'lagu cinta romantis indonesia terbaik' },
  { id: 'sleep', name: 'Tidur', query: 'relaxing sleep piano rain peaceful' },
  { id: 'nostalgia', name: 'Nostalgia', query: 'lagu nostalgia 90an 2000an indonesia' },
  { id: 'acoustic', name: 'Akustik', query: 'lagu akustik cafe santai indonesia' },
  { id: 'pop', name: 'Pop Hits', query: 'top hits pop indonesia 2024 terbaru' },
  { id: 'rock', name: 'Rock', query: 'lagu rock indonesia terbaik alternative' },
  { id: 'jedagjedug', name: 'Jedag Jedug', query: 'lagu fyp tiktok remix jedag jedug' },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.02,
    },
  },
};

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', damping: 24, stiffness: 260 },
  },
};

export default function Home() {
  const [heroTracks, setHeroTracks] = useState<Track[]>([]);
  const [speedDialTracks, setSpeedDialTracks] = useState<Track[]>([]);
  const [quickPicksTracks, setQuickPicksTracks] = useState<Track[]>([]);
  const [communityPlaylists, setCommunityPlaylists] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [categories, setCategories] = useState<{ key: string; title: string; type: 'song' | 'mixed'; items: any[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [activeMoodId, setActiveMoodId] = useState<string>('all');
  const [moodFilterData, setMoodFilterData] = useState<{ title: string; tracks: Track[] }[]>([]);
  const [loadingMood, setLoadingMood] = useState(false);
  
  const playTrack = usePlayerStore((state) => state.playTrack);
  const setTrackToAdd = usePlayerStore((state) => state.setTrackToAdd);
  const history = usePlayerStore((state) => state.history);

  // Abort controllers for cleaning up in-flight requests
  const homeAbortRef = useRef<AbortController | null>(null);
  const moodAbortRef = useRef<AbortController | null>(null);

  const [greeting, setGreeting] = useState({ 
    title: 'Selamat Datang', 
    sub: 'Mulai harimu dengan musik favorit' 
  });

  // Metrolist Dynamic Time-based Greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) {
      setGreeting({ title: 'Selamat Pagi', sub: 'Mulai harimu dengan musik favorit' });
    } else if (hour >= 11 && hour < 15) {
      setGreeting({ title: 'Selamat Siang', sub: 'Temani harimu dengan irama terbaik' });
    } else if (hour >= 15 && hour < 18) {
      setGreeting({ title: 'Selamat Sore', sub: 'Santai sejenak di sore hari' });
    } else {
      setGreeting({ title: 'Selamat Malam', sub: 'Irama tenang untuk malam harimu' });
    }
  }, []);

  // Metrolist "Dengarkan Lagi" (Listen Again / Forgotten Favorites from History)
  const listenAgainTracks = useMemo(() => {
    if (!history || history.length === 0) return [];
    const seen = new Set<string>();
    const unique: Track[] = [];
    for (const item of history) {
      if (item.track && item.track.videoId && !seen.has(item.track.videoId)) {
        seen.add(item.track.videoId);
        unique.push(item.track);
      }
      if (unique.length >= 16) break;
    }
    return unique;
  }, [history]);

  // Fetch Mood Specific Data with AbortController
  useEffect(() => {
    if (activeMoodId === 'all') {
      setMoodFilterData([]);
      return;
    }

    const selectedMood = METROLIST_MOODS.find((m) => m.id === activeMoodId);
    if (!selectedMood) return;

    if (moodAbortRef.current) {
      moodAbortRef.current.abort();
    }
    const controller = new AbortController();
    moodAbortRef.current = controller;

    const fetchMoodData = async () => {
      setLoadingMood(true);
      try {
        const queries = [
          { title: `Pilihan ${selectedMood.name}`, q: selectedMood.query },
          { title: `Hits ${selectedMood.name}`, q: `top ${selectedMood.name} songs` },
          { title: `Suasana ${selectedMood.name}`, q: `best ${selectedMood.name} mix` },
        ];

        const results = [];
        for (const { title, q } of queries) {
          if (controller.signal.aborted) break;
          const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=song`, {
            signal: controller.signal,
          });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              results.push({ title, tracks: data.slice(0, 10) });
            }
          }
        }

        if (!controller.signal.aborted) {
          setMoodFilterData(results);
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.warn('Failed to fetch mood data:', error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingMood(false);
        }
      }
    };

    fetchMoodData();

    return () => {
      controller.abort();
    };
  }, [activeMoodId]);

  // Main Home Data Fetching (Independent of history mutations to prevent continuous re-fetch loops)
  const fetchHomeData = useCallback(async (showRefreshingSpinner = false) => {
    if (homeAbortRef.current) {
      homeAbortRef.current.abort();
    }
    const controller = new AbortController();
    homeAbortRef.current = controller;

    if (showRefreshingSpinner) setIsRefreshing(true);
    try {
      const queries: { key: string; title?: string; q: string; type?: string }[] = [
        { key: 'hero', q: 'dave how i met my ex', type: 'song' },
        { key: 'speedDial', q: 'top hits indonesia viral', type: 'song' },
        { key: 'quickPicks', q: 'lagu populer viral indonesia', type: 'song' },
        { key: 'community', q: 'chill aesthetic playlists indonesia', type: 'playlist' },
        { key: 'artists', q: 'artis indonesia populer', type: 'artist' },
      ];

      const defaultCategories = [
        { key: 'cat0', title: 'Trending Sekarang', q: 'lagu indonesia hits terbaru 2024', type: 'song' },
        { key: 'cat1', title: 'Rilis Terbaru & Populer', q: 'lagu pop indonesia rilis terbaru', type: 'song' },
        { key: 'similar0', title: 'Serupa dengan Hindia', q: 'Hindia', type: 'all' },
        { key: 'similar1', title: 'Serupa dengan Nadin Amizah', q: 'Nadin Amizah', type: 'all' },
        { key: 'similar2', title: 'Serupa dengan Bernadya', q: 'Bernadya', type: 'all' },
        { key: 'cat2', title: 'Top 50 Indonesia', q: 'top 50 indonesia update', type: 'song' },
        { key: 'cat3', title: 'Viral di TikTok', q: 'lagu fyp tiktok viral jedag jedug', type: 'song' },
        { key: 'cat4', title: 'Santai & Akustik', q: 'lagu akustik cafe santai indonesia', type: 'song' },
        { key: 'cat5', title: 'Nostalgia Indonesia', q: 'lagu nostalgia indonesia 2000an', type: 'song' },
      ];

      queries.push(...defaultCategories);

      // Process in chunks to prevent connection choking
      const results = [];
      for (let i = 0; i < queries.length; i += 3) {
        if (controller.signal.aborted) break;
        const chunk = queries.slice(i, i + 3);
        const chunkResults = await Promise.all(
          chunk.map(async ({ key, title, q, type }) => {
            try {
              const url = type
                ? `/api/search?q=${encodeURIComponent(q)}&type=${type}`
                : `/api/search?q=${encodeURIComponent(q)}`;
              const res = await fetch(url, { signal: controller.signal });
              if (!res.ok) return { key, title, data: [] };
              const data = await res.json();
              return { key, title, data: Array.isArray(data) ? data : [] };
            } catch (e: any) {
              return { key, title, data: [] };
            }
          })
        );
        results.push(...chunkResults);
      }

      if (controller.signal.aborted) return;

      const cats: { key: string; title: string; type: 'song' | 'mixed'; items: any[] }[] = [];

      results.forEach(({ key, title, data }) => {
        if (!data || data.length === 0) return;
        if (key === 'hero') setHeroTracks(data.slice(0, 4));
        else if (key === 'speedDial') setSpeedDialTracks(data.slice(0, 45));
        else if (key === 'quickPicks') setQuickPicksTracks(data.slice(0, 20));
        else if (key === 'community') setCommunityPlaylists(data.slice(0, 10));
        else if (key === 'artists') setArtists(data.slice(0, 10));
        else if (key.startsWith('cat') && title) cats.push({ key, title, type: 'song', items: data.slice(0, 10) });
        else if (key.startsWith('similar') && title) cats.push({ key, title, type: 'mixed', items: data.slice(0, 10) });
      });

      const orderMap = new Map(defaultCategories.map((c, i) => [c.key, i]));
      cats.sort((a, b) => (orderMap.get(a.key) ?? 999) - (orderMap.get(b.key) ?? 999));

      setCategories(cats);
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.warn('Failed to fetch home data:', error);
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchHomeData();
    return () => {
      if (homeAbortRef.current) homeAbortRef.current.abort();
      if (moodAbortRef.current) moodAbortRef.current.abort();
    };
  }, [fetchHomeData]);

  // Handle Quick Radio Launcher
  const handleStartQuickRadio = useCallback((track: Track, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    playTrack(track, [], 'similar');
  }, [playTrack]);

  return (
    <main className="min-h-screen pt-4 pb-32 overflow-x-hidden">
      {/* Metrolist Header with Greeting & Quick Actions */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="flex items-center justify-between px-4 mb-4"
      >
        <div className="min-w-0 flex-1 pr-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#81B29A] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Musicfly
            </span>
          </div>
          <h1 suppressHydrationWarning className="text-2xl font-black text-white leading-tight mt-0.5 tracking-tight">
            {greeting.title}
          </h1>
          <p suppressHydrationWarning className="text-xs text-white/60 truncate mt-0.5">{greeting.sub}</p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => fetchHomeData(true)}
            disabled={isRefreshing}
            className="w-10 h-10 rounded-full liquid-glass-icon flex items-center justify-center text-white/90 hover:text-white hover:scale-105 active:scale-95 transition-all shadow-md"
            title="Segarkan Beranda"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#81B29A]' : ''}`} />
          </button>
        </div>
      </motion.div>

      {/* Mood Pills (Metrolist Chip Carousel) */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 px-4 pr-8 mb-6 snap-x snap-mandatory scroll-smooth w-full">
        {METROLIST_MOODS.map((mood) => {
          const isActive = activeMoodId === mood.id;
          return (
            <motion.button
              key={mood.id}
              onClick={() => setActiveMoodId(mood.id)}
              whileTap={{ scale: 0.94 }}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all snap-center shadow-sm ${
                isActive 
                  ? 'bg-white text-zinc-950 shadow-md shadow-white/10' 
                  : 'liquid-glass-pill text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              {mood.name}
            </motion.button>
          );
        })}
      </div>

      {loading ? (
        <HomeSkeleton />
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {/* Mood Filter View */}
          {activeMoodId !== 'all' ? (
            <div className="px-4 space-y-6">
              {loadingMood ? (
                <div className="flex items-center justify-center py-20 text-white/60 gap-3">
                  <RefreshCw className="w-5 h-5 animate-spin text-[#81B29A]" />
                  <span className="text-sm font-medium">Memuat rekomendasi suasana...</span>
                </div>
              ) : moodFilterData.length > 0 ? (
                moodFilterData.map((section, idx) => (
                  <HorizontalScroll key={idx} title={section.title} tracks={section.tracks} />
                ))
              ) : (
                <div className="text-center py-16 text-white/50 text-sm">
                  Tidak ada lagu yang ditemukan untuk kategori ini.
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Metrolist Speed Dial (3-row compact grid) */}
              {speedDialTracks.length > 0 && (
                <motion.div variants={sectionVariants} className="mb-6">
                  <div className="flex items-center justify-between mb-3 px-4">
                    <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-[#81B29A]" /> Pilihan Cepat Untukmu
                    </h2>
                  </div>
                  
                  <div className="flex overflow-x-auto no-scrollbar gap-3 px-4 pr-8 snap-x snap-mandatory scroll-smooth w-full">
                    {Array.from({ length: Math.ceil(speedDialTracks.length / 3) }).map((_, colIndex) => {
                      const colTracks = speedDialTracks.slice(colIndex * 3, colIndex * 3 + 3);
                      return (
                        <div key={colIndex} className="flex flex-col gap-2 flex-none w-[280px] sm:w-[320px] snap-start">
                          {colTracks.map((track) => {
                            const thumbnail = getHighResImage(track.thumbnails?.[track.thumbnails.length - 1]?.url, 120);
                            const artistName = Array.isArray(track.artist) ? track.artist.map(a => a.name).join(', ') : track.artist?.name || 'Artis';

                            return (
                              <div
                                key={track.videoId}
                                onClick={() => playTrack(track, speedDialTracks)}
                                className="flex items-center p-2 rounded-2xl liquid-glass-subtle hover:bg-white/10 active:scale-[0.98] transition-all cursor-pointer group border border-white/5"
                              >
                                <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-white/5 shadow-sm">
                                  <SmoothImage src={thumbnail} alt={track.name} fill sizes="48px" className="object-cover" />
                                </div>
                                <div className="ml-3 flex-1 min-w-0 pr-1">
                                  <MarqueeText text={track.name} className="text-xs font-bold text-white leading-tight" />
                                  <MarqueeText text={artistName} className="text-[11px] text-white/50 mt-0.5" />
                                </div>
                                <button
                                  onClick={(e) => handleStartQuickRadio(track, e)}
                                  className="w-8 h-8 rounded-full liquid-glass-icon flex items-center justify-center text-white/60 hover:text-white shrink-0 ml-1"
                                  title="Mulai Radio dari Lagu Ini"
                                >
                                  <Radio className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Metrolist "Dengarkan Lagi" (Listen Again from history) */}
              {listenAgainTracks.length > 0 && (
                <motion.div variants={sectionVariants}>
                  <HorizontalScroll title="Dengarkan Lagi" tracks={listenAgainTracks} />
                </motion.div>
              )}

              {/* Quick Picks Carousel */}
              {quickPicksTracks.length > 0 && (
                <motion.div variants={sectionVariants}>
                  <HorizontalScroll title="Pilihan Terpopuler Hari Ini" tracks={quickPicksTracks} />
                </motion.div>
              )}

              {/* Dynamic Categories & Mixed recommendations */}
              {categories.map((category) => (
                <motion.div key={category.key} variants={sectionVariants}>
                  {category.type === 'song' ? (
                    <HorizontalScroll title={category.title} tracks={category.items} />
                  ) : (
                    <MixedScroll title={category.title} items={category.items} />
                  )}
                </motion.div>
              ))}

              {/* Community Playlists */}
              {communityPlaylists.length > 0 && (
                <motion.div variants={sectionVariants} className="mb-8">
                  <div className="flex items-center justify-between mb-3 px-4">
                    <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                      <Disc3 className="w-5 h-5 text-[#81B29A]" /> Playlist Komunitas
                    </h2>
                  </div>
                  <div className="flex overflow-x-auto no-scrollbar gap-4 px-4 pr-8 pb-3 snap-x snap-mandatory scroll-smooth w-full">
                    {communityPlaylists.map((playlist, idx) => (
                      <CommunityPlaylistCard key={playlist.playlistId || idx} playlistId={playlist.playlistId} />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Popular Artists */}
              {artists.length > 0 && (
                <motion.div variants={sectionVariants} className="mb-8">
                  <div className="flex items-center justify-between mb-3 px-4">
                    <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#81B29A]" /> Artis Populer
                    </h2>
                  </div>
                  <div className="flex overflow-x-auto no-scrollbar gap-4 px-4 pr-8 pb-3 snap-x snap-mandatory scroll-smooth w-full">
                    {artists.map((artist, idx) => {
                      const thumb = getHighResImage(artist.thumbnails?.[artist.thumbnails.length - 1]?.url, 200);
                      return (
                        <Link 
                          key={artist.artistId || idx} 
                          href={`/artist/${artist.artistId}`}
                          className="flex flex-col items-center flex-none w-28 group snap-start cursor-pointer"
                        >
                          <div className="relative w-24 h-24 rounded-full overflow-hidden mb-2.5 shadow-lg bg-white/5 border border-white/10 group-hover:scale-105 group-hover:border-white/25 transition-all">
                            <SmoothImage src={thumb} alt={artist.name} fill sizes="96px" className="object-cover" />
                          </div>
                          <MarqueeText text={artist.name} className="text-xs font-bold text-white text-center w-full" />
                          <span className="text-[10px] text-white/50">Artis</span>
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      )}
    </main>
  );
}
