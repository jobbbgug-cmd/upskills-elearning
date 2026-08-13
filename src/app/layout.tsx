import type { Metadata } from "next";
import { Sarabun, IBM_Plex_Sans_Thai } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import { CartProvider } from "@/context/CartContext";

const sarabun = Sarabun({
  subsets: ["thai", "latin"],
  weight: ["100", "300", "400", "500", "600", "700", "800"],
  variable: "--font-sarabun",
  display: "swap",
});

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans-thai",
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
    <html lang="th" className={`${sarabun.variable} ${ibmPlexSansThai.variable}`}>
      <body className="bg-gray-50 min-h-screen" style={{ fontFamily: "'Sarabun', sans-serif" }}>
        <CartProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </CartProvider>
      </body>
    </html>
  );
}
