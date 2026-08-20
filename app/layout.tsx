import type {Metadata, Viewport} from 'next';
import './globals.css';
import { BottomNav } from '@/components/BottomNav';
import { Player } from '@/components/Player';
import { DynamicIsland } from '@/components/DynamicIsland';
import { AddToPlaylistModal } from '@/components/AddToPlaylistModal';
import { PWARegister } from '@/components/PWARegister';
import { BackgroundProvider } from '@/components/BackgroundProvider';

export const metadata: Metadata = {
  title: 'Musicfly',
  description: 'Musicfly - Modern Liquid Glass Music Streaming Platform',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Musicfly',
  },
  icons: {
    apple: 'https://f.top4top.io/p_3733w0g4e0.jpg',
  },
};

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="id" className="dark bg-[#0A0A0A] selection:bg-[#81B29A]/30">
      <body className="text-white antialiased pb-24 min-h-screen bg-[#0A0A0A] overflow-x-hidden" suppressHydrationWarning>
        <BackgroundProvider />
        <PWARegister />
        <DynamicIsland />
        {children}
        <Player />
        <BottomNav />
        <AddToPlaylistModal />
      </body>
    </html>
  );
}
