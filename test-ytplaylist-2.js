const YTMusic = require('ytmusic-api');

async function test() {
  const ytmusic = new YTMusic();
  await ytmusic.initialize();
  try {
    const playlist = await ytmusic.getPlaylist('VLRDCLAK5uy_lBNUteBRencHzKelu5iDHwLF6mYqjL-JU');
    console.log(JSON.stringify(playlist, null, 2));
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
