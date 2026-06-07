"use client";
import { useState, useMemo } from "react";
import { Play, Search, X } from "lucide-react";

interface Clip { title: string; youtubeUrl: string; }

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return m ? m[1] : null;
}

export default function VideoPlayerSection({
  title,
  clips,
  accentColor = "red",
}: {
  title: string;
  clips: Clip[];
  accentColor?: "red" | "pink";
}) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return clips;
    const q = query.toLowerCase();
    return clips.filter((c) => c.title.toLowerCase().includes(q));
  }, [clips, query]);

  const selected = clips[selectedIdx];
  const videoId = selected ? getYouTubeId(selected.youtubeUrl) : null;

  const ringColor = accentColor === "pink"
    ? "ring-pink-400 bg-pink-50 text-pink-700"
    : "ring-red-400 bg-amber-50 text-amber-800";

  const playBg = accentColor === "pink" ? "bg-pink-500" : "bg-red-500";

  return (
    <div className="space-y-3">
      {/* Player */}
      <div className="rounded-xl overflow-hidden bg-black aspect-video shadow">
        {selected && videoId ? (
          <iframe
            key={videoId}
            src={`https://www.youtube.com/embed/${videoId}?autoplay=0`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : selected ? (
          <a
            href={selected.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-full flex flex-col items-center justify-center bg-gray-900 hover:bg-gray-800 transition-colors"
          >
            <div className={`w-16 h-16 ${playBg} rounded-full flex items-center justify-center shadow-lg mb-3`}>
              <Play className="w-7 h-7 text-white fill-white ml-1" />
            </div>
            <p className="text-white/60 text-xs">เปิดใน YouTube</p>
          </a>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <p className="text-white/40 text-sm">ไม่พบคลิป</p>
          </div>
        )}
      </div>

      {/* Now playing title */}
      {selected && (
        <p className="text-sm font-semibold text-gray-800 line-clamp-2 px-0.5">
          <span className="text-gray-400 font-normal mr-1">กำลังเล่น:</span>
          {selected.title}
        </p>
      )}

      {/* Search + List */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        {/* Search bar */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50">
          <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`ค้นหาคลิปใน${title}...`}
            className="flex-1 text-xs bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Clip list */}
        <div className="max-h-64 overflow-y-auto divide-y divide-gray-50 bg-white">
          {filtered.length === 0 ? (
            <div className="py-6 text-center text-xs text-gray-400">
              ไม่พบคลิปที่ค้นหา
            </div>
          ) : (
            filtered.map((clip, fi) => {
              // find real index in original clips array for player selection
              const realIdx = clips.findIndex((c) => c === clip);
              const isActive = realIdx === selectedIdx;
              const thumbId = getYouTubeId(clip.youtubeUrl);

              return (
                <button
                  key={fi}
                  onClick={() => setSelectedIdx(realIdx)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                    isActive ? `ring-inset ring-2 ${ringColor}` : "hover:bg-gray-50"
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-100 relative">
                    {thumbId ? (
                      <img
                        src={`https://img.youtube.com/vi/${thumbId}/mqdefault.jpg`}
                        alt={clip.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="w-4 h-4 text-gray-300 fill-gray-300" />
                      </div>
                    )}
                    {isActive && (
                      <div className={`absolute inset-0 ${playBg}/60 flex items-center justify-center`}>
                        <Play className="w-4 h-4 text-white fill-white" />
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <p className={`text-xs leading-snug line-clamp-2 flex-1 ${isActive ? "font-semibold" : "text-gray-600"}`}>
                    {clip.title}
                  </p>
                </button>
              );
            })
          )}
        </div>

        {/* Footer count */}
        <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-100 text-right">
          <span className="text-xs text-gray-400">
            {query ? `${filtered.length} / ${clips.length} คลิป` : `${clips.length} คลิป`}
          </span>
        </div>
      </div>
    </div>
  );
}
