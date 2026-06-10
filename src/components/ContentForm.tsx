"use client";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ICourseContent, ISmartPpt, IYoutubeClip, IDownloadItem } from "@/types";
import { Plus, Trash2, Upload, BookOpen, FileText } from "lucide-react";
import Toast from "@/components/ui/Toast";

interface ContentFormProps {
  content?: ICourseContent;
  mode: "create" | "edit";
}

export default function ContentForm({ content, mode }: ContentFormProps) {
  const router = useRouter();
  const [name, setName] = useState(content?.name ?? "");
  const [description, setDescription] = useState(content?.description ?? "");
  const [ebookCoverUrl, setEbookCoverUrl] = useState(content?.ebookCoverUrl ?? "");
  const [ebookPdfUrl, setEbookPdfUrl] = useState(content?.ebookPdfUrl ?? "");
  const [uploadingEbook, setUploadingEbook] = useState<"cover" | "pdf" | null>(null);
  const ebookCoverRef = useRef<HTMLInputElement>(null);
  const ebookPdfRef = useRef<HTMLInputElement>(null);
  const [smartPpts, setSmartPpts] = useState<ISmartPpt[]>(content?.smartPpts ?? []);
  const [teachingClips, setTeachingClips] = useState<IYoutubeClip[]>(content?.teachingClips ?? []);
  const [summaryClips, setSummaryClips] = useState<IYoutubeClip[]>(content?.summaryClips ?? []);
  const [downloadFree, setDownloadFree] = useState<IDownloadItem[]>(content?.downloadFree ?? []);
  const [downloadTeacherCard, setDownloadTeacherCard] = useState<IDownloadItem[]>(content?.downloadTeacherCard ?? []);
  const [downloadAksorn, setDownloadAksorn] = useState<IDownloadItem[]>(content?.downloadAksorn ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const closeToast = useCallback(() => setToast(null), []);

  const inputClass =
    "w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      const msg = "กรุณาใส่ชื่อชุดเนื้อหา";
      setError(msg);
      setToast({ message: msg, type: "error" });
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload = { name, description, ebookCoverUrl, ebookPdfUrl, smartPpts, teachingClips, summaryClips, downloadFree, downloadTeacherCard, downloadAksorn };
      const url = mode === "create" ? "/api/admin/content" : `/api/admin/content/${content?._id}`;
      const method = mode === "create" ? "POST" : "PUT";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.error ?? "เกิดข้อผิดพลาด";
        setError(msg);
        setToast({ message: msg, type: "error" });
      } else {
        setToast({ message: mode === "create" ? "สร้างเนื้อหาสำเร็จ!" : "บันทึกสำเร็จ!", type: "success" });
        setTimeout(() => router.push("/admin/content"), 1200);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEbookUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "cover" | "pdf"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingEbook(type);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const endpoint = type === "cover" ? "/api/upload" : "/api/upload/file";
      const res = await fetch(endpoint, { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        if (type === "cover") setEbookCoverUrl(data.url);
        else setEbookPdfUrl(data.url);
      } else {
        alert(data.error ?? "อัปโหลดล้มเหลว");
      }
    } finally {
      setUploadingEbook(null);
      e.target.value = "";
    }
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* ชื่อและคำอธิบาย */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">ชื่อชุดเนื้อหา *</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            placeholder="เช่น คณิตศาสตร์ ม.1 ภาคเรียนที่ 1"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">คำอธิบาย</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputClass}
            placeholder="รายละเอียดเพิ่มเติม..."
          />
        </div>
      </div>

      {/* e-Book */}
      <div className="border border-red-200 bg-red-50 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-red-500" />
          <h3 className="text-sm font-semibold text-red-800">e-Book</h3>
        </div>

        <div className="flex gap-5 items-start">
          {/* Cover preview */}
          <div className="shrink-0">
            <p className="text-xs text-gray-500 mb-1.5 font-medium">รูปปก</p>
            <div className="w-28 h-36 rounded-xl border-2 border-dashed border-red-200 bg-white overflow-hidden flex items-center justify-center">
              {ebookCoverUrl ? (
                <img src={ebookCoverUrl} alt="ebook cover" className="w-full h-full object-cover" />
              ) : (
                <BookOpen className="w-8 h-8 text-red-200" />
              )}
            </div>
            <input
              ref={ebookCoverRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleEbookUpload(e, "cover")}
            />
            <button
              type="button"
              disabled={uploadingEbook === "cover"}
              onClick={() => ebookCoverRef.current?.click()}
              className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 border border-red-300 rounded-lg text-xs text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              <Upload className="w-3 h-3" />
              {uploadingEbook === "cover" ? "..." : "อัปโหลดรูปปก"}
            </button>
          </div>

          {/* PDF upload */}
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-1.5 font-medium">ไฟล์ e-Book (PDF)</p>
            <div className="space-y-2">
              <input
                value={ebookPdfUrl}
                onChange={(e) => setEbookPdfUrl(e.target.value)}
                className={inputClass}
                placeholder="https://... หรืออัปโหลดไฟล์ PDF"
              />
              <input
                ref={ebookPdfRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => handleEbookUpload(e, "pdf")}
              />
              <button
                type="button"
                disabled={uploadingEbook === "pdf"}
                onClick={() => ebookPdfRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-red-300 rounded-xl text-sm text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50 w-full justify-center"
              >
                <FileText className="w-4 h-4" />
                {uploadingEbook === "pdf" ? "กำลังอัปโหลด..." : "อัปโหลดไฟล์ PDF"}
              </button>
              {ebookPdfUrl && (
                <a
                  href={ebookPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                >
                  <FileText className="w-3 h-3" />
                  ดูไฟล์ที่อัปโหลด →
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* เนื้อหาการเรียน */}
      <div className="border border-green-200 bg-green-50 rounded-2xl p-5 space-y-6">
        <h3 className="text-sm font-semibold text-green-800">เนื้อหาการเรียน</h3>

        <ContentArraySection<ISmartPpt>
          title="Smart PPT"
          items={smartPpts}
          setItems={setSmartPpts}
          defaultItem={{ title: "", thumbnailUrl: "", pptUrl: "" }}
          inputClass={inputClass}
          fields={[
            { key: "title", label: "ชื่อ PPT", placeholder: "เช่น หน่วยที่ 1" },
            { key: "thumbnailUrl", label: "รูปปก", placeholder: "https://...", uploadType: "image" },
            { key: "pptUrl", label: "ไฟล์ PPT / Google Slides", placeholder: "https://...", uploadType: "file" },
          ]}
        />

        <ClipGroupSection
          title="คลิปประกอบการสอน"
          items={teachingClips}
          setItems={setTeachingClips}
          inputClass={inputClass}
        />

        <ClipGroupSection
          title="คลิปอักษรเรียนสรุป"
          items={summaryClips}
          setItems={setSummaryClips}
          inputClass={inputClass}
        />

        {/* สื่อประกอบการสอน — parent section */}
        <div className="border border-green-300 rounded-xl overflow-hidden">
          <div className="bg-green-100 px-4 py-2.5">
            <span className="text-xs font-bold text-green-900">สื่อประกอบการสอน</span>
          </div>
          <div className="p-4 space-y-5 bg-white">
            {[
              { label: "[ดาวน์โหลดฟรี]", items: downloadFree, setItems: setDownloadFree },
              { label: "[เฉพาะลูกค้าอักษร (ยื่นบัตรครู)]", items: downloadTeacherCard, setItems: setDownloadTeacherCard },
              { label: "[เฉพาะลูกค้าอักษร]", items: downloadAksorn, setItems: setDownloadAksorn },
            ].map(({ label, items, setItems }) => (
              <ContentArraySection<IDownloadItem>
                key={label}
                title={label}
                items={items}
                setItems={setItems}
                defaultItem={{ title: "", thumbnailUrl: "", fileUrl: "" }}
                inputClass={inputClass}
                fields={[
                  { key: "title", label: "ชื่อไฟล์", placeholder: "เช่น แผนการสอน" },
                  { key: "thumbnailUrl", label: "รูปปก", placeholder: "https://...", uploadType: "image" as const },
                  { key: "fileUrl", label: "ไฟล์ดาวน์โหลด", placeholder: "https://...", uploadType: "file" as const },
                ]}
              />
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm p-4 rounded-xl border border-red-200">{error}</div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "กำลังบันทึก..." : mode === "create" ? "สร้างชุดเนื้อหา" : "บันทึกการแก้ไข"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/content")}
          className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
        >
          ยกเลิก
        </button>
      </div>
    </form>
    </>
  );
}

/* ── Array section with file upload ── */
interface FieldDef {
  key: string;
  label: string;
  placeholder: string;
  uploadType?: "image" | "file";
}

function ContentArraySection<T extends object>({
  title, items, setItems, defaultItem, inputClass, fields,
}: {
  title: string;
  items: T[];
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
  defaultItem: T;
  inputClass: string;
  fields: FieldDef[];
}) {
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const add = () => setItems((prev) => [...prev, { ...defaultItem }]);
  const remove = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));
  const update = (i: number, key: string, value: string) =>
    setItems((prev) => prev.map((item, idx) => idx === i ? { ...item, [key]: value } as T : item));

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    itemIndex: number,
    fieldKey: string,
    uploadType: "image" | "file"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const uKey = `${itemIndex}-${fieldKey}`;
    setUploadingKey(uKey);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const endpoint = uploadType === "image" ? "/api/upload" : "/api/upload/file";
      const res = await fetch(endpoint, { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) update(itemIndex, fieldKey, data.url);
      else alert(data.error ?? "อัปโหลดล้มเหลว");
    } finally {
      setUploadingKey(null);
      e.target.value = "";
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-700">{title}</span>
        <button type="button" onClick={add} className="flex items-center gap-1 text-xs text-green-700 hover:text-green-900 font-medium">
          <Plus className="w-3.5 h-3.5" /> เพิ่ม
        </button>
      </div>
      {items.length === 0 && (
        <p className="text-xs text-gray-400 italic">ยังไม่มีรายการ กด "+ เพิ่ม" เพื่อเพิ่ม</p>
      )}
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-3 space-y-2">
            <div className="flex justify-end">
              <button type="button" onClick={() => remove(i)} className="text-red-400 hover:text-red-600">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className={`grid gap-2 ${fields.length >= 3 ? "grid-cols-1" : "grid-cols-2"}`}>
              {fields.map(({ key, label, placeholder, uploadType }) => {
                const uKey = `${i}-${key}`;
                const isUploading = uploadingKey === uKey;
                const currentValue = (item as Record<string, string>)[key] ?? "";
                return (
                  <div key={key}>
                    <label className="text-xs text-gray-500 mb-0.5 block">{label}</label>
                    {uploadType ? (
                      <div className="space-y-1">
                        <div className="flex gap-2">
                          <input
                            value={currentValue}
                            onChange={(e) => update(i, key, e.target.value)}
                            className={`${inputClass} flex-1 text-xs`}
                            placeholder={placeholder}
                          />
                          <input
                            ref={(el) => { fileInputRefs.current[uKey] = el; }}
                            type="file"
                            className="hidden"
                            accept={
                              uploadType === "image"
                                ? "image/*"
                                : ".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.zip,image/*"
                            }
                            onChange={(e) => handleUpload(e, i, key, uploadType)}
                          />
                          <button
                            type="button"
                            disabled={isUploading}
                            onClick={() => fileInputRefs.current[uKey]?.click()}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-medium rounded-lg border border-green-200 transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
                          >
                            <Upload className="w-3 h-3" />
                            {isUploading ? "..." : "อัปโหลด"}
                          </button>
                        </div>
                        {currentValue && uploadType === "image" && (
                          <img src={currentValue} alt="" className="w-16 h-12 object-cover rounded-lg border border-gray-200" />
                        )}
                        {currentValue && uploadType === "file" && (
                          <a href={currentValue} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline truncate block max-w-full">
                            ดูไฟล์ที่อัปโหลด →
                          </a>
                        )}
                      </div>
                    ) : (
                      <input
                        value={currentValue}
                        onChange={(e) => update(i, key, e.target.value)}
                        className={inputClass}
                        placeholder={placeholder}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Clip group section ── */

interface ClipGroup {
  groupName: string;
  clips: { title: string; youtubeUrl: string; duration: string }[];
}

function toGroups(clips: IYoutubeClip[]): ClipGroup[] {
  const map = new Map<string, { title: string; youtubeUrl: string; duration: string }[]>();
  const ungrouped: { title: string; youtubeUrl: string; duration: string }[] = [];
  for (const c of clips) {
    const entry = { title: c.title, youtubeUrl: c.youtubeUrl, duration: c.duration ?? "" };
    if (c.group) {
      if (!map.has(c.group)) map.set(c.group, []);
      map.get(c.group)!.push(entry);
    } else {
      ungrouped.push(entry);
    }
  }
  const groups: ClipGroup[] = Array.from(map.entries()).map(([groupName, cs]) => ({ groupName, clips: cs }));
  if (ungrouped.length > 0) groups.push({ groupName: "", clips: ungrouped });
  return groups;
}

function fromGroups(groups: ClipGroup[]): IYoutubeClip[] {
  return groups.flatMap((g) =>
    g.clips.map((c) => ({ title: c.title, youtubeUrl: c.youtubeUrl, duration: c.duration ?? "", group: g.groupName || "" }))
  );
}

function ClipGroupSection({
  title,
  items,
  setItems,
  inputClass,
}: {
  title: string;
  items: IYoutubeClip[];
  setItems: React.Dispatch<React.SetStateAction<IYoutubeClip[]>>;
  inputClass: string;
}) {
  const [groups, setGroups] = useState<ClipGroup[]>(() => toGroups(items));

  const update = (newGroups: ClipGroup[]) => {
    setGroups(newGroups);
    setItems(fromGroups(newGroups));
  };

  const addGroup = () => update([...groups, { groupName: "", clips: [] }]);
  const removeGroup = (gi: number) => update(groups.filter((_, i) => i !== gi));
  const setGroupName = (gi: number, val: string) =>
    update(groups.map((g, i) => (i === gi ? { ...g, groupName: val } : g)));
  const addClip = (gi: number) =>
    update(groups.map((g, i) => (i === gi ? { ...g, clips: [...g.clips, { title: "", youtubeUrl: "", duration: "" }] } : g)));
  const removeClip = (gi: number, ci: number) =>
    update(groups.map((g, i) => (i === gi ? { ...g, clips: g.clips.filter((_, j) => j !== ci) } : g)));
  const setClipField = (gi: number, ci: number, key: "title" | "youtubeUrl" | "duration", val: string) =>
    update(
      groups.map((g, i) =>
        i === gi ? { ...g, clips: g.clips.map((c, j) => (j === ci ? { ...c, [key]: val } : c)) } : g
      )
    );

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-700">{title}</span>
        <button
          type="button"
          onClick={addGroup}
          className="flex items-center gap-1 text-xs text-green-700 hover:text-green-900 font-medium"
        >
          <Plus className="w-3.5 h-3.5" /> เพิ่มหัวข้อ
        </button>
      </div>

      {groups.length === 0 && (
        <p className="text-xs text-gray-400 italic">กด "+ เพิ่มหัวข้อ" เพื่อสร้างกลุ่มคลิป</p>
      )}

      <div className="space-y-3">
        {groups.map((group, gi) => (
          <div key={gi} className="border border-orange-200 rounded-xl overflow-hidden">
            {/* Group header */}
            <div className="flex items-center gap-2 bg-orange-50 px-3 py-2 border-b border-orange-100">
              <input
                value={group.groupName}
                onChange={(e) => setGroupName(gi, e.target.value)}
                className="flex-1 text-xs font-semibold bg-transparent outline-none placeholder:text-orange-300 text-orange-900"
                placeholder="ชื่อหัวข้อ เช่น หน่วยที่ 1 ตัวเรา พืช และสัตว์"
              />
              <button
                type="button"
                onClick={() => addClip(gi)}
                className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-medium shrink-0"
              >
                <Plus className="w-3 h-3" /> เพิ่มคลิป
              </button>
              <button
                type="button"
                onClick={() => removeGroup(gi)}
                className="text-red-400 hover:text-red-600 shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Clips */}
            <div className="p-3 space-y-2 bg-white">
              {group.clips.length === 0 && (
                <p className="text-xs text-gray-400 italic">กด "+ เพิ่มคลิป" เพื่อเพิ่มคลิปในหัวข้อนี้</p>
              )}
              {group.clips.map((clip, ci) => (
                <div key={ci} className="flex items-start gap-2 bg-gray-50 rounded-lg p-2">
                  <div className="flex-1 space-y-1.5">
                    <div className="flex gap-2">
                      <input
                        value={clip.title}
                        onChange={(e) => setClipField(gi, ci, "title", e.target.value)}
                        className="flex-1 min-w-0 px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="ชื่อคลิป เช่น การทำงานร่วมกันของอวัยวะ"
                      />
                      <input
                        value={clip.duration}
                        onChange={(e) => setClipField(gi, ci, "duration", e.target.value)}
                        className="w-14 shrink-0 px-2 py-2.5 border border-gray-300 rounded-xl text-xs text-center text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="10.02"
                      />
                    </div>
                    <input
                      value={clip.youtubeUrl}
                      onChange={(e) => setClipField(gi, ci, "youtubeUrl", e.target.value)}
                      className={inputClass}
                      placeholder="YouTube URL https://youtu.be/..."
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeClip(gi, ci)}
                    className="text-red-400 hover:text-red-600 mt-1 shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {/* ปุ่มเพิ่มคลิปด้านล่าง */}
              <button
                type="button"
                onClick={() => addClip(gi)}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-green-300 text-xs text-green-600 hover:bg-green-50 hover:border-green-400 transition-colors font-medium mt-1"
              >
                <Plus className="w-3.5 h-3.5" /> เพิ่มคลิป
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
