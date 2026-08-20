import { ArrowLeft } from 'lucide-react';
import { SmoothImage } from '@/components/SmoothImage';
import Link from 'next/link';
import { getHighResImage } from '@/lib/utils';
import { notFound } from 'next/navigation';
import { getYTMusic } from '@/lib/ytmusic';
import AlbumClient from './AlbumClient';
import AlbumTrackClient from './AlbumTrackClient';
import { MarqueeText } from '@/components/MarqueeText';

async function getAlbumDetails(rawId: string) {
  try {
    const ytmusic = await getYTMusic();
    const candidateIds = [
      rawId,
      rawId.startsWith('OLAK') || rawId.startsWith('RD') ? `VL${rawId}` : null,
      rawId.startsWith('VL') ? rawId.slice(2) : `VL${rawId}`
    ].filter(Boolean) as string[];

    for (const id of candidateIds) {
      try {
        const album = await ytmusic.getAlbum(id);
        if (album && album.songs) return album;
      } catch {
        // try next candidate
      }
    }
    return null;
  } catch (error: any) {
    console.error('Error fetching album:', error?.message || error);
    return null;
  }
}

export default async function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const album = await getAlbumDetails(resolvedParams.id);

  if (!album) {
    notFound();
  }

  const coverImage = album.thumbnails?.[album.thumbnails.length - 1]?.url || 'https://picsum.photos/seed/album/800/800';
  const totalDuration = album.songs.reduce((acc, song) => acc + (song.duration || 0), 0);
  
  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <main className="min-h-screen pb-32 bg-black">
      <div className="sticky top-0 z-10 bg-black/50 backdrop-blur-md pt-6 pb-4 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Link href="/" className="w-10 h-10 rounded-full liquid-glass-icon flex items-center justify-center text-white hover:scale-105 transition-all shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <MarqueeText text={album.name} className="text-xl font-bold text-white" />
        </div>
      </div>

      <div className="flex flex-col items-center px-4 mt-4 mb-8">
        <div className="relative w-64 h-64 rounded-2xl overflow-hidden shadow-2xl mb-6 bg-white/5">
          <SmoothImage src={getHighResImage(coverImage, 800)} alt={album.name} fill sizes="(max-width: 640px) 100vw, 300px" priority className="object-cover" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2 text-center">{album.name}</h2>
        <Link href={`/artist/${album.artist.artistId}`} className="text-white/80 hover:underline text-base mb-2">
          {album.artist.name}
        </Link>
        <p className="text-white/60 text-sm mb-6">
          {album.year} • {album.songs.length} lagu • {formatDuration(totalDuration)}
        </p>
        
        <AlbumClient album={album} />
      </div>

      <div className="space-y-1">
        {album.songs.map((track, index) => {
          const artistName = Array.isArray(track.artist) ? track.artist.map(a => a.name).join(', ') : track.artist?.name || album.artist.name;
          
          return (
            <AlbumTrackItem 
              key={`${track.videoId}-${index}`} 
              track={track} 
              index={index} 
              album={album} 
              artistName={artistName} 
            />
          );
        })}
      </div>
    </main>
  );
}

function AlbumTrackItem({ track, index, album, artistName }: { track: any, index: number, album: any, artistName: string }) {
  return (
    <AlbumTrackClient track={track} index={index} album={album} artistName={artistName} />
  );
}
