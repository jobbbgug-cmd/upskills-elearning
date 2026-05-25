import Navbar from "@/components/Navbar";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-10">{children}</main>
    </div>
  );
}
