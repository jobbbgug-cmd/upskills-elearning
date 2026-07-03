"use client";
import { useEffect } from "react";
import { setTheme } from "@/lib/theme";

export default function PublicPageThemeReset() {
  useEffect(() => {
    setTheme("default");
  }, []);

  return null;
}
