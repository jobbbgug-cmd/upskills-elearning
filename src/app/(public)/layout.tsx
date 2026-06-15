import { Metadata } from "next";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "UPSkills — คอร์สเรียนออนไลน์",
  description: "คอร์สเรียนออนไลน์คุณภาพสูง",
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Navbar />
      <main>{children}</main>
    </div>
  );
}
