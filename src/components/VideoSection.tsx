"use client";
import { useState } from "react";
import { Play } from "lucide-react";

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return m ? m[1] : null;
}

interface Clip { title: string; youtubeUrl: string; }

export default function VideoSection({ title, clips, sectionId }: { title: string; clips: Clip[]; sectionId: string }) {
  const [idx, setIdx] = useState(0);
  if (clips.length === 0) return null;

  const selected = clips[idx];
  const videoId = getYouTubeId(selected.youtubeUrl);

  return (
    <section id={sectionId} className="mb-10">
      <h2 className="flex items-center gap-2 text-base font-bold text-gray-900 mb-4">
        <span className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shrink-0">
          <Play className="w-3 h-3 text-white fill-white" />
        </span>
        {title}
      </h2>

      <div className="flex gap-4 items-start">
        {/* Video player */}
        <div className="flex-1">
          {videoId ? (
            <div className="aspect-video bg-black rounded-xl overflow-hidden shadow">
              <iframe
                key={videoId}
                src={`https://www.youtube.com/embed/${videoId}`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <a
              href={selected.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <Play className="w-12 h-12 text-red-500 fill-red-500" />
            </a>
          )}
          <p className="text-sm font-medium text-gray-700 mt-2">{selected.title}</p>
        </div>

        {/* Sidebar clip list */}
        {clips.length > 1 && (
          <div className="w-56 shrink-0 bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 bg-gray-50">
              <Play className="w-3.5 h-3.5 text-red-500 fill-red-500 shrink-0" />
              <span className="font-semibold text-xs text-gray-800 truncate">{title}</span>
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
              {clips.map((clip, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                    i === idx
                      ? "bg-amber-50 text-amber-800 font-semibold"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {clip.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
