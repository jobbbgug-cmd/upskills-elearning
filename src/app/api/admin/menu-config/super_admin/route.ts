import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const menuConfig = {
      items: [
        // ภาพรวม
        {
          id: "overview",
          label: "ภาพรวม",
          path: "/super-admin-dashboard",
          isSingleItem: true,
        },

        // รายได้และการเงิน
        {
          id: "revenue",
          label: "รายได้และการเงิน",
          children: [
            { id: "revenue-main", label: "รายได้", path: "/super-admin/revenue" },
            { id: "analytics", label: "Analytics", path: "/super-admin/analytics" },
            { id: "commission", label: "Commission & Payout", path: "/super-admin/payouts" },
            { id: "bookings", label: "ตรวจสอบการชำระ", path: "/super-admin/bookings" },
            { id: "finance", label: "ข้อมูลทางการเงิน", path: "/super-admin/finance" },
          ],
        },

        // สถาบัน
        {
          id: "institutions",
          label: "สถาบัน",
          children: [
            { id: "all-institutions", label: "สถาบันทั้งหมด", path: "/super-admin/institutions" },
            { id: "trials", label: "คำขอทดลองใช้งาน", path: "/super-admin/trials" },
          ],
        },

        // จัดการสมาชิก
        {
          id: "members",
          label: "จัดการสมาชิก",
          children: [
            { id: "approve-members", label: "อนุมัติสมาชิก", path: "/super-admin/members" },
            { id: "manage-users", label: "จัดการผู้ใช้งาน", path: "/super-admin/users" },
          ],
        },

        // ฟีเจอร์แพลตฟอร์ม
        {
          id: "features",
          label: "ฟีเจอร์แพลตฟอร์ม",
          children: [
            { id: "live", label: "Live Sessions", path: "/super-admin/live" },
            { id: "reviews", label: "รีวิวคอร์ส", path: "/super-admin/reviews" },
            { id: "forum", label: "Forum", path: "/super-admin/forum" },
          ],
        },

        // ระบบขาย
        {
          id: "ecommerce",
          label: "ระบบขาย",
          children: [
            { id: "orders", label: "จัดการคำสั่งซื้อ", path: "/super-admin/orders" },
            { id: "products", label: "จัดการสินค้า", path: "/super-admin/products" },
            { id: "coupons", label: "คูปอง/โปรโมชั่น", path: "/super-admin/coupons" },
          ],
        },

        // จัดการเนื้อหา
        {
          id: "content",
          label: "จัดการเนื้อหา",
          children: [
            { id: "courses", label: "จัดการคอร์ส", path: "/super-admin/courses" },
            { id: "content-main", label: "เนื้อหาการเรียน", path: "/super-admin/content" },
            { id: "schedule", label: "ตารางเรียน", path: "/super-admin/schedule" },
            { id: "teacher-schedule", label: "ตารางสอน", path: "/super-admin/teacher-schedule" },
            { id: "certificates", label: "ใบรับรอง", path: "/super-admin/certificates" },
          ],
        },

        // จัดการระบบ
        {
          id: "system",
          label: "จัดการระบบ",
          children: [
            { id: "banners", label: "จัดการแบนเนอร์", path: "/super-admin/banners" },
            { id: "roles", label: "จัดการ Role", path: "/super-admin/roles" },
            { id: "menu-config", label: "จัดการเมนู", path: "/super-admin/menu-config" },
            { id: "logs", label: "ประวัติการใช้งาน", path: "/super-admin/logs" },
            { id: "settings", label: "ตั้งค่าทั่วไป", path: "/super-admin/settings" },
          ],
        },
      ],
    };

    return NextResponse.json(menuConfig);
  } catch (error) {
    console.error("Error fetching menu config:", error);
    return NextResponse.json({ error: "Failed to fetch menu config" }, { status: 500 });
  }
}
