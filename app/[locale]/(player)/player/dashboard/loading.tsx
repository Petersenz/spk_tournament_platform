export default function PlayerDashboardLoading() {
  return (
    <div className="space-y-12 animate-pulse">
      {/* STATS OVERVIEW SKELETON */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-bg-secondary border border-white/5 p-8 rounded-[2rem] flex items-center gap-6 shadow-xl"
          >
            <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center">
              <div className="h-8 w-8 bg-white/5 rounded-lg"></div>
            </div>
            <div className="space-y-2">
              <div className="h-8 w-12 bg-white/10 rounded-lg"></div>
              <div className="h-3 w-20 bg-white/5 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* LEFT: UPCOMING MATCHES SKELETON */}
        <div className="xl:col-span-4 space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-8 w-1 bg-brand-primary/20 rounded-full"></div>
            <div className="h-6 w-32 bg-white/10 rounded-lg"></div>
          </div>

          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-bg-secondary border border-white/5 rounded-[2rem] p-5 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="h-3 w-24 bg-brand-primary/10 rounded-lg"></div>
                  <div className="h-4 w-20 bg-white/5 rounded-lg"></div>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <div className="h-12 w-12 rounded-xl bg-white/5"></div>
                    <div className="h-3 w-full bg-white/5 rounded-lg"></div>
                  </div>
                  <div className="h-7 w-7 rounded-full bg-white/5"></div>
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <div className="h-12 w-12 rounded-xl bg-white/5"></div>
                    <div className="h-3 w-full bg-white/5 rounded-lg"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: REGISTERED TOURNAMENTS SKELETON */}
        <div className="xl:col-span-8 space-y-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="h-8 w-1 bg-success/20 rounded-full"></div>
              <div className="h-6 w-48 bg-white/10 rounded-lg"></div>
            </div>
            <div className="h-4 w-20 bg-white/5 rounded-lg"></div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-bg-secondary border border-white/5 rounded-[2rem] p-6 h-40 shadow-2xl"
              >
                <div className="flex justify-between items-start mb-6 gap-4">
                  <div className="h-8 w-1/2 bg-white/10 rounded-lg"></div>
                  <div className="h-5 w-20 bg-white/5 rounded-lg"></div>
                </div>
                <div className="flex gap-4 mb-4">
                  <div className="h-3 w-24 bg-white/5 rounded-lg"></div>
                  <div className="h-3 w-24 bg-white/5 rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
