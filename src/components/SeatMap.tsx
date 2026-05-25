"use client";
import { cn } from "@/lib/utils";

interface SeatMapProps {
  totalSeats: number;
  bookedSeats: number[];
  mySeats: number[];
  selectedSeat: number | null;
  onSelectSeat: (seat: number | null) => void;
  disabled?: boolean;
}

export default function SeatMap({
  totalSeats,
  bookedSeats,
  mySeats,
  selectedSeat,
  onSelectSeat,
  disabled = false,
}: SeatMapProps) {
  const cols = totalSeats <= 5 ? totalSeats : totalSeats <= 20 ? 5 : 6;
  const seats = Array.from({ length: totalSeats }, (_, i) => i + 1);

  return (
    <div className="space-y-3">
      {/* Seats grid */}
      <div
        className="grid gap-2 mx-auto w-fit"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {seats.map((num) => {
          const isTaken    = bookedSeats.includes(num);
          const isMine     = mySeats.includes(num);
          const isSelected = selectedSeat === num;

          return (
            <button
              key={num}
              type="button"
              disabled={isTaken || isMine || disabled}
              onClick={() => onSelectSeat(isSelected ? null : num)}
              title={
                isMine     ? `ที่นั่ง ${num} — ของคุณ` :
                isTaken    ? `ที่นั่ง ${num} — จองแล้ว` :
                isSelected ? `ที่นั่ง ${num} — กำลังเลือก` :
                             `ที่นั่ง ${num} — ว่าง`
              }
              className={cn(
                "w-11 h-11 rounded-t-xl border-b-4 text-xs font-bold transition-all duration-150 flex items-center justify-center select-none",
                isMine
                  ? "bg-indigo-500 border-indigo-700 text-white cursor-default"
                  : isTaken
                  ? "bg-gray-200 border-gray-400 text-gray-400 cursor-not-allowed"
                  : isSelected
                  ? "bg-blue-500 border-blue-700 text-white scale-110 shadow-lg shadow-blue-200"
                  : "bg-emerald-100 border-emerald-400 text-emerald-700 hover:bg-emerald-200 hover:scale-105 cursor-pointer"
              )}
            >
              {isMine ? "✓" : num}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-gray-500 pt-2">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-4 rounded bg-emerald-100 border-b-2 border-emerald-400" />
          ว่าง ({totalSeats - bookedSeats.length})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-4 rounded bg-blue-500 border-b-2 border-blue-700" />
          เลือกอยู่
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-4 rounded bg-gray-200 border-b-2 border-gray-400" />
          จองแล้ว ({bookedSeats.length})
        </span>
        {mySeats.length > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-4 rounded bg-indigo-500 border-b-2 border-indigo-700" />
            ของคุณ
          </span>
        )}
      </div>
    </div>
  );
}
