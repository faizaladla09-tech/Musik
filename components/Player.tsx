'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { usePlayerStore } from '@/lib/store';
import { db } from '@/lib/db';
import YouTube from 'react-youtube';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Heart, 
  ChevronDown, 
  ListMusic, 
  Mic2, 
  Shuffle, 
  Repeat, 
  Repeat1, 
  Cast, 
  ListPlus, 
  User, 
  Volume2, 
  VolumeX,
  Sparkles,
  Moon
} from 'lucide-react';
import { cn, getHighResImage } from '@/lib/utils';
import { SmoothImage } from '@/components/SmoothImage';
import { useRouter } from 'next/navigation';
import { MarqueeText } from './MarqueeText';
import { SpotifySeekBar } from '@/components/SpotifySeekBar';
import { SleepTimerModal } from '@/components/SleepTimerModal';

// Continuous silent WAV data URI to keep OS Audio Focus and MediaSession alive in background
const SILENT_AUDIO_URI = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

export function Player() {
  const router = useRouter();
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const isExpanded = usePlayerStore((state) => state.isExpanded);
  const progress = usePlayerStore((state) => state.progress);
  const duration = usePlayerStore((state) => state.duration);
  const volume = usePlayerStore((state) => state.volume);
  const togglePlay = usePlayerStore((state) => state.togglePlay);
  const setPlaying = usePlayerStore((state) => state.setPlaying);
  const setExpanded = usePlayerStore((state) => state.setExpanded);
  const setProgress = usePlayerStore((state) => state.setProgress);
  const setDuration = usePlayerStore((state) => state.setDuration);
  const setVolume = usePlayerStore((state) => state.setVolume);
  const playNext = usePlayerStore((state) => state.playNext);
  const playPrev = usePlayerStore((state) => state.playPrev);
  const setTrackToAdd = usePlayerStore((state) => state.setTrackToAdd);
  const dominantColor = usePlayerStore((state) => state.dominantColor);
  const isShuffle = usePlayerStore((state) => state.isShuffle);
  const repeatMode = usePlayerStore((state) => state.repeatMode);
  const backgroundPlayEnabled = usePlayerStore((state) => state.backgroundPlayEnabled);
  const toggleShuffle = usePlayerStore((state) => state.toggleShuffle);
  const toggleRepeat = usePlayerStore((state) => state.toggleRepeat);
  const sleepTimerTarget = usePlayerStore((state) => state.sleepTimerTarget);
  const sleepTimerEndOfTrack = usePlayerStore((state) => state.sleepTimerEndOfTrack);
  const clearSleepTimer = usePlayerStore((state) => state.clearSleepTimer);

  const [isLiked, setIsLiked] = useState(false);
  const [lyrics, setLyrics] = useState<{ text: string; time?: number }[] | null>(null);
  const [lyricsType, setLyricsType] = useState<'synced' | 'plain' | null>(null);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showSleepTimerModal, setShowSleepTimerModal] = useState(false);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<string | null>(null);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [isAlternativeTrying, setIsAlternativeTrying] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  
  const playerRef = useRef<any>(null);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const silentAudioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    setActiveVideoId(currentTrack?.videoId || null);
    setIsAlternativeTrying(false);
  }, [currentTrack?.videoId]);

  // Sleep Timer countdown engine
  useEffect(() => {
    if (!sleepTimerTarget) {
      setSleepTimerRemaining(null);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, sleepTimerTarget - now);
      if (diff <= 0) {
        setPlaying(false);
        if (playerRef.current) playerRef.current.pauseVideo();
        clearSleepTimer();
        setSleepTimerRemaining(null);
      } else {
        const m = Math.floor(diff / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setSleepTimerRemaining(`${m}:${s.toString().padStart(2, '0')}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [sleepTimerTarget, setPlaying, clearSleepTimer]);

  // Background Audio Keeper Engine: Keep HTML5 audio playing to maintain Audio Focus in mobile background
  useEffect(() => {
    if (silentAudioRef.current) {
      if (isPlaying && backgroundPlayEnabled) {
        silentAudioRef.current.play().catch(() => {
          // Handled if user has not interacted yet
        });
      } else {
        silentAudioRef.current.pause();
      }
    }
  }, [isPlaying, backgroundPlayEnabled]);

  // Smooth scroll lyrics
  useEffect(() => {
    if (showLyrics && lyricsContainerRef.current && duration > 0 && lyrics && lyrics.length > 0 && lyricsType === 'synced') {
      const container = lyricsContainerRef.current;
      
      const LYRICS_OFFSET = 0.25;
      const index = lyrics.findIndex(line => line.time !== undefined && line.time > (progress + LYRICS_OFFSET));
      const activeIndex = index === -1 ? lyrics.length - 1 : Math.max(0, index - 1);
      
      const lineElements = container.querySelectorAll('.lyric-line');
      if (lineElements[activeIndex]) {
        const targetLine = lineElements[activeIndex] as HTMLElement;
        const targetScroll = targetLine.offsetTop - container.clientHeight / 2 + targetLine.clientHeight / 2;
        container.scrollTo({ top: targetScroll, behavior: 'smooth' });
      }
    }
  }, [progress, duration, showLyrics, lyrics, lyricsType]);

  // Reset lyrics when track changes
  useEffect(() => {
    setLyrics(null);
    setLyricsType(null);
  }, [currentTrack?.videoId]);

  useEffect(() => {
    if (currentTrack) {
      db.isLiked(currentTrack.videoId).then(setIsLiked);
    }
  }, [currentTrack]);

  useEffect(() => {
    if (currentTrack && showLyrics && !lyrics) {
      const artistName = Array.isArray(currentTrack.artist)
        ? currentTrack.artist.map(a => a.name).join(', ')
        : currentTrack.artist?.name || '';
      
      const queryParams = new URLSearchParams({
        id: currentTrack.videoId,
        title: currentTrack.name,
        artist: artistName
      });

      fetch(`/api/lyrics?${queryParams.toString()}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.lyrics && data.lyrics.lines) {
            setLyricsType(data.lyrics.type);
            setLyrics(data.lyrics.lines);
          } else {
            setLyrics([{ text: "Lirik belum tersedia untuk lagu ini." }]);
            setLyricsType('plain');
          }
        })
        .catch(() => {
          setLyrics([{ text: "Lirik belum tersedia untuk lagu ini." }]);
          setLyricsType('plain');
        });
    }
  }, [currentTrack, showLyrics, lyrics]);

  const handleLike = useCallback(async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentTrack) return;
    if (isLiked) {
      await db.removeLikedSong(currentTrack.videoId);
      setIsLiked(false);
    } else {
      await db.addLikedSong(currentTrack);
      setIsLiked(true);
    }
  }, [currentTrack, isLiked]);

  const onReady = useCallback(async (event: any) => {
    try {
      playerRef.current = event.target;
      const dur = await event.target.getDuration();
      setDuration(dur || 0);
      if (volume !== undefined && typeof event.target.setVolume === 'function') {
        event.target.setVolume(volume);
      }
    } catch (err) {
      console.warn("onReady error:", err);
    }
  }, [setDuration, volume]);

  const onStateChange = useCallback(async (event: any) => {
    try {
      if (event.data === YouTube.PlayerState.PLAYING) {
        setPlaying(true);
        const dur = await event.target.getDuration();
        setDuration(dur || 0);
      } else if (event.data === YouTube.PlayerState.PAUSED) {
        const state = usePlayerStore.getState();
        // If paused unexpectedly while user wants it playing and background play is enabled
        if (state.isPlaying && state.backgroundPlayEnabled && document.visibilityState === 'hidden') {
          setTimeout(() => {
            try {
              event.target.playVideo();
            } catch {
              // ignore
            }
          }, 150);
        } else {
          setPlaying(false);
        }
      } else if (event.data === YouTube.PlayerState.ENDED) {
        const state = usePlayerStore.getState();
        if (state.sleepTimerEndOfTrack) {
          state.setPlaying(false);
          state.clearSleepTimer();
          return;
        }
        if (state.repeatMode === 'one') {
          try {
            event.target.seekTo(0);
            event.target.playVideo();
          } catch {
            // ignore
          }
        } else {
          playNext();
        }
      }
    } catch (err) {
      console.warn("onStateChange error:", err);
    }
  }, [setPlaying, setDuration, playNext]);

  const onError = useCallback(async (event: any) => {
    const error = event.data;
    console.warn("YouTube Player Error:", error);
    
    if ((error === 101 || error === 150 || error === 100) && currentTrack && !isAlternativeTrying) {
      setIsAlternativeTrying(true);
      
      try {
        const artistName = Array.isArray(currentTrack.artist) ? currentTrack.artist.map(a => a.name).join(' ') : currentTrack.artist?.name || '';
        const query = `${currentTrack.name} ${artistName} audio`;
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=video`);
        if (res.ok) {
          const videos = await res.json();
          const alternativeVideo = videos.find((v: any) => v.videoId && v.videoId !== currentTrack.videoId);
          if (alternativeVideo) {
            setActiveVideoId(alternativeVideo.videoId);
            return;
          }
        }
      } catch (err) {
        console.warn("Failed to find alternative video", err);
      }
    }
    
    playNext();
  }, [currentTrack, isAlternativeTrying, playNext]);

  // Progress polling
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(async () => {
        try {
          if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
            const time = await playerRef.current.getCurrentTime();
            setProgress(time || 0);

            if ('mediaSession' in navigator && duration > 0) {
              try {
                navigator.mediaSession.setPositionState({
                  duration: duration,
                  playbackRate: 1,
                  position: Math.min(time || 0, duration)
                });
              } catch {
                // ignore
              }
            }
          }
        } catch {
          // ignore transient player state
        }
      }, 250);
    }
    return () => clearInterval(interval);
  }, [isPlaying, setProgress, duration]);

  // MediaSession API Integration
  useEffect(() => {
    if (currentTrack && 'mediaSession' in navigator) {
      const thumb = getHighResImage(currentTrack.thumbnails?.[currentTrack.thumbnails.length - 1]?.url, 800);
      const artist = Array.isArray(currentTrack.artist) ? currentTrack.artist.map(a => a.name).join(', ') : currentTrack.artist?.name || 'Unknown Artist';
      
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.name,
        artist: artist,
        album: 'Musicfly',
        artwork: [
          { src: thumb, sizes: '512x512', type: 'image/jpeg' },
          { src: thumb, sizes: '256x256', type: 'image/jpeg' },
          { src: thumb, sizes: '128x128', type: 'image/jpeg' },
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => {
        setPlaying(true);
        if (playerRef.current) playerRef.current.playVideo();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        setPlaying(false);
        if (playerRef.current) playerRef.current.pauseVideo();
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        playPrev();
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        playNext();
      });
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined && playerRef.current) {
          setProgress(details.seekTime);
          playerRef.current.seekTo(details.seekTime, true);
        }
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        if (playerRef.current) {
          const skipTime = details.seekOffset || 10;
          const newTime = Math.min(progress + skipTime, duration);
          setProgress(newTime);
          playerRef.current.seekTo(newTime, true);
        }
      });
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        if (playerRef.current) {
          const skipTime = details.seekOffset || 10;
          const newTime = Math.max(progress - skipTime, 0);
          setProgress(newTime);
          playerRef.current.seekTo(newTime, true);
        }
      });
      navigator.mediaSession.setActionHandler('stop', () => {
        setPlaying(false);
        if (playerRef.current) playerRef.current.pauseVideo();
      });
    }
  }, [currentTrack, setPlaying, playNext, playPrev, setProgress, progress, duration]);

  // Sync isPlaying with Player and MediaSession
  useEffect(() => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.playVideo();
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'playing';
        }
      } else {
        playerRef.current.pauseVideo();
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'paused';
        }
      }
    }
  }, [isPlaying]);

  // Background playback & Page Visibility Management
  useEffect(() => {
    const handleVisibilityChange = () => {
      const state = usePlayerStore.getState();
      if (document.visibilityState === 'hidden') {
        if (!state.backgroundPlayEnabled && playerRef.current && state.isPlaying) {
          playerRef.current.pauseVideo();
        } else if (state.backgroundPlayEnabled && state.isPlaying && playerRef.current) {
          // Re-assert playVideo to prevent background pause
          setTimeout(() => {
            try {
              if (playerRef.current) playerRef.current.playVideo();
            } catch {
              // ignore
            }
          }, 100);
        }
      } else if (document.visibilityState === 'visible') {
        if (state.isPlaying && playerRef.current) {
          try {
            playerRef.current.playVideo();
          } catch {
            // ignore
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const handleSeek = (newTime: number) => {
    setProgress(newTime);
    if (playerRef.current) {
      playerRef.current.seekTo(newTime, true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = Number(e.target.value);
    setVolume(newVol);
    if (playerRef.current) {
      playerRef.current.setVolume(newVol);
    }
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.y > 100 || info.velocity.y > 400) {
      setExpanded(false);
    }
  };

  if (!currentTrack) return null;

  const thumbnail = getHighResImage(currentTrack.thumbnails?.[currentTrack.thumbnails.length - 1]?.url, 800);
  const artistName = Array.isArray(currentTrack.artist) ? currentTrack.artist.map(a => a.name).join(', ') : currentTrack.artist?.name || 'Unknown Artist';

  return (
    <>
      {/* Silent Audio Keeper (Keeps Audio Focus alive when backgrounded) */}
      <audio
        ref={silentAudioRef}
        src={SILENT_AUDIO_URI}
        loop
        playsInline
        className="hidden"
      />

      {/* Embedded YouTube Player (Positioned inside viewport so browser doesn't throttle it) */}
      <div className="fixed bottom-2 right-2 w-1 h-1 pointer-events-none opacity-[0.01] overflow-hidden z-[-10]">
        {activeVideoId && (
          <YouTube
            videoId={activeVideoId}
            opts={{
              height: '1',
              width: '1',
              playerVars: {
                autoplay: 1,
                controls: 0,
                playsinline: 1,
                origin: typeof window !== 'undefined' ? window.location.origin : 'https://www.youtube.com',
              },
            }}
            onReady={onReady}
            onStateChange={onStateChange}
            onError={onError}
          />
        )}
      </div>

      {/* Mini Player (Floating Liquid Glass Pill above Metrolist full-width bottom nav) */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.div
            initial={{ y: 80, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] left-2.5 right-2.5 sm:left-6 sm:right-6 max-w-lg sm:mx-auto z-50 liquid-glass rounded-2xl flex items-center p-2 pr-3 cursor-pointer shadow-[0_12px_40px_rgba(0,0,0,0.6)] border border-white/20"
            onClick={() => setExpanded(true)}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTrack.videoId}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.25 }}
                className="flex items-center flex-1 min-w-0"
              >
                {/* Circular Album Art with Progress Ring */}
                <div className="relative w-11 h-11 shrink-0 mr-3">
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="5" />
                    <circle 
                      cx="50" cy="50" r="45" fill="none" stroke="#81B29A" strokeWidth="5" 
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - (duration > 0 ? progress / duration : 0))}`}
                      strokeLinecap="round"
                      className="transition-all duration-300 ease-linear"
                    />
                  </svg>
                  <div className="absolute inset-1 rounded-full overflow-hidden bg-white/5 shadow-inner">
                    <SmoothImage src={thumbnail} alt={currentTrack.name} fill sizes="44px" className="object-cover" />
                  </div>
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <MarqueeText text={currentTrack.name} className="text-white text-xs sm:text-sm font-bold" />
                  <MarqueeText 
                    text={
                      <>
                        {currentTrack.isExplicit && <span className="bg-white/20 text-[8px] px-1 rounded-sm text-white mr-1">E</span>}
                        {artistName}
                      </>
                    } 
                    className="text-white/60 text-[11px] mt-0.5" 
                  />
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="w-10 h-10 rounded-full liquid-glass-icon flex items-center justify-center text-white shadow-md"
                title={isPlaying ? "Jeda" : "Putar"}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={(e) => {
                  e.stopPropagation();
                  playNext();
                }}
                className="w-9 h-9 rounded-full liquid-glass-icon flex items-center justify-center text-white/80 hover:text-white shadow-md"
                title="Lagu Berikutnya"
              >
                <SkipForward className="w-4 h-4 fill-current" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={handleLike}
                className="w-9 h-9 rounded-full liquid-glass-icon flex items-center justify-center text-white shadow-md"
                title={isLiked ? "Hapus dari Disukai" : "Sukai"}
              >
                <Heart className={`w-4 h-4 transition-colors ${isLiked ? 'fill-[#FA243C] text-[#FA243C]' : 'text-white/80'}`} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Player with Drag-to-Dismiss Gesture */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={handleDragEnd}
            className="fixed inset-0 z-[100] flex flex-col p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:pb-8 overflow-hidden touch-none"
            style={{
              background: dominantColor 
                ? `linear-gradient(to bottom, color-mix(in srgb, ${dominantColor} 45%, #0B0F0D) 0%, #0B0F0D 100%)`
                : 'linear-gradient(to bottom, #1B2A22 0%, #0B0F0D 100%)'
            }}
          >
            {/* Top Drag Handle Indicator */}
            <div className="w-12 h-1.5 rounded-full bg-white/25 mx-auto mb-3 shrink-0 cursor-grab active:cursor-grabbing" />

            {/* Header Controls */}
            <div className="flex justify-between items-center mb-6 shrink-0 relative z-10">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setExpanded(false)} 
                className="w-10 h-10 rounded-full liquid-glass-icon text-white shadow-md"
              >
                <ChevronDown className="w-6 h-6" />
              </motion.button>

              <div className="flex items-center gap-1.5">
                {(sleepTimerTarget || sleepTimerEndOfTrack) ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowSleepTimerModal(true)}
                    className="px-3 py-1.5 rounded-full liquid-glass-green text-zinc-950 font-bold text-[11px] flex items-center gap-1.5 shadow-sm"
                  >
                    <Moon className="w-3.5 h-3.5 fill-current" />
                    <span>{sleepTimerEndOfTrack ? 'Akhir Lagu' : sleepTimerRemaining || 'Timer'}</span>
                  </motion.button>
                ) : (
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/50 px-3 py-1 rounded-full liquid-glass-subtle flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-[#81B29A]" /> Musicfly
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSleepTimerModal(true)} 
                  className={cn(
                    "w-10 h-10 rounded-full liquid-glass-icon text-white shadow-md transition-all",
                    (sleepTimerTarget || sleepTimerEndOfTrack) && "liquid-glass-green text-zinc-950 font-bold"
                  )}
                  title="Timer Tidur (Sleep Timer)"
                >
                  <Moon className={cn("w-4 h-4", (sleepTimerTarget || sleepTimerEndOfTrack) && "fill-current")} />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowVolumeSlider(!showVolumeSlider)} 
                  className="w-10 h-10 rounded-full liquid-glass-icon text-white shadow-md"
                  title="Volume"
                >
                  {volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTrackToAdd(currentTrack)} 
                  className="w-10 h-10 rounded-full liquid-glass-icon text-white shadow-md"
                  title="Tambah ke Playlist"
                >
                  <ListPlus className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Optional Volume Scrubbing Pill */}
            <AnimatePresence>
              {showVolumeSlider && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 px-4 py-2.5 rounded-2xl liquid-glass border border-white/15 flex items-center gap-3 shrink-0"
                >
                  <Volume2 className="w-4 h-4 text-white/60" />
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-full h-1.5 bg-white/20 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full cursor-pointer"
                  />
                  <span className="text-xs font-mono text-white/70 w-8 text-right">{volume}%</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Center Area: Album Art OR Synced Lyrics */}
            <div className="flex-1 flex flex-col justify-center items-center my-auto min-h-0 relative w-full">
              <AnimatePresence mode="wait">
                {showLyrics ? (
                  <motion.div 
                    key="lyrics"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.25 }}
                    className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden"
                    style={{
                      maskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
                      WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)"
                    }}
                  >
                    <div 
                      ref={lyricsContainerRef}
                      className="w-full h-full overflow-y-auto no-scrollbar space-y-7 text-center py-[25vh] px-4 scroll-smooth"
                    >
                      {lyrics && lyrics.length > 0 ? (
                        lyrics.map((line, index) => {
                          const LYRICS_OFFSET = 0.25;
                          const nextLine = lyrics[index + 1];
                          const isActive = lyricsType === 'synced' && line.time !== undefined && 
                            progress + LYRICS_OFFSET >= line.time && 
                            (!nextLine || !nextLine.time || progress + LYRICS_OFFSET < nextLine.time);

                          return (
                            <motion.p
                              key={index}
                              onClick={() => {
                                if (line.time !== undefined) {
                                  handleSeek(line.time);
                                }
                              }}
                              animate={{
                                scale: isActive ? 1.06 : 1,
                                opacity: isActive ? 1 : 0.35,
                              }}
                              transition={{ duration: 0.25 }}
                              className={cn(
                                "lyric-line transition-all duration-200 tracking-tight cursor-pointer leading-relaxed max-w-xl mx-auto",
                                isActive ? "text-white text-2xl sm:text-3xl font-black" : "text-white/40 text-lg sm:text-xl font-bold hover:text-white/70"
                              )}
                            >
                              {line.text}
                            </motion.p>
                          );
                        })
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-white/50 text-sm gap-3">
                          <div className="w-8 h-8 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          <p>Memuat lirik...</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="artwork"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.3 }}
                    className="relative w-full max-w-[320px] sm:max-w-[360px] aspect-square rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/20"
                  >
                    <SmoothImage
                      src={thumbnail}
                      alt={currentTrack.name}
                      fill
                      sizes="360px"
                      priority
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
                    
                    {/* Equalizer animation overlay when playing */}
                    {isPlaying && (
                      <div className="absolute bottom-4 right-4 flex items-end gap-1 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 shadow-md">
                        <div className="w-1 bg-[#81B29A] rounded-full eq-bar-1" />
                        <div className="w-1 bg-[#81B29A] rounded-full eq-bar-2" />
                        <div className="w-1 bg-[#81B29A] rounded-full eq-bar-3" />
                        <div className="w-1 bg-[#81B29A] rounded-full eq-bar-4" />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Controls Area */}
            <div className="w-full max-w-lg mx-auto mt-6 shrink-0">
              {/* Track Title & Like Button */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex-1 min-w-0 pr-4">
                  <MarqueeText text={currentTrack.name} className="text-xl sm:text-2xl font-black text-white tracking-tight" />
                  <MarqueeText 
                    text={
                      <>
                        {currentTrack.isExplicit && <span className="bg-white/20 text-[9px] px-1.5 py-0.5 rounded text-white mr-1.5 font-bold">EXPLICIT</span>}
                        {artistName}
                      </>
                    } 
                    className="text-sm font-semibold text-white/65 mt-1" 
                  />
                </div>
                <div className="flex items-center gap-2">
                  <motion.button 
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.85 }}
                    onClick={handleLike}
                    className="w-11 h-11 rounded-full liquid-glass-icon shadow-md"
                  >
                    <Heart className={cn("w-5 h-5 transition-colors", isLiked ? "fill-[#FA243C] text-[#FA243C]" : "text-white/80")} />
                  </motion.button>
                </div>
              </div>

              {/* Spotify Clean Seekbar */}
              <div className="mb-5">
                <SpotifySeekBar
                  progress={progress}
                  duration={duration}
                  onSeek={handleSeek}
                />
              </div>

              {/* Playback Controls */}
              <div className="flex justify-between items-center mb-6 px-3">
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleShuffle}
                  className={cn("w-11 h-11 rounded-full liquid-glass-icon transition-all shadow-md", isShuffle ? "liquid-glass-green text-zinc-950 font-bold" : "text-white/70 hover:text-white")}
                  title="Acak"
                >
                  <Shuffle className="w-4 h-4" />
                </motion.button>

                <motion.button 
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={playPrev} 
                  className="w-12 h-12 rounded-full liquid-glass-icon text-white shadow-md" 
                  title="Sebelumnya"
                >
                  <SkipBack className="w-5 h-5 fill-current" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={togglePlay}
                  className="w-18 h-18 sm:w-20 sm:h-20 flex items-center justify-center bg-white text-zinc-950 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-transform"
                  title={isPlaying ? "Jeda" : "Putar"}
                >
                  {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                </motion.button>

                <motion.button 
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={playNext} 
                  className="w-12 h-12 rounded-full liquid-glass-icon text-white shadow-md" 
                  title="Berikutnya"
                >
                  <SkipForward className="w-5 h-5 fill-current" />
                </motion.button>

                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleRepeat}
                  className={cn("w-11 h-11 rounded-full liquid-glass-icon transition-all shadow-md", repeatMode !== 'off' ? "liquid-glass-green text-zinc-950" : "text-white/70 hover:text-white")}
                  title="Ulangi"
                >
                  {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
                </motion.button>
              </div>

              {/* Bottom Quick Action Pills */}
              <div className="flex justify-around items-center p-2 rounded-2xl liquid-glass-pill border border-white/10">
                <button
                  onClick={() => setShowLyrics(!showLyrics)}
                  className={cn("transition flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold", showLyrics ? "liquid-glass-button bg-white/20 text-white" : "text-white/70 hover:text-white hover:bg-white/10")}
                >
                  <Mic2 className="w-4 h-4 text-[#81B29A]" />
                  <span>Lirik</span>
                </button>

                <button
                  onClick={() => setShowSleepTimerModal(true)}
                  className={cn(
                    "transition flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold",
                    (sleepTimerTarget || sleepTimerEndOfTrack) 
                      ? "liquid-glass-green text-zinc-950" 
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  )}
                >
                  <Moon className="w-4 h-4 text-[#81B29A]" />
                  <span>{sleepTimerEndOfTrack ? 'Akhir Lagu' : sleepTimerRemaining ? sleepTimerRemaining : 'Timer Tidur'}</span>
                </button>

                <button 
                  onClick={() => {
                    const artistId = Array.isArray(currentTrack.artist) 
                      ? currentTrack.artist[0]?.artistId 
                      : currentTrack.artist?.artistId;
                    if (artistId) {
                      setExpanded(false);
                      router.push(`/artist/${artistId}`);
                    }
                  }}
                  className="text-white/70 hover:text-white transition flex items-center gap-2 px-3.5 py-2 rounded-xl hover:bg-white/10 text-xs font-bold"
                >
                  <User className="w-4 h-4 text-[#81B29A]" />
                  <span>Artis</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sleep Timer Configuration Modal */}
      <SleepTimerModal
        isOpen={showSleepTimerModal}
        onClose={() => setShowSleepTimerModal(false)}
      />
    </>
  );
}
