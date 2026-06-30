"use client";
import { useEffect } from "react";
import { getTheme, applyTheme } from "@/lib/theme";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const theme = getTheme();
    applyTheme(theme);

    // Apply text color to all buttons with bg-indigo/violet
    const applyTextColors = () => {
      const elements = document.querySelectorAll(
        '[class*="bg-indigo-"], [class*="bg-violet-"]'
      );
      console.log(`Found ${elements.length} elements to style`);
      elements.forEach((el) => {
        const hasColorClass =
          el.className.includes("bg-indigo-") ||
          el.className.includes("bg-violet-");
        if (hasColorClass) {
          (el as HTMLElement).style.color = "white !important";
          // Also set color for all children
          el.querySelectorAll("*").forEach((child) => {
            (child as HTMLElement).style.color = "white !important";
          });
          console.log("Styled element:", el.className);
        }
      });
    };

    applyTextColors();
    // Re-apply when DOM changes
    const observer = new MutationObserver(applyTextColors);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return <>{children}</>;
}
