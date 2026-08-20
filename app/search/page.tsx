'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { db, RecentSearch } from '@/lib/db';
import { TrackItem } from '@/components/TrackItem';
import { ArtistItem } from '@/components/ArtistItem';
import { Search as SearchIcon, ArrowLeft, X, ArrowUpLeft, History, Flame, Compass } from 'lucide-react';
import { motion, Variants } from 'motion/react';
import { useRouter } from 'next/navigation';
import { SearchSkeleton } from '@/components/SearchSkeleton';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
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

const POPULAR_SEARCH_TOPICS = [
  { name: 'Top Hits Indonesia', q: 'top hits indonesia 2024' },
  { name: 'Pop Viral TikTok', q: 'lagu fyp tiktok viral' },
  { name: 'Akustik Santai', q: 'lagu akustik santai cafe' },
  { name: 'Rock Klasik', q: 'lagu rock indonesia legendaris' },
  { name: 'Lofi Deep Focus', q: 'lofi hip hop beats study focus' },
  { name: 'Lagu Galau Indonesia', q: 'lagu galau sedih indonesia' },
];

const SEARCH_TABS = ['Semua', 'Lagu', 'Video', 'Album', 'Artis', 'Daftar putar'] as const;

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<typeof SEARCH_TABS[number]>('Semua');
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  // Abort controllers to prevent race conditions and memory leaks
  const searchAbortRef = useRef<AbortController | null>(null);
  const suggestAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadRecentSearches = async () => {
      try {
        const searches = await db.getRecentSearches();
        if (isMounted) {
          setRecentSearches(searches);
        }
      } catch (err) {
        console.warn('Failed to load recent searches:', err);
      }
    };
    loadRecentSearches();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch Suggestions with debounce and abort controller
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    if (suggestAbortRef.current) {
      suggestAbortRef.current.abort();
    }
    const controller = new AbortController();
    suggestAbortRef.current = controller;

    const debounceTimer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/suggest?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          setSuggestions(Array.isArray(data) ? data : []);
        } else {
          setSuggestions([]);
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.warn('Error fetching suggestions:', error?.message || error);
          setSuggestions([]);
        }
      }
    }, 250);

    return () => {
      clearTimeout(debounceTimer);
      controller.abort();
    };
  }, [query]);

  // Clean up all abort controllers on unmount
  useEffect(() => {
    return () => {
      if (searchAbortRef.current) searchAbortRef.current.abort();
      if (suggestAbortRef.current) suggestAbortRef.current.abort();
    };
  }, []);

  const handleSearch = useCallback(async (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    if (searchAbortRef.current) {
      searchAbortRef.current.abort();
    }
    const controller = new AbortController();
    searchAbortRef.current = controller;

    setLoading(true);
    setIsFocused(false);

    // Save to recent searches asynchronously
    db.addRecentSearch(trimmed).then(() => {
      db.getRecentSearches().then(setRecentSearches);
    }).catch(() => {});

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
        signal: controller.signal,
      });
      if (res.ok) {
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.warn('Search query error:', error?.message || error);
        setResults([]);
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleRemoveRecentSearch = useCallback(async (e: React.MouseEvent, queryToRemove: string) => {
    e.stopPropagation();
    await db.removeRecentSearch(queryToRemove);
    const searches = await db.getRecentSearches();
    setRecentSearches(searches);
  }, []);

  // Filtered results memoization
  const filteredResults = useMemo(() => {
    if (!results || results.length === 0) return [];
    return results.filter((item) => {
      if (activeTab === 'Semua') return true;
      if (activeTab === 'Lagu') return item.type === 'SONG';
      if (activeTab === 'Video') return item.type === 'VIDEO';
      if (activeTab === 'Artis') return item.type === 'ARTIST';
      if (activeTab === 'Album') return item.type === 'ALBUM';
      if (activeTab === 'Daftar putar') return item.type === 'PLAYLIST';
      return false;
    });
  }, [results, activeTab]);

  const playableQueue = useMemo(() => {
    return filteredResults.filter((r) => r.type !== 'ARTIST' && r.type !== 'PLAYLIST' && r.type !== 'ALBUM');
  }, [filteredResults]);

  return (
    <main className="min-h-screen pt-4 pb-32 overflow-x-hidden">
      {/* Search Header */}
      <div className="px-4 mb-4 flex items-center gap-3">
        <button 
          onClick={() => router.back()} 
          className="w-10 h-10 rounded-full liquid-glass-icon flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all shrink-0 shadow-md"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <form onSubmit={onSubmit} className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 250)}
            placeholder="Mencari di Musicfly (lagu, artis, album)..."
            className="w-full liquid-glass text-white rounded-full py-2.5 pl-4 pr-10 focus:outline-none focus:ring-1 focus:ring-white/40 transition-all text-sm placeholder:text-white/40 border border-white/10 shadow-lg"
          />
          {query && (
            <button 
              type="button"
              onClick={() => {
                setQuery('');
                setResults([]);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full liquid-glass-icon flex items-center justify-center text-white/70 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>

      {/* Metrolist-style Category Tabs */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 px-4 pr-12 mb-5 snap-x snap-mandatory scroll-smooth w-full">
        {SEARCH_TABS.map((tab) => {
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
                  layoutId="searchTabIndicator"
                  className="absolute inset-0 bg-white rounded-full -z-10"
                  transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                />
              )}
              <span className="relative z-10">{tab}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Auto Suggestions Dropdown */}
      {query && isFocused && suggestions.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mb-6 rounded-2xl liquid-glass border border-white/10 overflow-hidden shadow-2xl divide-y divide-white/5"
        >
          {suggestions.map((suggestion, index) => (
            <div 
              key={index}
              className="flex items-center justify-between px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors"
              onMouseDown={() => {
                setQuery(suggestion);
                handleSearch(suggestion);
              }}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                <div className="w-8 h-8 rounded-full liquid-glass-icon flex items-center justify-center text-white/60 shrink-0">
                  <SearchIcon className="w-4 h-4" />
                </div>
                <span className="text-white text-sm font-medium truncate">{suggestion}</span>
              </div>
              <ArrowUpLeft className="w-4 h-4 text-white/50 shrink-0" />
            </div>
          ))}
        </motion.div>
      )}

      {/* Recent Searches */}
      {!query && !loading && results.length === 0 && recentSearches.length > 0 && (
        <div className="px-4 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white/70 flex items-center gap-1.5">
              <History className="w-4 h-4 text-[#81B29A]" /> Pencarian Terakhir
            </h2>
          </div>
          <div className="space-y-1 rounded-2xl liquid-glass-subtle p-1 border border-white/5">
            {recentSearches.slice(0, 8).map((search, index) => (
              <div 
                key={`recent-${index}`}
                className="flex items-center justify-between px-3 py-2.5 hover:bg-white/10 rounded-xl cursor-pointer transition-colors group"
                onClick={() => {
                  setQuery(search.query);
                  handleSearch(search.query);
                }}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                  <div className="w-8 h-8 rounded-full liquid-glass-icon flex items-center justify-center text-white/60 shrink-0">
                    <History className="w-4 h-4" />
                  </div>
                  <span className="text-white text-sm font-medium truncate">{search.query}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button 
                    onClick={(e) => handleRemoveRecentSearch(e, search.query)}
                    className="w-7 h-7 rounded-full liquid-glass-icon flex items-center justify-center text-white/50 hover:text-red-400 transition-all"
                    title="Hapus riwayat"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setQuery(search.query);
                      setIsFocused(true);
                    }}
                    className="w-7 h-7 rounded-full liquid-glass-icon flex items-center justify-center text-white/50 hover:text-white transition-all"
                    title="Gunakan kata kunci"
                  >
                    <ArrowUpLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Explore Topics (Metrolist Style) */}
      {!query && !loading && results.length === 0 && (
        <div className="px-4 mb-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white/70 mb-3 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-[#FA243C]" /> Tren Musik Populer
          </h2>
          <div className="grid grid-cols-2 gap-2.5">
            {POPULAR_SEARCH_TOPICS.map((topic, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setQuery(topic.q);
                  handleSearch(topic.q);
                }}
                className="p-3.5 rounded-2xl liquid-glass-subtle hover:bg-white/15 text-left transition-all border border-white/10 group flex flex-col justify-between h-20 shadow-sm"
              >
                <div className="flex justify-between items-start w-full">
                  <span className="text-xs font-bold text-white group-hover:text-[#81B29A] transition-colors leading-tight">
                    {topic.name}
                  </span>
                  <Compass className="w-3.5 h-3.5 text-white/40 group-hover:text-white transition-colors shrink-0 ml-1" />
                </div>
                <span className="text-[10px] text-white/40 truncate">Cari sekarang &rarr;</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Results Section */}
      <div className="px-4">
        {loading ? (
          <SearchSkeleton />
        ) : filteredResults.length > 0 ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-1 border-t border-white/10 pt-4"
          >
            {filteredResults.map((item, index) => (
              <motion.div key={`${item.type}-${item.videoId || item.artistId || item.playlistId || item.albumId}-${index}`} variants={itemVariants}>
                {item.type === 'ARTIST' ? (
                  <ArtistItem artist={item} />
                ) : (
                  <TrackItem track={item} queue={playableQueue} />
                )}
              </motion.div>
            ))}
          </motion.div>
        ) : query ? (
          <div className="flex flex-col items-center justify-center mt-20 text-white/50 text-center px-4">
            <SearchIcon className="w-16 h-16 mb-4 opacity-20" />
            <p className="font-bold text-white text-base">Tidak ada hasil yang ditemukan</p>
            <p className="text-xs text-white/50 mt-1">Coba kata kunci lain atau periksa ejaan judul lagu/artis.</p>
          </div>
        ) : null}
      </div>
    </main>
  );
}
