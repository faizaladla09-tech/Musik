const YTMusic = require('ytmusic-api');

async function test() {
  const ytmusic = new YTMusic();
  await ytmusic.initialize();
  try {
    const playlist = await ytmusic.getPlaylist('UCVacQ2t5GUZ2t_J3Ia9BynA');
    console.log("Playlist Name:", playlist.name);
  } catch (e) {
    console.error("Error:", e.message);
  }
}
test();
