'use client';

import { Track, usePlayerStore } from '@/lib/store';
import Image from 'next/image';
import { getHighResImage } from '@/lib/utils';
import { Play, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { MarqueeText } from './MarqueeText';
import { useRouter } from 'next/navigation';

export function HorizontalScroll({ title, tracks }: { title: string; tracks: Track[] }) {
  const playTrack = usePlayerStore((state) => state.playTrack);
  const router = useRouter();

  let headerContent = <h2 className="text-xl font-bold text-white mb-4 px-4">{title}</h2>;

  if (title.startsWith('Serupa dengan ')) {
    const mainTitle = title.replace('Serupa dengan ', '');
    const headerImage = getHighResImage(tracks[0]?.thumbnails?.[0]?.url, 100);
    
    let artistId = '';
    for (const track of tracks) {
      if (track.artist && !Array.isArray(track.artist) && track.artist.artistId) {
        artistId = track.artist.artistId;
        break;
      } else if (Array.isArray(track.artist) && track.artist[0]?.artistId) {
        artistId = track.artist[0].artistId;
        break;
      }
    }

    const handleHeaderClick = () => {
      if (artistId) {
        router.push(`/artist/${artistId}`);
      } else {
        router.push(`/search?q=${encodeURIComponent(mainTitle)}`);
      }
    };

    headerContent = (
      <div 
        className="flex items-center justify-between mb-4 px-4 cursor-pointer group"
        onClick={handleHeaderClick}
      >
        <div className="flex items-center gap-4">
          {headerImage && (
            <div className="w-14 h-14 rounded-md overflow-hidden relative shrink-0">
              <Image src={headerImage} alt={mainTitle} fill className="object-cover" />
            </div>
          )}
          <div className="flex flex-col justify-center">
            <span className="text-sm text-white/70 font-medium">Serupa dengan</span>
            <h2 className="text-2xl font-bold text-white leading-tight">{mainTitle}</h2>
          </div>
        </div>
        <button className="p-2 text-white/70 group-hover:text-white transition-colors">
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="mb-8">
      {headerContent}
      <div className="flex overflow-x-auto no-scrollbar gap-4 px-4 pb-4 snap-x snap-mandatory scroll-smooth">
        {tracks.map((track, i) => {
          const thumbnail = getHighResImage(track.thumbnails?.[track.thumbnails.length - 1]?.url, 400);
          const artistName = Array.isArray(track.artist) ? track.artist.map(a => a.name).join(', ') : track.artist?.name || 'Unknown Artist';

          return (
            <motion.div
              key={`${track.videoId}-${i}`}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex-none w-36 cursor-pointer group snap-center hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"
              onClick={() => playTrack(track, tracks)}
            >
              <div className="relative w-36 h-36 rounded-xl overflow-hidden mb-2 shadow-lg transition-transform duration-300">
                <Image src={thumbnail} alt={track.name} fill sizes="144px" className="object-cover" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              <MarqueeText text={track.name} className="text-sm font-medium text-white leading-tight" />
              <MarqueeText text={artistName} className="text-xs text-gray-400 mt-1" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
