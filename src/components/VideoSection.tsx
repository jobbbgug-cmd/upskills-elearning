"use client";
import { useState, useEffect, useCallback } from "react";
import { Play, CheckCircle2 } from "lucide-react";

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return m ? m[1] : null;
}

interface Clip { title: string; youtubeUrl: string; }

interface Props {
  title: string;
  clips: Clip[];
  sectionId: string;
  section: string;
  courseId: string;
}

export default function VideoSection({ title, clips, sectionId, section, courseId }: Props) {
  const [idx,     setIdx]     = useState(0);
  const [watched, setWatched] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetch(`/api/learn/${courseId}/progress`)
      .then((r) => r.ok ? r.json() : [])
      .then((records: { section: string; clipIndex: number }[]) => {
        const idxs = records.filter((r) => r.section === section).map((r) => r.clipIndex);
        setWatched(new Set(idxs));
      })
      .catch(() => {});
  }, [courseId, section]);

  const markWatched = useCallback((i: number) => {
    if (watched.has(i)) return;
    fetch(`/api/learn/${courseId}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section, clipIndex: i }),
    }).catch(() => {});
    setWatched((prev) => new Set([...prev, i]));
  }, [courseId, section, watched]);

  if (clips.length === 0) return null;

  const selected = clips[idx];
  const videoId  = getYouTubeId(selected.youtubeUrl);
  const watchedCount = watched.size;

  return (
    <section id={sectionId} className="mb-10 scroll-mt-20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
          <span className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shrink-0">
            <Play className="w-3 h-3 text-white fill-white" />
          </span>
          {title}
        </h2>
        {clips.length > 1 && (
          <span className="text-xs text-gray-400">
            ดูแล้ว <span className="font-semibold text-green-600">{watchedCount}</span>/{clips.length}
          </span>
        )}
      </div>

      <div className="flex gap-4 items-start">
        {/* Video player */}
        <div className="flex-1">
          {videoId ? (
            <div className="aspect-video bg-black rounded-xl overflow-hidden shadow">
              <iframe
                key={videoId}
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={() => markWatched(idx)}
              />
            </div>
          ) : (
            <a
              href={selected.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => markWatched(idx)}
              className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <Play className="w-12 h-12 text-red-500 fill-red-500" />
            </a>
          )}
          <div className="flex items-center gap-2 mt-2">
            <p className="text-sm font-medium text-gray-700">{selected.title}</p>
            {watched.has(idx) && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
          </div>
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
                  onClick={() => { setIdx(i); markWatched(i); }}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center gap-2 ${
                    i === idx
                      ? "bg-amber-50 text-amber-800 font-semibold"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {watched.has(i)
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    : <span className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0" />
                  }
                  <span className="flex-1 truncate">{clip.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
