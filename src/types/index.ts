export type GradeLevel =
  | "ป.1" | "ป.2" | "ป.3" | "ป.4" | "ป.5" | "ป.6"
  | "ม.1" | "ม.2" | "ม.3" | "ม.4" | "ม.5" | "ม.6"
  | "ปวช." | "ปวส." | "มหาวิทยาลัย" | "ทั่วไป";

export interface ISession {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  bookedCount: number;
  bookedSeats: number[];
  zoomLink?: string;
}

export interface ICourse {
  _id: string;
  title: string;
  description: string;
  coverImage: string;
  gradeLevels: GradeLevel[];
  instructor: string;
  instructorId?: string;
  category: string;
  sessions: ISession[];
  price: number;
  isActive: boolean;
  qrCodeImage?: string;
  bankAccount?: string;
  bankName?: string;
  linkDigital?: string;
  linkClip?: string;
  linkSupplementary?: string;
  linkFullbook?: string;
  createdAt: string;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: "student" | "teacher" | "admin";
  status: "pending" | "approved" | "rejected";
  gradeLevel?: GradeLevel;
  createdAt: string;
}

export interface IBooking {
  _id: string;
  userId: string | IUser;
  courseId: string | ICourse;
  sessionId: string;
  seatNumber: number;
  status: "pending_payment" | "confirmed" | "cancelled" | "rejected";
  slipImage?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: IUser;
}

export interface IBanner {
  _id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  linkUrl: string;
  linkText: string;
  bgColor: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
