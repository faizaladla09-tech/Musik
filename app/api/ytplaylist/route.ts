import { NextResponse } from 'next/server';
import { getYTMusic } from '@/lib/ytmusic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawId = searchParams.get('id');
  
  if (!rawId || rawId === 'undefined' || rawId === 'null') {
    return NextResponse.json({ error: 'Missing or invalid id', videos: [] }, { status: 200 });
  }

  // Generate candidates to try in priority order
  const candidates: string[] = [];
  if (rawId.startsWith('RD') || rawId.startsWith('OLAK')) {
    candidates.push(`VL${rawId}`, rawId);
  } else if (rawId.startsWith('VL')) {
    candidates.push(rawId, rawId.slice(2));
  } else {
    candidates.push(rawId, `VL${rawId}`);
  }

  try {
    const ytmusic = await getYTMusic();

    for (const id of candidates) {
      // 1. Try getPlaylist
      try {
        const playlist = await ytmusic.getPlaylist(id) as any;
        if (playlist) {
          let videos = playlist.videos || [];
          if (!videos || videos.length === 0) {
            try {
              videos = await ytmusic.getPlaylistVideos(id);
            } catch {
              // ignore
            }
          }
          if (videos && videos.length > 0) {
            return NextResponse.json({
              playlistId: playlist.playlistId || id,
              name: playlist.name || 'Playlist',
              artist: playlist.artist,
              thumbnails: playlist.thumbnails || [],
              videos: videos
            });
          }
        }
      } catch {
        // try getAlbum or next candidate
      }

      // 2. Try getAlbum
      try {
        const album = await ytmusic.getAlbum(id) as any;
        if (album && album.songs && album.songs.length > 0) {
          return NextResponse.json({
            playlistId: album.albumId || id,
            name: album.name || 'Album',
            artist: album.artist,
            thumbnails: album.thumbnails || [],
            videos: album.songs.map((song: any) => ({
              videoId: song.videoId,
              name: song.name,
              artist: song.artist || (album.artist ? [album.artist] : []),
              duration: song.duration,
              thumbnails: song.thumbnails || album.thumbnails || [],
            }))
          });
        }
      } catch {
        // try next candidate
      }

      // 3. Try getPlaylistVideos directly
      try {
        const videos = await ytmusic.getPlaylistVideos(id);
        if (videos && videos.length > 0) {
          return NextResponse.json({
            playlistId: id,
            name: 'Playlist',
            thumbnails: videos[0]?.thumbnails || [],
            videos: videos
          });
        }
      } catch {
        // continue
      }
    }

    // Return empty payload gracefully if no tracks could be resolved
    return NextResponse.json({
      playlistId: rawId,
      name: 'Playlist',
      thumbnails: [],
      videos: []
    });
  } catch (error: any) {
    console.error(`Error in ytplaylist route for id ${rawId}:`, error?.message || error);
    return NextResponse.json({
      playlistId: rawId,
      name: 'Playlist',
      thumbnails: [],
      videos: []
    });
  }
}
