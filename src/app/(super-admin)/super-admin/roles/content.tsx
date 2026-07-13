"use client";

import React, { useState, useEffect } from "react";
import { Save, RotateCcw, Check } from "lucide-react";

interface RolePerms {
  _id: string;
  role: string;
  permissions: Record<string, any>;
}

const ROLES = ["super_admin", "owner", "admin", "teacher", "parent", "student"];

const FEATURES = {
  overview: { label: "ภาพรวม", items: ["ภาพรวม"] },
  finance: {
    label: "รายได้และการเงิน",
    items: ["revenue", "analytics", "commission_payout", "payment_verification", "finance_info"],
  },
  institution: {
    label: "สถาบัน",
    items: ["all_institutions", "trial_requests"],
  },
  members: {
    label: "จัดการสมาชิก",
    items: ["approve_members", "manage_users"],
  },
  platform_features: {
    label: "ฟีเจอร์แพลตฟอร์ม",
    items: ["live_sessions", "course_reviews", "forum"],
  },
  commerce: {
    label: "ระบบขาย",
    items: ["manage_orders", "manage_products", "coupons_promotions"],
  },
  content: {
    label: "จัดการเนื้อหา",
    items: ["manage_courses", "course_content", "student_schedule", "teacher_schedule", "certificates", "categories"],
  },
  system: {
    label: "จัดการระบบ",
    items: ["manage_banners", "manage_roles", "activity_logs", "general_settings"],
  },
  teaching: {
    label: "การเรียนการสอน",
    items: ["manage_students", "homework", "quizzes", "live_class", "teacher_portal", "forum"],
  },
  courses: {
    label: "คอร์สและเนื้อหา",
    items: ["manage_courses", "course_content", "student_schedule", "teacher_schedule", "certificates"],
  },
  marketing: {
    label: "การตลาด",
    items: ["landing_page", "course_reviews", "notifications", "manage_banners"],
  },
  learning_center: {
    label: "ศูนย์การเรียน",
    items: ["homework", "attendance", "quizzes", "live_class"],
  },
};

const FEATURE_LABELS: Record<string, string> = {
  revenue: "รายได้",
  analytics: "Analytics",
  commission_payout: "Commission & Payout",
  payment_verification: "ตรวจสอบการชำระ",
  finance_info: "ข้อมูลทางการเงิน",
  all_institutions: "สถาบันทั้งหมด",
  trial_requests: "คำขอทดลองใช้งาน",
  approve_members: "อนุมัติสมาชิก",
  manage_users: "จัดการผู้ใช้",
  live_sessions: "Live Sessions",
  course_reviews: "รีวิวคอร์ส",
  forum: "Forum",
  manage_orders: "จัดการคำสั่งซื้อ",
  manage_products: "จัดการสินค้า",
  coupons_promotions: "คูปอง/โปรโมชั่น",
  manage_courses: "จัดการคอร์ส",
  course_content: "เนื้อหาการเรียน",
  student_schedule: "ตารางเรียน",
  teacher_schedule: "ตารางสอน",
  certificates: "ใบรับรอง",
  categories: "หมวดหมู่",
  manage_banners: "จัดการแบนเนอร์",
  manage_roles: "จัดการ Role",
  activity_logs: "ประวัติการใช้งาน",
  general_settings: "ตั้งค่าทั่วไป",
  manage_students: "จัดการนักเรียน",
  homework: "การบ้าน",
  quizzes: "ข้อสอบ",
  live_class: "Live Class",
  teacher_portal: "Teacher Portal",
  landing_page: "Landing Page",
  notifications: "แจ้งเตือน",
  manage_branding: "จัดการ Branding",
  billing_invoice: "Billing & ใบเสร็จ",
  attendance: "เช็คชื่อ",
  invoice: "ใบเสร็จ",
  reviews: "รีวิว",
};

