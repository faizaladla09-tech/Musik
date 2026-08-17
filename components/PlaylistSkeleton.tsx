export function PlaylistSkeleton() {
  return (
    <div className="min-h-screen pb-20 animate-pulse bg-[#0F0F0F]">
      <div className="sticky top-0 z-10 bg-black/50 backdrop-blur-md px-4 py-4 flex items-center gap-4">
        <div className="w-6 h-6 bg-white/10 rounded-full" />
      </div>

      <div className="px-4 pt-4 pb-8 flex flex-col items-center text-center">
        <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-2xl bg-white/10 mb-6" />
        <div className="h-8 w-3/4 bg-white/10 rounded-md mb-2" />
        <div className="h-4 w-1/4 bg-white/10 rounded-md mb-6" />

        <div className="flex items-center gap-4 w-full justify-center">
          <div className="flex-1 max-w-[200px] h-12 bg-white/10 rounded-full" />
          <div className="flex-1 max-w-[200px] h-12 bg-white/10 rounded-full" />
        </div>
      </div>

      <div className="px-4 space-y-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-md shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-white/10 rounded-md" />
              <div className="h-3 w-1/2 bg-white/10 rounded-md" />
            </div>
            <div className="w-8 h-8 bg-white/10 rounded-full shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
