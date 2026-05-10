export default function OrganizerDashboardLoading() {
  return (
    <div className="space-y-10 animate-pulse">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="space-y-3">
          <div className="h-10 w-64 bg-white/10 rounded-lg"></div>
          <div className="h-4 w-48 bg-white/5 rounded-lg"></div>
        </div>
        <div className="h-12 w-40 bg-white/10 rounded-xl"></div>
      </div>

      {/* STATS CARDS SKELETON */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-bg-secondary border border-white/5 rounded-[2rem] p-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-3 w-20 bg-white/5 rounded-lg"></div>
              <div className="h-4 w-4 bg-white/10 rounded-full"></div>
            </div>
            <div className="h-10 w-16 bg-white/10 rounded-lg"></div>
          </div>
        ))}
      </div>

      {/* RECENT ACTIVITY SKELETON */}
      <div className="bg-bg-secondary border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="px-10 py-6 border-b border-white/5 bg-white/2 flex justify-between items-center">
          <div className="h-6 w-40 bg-white/10 rounded-lg"></div>
          <div className="h-3 w-16 bg-white/5 rounded-lg"></div>
        </div>
        <div className="divide-y divide-white/5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-8 space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-24 bg-brand-primary/10 rounded-lg"></div>
                  <div className="h-6 w-1/2 bg-white/10 rounded-lg"></div>
                  <div className="h-3 w-32 bg-white/5 rounded-lg"></div>
                </div>
                <div className="text-right space-y-2">
                  <div className="h-8 w-16 bg-white/10 rounded-lg ml-auto"></div>
                  <div className="h-3 w-24 bg-white/5 rounded-lg ml-auto"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
