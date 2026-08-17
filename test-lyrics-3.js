const YTMusic = require('ytmusic-api');

async function test() {
  const ytmusic = new YTMusic();
  await ytmusic.initialize();
  try {
    const data = await ytmusic['constructRequest']("browse", { browseId: 'MPLYt_0XNX5s8uBvI' });
    const fs = require('fs');
    fs.writeFileSync('lyrics-response.json', JSON.stringify(data, null, 2));
    console.log("Saved lyrics-response.json");
  } catch (e) {
    console.error("Error:", e.message);
  }
}
test();
