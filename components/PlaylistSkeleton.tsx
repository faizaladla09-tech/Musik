export function PlaylistSkeleton() {
  return (
    <div className="min-h-screen pb-20">
      <div className="sticky top-0 z-10 bg-black/50 backdrop-blur-md px-4 py-4 flex items-center justify-between">
        <div className="w-10 h-10 rounded-full liquid-glass-icon liquid-glass-shimmer" />
        <div className="h-4 w-20 bg-white/10 rounded-full liquid-glass-shimmer" />
        <div className="w-10" />
      </div>

      <div className="px-4 pt-4 pb-8 flex flex-col items-center text-center">
        <div className="w-48 h-48 sm:w-60 sm:h-60 rounded-3xl liquid-glass liquid-glass-shimmer mb-5" />
        <div className="h-7 w-60 bg-white/15 rounded-xl mb-2.5 liquid-glass-shimmer" />
        <div className="h-4 w-32 bg-white/10 rounded-full mb-6 liquid-glass-shimmer" />

        <div className="flex items-center gap-3 w-full justify-center">
          <div className="h-12 w-36 bg-white/20 rounded-full liquid-glass-shimmer" />
          <div className="w-12 h-12 rounded-full liquid-glass liquid-glass-shimmer" />
          <div className="w-12 h-12 rounded-full liquid-glass liquid-glass-shimmer" />
        </div>
      </div>

      <div className="px-4 max-w-3xl mx-auto space-y-2 border-t border-white/10 pt-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center gap-3.5 p-2 rounded-2xl liquid-glass-subtle border border-white/5">
            <div className="w-12 h-12 rounded-xl bg-white/10 shrink-0 liquid-glass-shimmer" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-white/15 rounded-lg liquid-glass-shimmer" />
              <div className="h-3 w-1/2 bg-white/10 rounded-md" />
            </div>
            <div className="w-8 h-8 rounded-full bg-white/10 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
