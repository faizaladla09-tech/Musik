import YTMusic from 'ytmusic-api';

const ytmusic = new YTMusic();
let initPromise: Promise<any> | null = null;

export async function getYTMusic() {
  if (!initPromise) {
    initPromise = ytmusic.initialize().catch((err) => {
      initPromise = null;
      console.warn('YTMusic initialize error:', err?.message || err);
      // Return uninitialized instance as fallback rather than crashing
      return ytmusic;
    });
  }
  try {
    await initPromise;
  } catch (err) {
    console.warn('YTMusic init await error:', err);
  }
  return ytmusic;
}

/**
 * Safe search helpers with automatic ZodError and network fallback handling
 */
export async function safeSearchSongs(query: string) {
  try {
    const api = await getYTMusic();
    const res = await api.searchSongs(query);
    return Array.isArray(res) ? res : [];
  } catch (e: any) {
    console.warn(`safeSearchSongs failed for query "${query}":`, e?.name || e?.message);
    return [];
  }
}

export async function safeSearchVideos(query: string) {
  try {
    const api = await getYTMusic();
    const res = await api.searchVideos(query);
    return Array.isArray(res) ? res : [];
  } catch (e: any) {
    console.warn(`safeSearchVideos failed for query "${query}":`, e?.name || e?.message);
    return [];
  }
}

export async function safeSearchArtists(query: string) {
  try {
    const api = await getYTMusic();
    const res = await api.searchArtists(query);
    return Array.isArray(res) ? res : [];
  } catch (e: any) {
    console.warn(`safeSearchArtists failed for query "${query}":`, e?.name || e?.message);
    return [];
  }
}

export async function safeSearchPlaylists(query: string) {
  try {
    const api = await getYTMusic();
    const res = await api.searchPlaylists(query);
    return Array.isArray(res) ? res.filter((p: any) => p.playlistId && !p.playlistId.startsWith('RD')) : [];
  } catch (e: any) {
    console.warn(`safeSearchPlaylists failed for query "${query}":`, e?.name || e?.message);
    return [];
  }
}
