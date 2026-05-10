export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary">
      <div className="flex flex-col items-center gap-6">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-brand-primary/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-brand-primary border-t-transparent animate-spin"></div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <h2 className="font-display text-xs font-black uppercase tracking-[0.4em] text-white animate-pulse">
            Samutprakan Esports
          </h2>
          <div className="h-1 w-24 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-brand-primary animate-loading-bar w-full origin-left"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
