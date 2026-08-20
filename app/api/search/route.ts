import { NextResponse } from 'next/server';
import { 
  safeSearchSongs, 
  safeSearchVideos, 
  safeSearchArtists, 
  safeSearchPlaylists,
  getYTMusic
} from '@/lib/ytmusic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const type = searchParams.get('type');
  
  if (!query) return NextResponse.json([], { status: 200 });
  
  try {
    if (type === 'playlist') {
      const playlists = await safeSearchPlaylists(query);
      return NextResponse.json(playlists, {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      });
    }
    
    if (type === 'artist') {
      const artists = await safeSearchArtists(query);
      return NextResponse.json(artists, { 
        headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } 
      });
    }
    
    if (type === 'song') {
      const songs = await safeSearchSongs(query);
      return NextResponse.json(songs, { 
        headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } 
      });
    }
    
    if (type === 'video') {
      const videos = await safeSearchVideos(query);
      return NextResponse.json(videos, { 
        headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } 
      });
    }

    if (type === 'all') {
      try {
        const ytmusic = await getYTMusic();
        const results = await ytmusic.search(query).catch(() => []);
        return NextResponse.json(Array.isArray(results) ? results : [], { 
          headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } 
        });
      } catch {
        const songs = await safeSearchSongs(query);
        return NextResponse.json(songs, { 
          headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } 
        });
      }
    }

    // Default: search sequentially with safe fallbacks to avoid 403 or schema ZodError
    const songs = await safeSearchSongs(query);
    const videos = await safeSearchVideos(query);
    const artists = await safeSearchArtists(query);
    
    const results = [
      ...(Array.isArray(songs) ? songs : []),
      ...(Array.isArray(videos) ? videos : []),
      ...(Array.isArray(artists) ? artists : [])
    ];

    return NextResponse.json(results, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error: any) {
    console.warn('Search route error:', error?.message || error);
    return NextResponse.json([], { status: 200 });
  }
}
