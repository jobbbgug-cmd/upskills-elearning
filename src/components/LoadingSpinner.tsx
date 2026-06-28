export default function LoadingSpinner({ fullPage }: { fullPage?: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${fullPage ? "min-h-screen" : "py-20"}`}>
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 border-r-violet-400 animate-spin" />
      </div>
      <p className="text-sm text-gray-400 animate-pulse">กำลังโหลด...</p>
    </div>
  );
}
