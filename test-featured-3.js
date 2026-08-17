const YTMusic = require('ytmusic-api');

async function test() {
  const ytmusic = new YTMusic();
  await ytmusic.initialize();
  try {
    const artist = await ytmusic.getArtist('UCVacQ2t5GUZ2t_J3Ia9BynA');
    const actualFeaturedOn = artist.similarArtists?.filter((a) => !a.artistId?.startsWith('UC') && !a.artistId?.startsWith('HC')) || [];
    console.log(JSON.stringify(actualFeaturedOn[0], null, 2));
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
