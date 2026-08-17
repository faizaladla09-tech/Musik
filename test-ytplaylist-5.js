const YTMusic = require('ytmusic-api');

async function test() {
  const ytmusic = new YTMusic();
  await ytmusic.initialize();
  try {
    const videos = await ytmusic.getPlaylistVideos('VLRDCLAK5uy_lBNUteBRencHzKelu5iDHwLF6mYqjL-JU');
    console.log("Videos length:", videos?.length);
    if (videos?.length > 0) {
      console.log("First video thumbnail:", videos[0].thumbnails);
      console.log("Second video thumbnail:", videos[1].thumbnails);
    }
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
