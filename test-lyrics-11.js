const YTMusic = require('ytmusic-api');

async function test() {
  const ytmusic = new YTMusic();
  await ytmusic.initialize();
  try {
    // A random non-music video or a very obscure track
    const data = await ytmusic['constructRequest']("next", { videoId: 'jNQXAC9IVRw' }); // Me at the zoo
    const fs = require('fs');
    fs.writeFileSync('next-response-5.json', JSON.stringify(data, null, 2));
    console.log("Saved next-response-5.json");
  } catch (e) {
    console.error("Error:", e.message);
  }
}
test();
