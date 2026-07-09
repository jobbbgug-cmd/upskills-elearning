import Navbar from "@/components/Navbar";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Navbar />
      <main className="px-4 py-10">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
