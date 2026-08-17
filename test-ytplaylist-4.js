const YTMusic = require('ytmusic-api');

async function test() {
  const ytmusic = new YTMusic();
  await ytmusic.initialize();
  try {
    const videos = await ytmusic.getPlaylistVideos('VLRDCLAK5uy_kY7Uomg8uSGAGuvMIKc3HsVg_ipocKTrE');
    console.log("Videos length:", videos?.length);
    if (videos?.length > 0) {
      console.log("First video:", videos[0].name);
    }
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
