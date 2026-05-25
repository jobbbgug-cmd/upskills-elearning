import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { th } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatThaiDate(date: string | Date): string {
  return format(new Date(date), "d MMMM yyyy", { locale: th });
}

export function formatTime(time: string): string {
  return time;
}

export function getSeatsLeft(maxCapacity: number, bookedCount: number): number {
  return Math.max(0, maxCapacity - bookedCount);
}

export function getSeatStatus(maxCapacity: number, bookedCount: number) {
  const left = getSeatsLeft(maxCapacity, bookedCount);
  const percentage = (bookedCount / maxCapacity) * 100;
  if (left === 0) return { label: "เต็มแล้ว", color: "red" };
  if (percentage >= 80) return { label: `เหลือ ${left} ที่นั่ง`, color: "orange" };
  return { label: `เหลือ ${left} ที่นั่ง`, color: "green" };
}
