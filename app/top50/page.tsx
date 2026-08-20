'use client';

import { ArrowLeft, Play, Shuffle, Flame } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePlayerStore } from '@/lib/store';
import Image from 'next/image';
import { getHighResImage } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { MarqueeText } from '@/components/MarqueeText';
import { motion, Variants } from 'motion/react';
import { TrackItem } from '@/components/TrackItem';

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

export default function Top50Page() {
  const router = useRouter();
  const history = usePlayerStore((state) => state.history);
  const playCounts = usePlayerStore((state) => state.playCounts);
  const playTrack = usePlayerStore((state) => state.playTrack);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const uniqueTracks = Array.from(new Map(history.map(item => [item.track.videoId, item.track])).values());
  
  const topTracks = uniqueTracks
    .map(track => ({
      track,
      count: playCounts[track.videoId] || 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 50)
    .map(item => item.track);

  const totalDuration = topTracks.reduce((acc, track) => acc + (track.duration || 0), 0);
  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h} jam ${m} mnt`;
    return `${m} mnt ${s} dtk`;
  };

  const coverImage = topTracks.length > 0 
    ? getHighResImage(topTracks[0].thumbnails?.[topTracks[0].thumbnails.length - 1]?.url, 800)
    : 'https://picsum.photos/seed/top50/800/800';

  const handleShuffle = () => {
    if (topTracks.length > 0) {
      const shuffled = [...topTracks].sort(() => Math.random() - 0.5);
      playTrack(shuffled[0], shuffled, 'playlist');
    }
  };

  return (
    <main className="min-h-screen pb-32 overflow-x-hidden">
      {/* Top Header */}
      <div className="sticky top-0 z-10 bg-black/50 backdrop-blur-md pt-4 pb-3 px-4 flex items-center justify-between">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.back()} 
          className="w-10 h-10 rounded-full liquid-glass-icon flex items-center justify-center text-white shadow-md"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
        <span className="text-xs font-bold uppercase tracking-wider text-white/50">Top 50 Saya</span>
        <div className="w-10" />
      </div>

      <div className="flex flex-col items-center px-4 mt-2 mb-6 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 24, stiffness: 260 }}
          className="relative w-48 h-48 sm:w-60 sm:h-60 rounded-3xl overflow-hidden shadow-2xl mb-4 bg-white/5 border border-white/10"
        >
          <Image src={coverImage} alt="Teratas Saya 50" fill sizes="(max-width: 640px) 100vw, 300px" className="object-cover" priority />
        </motion.div>

        <div className="flex items-center gap-1.5 justify-center mb-1">
          <Flame className="w-4 h-4 text-[#81B29A]" />
          <span className="text-xs font-bold text-[#81B29A] uppercase tracking-wider">Musik Paling Sering Diputar</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white mb-1 tracking-tight">Top 50 Musikfly</h2>
        <p className="text-white/60 text-xs sm:text-sm mb-5">
          {topTracks.length} lagu • {formatDuration(totalDuration)}
        </p>
        
        <div className="flex items-center gap-3">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="h-12 px-6 bg-white text-zinc-950 rounded-full font-bold text-xs flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
            onClick={() => topTracks.length > 0 && playTrack(topTracks[0], topTracks, 'playlist')}
            disabled={topTracks.length === 0}
            title="Putar"
          >
            <Play className="w-4 h-4 fill-current ml-0.5" />
            <span>Putar Semua</span>
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShuffle}
            disabled={topTracks.length === 0}
            className="w-12 h-12 rounded-full liquid-glass border border-white/15 flex items-center justify-center text-white shadow-md disabled:opacity-50" 
            title="Acak"
          >
            <Shuffle className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      <div className="px-4 max-w-3xl mx-auto">
        {topTracks.length > 0 ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-1 border-t border-white/10 pt-4"
          >
            {topTracks.map((track, index) => (
              <motion.div key={`${track.videoId}-${index}`} variants={itemVariants} className="relative">
                <div className="flex items-center">
                  <span className="w-6 text-center text-xs font-bold text-white/40 shrink-0 mr-1">{index + 1}</span>
                  <div className="flex-1 min-w-0">
                    <TrackItem track={track} queue={topTracks} />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-14 text-white/50 rounded-2xl liquid-glass-subtle border border-dashed border-white/10 p-6">
            <Flame className="w-10 h-10 text-white/20 mx-auto mb-2" />
            <p className="font-bold text-white text-sm">Belum ada lagu yang sering diputar</p>
            <p className="text-xs text-white/50 mt-1">Dengarkan lebih banyak musik di Musicfly untuk membentuk tangga lagu Top 50 Anda.</p>
          </div>
        )}
      </div>
    </main>
  );
}
