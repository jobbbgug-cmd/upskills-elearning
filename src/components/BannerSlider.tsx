"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { IBanner } from "@/types";

interface Props {
  banners: IBanner[];
}

export default function BannerSlider({ banners }: Props) {
  const [current, setCurrent] = useState(0);
  const next = useCallback(() => setCurrent((c) => (c + 1) % banners.length), [banners.length]);
  const prev = () => setCurrent((c) => (c - 1 + banners.length) % banners.length);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [banners.length, next]);

  if (banners.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden" style={{ height: "100svh" }}>
      {banners.map((b, i) => (
        <div
          key={b._id}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
        >
          {/* Desktop image */}
          <div className="hidden md:block absolute inset-0">
            <Image
              src={b.imageUrl}
              alt={b.title || "banner"}
              fill
              className="object-cover object-center"
              priority={i === 0}
            />
          </div>
          {/* Mobile image (ถ้าไม่มีให้ใช้รูป desktop แทน) */}
          <div className="md:hidden absolute inset-0">
            <Image
              src={b.mobileImageUrl || b.imageUrl}
              alt={b.title || "banner"}
              fill
              className="object-cover object-center"
              priority={i === 0}
            />
          </div>

          {/* Overlay for text readability */}
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.25)" }} />
          {/* Top gradient — ช่วยให้ navbar transparent อ่านได้ชัด */}
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/50 to-transparent" />

          {/* Text overlay */}
          {(b.title || b.subtitle || b.linkUrl) && (
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-7xl mx-auto px-8 md:px-16 w-full">
                <div className="max-w-xl">
                  {b.title && (
                    <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-5 whitespace-pre-line drop-shadow-lg">
                      {b.title}
                    </h2>
                  )}
                  {b.subtitle && (
                    <p className="text-white/80 text-lg md:text-xl mb-10 whitespace-pre-line drop-shadow">
                      {b.subtitle}
                    </p>
                  )}
                  {b.linkUrl && (
                    <Link
                      href={b.linkUrl}
                      className="inline-block px-10 py-4 rounded-2xl font-semibold text-white text-base shadow-lg transition-opacity hover:opacity-90"
                      style={{ background: "linear-gradient(90deg,#7c3aed,#a855f7)" }}
                    >
                      {b.linkText || "ดูรายละเอียด"}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white backdrop-blur-sm transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={next}
            className="absolute right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white backdrop-blur-sm transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === current ? 28 : 12,
                height: 12,
                background: i === current ? "#7c3aed" : "rgba(255,255,255,0.35)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
