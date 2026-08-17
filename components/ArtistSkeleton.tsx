export function ArtistSkeleton() {
  return (
    <div className="min-h-screen bg-[#0F0F0F] pb-32 animate-pulse">
      {/* Header Skeleton */}
      <div className="relative h-[40vh] min-h-[300px] w-full bg-white/5">
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
          <div className="w-10 h-10 bg-white/10 rounded-full" />
          <div className="w-10 h-10 bg-white/10 rounded-full" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0F0F0F] to-transparent">
          <div className="h-10 w-2/3 bg-white/10 rounded-md mb-4" />
          <div className="h-4 w-1/3 bg-white/10 rounded-md" />
        </div>
      </div>

      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-4">
            <div className="w-14 h-14 bg-white/10 rounded-full" />
            <div className="w-14 h-14 bg-white/10 rounded-full" />
          </div>
          <div className="w-24 h-10 bg-white/10 rounded-full" />
        </div>

        <div className="mb-8">
          <div className="h-6 w-32 bg-white/10 rounded-md mb-4" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
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
      </div>
    </div>
  );
}
