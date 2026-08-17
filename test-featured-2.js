const YTMusic = require('ytmusic-api');

async function test() {
  const ytmusic = new YTMusic();
  await ytmusic.initialize();
  try {
    const artist = await ytmusic.getArtist('UCVacQ2t5GUZ2t_J3Ia9BynA');
    const actualFeaturedOn = artist.similarArtists?.filter((a) => !a.artistId?.startsWith('UC') && !a.artistId?.startsWith('HC')) || [];
    console.log("Actual Featured On:");
    actualFeaturedOn.forEach(item => {
      console.log(`- ${item.name} (ID: ${item.artistId})`);
    });
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
