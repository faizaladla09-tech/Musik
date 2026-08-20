import React from 'react';

export function HomeSkeleton() {
  return (
    <div className="space-y-8 px-4 pt-2">
      {/* Mood Pills Skeleton */}
      <div className="flex gap-2.5 overflow-x-hidden pb-1">
        {[80, 110, 90, 100, 120].map((w, idx) => (
          <div 
            key={idx}
            style={{ width: `${w}px` }}
            className="h-9 rounded-full liquid-glass-subtle liquid-glass-shimmer shrink-0"
          />
        ))}
      </div>

      {/* Hero Section Skeleton */}
      <div className="flex overflow-x-hidden gap-4 pb-2">
        {[1, 2].map((i) => (
          <div 
            key={i}
            className="relative w-[85vw] sm:w-[380px] shrink-0 aspect-[16/10] rounded-3xl liquid-glass liquid-glass-shimmer overflow-hidden p-5 flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="h-6 bg-white/10 rounded-full w-24"></div>
              <div className="h-8 bg-white/15 rounded-xl w-3/4"></div>
              <div className="h-4 bg-white/10 rounded-lg w-1/2"></div>
            </div>
            <div className="flex items-center justify-between pt-4">
              <div className="h-4 bg-white/10 rounded-full w-28"></div>
              <div className="w-12 h-12 rounded-full bg-white/20"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Speed Dial Grid Skeleton */}
      <div>
        <div className="h-6 bg-white/10 rounded-full w-40 mb-4 liquid-glass-shimmer"></div>
        <div className="flex overflow-x-hidden gap-4 pb-2">
          {[1, 2].map((chunk) => (
            <div 
              key={chunk}
              className="w-[85vw] sm:w-[380px] shrink-0 liquid-glass-subtle rounded-3xl p-3.5 space-y-2 border border-white/10"
            >
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3.5 p-2 rounded-2xl">
                  <div className="w-12 h-12 rounded-xl bg-white/10 shrink-0 liquid-glass-shimmer"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/15 rounded-lg w-3/4 liquid-glass-shimmer"></div>
                    <div className="h-3 bg-white/10 rounded-lg w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Carousels Skeleton */}
      {[1, 2].map((section) => (
        <div key={section} className="space-y-4">
          <div className="h-6 bg-white/10 rounded-full w-48 liquid-glass-shimmer"></div>
          <div className="flex overflow-x-hidden gap-3.5 pb-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-none w-36 space-y-2.5">
                <div className="w-36 h-36 rounded-2xl bg-white/10 liquid-glass-shimmer"></div>
                <div className="h-4 bg-white/15 rounded-lg w-full"></div>
                <div className="h-3 bg-white/10 rounded-lg w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
