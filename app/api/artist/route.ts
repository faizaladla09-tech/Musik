import { NextResponse } from 'next/server';
import { getYTMusic, safeSearchSongs, safeSearchVideos } from '@/lib/ytmusic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) return NextResponse.json({ error: 'Artist ID required' }, { status: 400 });
  
  try {
    const ytmusic = await getYTMusic();
    let artist: any = null;

    try {
      artist = await ytmusic.getArtist(id);
    } catch (e: any) {
      console.warn(`ytmusic.getArtist failed for id ${id} (e.g. ZodError), attempting fallback search...`, e?.name || e?.message);
    }
    
    // If getArtist succeeded, ensure topVideos are populated and fix carousels
    if (artist) {
      // Clean up featuredOn / livePerformances if misassigned by ytmusic-api
      if (artist.featuredOn && artist.featuredOn.length > 0 && artist.featuredOn[0].playlistId === artist.artistId) {
        const liveVids = artist.featuredOn.map((item: any) => {
          let videoId = item.playlistId;
          if (item.thumbnails && item.thumbnails.length > 0) {
            const match = item.thumbnails[0].url.match(/\/vi\/([a-zA-Z0-9-_]{11})\//);
            if (match) videoId = match[1];
          }
          return { ...item, type: 'VIDEO', videoId };
        });
        
        if (artist.similarArtists && artist.similarArtists.length > 0 && 
            (artist.similarArtists[0].artistId.startsWith('VL') || 
             artist.similarArtists[0].artistId.startsWith('PL') || 
             artist.similarArtists[0].artistId.startsWith('RD'))) {
          
          artist.featuredOn = artist.similarArtists.map((item: any) => ({
            type: 'PLAYLIST',
            playlistId: item.artistId,
            name: item.name,
            artist: { name: artist.name, artistId: artist.artistId },
            thumbnails: item.thumbnails
          }));
          
          artist.similarArtists = [];
        } else {
          artist.featuredOn = [];
        }
        
        (artist as any).livePerformances = liveVids;
      }

      // Ensure artist has topVideos (Music Videos / Live)
      if (!artist.topVideos || artist.topVideos.length === 0) {
        try {
          const vids = await safeSearchVideos(`${artist.name} official video`);
          if (Array.isArray(vids) && vids.length > 0) {
            artist.topVideos = vids.slice(0, 12);
          }
        } catch {
          // ignore
        }
      }
      
      return NextResponse.json(artist, {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      });
    }

    // Fallback when ytmusic.getArtist fails (e.g. ZodError or schema change):
    let fallbackSongs: any[] = [];
    let fallbackAlbums: any[] = [];
    let fallbackVideos: any[] = [];
    let artistName = id;
    let thumbnails: any[] = [];

    try {
      const searchRes = await ytmusic.search(id).catch(() => []);
      if (Array.isArray(searchRes)) {
        const artistMatch = searchRes.find((item: any) => item.type === 'ARTIST' || item.artistId === id);
        if (artistMatch) {
          artistName = artistMatch.name || id;
          thumbnails = artistMatch.thumbnails || [];
        }
      }

      fallbackSongs = await safeSearchSongs(artistName);
      fallbackVideos = await safeSearchVideos(`${artistName} official video`);
      
      if (fallbackSongs.length > 0 && (!thumbnails || thumbnails.length === 0)) {
        const first = fallbackSongs[0];
        thumbnails = first.thumbnails || [];
        if (first.artist?.name) artistName = first.artist.name;
      }
    } catch {
      // ignore
    }

    const fallbackArtist = {
      artistId: id,
      name: artistName || 'Artis',
      thumbnails: thumbnails.length > 0 ? thumbnails : [{ url: 'https://picsum.photos/seed/artist/400/400', width: 400, height: 400 }],
      topSongs: fallbackSongs.slice(0, 20),
      topAlbums: fallbackAlbums,
      topSingles: [],
      topVideos: fallbackVideos.slice(0, 12),
      similarArtists: []
    };

    return NextResponse.json(fallbackArtist, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error: any) {
    console.warn(`Artist route error for id ${id}:`, error?.message || error);
    return NextResponse.json({
      artistId: id,
      name: 'Artis',
      thumbnails: [{ url: 'https://picsum.photos/seed/artist/400/400', width: 400, height: 400 }],
      topSongs: [],
      topAlbums: [],
      topSingles: [],
      topVideos: [],
      similarArtists: []
    }, { status: 200 });
  }
}
