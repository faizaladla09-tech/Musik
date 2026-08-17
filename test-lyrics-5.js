const YTMusic = require('ytmusic-api');

async function test() {
  const ytmusic = new YTMusic();
  await ytmusic.initialize();
  try {
    const data = await ytmusic['constructRequest']("next", { videoId: 'fJ9rUzIMcZQ' });
    const fs = require('fs');
    fs.writeFileSync('next-response-2.json', JSON.stringify(data, null, 2));
    console.log("Saved next-response-2.json");
  } catch (e) {
    console.error("Error:", e.message);
  }
}
test();
