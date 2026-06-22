export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-teal-500 border-r-violet-500 animate-spin" />
      </div>
      <p className="mt-4 text-sm font-medium text-gray-400 tracking-wide animate-pulse">
        กำลังโหลด...
      </p>
    </div>
  );
}
