import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getHighResImage(url: string | undefined, size = 800) {
  if (!url) return `https://picsum.photos/seed/music/${size}/${size}`;
  if (url.includes('googleusercontent.com') || url.includes('ytimg.com') || url.includes('ggpht.com')) {
    return url.replace(/=w\d+-h\d+/, `=w${size}-h${size}`);
  }
  return url;
}

export function formatTime(seconds: number | undefined | null) {
  if (!seconds || isNaN(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}
