const YTMusic = require('ytmusic-api');

async function test() {
  const ytmusic = new YTMusic();
  await ytmusic.initialize();
  try {
    const id = 'yl3TsqL0ZPw';
    const watchPlaylistData = await ytmusic['constructRequest']('next', { videoId: id });
    
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
      const lyricsData = await ytmusic['constructRequest']('browse', { browseId: lyricsId });
      const runs = lyricsData?.contents?.sectionListRenderer?.contents?.[0]?.musicDescriptionShelfRenderer?.description?.runs;
      let lyricsText = null;
      if (runs) {
        lyricsText = runs.map(r => r.text).join('');
      }
      
      if (lyricsText && !lyricsText.includes('Lyrics not available')) {
        const lyrics = lyricsText.replaceAll('\r', '').split('\n').filter(v => !!v);
        console.log("Lyrics length:", lyrics.length);
        console.log("First line:", lyrics[0]);
      } else {
        console.log("Lyrics not available");
      }
    } else {
      console.log("No lyrics tab found");
    }
  } catch (e) {
    console.error("Error:", e.message);
  }
}
test();
