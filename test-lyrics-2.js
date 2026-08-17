const YTMusic = require('ytmusic-api');

async function test() {
  const ytmusic = new YTMusic();
  await ytmusic.initialize();
  try {
    const data = await ytmusic['constructRequest']("next", { videoId: 'kJQP7kiw5Fk' });
    const fs = require('fs');
    fs.writeFileSync('next-response.json', JSON.stringify(data, null, 2));
    console.log("Saved next-response.json");
  } catch (e) {
    console.error("Error:", e.message);
  }
}
test();
