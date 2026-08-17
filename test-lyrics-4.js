const YTMusic = require('ytmusic-api');

async function test() {
  const ytmusic = new YTMusic();
  await ytmusic.initialize();
  try {
    const lyrics = await ytmusic.getLyrics('fJ9rUzIMcZQ');
    console.log("Lyrics length:", lyrics ? lyrics.length : null);
    if (lyrics) {
        console.log("First line:", lyrics[0]);
    }
  } catch (e) {
    console.error("Error:", e.message);
  }
}
test();
