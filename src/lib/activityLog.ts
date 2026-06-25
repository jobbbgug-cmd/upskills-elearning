import { connectDB } from "@/lib/mongodb";
import ActivityLog from "@/models/ActivityLog";

interface LogParams {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  institutionId?: string;
  institutionName?: string;
  action: string;
  description: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

export async function logActivity(params: LogParams) {
  try {
    await connectDB();
    await ActivityLog.create(params);
  } catch {
    // never throw — logging must not break the main flow
  }
}

export const ACTION = {
  LOGIN:              "login",
  LOGOUT:             "logout",
  CREATE_COURSE:      "create_course",
  UPDATE_COURSE:      "update_course",
  DELETE_COURSE:      "delete_course",
  APPROVE_BOOKING:    "approve_booking",
  REJECT_BOOKING:     "reject_booking",
  APPROVE_MEMBER:     "approve_member",
  REJECT_MEMBER:      "reject_member",
  CREATE_PAYOUT:      "create_payout",
  UPDATE_PAYOUT:      "update_payout",
  CREATE_INSTITUTION: "create_institution",
  UPDATE_INSTITUTION: "update_institution",
  UPDATE_SETTINGS:    "update_settings",
} as const;
