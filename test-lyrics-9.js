const YTMusic = require('ytmusic-api');

async function test() {
  const ytmusic = new YTMusic();
  await ytmusic.initialize();
  try {
    const data = await ytmusic['constructRequest']("browse", { browseId: 'MPLYt_lBAWMJdpu9Y-7' });
    const fs = require('fs');
    fs.writeFileSync('lyrics-response-4.json', JSON.stringify(data, null, 2));
    console.log("Saved lyrics-response-4.json");
  } catch (e) {
    console.error("Error:", e.message);
  }
}
test();
