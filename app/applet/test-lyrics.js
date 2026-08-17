console.log("Starting...");
const YTMusic = require('ytmusic-api').default;

async function test() {
  console.log("Inside test");
  const ytmusic = new YTMusic();
  await ytmusic.initialize();
  try {
    const song = await ytmusic.getSong('dQw4w9WgXcQ');
    console.log("Song lyricsId:", song.lyricsId);
    
    const lyrics = await ytmusic.getLyrics('dQw4w9WgXcQ');
    console.log("Lyrics directly from videoId:", lyrics ? lyrics.length : null);
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
