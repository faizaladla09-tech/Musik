import { Play, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { getHighResImage } from '@/lib/utils';
import { motion } from 'motion/react';
import { MarqueeText } from './MarqueeText';
import { usePlayerStore } from '@/lib/store';
import { useRouter } from 'next/navigation';

interface MixedScrollProps {
  title: string;
  items: any[];
}

export function MixedScroll({ title, items }: MixedScrollProps) {
  const playTrack = usePlayerStore((state) => state.playTrack);
  const router = useRouter();

  if (!items || items.length === 0) return null;

  let headerContent = <h2 className="text-xl font-bold text-white mb-4 px-4">{title}</h2>;

  if (title.startsWith('Serupa dengan ')) {
    const mainTitle = title.replace('Serupa dengan ', '');
    const headerImage = getHighResImage(items[0]?.thumbnails?.[0]?.url, 100);
    
    let artistId = '';
    for (const item of items) {
      if (item.type === 'ARTIST' && item.artistId) {
        artistId = item.artistId;
        break;
      } else if (item.artist?.artistId) {
        artistId = item.artist.artistId;
        break;
      } else if (Array.isArray(item.artist) && item.artist[0]?.artistId) {
        artistId = item.artist[0].artistId;
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
        {items.map((item, i) => {
          const type = item.type;
          const isArtist = type === 'ARTIST';
          const isPlaylist = type === 'PLAYLIST';
          const isAlbum = type === 'ALBUM';
          const isSong = type === 'SONG' || type === 'VIDEO';

          const titleText = item.name || item.title || 'Unknown';
          const subtitleText = isArtist 
            ? 'Artist' 
            : isPlaylist 
              ? 'Playlist' 
              : isAlbum 
                ? 'Album' 
                : Array.isArray(item.artist) 
                  ? item.artist.map((a: any) => a.name).join(', ') 
                  : item.artist?.name || 'Song';

          const handleClick = () => {
            if (isArtist && item.artistId) {
              router.push(`/artist/${item.artistId}`);
            } else if (isPlaylist && item.playlistId) {
              router.push(`/playlist/${item.playlistId}`);
            } else if (isAlbum && item.albumId) {
              router.push(`/album/${item.albumId}`);
            } else if (isSong && item.videoId) {
              playTrack(item, [item], 'similar');
            }
          };

          return (
            <motion.div
              key={`${item.videoId || item.playlistId || item.albumId || item.artistId}-${i}`}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex-none w-36 cursor-pointer group snap-center hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"
              onClick={handleClick}
            >
              <div className={`relative w-36 h-36 overflow-hidden mb-2 shadow-lg transition-transform duration-300 ${isArtist ? 'rounded-full' : 'rounded-xl'}`}>
                <Image 
                  src={getHighResImage(item.thumbnails?.[item.thumbnails.length - 1]?.url, 400)} 
                  alt={titleText} 
                  fill 
                  sizes="144px" 
                  className="object-cover" 
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="w-full">
                <MarqueeText text={titleText} className="text-sm font-medium text-white leading-tight" />
                <MarqueeText text={subtitleText} className="text-xs text-gray-400 mt-1" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
