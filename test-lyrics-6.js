const YTMusic = require('ytmusic-api');

async function test() {
  const ytmusic = new YTMusic();
  await ytmusic.initialize();
  try {
    const data = await ytmusic['constructRequest']("browse", { browseId: 'MPLYt_wUbiMNbaE6O' });
    const fs = require('fs');
    fs.writeFileSync('lyrics-response-2.json', JSON.stringify(data, null, 2));
    console.log("Saved lyrics-response-2.json");
  } catch (e) {
    console.error("Error:", e.message);
  }
}
test();
