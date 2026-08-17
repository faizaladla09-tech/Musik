const YTMusic = require('ytmusic-api');

async function test() {
  const ytmusic = new YTMusic();
  await ytmusic.initialize();
  try {
    const lyrics = await ytmusic.getLyrics('kJQP7kiw5Fk'); // Despacito
    console.log("Lyrics length:", lyrics ? lyrics.length : null);
  } catch (e) {
    console.error("Error:", e.message);
  }
}
test();
