export function LoadingOverlay() {
  return (
    <div className="min-h-screen bg-yellow-300 dark:bg-slate-950 flex items-center justify-center font-sans tracking-tight">
      <div className="bg-black dark:bg-white text-white dark:text-black p-8 border-4 border-white dark:border-black shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] dark:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform rotate-3">
        <h2 className="text-4xl font-black uppercase">Loading...</h2>
      </div>
    </div>
  );
}
