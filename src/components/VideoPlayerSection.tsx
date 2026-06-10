"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import { Play, Search, X, ChevronDown, ChevronRight } from "lucide-react";

interface Clip { title: string; youtubeUrl: string; group?: string; duration?: string; }
type IndexedClip = Clip & { realIdx: number };

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return m ? m[1] : null;
}

export default function VideoPlayerSection({
  clips,
  accentColor = "red",
}: {
  title: string;
  clips: Clip[];
  accentColor?: "red" | "pink";
}) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [query, setQuery] = useState("");
  const [panelHeight, setPanelHeight] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => setPanelHeight(el.offsetHeight));
    obs.observe(el);
    setPanelHeight(el.offsetHeight);
    return () => obs.disconnect();
  }, []);

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const hasGroups = useMemo(() => clips.some((c) => c.group), [clips]);

  const filtered = useMemo<IndexedClip[]>(() => {
    const indexed = clips.map((c, i) => ({ ...c, realIdx: i }));
    if (!query.trim()) return indexed;
    const q = query.toLowerCase();
    return indexed.filter((c) => c.title.toLowerCase().includes(q));
  }, [clips, query]);

  const groupedFiltered = useMemo(() => {
    if (!hasGroups) return null;
    const map = new Map<string, IndexedClip[]>();
    const ungrouped: IndexedClip[] = [];
    filtered.forEach((clip) => {
      if (clip.group) {
        if (!map.has(clip.group)) map.set(clip.group, []);
        map.get(clip.group)!.push(clip);
      } else {
        ungrouped.push(clip);
      }
    });
    return { map, ungrouped };
  }, [filtered, hasGroups]);

  const toggleGroup = (name: string) =>
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });

  const handleSelect = (idx: number) => {
    setSelectedIdx(idx);
    if (isMobile && videoRef.current) {
      setTimeout(() => {
        videoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  };

  const selected = clips[selectedIdx];
  const videoId = selected ? getYouTubeId(selected.youtubeUrl) : null;

  const playBg        = accentColor === "pink" ? "bg-pink-500"   : "bg-red-500";
  const ringColor     = accentColor === "pink" ? "ring-pink-400 bg-pink-50"  : "ring-red-400 bg-amber-50";
  const groupHeaderCls = accentColor === "pink" ? "bg-pink-500 text-white"   : "bg-orange-500 text-white";
  const groupIconCls   = accentColor === "pink" ? "text-pink-200"            : "text-orange-200";

  const ClipRow = ({ clip }: { clip: IndexedClip }) => {
    const isActive = clip.realIdx === selectedIdx;
    const thumbId  = getYouTubeId(clip.youtubeUrl);
    return (
      <button
        onClick={() => handleSelect(clip.realIdx)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
          isActive ? `ring-inset ring-2 ${ringColor}` : "hover:bg-gray-50"
        }`}
      >
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
        <div className="flex-1 min-w-0">
          <p className={`text-xs leading-snug line-clamp-2 ${isActive ? "font-semibold text-gray-900" : "text-gray-600"}`}>
            {clip.title}
          </p>
          {clip.duration && (
            <p className="text-[10px] text-gray-400 mt-0.5">{clip.duration} นาที</p>
          )}
        </div>
      </button>
    );
  };

  const ClipList = () => (
    <>
      {filtered.length === 0 ? (
        <div className="py-6 text-center text-xs text-gray-400">ไม่พบคลิปที่ค้นหา</div>
      ) : hasGroups && groupedFiltered ? (
        <>
          {Array.from(groupedFiltered.map.entries()).map(([groupName, groupClips]) => {
            const isExpanded = expandedGroups.has(groupName);
            return (
              <div key={groupName}>
                <button
                  onClick={() => toggleGroup(groupName)}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 text-left transition-opacity hover:opacity-90 ${groupHeaderCls}`}
                >
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 bg-white/20">
                    <Play className={`w-3 h-3 fill-current ${groupIconCls}`} />
                  </div>
                  <span className="text-xs font-semibold flex-1 line-clamp-2 leading-snug">{groupName}</span>
                  {isExpanded
                    ? <ChevronDown className="w-4 h-4 shrink-0 opacity-70" />
                    : <ChevronRight className="w-4 h-4 shrink-0 opacity-70" />}
                </button>
                {isExpanded && (
                  <div className="divide-y divide-gray-50">
                    {groupClips.map((clip) => <ClipRow key={clip.realIdx} clip={clip} />)}
                  </div>
                )}
              </div>
            );
          })}
          {groupedFiltered.ungrouped.length > 0 && (
            <div className="divide-y divide-gray-50">
              {groupedFiltered.ungrouped.map((clip) => <ClipRow key={clip.realIdx} clip={clip} />)}
            </div>
          )}
        </>
      ) : (
        <div className="divide-y divide-gray-50">
          {filtered.map((clip) => <ClipRow key={clip.realIdx} clip={clip} />)}
        </div>
      )}
    </>
  );

  return (
    <div className="flex flex-col md:flex-row gap-4">

      {/* ── Player (full width on mobile, flex-1 on desktop) ── */}
      <div className="flex-1 min-w-0 space-y-2">
        <div ref={videoRef} className="rounded-xl overflow-hidden bg-black aspect-video shadow">
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
        {selected && (
          <p className="text-sm font-semibold text-gray-800 line-clamp-2 px-0.5">
            <span className="text-gray-400 font-normal mr-1">กำลังเล่น:</span>
            {selected.title}
          </p>
        )}
      </div>

      {/* ── Clip list panel ── */}
      <div
        className="w-full md:w-72 shrink-0 border border-gray-200 rounded-xl overflow-hidden flex flex-col"
        style={!isMobile && panelHeight ? { height: panelHeight } : undefined}
      >
        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50 shrink-0">
          <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาคลิป..."
            className="flex-1 text-xs bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* List — scrollable, capped height on mobile */}
        <div className="flex-1 overflow-y-auto bg-white max-h-72 md:max-h-none">
          <ClipList />
        </div>

        {/* Footer */}
        <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-100 text-right shrink-0">
          <span className="text-xs text-gray-400">
            {query ? `${filtered.length} / ${clips.length} คลิป` : `${clips.length} คลิป`}
          </span>
        </div>
      </div>
    </div>
  );
}
