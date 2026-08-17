import YTMusic from 'ytmusic-api';

async function test() {
  const ytmusic = new YTMusic();
  await ytmusic.initialize();
  try {
    const lyrics = await ytmusic.getLyrics('dQw4w9WgXcQ'); // Rick Astley
    console.log(lyrics);
  } catch (e) {
    console.error(e);
  }
}
test();
