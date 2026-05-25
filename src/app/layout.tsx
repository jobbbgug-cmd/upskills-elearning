import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UPSkills - ระบบจองคอร์สเรียนออนไลน์",
  description: "เรียนสดกับผู้เชี่ยวชาญ จองที่นั่งง่ายๆ เหมือนจองตั๋วหนัง",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
