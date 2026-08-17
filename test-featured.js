const YTMusic = require('ytmusic-api');

async function test() {
  const ytmusic = new YTMusic();
  await ytmusic.initialize();
  try {
    const artist = await ytmusic.getArtist('UCVacQ2t5GUZ2t_J3Ia9BynA');
    console.log("Featured On:");
    artist.featuredOn.forEach(item => {
      console.log(`- ${item.name} (ID: ${item.playlistId})`);
    });
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
