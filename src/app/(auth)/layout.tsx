export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden p-4">
      {/* Yellow triangle — left center */}
      <div
        className="absolute left-16 top-1/2 -translate-y-1/2"
        style={{
          width: 64,
          height: 76,
          background: "#F5A623",
          clipPath: "polygon(0% 50%, 100% 0%, 100% 100%)",
        }}
      />

      {/* Pink blob — top right */}
      <div
        className="absolute -right-24 -top-16 w-80 h-96 bg-rose-300 opacity-75"
        style={{ borderRadius: "60% 40% 70% 30% / 50% 60% 40% 50%" }}
      />

      {/* Dark pink triangle — right center */}
      <div
        className="absolute right-10 top-1/2"
        style={{
          width: 56,
          height: 56,
          background: "#C0396B",
          clipPath: "polygon(50% 100%, 0% 0%, 100% 0%)",
          transform: "translateY(-20px)",
        }}
      />

      <div className="relative z-10 w-full flex flex-col items-center">
        {children}
      </div>
    </div>
  );
}
