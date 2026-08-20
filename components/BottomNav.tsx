'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Library, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Beranda', href: '/', icon: Home },
    { name: 'Mencari', href: '/search', icon: Search },
    { name: 'Pustaka', href: '/library', icon: Library },
    { name: 'Developer', href: '/developer', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 w-full bg-[#0A0E0C]/90 backdrop-blur-2xl border-t border-white/10 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full py-1 transition-all duration-200 relative group select-none'
              )}
            >
              {/* Icon Container with Metrolist-style active pill */}
              <div className="relative flex items-center justify-center w-16 h-8 rounded-full transition-colors">
                {isActive && (
                  <motion.div
                    layoutId="metrolistActiveIndicator"
                    className="absolute inset-0 bg-white rounded-full shadow-sm"
                    transition={{ type: 'spring', damping: 26, stiffness: 360 }}
                  />
                )}
                <item.icon
                  className={cn(
                    'w-5 h-5 relative z-10 transition-all duration-200',
                    isActive ? 'text-zinc-950 stroke-[2.5] scale-105' : 'text-white/65 group-hover:text-white group-hover:scale-110'
                  )}
                />
              </div>

              {/* Label */}
              <span
                className={cn(
                  'text-[11px] tracking-tight transition-all duration-200 mt-1 truncate',
                  isActive ? 'font-black text-white' : 'font-medium text-white/55 group-hover:text-white/80'
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
