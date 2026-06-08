import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "UPSkills - คอร์สเรียนออนไลน์ วิทยาศาสตร์ คณิตศาสตร์ ภาษาอังกฤษ",
    template: "%s | UPSkills",
  },
  description: "คอร์สเรียนออนไลน์สดกับครูผู้เชี่ยวชาญ วิทยาศาสตร์ คณิตศาสตร์ ภาษาอังกฤษ ป.1-ม.6 จองที่นั่งง่าย มีสื่อการสอนและคลิปประกอบ",
  keywords: ["คอร์สเรียนออนไลน์", "ติวออนไลน์", "วิทยาศาสตร์", "คณิตศาสตร์", "ภาษาอังกฤษ", "ประถม", "มัธยม", "UPSkills"],
  metadataBase: new URL("https://upskills-elearning.vercel.app"),
  openGraph: {
    type: "website",
    locale: "th_TH",
    url: "https://upskills-elearning.vercel.app",
    siteName: "UPSkills",
    title: "UPSkills - คอร์สเรียนออนไลน์ วิทยาศาสตร์ คณิตศาสตร์ ภาษาอังกฤษ",
    description: "คอร์สเรียนออนไลน์สดกับครูผู้เชี่ยวชาญ วิทยาศาสตร์ คณิตศาสตร์ ภาษาอังกฤษ ป.1-ม.6",
  },
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
