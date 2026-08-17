import { NextResponse } from 'next/server';
import YTMusic from 'ytmusic-api';

const ytmusic = new YTMusic();
let initialized = false;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) return NextResponse.json({ error: 'Artist ID required' }, { status: 400 });
  
  try {
    if (!initialized) {
      await ytmusic.initialize();
      initialized = true;
    }
    const artist = await ytmusic.getArtist(id);
    
    // Fix ytmusic-api bug where carousels are shifted for artists with extra carousels (like "Live performances")
    if (artist.featuredOn && artist.featuredOn.length > 0 && artist.featuredOn[0].playlistId === artist.artistId) {
      // The featuredOn array actually contains videos (Live performances)
      const videos = artist.featuredOn.map((item: any) => {
        let videoId = item.playlistId;
        if (item.thumbnails && item.thumbnails.length > 0) {
          const match = item.thumbnails[0].url.match(/\/vi\/([a-zA-Z0-9-_]{11})\//);
          if (match) videoId = match[1];
        }
        return { ...item, type: 'VIDEO', videoId };
      });
      
      // Check if similarArtists actually contains the real featuredOn playlists
      if (artist.similarArtists && artist.similarArtists.length > 0 && 
          (artist.similarArtists[0].artistId.startsWith('VL') || 
           artist.similarArtists[0].artistId.startsWith('PL') || 
           artist.similarArtists[0].artistId.startsWith('RD'))) {
        
        // Swap them
        artist.featuredOn = artist.similarArtists.map((item: any) => ({
          type: 'PLAYLIST',
          playlistId: item.artistId,
          name: item.name,
          artist: { name: artist.name, artistId: artist.artistId },
          thumbnails: item.thumbnails
        }));
        
        // Clear similarArtists since we lost the real ones
        artist.similarArtists = [];
      } else {
        artist.featuredOn = [];
      }
      
      // Add the videos to topVideos if we want, or just expose them as livePerformances
      (artist as any).livePerformances = videos;
    }
    
    return NextResponse.json(artist, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return NextResponse.json({ error: 'ZodError', details: error.issues }, { status: 500 });
    }
    if (error?.isAxiosError && error?.response?.status === 400) {
      return NextResponse.json({ error: 'Invalid artist ID' }, { status: 400 });
    }
    console.error(`Artist error for id ${id}:`, error?.message || error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
