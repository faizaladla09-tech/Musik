const YTMusic = require('ytmusic-api');

async function test() {
  const ytmusic = new YTMusic();
  await ytmusic.initialize();
  try {
    const album = await ytmusic.getAlbum('UCVacQ2t5GUZ2t_J3Ia9BynA');
    console.log("Album Name:", album.name);
  } catch (e) {
    console.error("Error:", e.message);
  }
}
test();
