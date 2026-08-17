const YTMusic = require('ytmusic-api');

async function test() {
  const ytmusic = new YTMusic();
  await ytmusic.initialize();
  try {
    const playlist = await ytmusic.getPlaylist('VLRDCLAK5uy_lBNUteBRencHzKelu5iDHwLF6mYqjL-JU');
    console.log("Playlist Name:", playlist.name);
    console.log("Videos length:", playlist.videos?.length);
    if (playlist.videos?.length > 0) {
      console.log("First video:", playlist.videos[0].name);
    }
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
