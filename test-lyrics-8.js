const YTMusic = require('ytmusic-api');

async function test() {
  const ytmusic = new YTMusic();
  await ytmusic.initialize();
  try {
    const results = await ytmusic.searchSongs('Bohemian Rhapsody');
    console.log("Results:", results[0]);
    
    const data = await ytmusic['constructRequest']("next", { videoId: results[0].videoId });
    const fs = require('fs');
    fs.writeFileSync('next-response-4.json', JSON.stringify(data, null, 2));
    console.log("Saved next-response-4.json");
  } catch (e) {
    console.error("Error:", e.message);
  }
}
test();
