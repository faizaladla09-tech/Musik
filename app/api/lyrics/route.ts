import { NextResponse } from 'next/server';
import { getYTMusic } from '@/lib/ytmusic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const title = searchParams.get('title');
  const artist = searchParams.get('artist');
  
  if (!id || id.length !== 11) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  
  try {
    let finalLyrics: any = null;

    // 1. Try LRCLIB API first for synced lyrics
    if (title && artist) {
      try {
        const q = new URLSearchParams({ track_name: title, artist_name: artist }).toString();
        const res = await fetch('https://lrclib.net/api/get?' + q, { headers: { 'User-Agent': 'AppleMusicClone/1.0.0' } });
        if (res.ok) {
          const data = await res.json();
          if (data && data.syncedLyrics) {
            const lines = data.syncedLyrics.split('\n');
            const parsed = lines.map((line: string) => {
              const match = line.match(/\[(\d{2}):(\d{2}(?:\.\d{2,3})?)\](.*)/);
              if (match) {
                const time = parseInt(match[1], 10) * 60 + parseFloat(match[2]);
                return { time, text: match[3].trim() };
              }
              return null;
            }).filter(Boolean);
            if (parsed.length > 0) {
              finalLyrics = { type: 'synced', lines: parsed };
            }
          } else if (data && data.plainLyrics && !finalLyrics) {
            const lines = data.plainLyrics.split('\n').filter((v: string) => !!v.trim());
            finalLyrics = { type: 'plain', lines: lines.map((text: string) => ({ text })) };
          }
        }
      } catch (err) {
        console.error('LRCLIB fetch error:', err);
      }
    }

    // 2. Fallback to YTMusic text lyrics
    if (!finalLyrics) {
      const ytmusic = await getYTMusic();
      try {
        const watchPlaylistData = await (ytmusic as any).constructRequest('next', { videoId: id });
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

        if (lyricsId) {
          const lyricsData = await (ytmusic as any).constructRequest('browse', { browseId: lyricsId });
          const runs = lyricsData?.contents?.sectionListRenderer?.contents?.[0]?.musicDescriptionShelfRenderer?.description?.runs;
          let lyricsText = null;
          
          if (runs) {
            lyricsText = runs.map((r: any) => r.text).join('');
          }
          
          if (lyricsText && !lyricsText.includes('Lyrics not available')) {
            const lines = lyricsText.replaceAll('\r', '').split('\n').filter((v: string) => !!v.trim());
            finalLyrics = { type: 'plain', lines: lines.map((text: string) => ({ text })) };
          }
        }
      } catch (e: any) {
        if (e.message !== 'Invalid videoId') {
          console.error('Error fetching lyrics from ytmusic:', e);
        }
      }
    }
    
    return NextResponse.json({ lyrics: finalLyrics }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error: any) {
    console.warn(`Lyrics error for id ${id}:`, error?.message || error);
    return NextResponse.json({ lyrics: null }, { status: 200 });
  }
}
