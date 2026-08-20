import { NextResponse } from 'next/server';
import { getYTMusic } from '@/lib/ytmusic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) return NextResponse.json([], { status: 200 });
  
  try {
    const ytmusic = await getYTMusic();
    const upNext = await ytmusic.getUpNexts(id).catch((e: any) => {
      console.warn(`UpNext fetch failed for id ${id}:`, e?.name || e?.message);
      return [];
    });

    return NextResponse.json(Array.isArray(upNext) ? upNext : [], {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error: any) {
    console.error(`UpNext error for id ${id}:`, error?.message || error);
    return NextResponse.json([], { status: 200 });
  }
}
