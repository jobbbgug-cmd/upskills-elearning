import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";

const kanit = Kanit({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-kanit",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "UPSkills - ระบบบริหารจัดการสถาบันการศึกษา ครบวงจร (All-in-One Education Management Platform)",
    template: "%s | UPSkills",
  },
  description: "UPSkills ระบบบริหารจัดการสถาบันการศึกษา ครบวงจร - จัดการคอร์สเรียน นักเรียน อาจารย์ และระบบการศึกษาแบบครบวงจร",
  keywords: ["คอร์สเรียนออนไลน์", "ระบบจัดการสถาบันการศึกษา", "UPSkills", "Education Management", "Learning Management System"],
  metadataBase: new URL("https://upskills-elearning.vercel.app"),
  openGraph: {
    type: "website",
    locale: "th_TH",
    url: "https://upskills-elearning.vercel.app",
    siteName: "UPSkills",
    title: "UPSkills - ระบบบริหารจัดการสถาบันการศึกษา ครบวงจร",
    description: "UPSkills ระบบบริหารจัดการสถาบันการศึกษา ครบวงจร - All-in-One Education Management Platform",
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={kanit.variable}>
      <body className="bg-gray-50 min-h-screen font-kanit">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
