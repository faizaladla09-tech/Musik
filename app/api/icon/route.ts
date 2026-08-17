import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://f.top4top.io/p_3733w0g4e0.jpg');
    const buffer = await res.arrayBuffer();
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error fetching icon:', error);
    return new NextResponse('Error fetching icon', { status: 500 });
  }
}
