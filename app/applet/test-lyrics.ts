import YTMusic from 'ytmusic-api';

async function test() {
  const ytmusic = new YTMusic();
  await ytmusic.initialize();
  try {
    const song = await ytmusic.getSong('dQw4w9WgXcQ');
    console.log("Song:", song);
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