export default function RolesContent() {
  const [roles, setRoles] = useState<RolePerms[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modified, setModified] = useState(false);

  useEffect(() => {
    initializePermissions();
  }, []);

  const initializePermissions = async () => {
    try {
      const res = await fetch("/api/admin/role-permissions");
      const data = await res.json();
      if (data.permissions && data.permissions.length === 0) {
        await fetch("/api/admin/role-permissions", { method: "POST" });
      }
      fetchPermissions();
    } catch (error) {
      console.error("Error initializing permissions:", error);
      fetchPermissions();
    }
  };

  const fetchPermissions = async () => {
    try {
      const res = await fetch("/api/admin/role-permissions");
      const data = await res.json();
      setRoles(data.permissions || []);
      setModified(false);
    } catch (error) {
      console.error("Error fetching permissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPermissionValue = (role: RolePerms, featureKey: string, itemKey: string): boolean => {
    if (featureKey === "overview" && itemKey === "ภาพรวม") {
      return role.permissions.overview ?? false;
    }
    return role.permissions[featureKey]?.[itemKey] ?? false;
  };

  const setPermissionValue = (roleIndex: number, featureKey: string, itemKey: string, value: boolean) => {
    const newRoles = [...roles];
    if (featureKey === "overview" && itemKey === "ภาพรวม") {
      newRoles[roleIndex].permissions.overview = value;
    } else {
      if (!newRoles[roleIndex].permissions[featureKey]) {
        newRoles[roleIndex].permissions[featureKey] = {};
      }
      newRoles[roleIndex].permissions[featureKey][itemKey] = value;
    }
    setRoles(newRoles);
    setModified(true);
  };

  const savePermissions = async () => {
    setSaving(true);
    try {
      for (const role of roles) {
        await fetch(`/api/admin/role-permissions/${role.role}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ permissions: role.permissions }),
        });
      }
      alert("บันทึกสำเร็จ!");
      setModified(false);
    } catch (error) {
      console.error("Error saving permissions:", error);
      alert("บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">กำลังโหลด...</div>;
  }

  const roleColors: Record<string, { bg: string; badge: string; text: string }> = {
    super_admin: { bg: 'from-rose-50 to-pink-50', badge: 'bg-gradient-to-r from-rose-500 to-pink-500 text-white', text: 'Super Admin' },
    owner: { bg: 'from-purple-50 to-indigo-50', badge: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white', text: 'Owner' },
    admin: { bg: 'from-blue-50 to-cyan-50', badge: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white', text: 'Admin' },
    teacher: { bg: 'from-green-50 to-emerald-50', badge: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white', text: 'Teacher' },
    parent: { bg: 'from-amber-50 to-orange-50', badge: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white', text: 'Parent' },
    student: { bg: 'from-sky-50 to-blue-50', badge: 'bg-gradient-to-r from-sky-500 to-blue-500 text-white', text: 'Student' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">จัดการ Role</h1>
          <p className="text-lg text-gray-600">ตั้งค่าสิทธิการเข้าถึงและฟีเจอร์สำหรับแต่ละบทบาท</p>
        </div>

        {/* Controls */}
        <div className="mb-8 flex gap-3">
          <button
            onClick={savePermissions}
            disabled={!modified || saving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 transition-all"
          >
            <Save className="w-5 h-5" />
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </button>
          <button
            onClick={() => fetchPermissions()}
            disabled={!modified}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 disabled:opacity-50 transition-all"
          >
            <RotateCcw className="w-5 h-5" />
            รีเซต
          </button>
        </div>

        {/* Table Matrix */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <colgroup>
                <col style={{ width: '280px' }} />
                {ROLES.map((role) => (
                  <col key={role} style={{ width: '120px' }} />
                ))}
              </colgroup>

              {/* Header with Roles */}
              <thead>
                <tr className="bg-gradient-to-r from-indigo-600 to-purple-600 border-b border-gray-200">
                  <th className="px-6 py-4 text-left font-bold text-white sticky left-0 bg-gradient-to-r from-indigo-600 to-purple-600 z-10">
                    ฟีเจอร์
                  </th>
                  {ROLES.map((role) => {
                    const color = roleColors[role];
                    return (
                      <th key={role} className="px-0 py-4 text-center">
                        <div className={`inline-block px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap ${color.badge}`}>
                          {color.text}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {/* Feature Rows */}
              <tbody>
                {Object.entries(FEATURES).map(([featureKey, feature], groupIdx) => (
                  <React.Fragment key={featureKey}>
                    {/* Group Header Row */}
                    <tr className="bg-indigo-50 border-b border-gray-200">
                      <td colSpan={ROLES.length + 1} className="px-6 py-4">
                        <h3 className="font-bold text-gray-900 text-base">{feature.label}</h3>
                      </td>
                    </tr>

                    {/* Feature Items */}
                    {feature.items.map((itemKey, itemIdx) => (
                      <tr
                        key={itemKey}
                        className={`border-b border-gray-100 hover:bg-indigo-50 transition-colors ${
                          itemIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <td className="px-6 py-4 text-gray-700 font-medium sticky left-0 bg-inherit z-5">
                          {FEATURE_LABELS[itemKey] || itemKey}
                        </td>
                        {roles.map((role, roleIdx) => {
                          const checked = getPermissionValue(role, featureKey, itemKey);
                          return (
                            <td key={role.role} className="px-0 py-4 text-center">
                              <label className="flex justify-center items-center cursor-pointer group h-full">
                                <div className="relative">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(e) =>
                                      setPermissionValue(roleIdx, featureKey, itemKey, e.target.checked)
                                    }
                                    className="w-5 h-5 rounded cursor-pointer accent-indigo-600 opacity-0 absolute"
                                  />
                                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                    checked
                                      ? 'bg-indigo-600 border-indigo-600'
                                      : 'border-gray-300 group-hover:border-indigo-400'
                                  }`}>
                                    {checked && <Check className="w-3.5 h-3.5 text-white" />}
                                  </div>
                                </div>
                              </label>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {modified && (
          <div className="mt-8 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-lg text-amber-900">
            <p className="font-semibold">⚠️ มีการเปลี่ยนแปลง - กดบันทึกเพื่อบันทึกการเปลี่ยนแปลง</p>
          </div>
        )}
      </div>
    </div>
  );
}
