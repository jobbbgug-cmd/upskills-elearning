"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ICourse, ISession } from "@/types";
import SeatMap from "@/components/SeatMap";
import { Calendar, Clock, Upload, CheckCircle, XCircle, Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MyBookingInfo { bookingId: string; seatNumber: number; status: string; slipImage: string; }

interface CourseBookingProps {
  course: ICourse;
  sessions: ISession[];
  myBookings: Record<string, MyBookingInfo>;
  isLoggedIn: boolean;
}

export default function CourseBooking({ course, sessions, myBookings, isLoggedIn }: CourseBookingProps) {
  const [selectedSession, setSelectedSession] = useState<ISession | null>(sessions[0] ?? null);
  const [selectedSeat, setSelectedSeat]       = useState<number | null>(null);
  const [loading, setLoading]                 = useState(false);
  const [uploading, setUploading]             = useState(false);
  const [message, setMessage]                 = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pendingFile, setPendingFile]         = useState<File | null>(null);
  const [pendingPreview, setPendingPreview]   = useState<string | null>(null);
  const router  = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const myInfo       = selectedSession ? myBookings[selectedSession._id] : undefined;
  const isBooked     = !!myInfo;
  const bookingStatus = myInfo?.status ?? "";

  const handleSelectSession = (session: ISession) => {
    setSelectedSession(session);
    setSelectedSeat(null);
    setMessage(null);
  };

  const handleBook = async () => {
    if (!isLoggedIn) { router.push("/login"); return; }
    if (!selectedSession || !selectedSeat) { setMessage({ type: "error", text: "กรุณาเลือกที่นั่งก่อน" }); return; }
    setLoading(true); setMessage(null);
    try {
      const res = await fetch(`/api/courses/${course._id}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: selectedSession._id, seatNumber: selectedSeat }),
      });
      const data = await res.json();
      if (res.ok) { setMessage({ type: "success", text: data.message }); router.refresh(); }
      else setMessage({ type: "error", text: data.error ?? "เกิดข้อผิดพลาด" });
    } catch { setMessage({ type: "error", text: "เกิดข้อผิดพลาด กรุณาลองใหม่" }); }
    finally { setLoading(false); }
  };

  const handleSlipSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setPendingPreview(URL.createObjectURL(file));
    setMessage(null);
  };

  const handleConfirmPayment = async () => {
    if (!pendingFile || !myInfo) return;
    setUploading(true); setMessage(null);
    try {
      const fd = new FormData();
      fd.append("file", pendingFile);
      const res = await fetch(`/api/bookings/${myInfo.bookingId}/slip`, { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "ยืนยันการชำระเงินสำเร็จ! รอครูตรวจสอบ" });
        setPendingFile(null);
        setPendingPreview(null);
        router.refresh();
      } else {
        setMessage({ type: "error", text: data.error ?? "อัปโหลดล้มเหลว" });
      }
    } catch { setMessage({ type: "error", text: "เกิดข้อผิดพลาด" }); }
    finally { setUploading(false); }
  };

  const handleCancelPending = () => {
    setPendingFile(null);
    setPendingPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">เลือกรอบเรียน</h3>

      {/* Session list */}
      <div className="space-y-2">
        {sessions.map((session) => {
          const bookedCount   = session.bookedSeats?.length ?? session.bookedCount;
          const isFull        = bookedCount >= session.maxCapacity;
          const sessionInfo   = myBookings[session._id];
          const isThisBooked  = !!sessionInfo;
          const isSelected    = selectedSession?._id === session._id;

          return (
            <button key={session._id} onClick={() => handleSelectSession(session)}
              className={cn("w-full text-left p-3 rounded-xl border-2 transition-all",
                isSelected ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-indigo-200",
                isFull && !isThisBooked ? "opacity-60" : ""
              )}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 text-sm font-medium text-gray-800">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  {new Date(session.date).toLocaleDateString("th-TH", { weekday: "short", day: "numeric", month: "short" })}
                </div>
                <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full",
                  isThisBooked ? "bg-indigo-100 text-indigo-700" :
                  isFull ? "bg-red-100 text-red-600" :
                  (session.maxCapacity - bookedCount) / session.maxCapacity <= 0.2 ? "bg-orange-100 text-orange-600" :
                  "bg-green-100 text-green-700"
                )}>
                  {isThisBooked ? `ที่นั่ง ${sessionInfo.seatNumber}` : isFull ? "เต็ม" : `ว่าง ${session.maxCapacity - bookedCount} ที่`}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Clock className="w-3 h-3" />{session.startTime} - {session.endTime} น.
              </div>
            </button>
          );
        })}
      </div>

      {/* Seat picker */}
      {selectedSession && !isBooked && (
        <div className="border-t border-gray-100 pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-700">เลือกที่นั่ง</h4>
            {selectedSeat && <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">เลือกที่นั่ง {selectedSeat}</span>}
          </div>
          <SeatMap
            totalSeats={selectedSession.maxCapacity}
            bookedSeats={selectedSession.bookedSeats ?? []}
            mySeats={[]}
            selectedSeat={selectedSeat}
            onSelectSeat={setSelectedSeat}
          />
          <button onClick={handleBook} disabled={loading || !selectedSeat}
            className={cn("w-full py-3 rounded-xl font-semibold text-sm transition-all",
              selectedSeat ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md" : "bg-gray-100 text-gray-400 cursor-not-allowed"
            )}>
            {loading ? "กำลังจอง..." : selectedSeat ? `จองที่นั่ง ${selectedSeat}` : "กรุณาเลือกที่นั่งก่อน"}
          </button>
        </div>
      )}

      {/* Payment section — after booking */}
      {isBooked && (
        <div className="border-t border-gray-100 pt-4 space-y-4">
          {/* Status banner */}
          {bookingStatus === "pending_payment" && !myInfo.slipImage && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-sm font-medium">
              <Clock3 className="w-4 h-4 shrink-0" />
              <span>ที่นั่ง {myInfo.seatNumber} — กรุณาชำระเงินและอัปโหลดสลิป</span>
            </div>
          )}
          {bookingStatus === "pending_payment" && myInfo.slipImage && (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-sm font-medium">
              <Clock3 className="w-4 h-4 shrink-0" />
              <span>ที่นั่ง {myInfo.seatNumber} — รอครูตรวจสอบสลิป</span>
            </div>
          )}
          {bookingStatus === "confirmed" && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>ที่นั่ง {myInfo.seatNumber} — อนุมัติแล้ว พร้อมเรียน!</span>
            </div>
          )}
          {bookingStatus === "rejected" && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>ที่นั่ง {myInfo.seatNumber} — ถูกปฏิเสธ กรุณาติดต่อครู</span>
            </div>
          )}

          {/* Seat map (readonly) */}
          {selectedSession && (
            <SeatMap
              totalSeats={selectedSession.maxCapacity}
              bookedSeats={selectedSession.bookedSeats ?? []}
              mySeats={[myInfo.seatNumber]}
              selectedSeat={null}
              onSelectSeat={() => {}}
              disabled
            />
          )}

          {/* Payment info + slip upload (only if pending and price > 0) */}
          {bookingStatus === "pending_payment" && course.price > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
              <h4 className="text-sm font-semibold text-amber-800">ข้อมูลการชำระเงิน</h4>

              {/* QR Code */}
              {course.qrCodeImage && (
                <div className="flex justify-center">
                  <div className="bg-white rounded-xl p-3 shadow-sm border border-amber-100">
                    <Image src={course.qrCodeImage} alt="QR Code" width={180} height={180} className="object-contain" />
                  </div>
                </div>
              )}

              {/* Bank info */}
              {(course.bankAccount || course.bankName) && (
                <div className="bg-white rounded-xl px-4 py-3 text-sm space-y-1 border border-amber-100">
                  {course.bankName && <p className="text-gray-700"><span className="font-semibold">ชื่อบัญชี:</span> {course.bankName}</p>}
                  {course.bankAccount && <p className="text-gray-700"><span className="font-semibold">เลขที่บัญชี:</span> {course.bankAccount}</p>}
                  <p className="text-amber-700 font-bold text-base mt-1">฿{course.price.toLocaleString()}</p>
                </div>
              )}

              {/* Slip upload */}
              <div className="space-y-2">
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleSlipSelect} />

                {/* Pending preview (not yet submitted) */}
                {pendingPreview ? (
                  <div className="space-y-3">
                    <p className="text-xs text-amber-700 font-semibold">ตรวจสอบสลิปก่อนยืนยัน:</p>
                    <img src={pendingPreview} alt="slip preview" className="w-full max-h-52 object-contain rounded-xl border-2 border-amber-300 bg-white" />
                    <button onClick={handleConfirmPayment} disabled={uploading}
                      className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
                      <CheckCircle className="w-4 h-4" />
                      {uploading ? "กำลังส่ง..." : "ยืนยันการชำระเงิน"}
                    </button>
                    <button onClick={handleCancelPending} disabled={uploading}
                      className="w-full py-2 border border-gray-200 rounded-xl text-xs text-gray-500 hover:bg-gray-50 transition-colors">
                      เลือกรูปใหม่
                    </button>
                  </div>
                ) : myInfo.slipImage ? (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 font-medium">สลิปที่ส่งแล้ว:</p>
                    <img src={myInfo.slipImage} alt="slip" className="w-full max-h-48 object-contain rounded-xl border border-amber-200 bg-white" />
                    <button onClick={() => fileRef.current?.click()} disabled={uploading}
                      className="w-full py-2 border-2 border-dashed border-amber-300 rounded-xl text-xs text-amber-700 hover:bg-amber-100 transition-colors">
                      เลือกสลิปใหม่
                    </button>
                  </div>
                ) : (
                  <button onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
                    <Upload className="w-4 h-4" />
                    เลือกสลิปการโอนเงิน
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={cn("p-3 rounded-xl text-sm text-center",
          message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
        )}>
          {message.text}
        </div>
      )}

      {!isLoggedIn && (
        <p className="text-center text-xs text-gray-400">
          กรุณา{" "}<a href="/login" className="text-indigo-600 font-medium hover:underline">เข้าสู่ระบบ</a>{" "}เพื่อจองที่นั่ง
        </p>
      )}
    </div>
  );
}
