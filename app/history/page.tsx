'use client';

import { ArrowLeft, Clock, Trash2, Play, Shuffle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePlayerStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import { TrackItem } from '@/components/TrackItem';
import { motion, Variants } from 'motion/react';
import { ConfirmModal } from '@/components/FeedbackModals';

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

export default function HistoryPage() {
  const router = useRouter();
  const history = usePlayerStore((state) => state.history);
  const clearHistory = usePlayerStore((state) => state.clearHistory);
  const playTrack = usePlayerStore((state) => state.playTrack);
  const [mounted, setMounted] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const historyTracks = history.map(h => h.track);

  // Group history by Today, This Week, etc.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const todayHistory = history.filter(item => new Date(item.playedAt) >= today);
  const thisWeekHistory = history.filter(item => {
    const date = new Date(item.playedAt);
    return date >= startOfWeek && date < today;
  });
  const olderHistory = history.filter(item => new Date(item.playedAt) < startOfWeek);

  const handlePlayAll = () => {
    if (historyTracks.length > 0) {
      playTrack(historyTracks[0], historyTracks, 'playlist');
    }
  };

  const handleShuffle = () => {
    if (historyTracks.length > 0) {
      const shuffled = [...historyTracks].sort(() => Math.random() - 0.5);
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
        <span className="text-xs font-bold uppercase tracking-wider text-white/50">Riwayat Putar</span>
        {history.length > 0 ? (
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowClearConfirm(true)}
            className="w-10 h-10 rounded-full liquid-glass-icon flex items-center justify-center text-white/60 hover:text-red-400 shadow-md transition-colors"
            title="Hapus Riwayat"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        ) : (
          <div className="w-10" />
        )}
      </div>

      {history.length > 0 && (
        <div className="px-4 py-3 flex items-center justify-between border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#81B29A]" />
            <span className="text-xs font-bold text-white">{history.length} lagu di riwayat</span>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handlePlayAll}
              className="px-3.5 py-1.5 rounded-full bg-white text-zinc-950 text-xs font-bold flex items-center gap-1.5 shadow-md"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Putar</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleShuffle}
              className="p-2 rounded-full liquid-glass border border-white/15 text-white"
              title="Acak"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>
      )}

      <div className="px-4 max-w-3xl mx-auto space-y-6">
        {todayHistory.length > 0 && (
          <motion.div variants={containerVariants} initial="hidden" animate="show">
            <h2 className="text-xs font-bold uppercase tracking-wider text-white/60 mb-2 px-1">Hari Ini</h2>
            <div className="space-y-1">
              {todayHistory.map((item, idx) => (
                <motion.div key={`today-${item.track.videoId}-${idx}`} variants={itemVariants}>
                  <TrackItem track={item.track} queue={historyTracks} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {thisWeekHistory.length > 0 && (
          <motion.div variants={containerVariants} initial="hidden" animate="show">
            <h2 className="text-xs font-bold uppercase tracking-wider text-white/60 mb-2 px-1">Minggu Ini</h2>
            <div className="space-y-1">
              {thisWeekHistory.map((item, idx) => (
                <motion.div key={`week-${item.track.videoId}-${idx}`} variants={itemVariants}>
                  <TrackItem track={item.track} queue={historyTracks} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {olderHistory.length > 0 && (
          <motion.div variants={containerVariants} initial="hidden" animate="show">
            <h2 className="text-xs font-bold uppercase tracking-wider text-white/60 mb-2 px-1">Lebih Lama</h2>
            <div className="space-y-1">
              {olderHistory.map((item, idx) => (
                <motion.div key={`older-${item.track.videoId}-${idx}`} variants={itemVariants}>
                  <TrackItem track={item.track} queue={historyTracks} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {history.length === 0 && (
          <div className="text-center py-20 text-white/50 rounded-2xl liquid-glass-subtle border border-dashed border-white/10 p-6">
            <Clock className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="font-bold text-white text-base">Belum ada riwayat putaran</p>
            <p className="text-xs text-white/50 mt-1">Lagu-lagu yang Anda dengarkan akan otomatis dicatat di sini.</p>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showClearConfirm}
        title="Hapus Semua Riwayat"
        message="Apakah Anda yakin ingin menghapus seluruh riwayat putaran musik Anda?"
        onConfirm={() => {
          clearHistory();
          setShowClearConfirm(false);
        }}
        onCancel={() => setShowClearConfirm(false)}
      />
    </main>
  );
}
