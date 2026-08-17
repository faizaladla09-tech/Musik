import { NextResponse } from 'next/server';
import YTMusic from 'ytmusic-api';

const ytmusic = new YTMusic();
let initialized = false;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id || id.length !== 11) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  
  try {
    if (!initialized) {
      await ytmusic.initialize();
      initialized = true;
    }
    
    try {
      // 1. Fetch the watch playlist using the video ID
      const watchPlaylistData = await (ytmusic as any).constructRequest('next', { videoId: id });
      
      // 2. Get the lyrics ID from the watch playlist
      let lyricsId = null;
      const tabs = watchPlaylistData?.contents?.singleColumnMusicWatchNextResultsRenderer?.tabbedRenderer?.watchNextTabbedResultsRenderer?.tabs;
      
      if (tabs) {
        for (const tab of tabs) {
          const tabRenderer = tab.tabRenderer;
          if (tabRenderer?.endpoint?.browseEndpoint?.browseEndpointContextSupportedConfigs?.browseEndpointContextMusicConfig?.pageType === "MUSIC_PAGE_TYPE_TRACK_LYRICS") {
            lyricsId = tabRenderer.endpoint.browseEndpoint.browseId;
            break;
          }
        }
      }

      // 3. Use that lyrics ID to fetch the lyrics
      if (lyricsId) {
        const lyricsData = await (ytmusic as any).constructRequest('browse', { browseId: lyricsId });
        
        const runs = lyricsData?.contents?.sectionListRenderer?.contents?.[0]?.musicDescriptionShelfRenderer?.description?.runs;
        let lyricsText = null;
        
        if (runs) {
          lyricsText = runs.map((r: any) => r.text).join('');
        }
        
        if (lyricsText && !lyricsText.includes('Lyrics not available')) {
          const lyrics = lyricsText.replaceAll('\r', '').split('\n').filter((v: string) => !!v);
          return NextResponse.json({ lyrics }, {
            headers: {
              'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            },
          });
        }
      }
    } catch (e: any) {
      if (e.message !== 'Invalid videoId') {
        console.error('Error fetching lyrics:', e);
      }
    }
    
    return NextResponse.json({ lyrics: null }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return NextResponse.json({ lyrics: null });
    }
    if (error?.message?.includes('Invalid videoId') || (error?.isAxiosError && error?.response?.status === 400)) {
      return NextResponse.json({ lyrics: null });
    }
    console.error(`Lyrics error for id ${id}:`, error?.message || error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
