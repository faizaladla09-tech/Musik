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
