"use client";

import { useState, useEffect } from "react";
import { Save, RotateCcw, Edit2, Trash2, Plus, GripVertical, ChevronDown, ChevronRight, ChevronUp, X } from "lucide-react";

interface MenuItem {
  id: string;
  label: string;
  path?: string;
  children?: MenuItem[];
  expanded?: boolean;
}

interface MenuGroup {
  id: string;
  label: string;
  children: MenuItem[];
  isSingleItem?: boolean;
  path?: string;
}

const ROLES = ["super_admin", "owner", "admin", "teacher", "parent", "student"];

const ROLE_ROUTES: Record<string, Array<{ path: string; label: string }>> = {
  super_admin: [
    { path: "/super-admin", label: "ภาพรวม" },
    { path: "/super-admin/institutions", label: "สถาบันทั้งหมด" },
    { path: "/super-admin/trials", label: "คำขอทดลองใช้งาน" },
    { path: "/super-admin/members", label: "อนุมัติสมาชิก" },
    { path: "/super-admin/users", label: "จัดการผู้ใช้งาน" },
    { path: "/super-admin/payouts", label: "Commission & Payout" },
    { path: "/super-admin/bookings", label: "ตรวจสอบการชำระ" },
    { path: "/super-admin/finance", label: "ข้อมูลทางการเงิน" },
    { path: "/super-admin/analytics", label: "Analytics" },
    { path: "/super-admin/courses", label: "จัดการคอร์ส" },
    { path: "/super-admin/content", label: "เนื้อหาการเรียน" },
    { path: "/super-admin/schedule", label: "ตารางเรียน" },
    { path: "/super-admin/teacher-schedule", label: "ตารางสอน" },
    { path: "/super-admin/certificates", label: "ใบรับรอง" },
    { path: "/super-admin/orders", label: "จัดการคำสั่งซื้อ" },
    { path: "/super-admin/products", label: "จัดการสินค้า" },
    { path: "/super-admin/coupons", label: "คูปอง/โปรโมชั่น" },
    { path: "/super-admin/reviews", label: "รีวิวคอร์ส" },
    { path: "/super-admin/live", label: "Live Sessions" },
    { path: "/super-admin/forum", label: "Forum" },
    { path: "/super-admin/banners", label: "จัดการแบนเนอร์" },
    { path: "/super-admin/roles", label: "จัดการ Role" },
    { path: "/super-admin/menu-config", label: "จัดการเมนู" },
    { path: "/super-admin/logs", label: "ประวัติการใช้งาน" },
    { path: "/super-admin/settings", label: "ตั้งค่าทั่วไป" },
  ],
  owner: [
    { path: "/owner", label: "ภาพรวม" },
    { path: "/owner/students", label: "จัดการนักเรียน" },
    { path: "/owner/assignments", label: "การบ้าน" },
    { path: "/owner/exams", label: "ข้อสอบ" },
    { path: "/owner/live", label: "Live Class" },
    { path: "/owner/teacher-portal", label: "Teacher Portal" },
    { path: "/owner/forum", label: "Forum" },
    { path: "/owner/courses", label: "จัดการคอร์ส" },
    { path: "/owner/content", label: "เนื้อหาการเรียน" },
    { path: "/owner/schedule", label: "ตารางเรียน" },
    { path: "/owner/teacher-schedule", label: "ตารางสอน" },
    { path: "/owner/certificates", label: "ใบรับรอง" },
    { path: "/owner/approve-members", label: "อนุมัติสมาชิก" },
    { path: "/owner/users", label: "จัดการผู้ใช้" },
    { path: "/owner/orders", label: "จัดการคำสั่งซื้อ" },
    { path: "/owner/products", label: "จัดการสินค้า" },
    { path: "/owner/coupons", label: "คูปอง/โปรโมชั่น" },
    { path: "/owner/analytics", label: "Analytics" },
    { path: "/owner/revenue", label: "รายได้" },
    { path: "/owner/billing", label: "Billing & ใบเสร็จ" },
    { path: "/owner/landing-page", label: "Landing Page" },
    { path: "/owner/reviews", label: "รีวิวคอร์ส" },
    { path: "/owner/notifications", label: "แจ้งเตือน" },
    { path: "/owner/banners", label: "จัดการแบรนเนอร์" },
    { path: "/owner/branding", label: "จัดการ Branding" },
  ],
  admin: [
    { path: "/admin", label: "ภาพรวม" },
    { path: "/admin/students", label: "จัดการนักเรียน" },
    { path: "/admin/courses", label: "จัดการคอร์ส" },
    { path: "/admin/content", label: "เนื้อหาการเรียน" },
    { path: "/admin/schedule", label: "ตารางเรียน" },
    { path: "/admin/teacher-schedule", label: "ตารางสอน" },
    { path: "/admin/certificates", label: "ใบรับรอง" },
    { path: "/admin/members", label: "อนุมัติสมาชิก" },
    { path: "/admin/users", label: "จัดการผู้ใช้" },
    { path: "/admin/orders", label: "จัดการคำสั่งซื้อ" },
    { path: "/admin/products", label: "จัดการสินค้า" },
    { path: "/admin/coupons", label: "คูปอง/โปรโมชั่น" },
    { path: "/admin/analytics", label: "Analytics" },
    { path: "/admin/revenue", label: "รายได้" },
    { path: "/admin/bookings", label: "ตรวจสอบการชำระ" },
    { path: "/admin/reviews", label: "รีวิวคอร์ส" },
    { path: "/admin/live", label: "Live Sessions" },
    { path: "/admin/forum", label: "Forum" },
    { path: "/admin/banners", label: "จัดการแบนเนอร์" },
    { path: "/admin/settings", label: "ตั้งค่าทั่วไป" },
  ],
  teacher: [
    { path: "/teacher", label: "ภาพรวม" },
    { path: "/teacher/my-courses", label: "คอร์สของฉัน" },
    { path: "/teacher/students", label: "นักเรียนของฉัน" },
    { path: "/teacher/assignments", label: "การบ้าน" },
    { path: "/teacher/exams", label: "ข้อสอบ" },
    { path: "/teacher/live", label: "Live Class" },
    { path: "/teacher/content", label: "เนื้อหาการเรียน" },
    { path: "/teacher/schedule", label: "ตารางสอน" },
    { path: "/teacher/forum", label: "Forum" },
    { path: "/teacher/reviews", label: "รีวิวคอร์ส" },
    { path: "/teacher/earnings", label: "รายได้ของฉัน" },
    { path: "/teacher/profile", label: "โปรไฟล์" },
  ],
  parent: [
    { path: "/parent", label: "ภาพรวม" },
    { path: "/parent/my-children", label: "บุตรหลาน" },
    { path: "/parent/courses", label: "คอร์สของบุตรหลาน" },
    { path: "/parent/progress", label: "ความก้าวหน้า" },
    { path: "/parent/schedule", label: "ตารางเรียน" },
    { path: "/parent/forum", label: "Forum" },
    { path: "/parent/notifications", label: "แจ้งเตือน" },
    { path: "/parent/billing", label: "ใบเสร็จ" },
    { path: "/parent/profile", label: "โปรไฟล์" },
  ],
  student: [
    { path: "/student", label: "ภาพรวม" },
    { path: "/student/my-courses", label: "คอร์สของฉัน" },
    { path: "/student/learning", label: "การเรียน" },
    { path: "/student/assignments", label: "การบ้าน" },
    { path: "/student/exams", label: "ข้อสอบ" },
    { path: "/student/schedule", label: "ตารางเรียน" },
    { path: "/student/forum", label: "Forum" },
    { path: "/student/certificates", label: "ใบรับรอง" },
    { path: "/student/profile", label: "โปรไฟล์" },
  ],
};

const getAvailableRoutes = (role: string) => ROLE_ROUTES[role] || [];

export default function MenuConfigContent() {
  const [selectedRole, setSelectedRole] = useState<string>("super_admin");
  const [menuGroups, setMenuGroups] = useState<MenuGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modified, setModified] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>("");
  const [showAddItemModal, setShowAddItemModal] = useState<string | null>(null);
  const [showAddSingleItemModal, setShowAddSingleItemModal] = useState(false);
  const [draggedGroupId, setDraggedGroupId] = useState<string | null>(null);
  const [dragOverGroupId, setDragOverGroupId] = useState<string | null>(null);

  useEffect(() => {
    fetchMenuConfig();
  }, [selectedRole]);

  useEffect(() => {
    // Auto-save default menu for super_admin if empty
    if (selectedRole === "super_admin" && menuGroups.length === 0 && !loading) {
      saveDefaultMenu();
    }
  }, [selectedRole, menuGroups.length, loading]);


  const isRouteUsed = (path: string): boolean => {
    for (const group of menuGroups) {
      // Check if single item uses this path
      if (group.isSingleItem && group.path === path) {
        return true;
      }
      // Check if child item uses this path
      if (group.children.some(child => child.path === path)) {
        return true;
      }
    }
    return false;
  };

  const getDefaultMenus = () => {
    return [
      {
        id: "overview",
        label: "ภาพรวม",
        path: "/super-admin",
        children: [],
        isSingleItem: true,
      },
      {
        id: "finance",
        label: "รายได้และการเงิน",
        children: [
          { id: "revenue", label: "รายได้", path: "/admin/revenue" },
          { id: "analytics", label: "Analytics", path: "/admin/analytics" },
          { id: "commission", label: "Commission & Payout", path: "/admin/bookings" },
          { id: "verification", label: "ตรวจสอบการชำระ", path: "/admin/bookings" },
          { id: "finance-info", label: "ข้อมูลทางการเงิน", path: "/admin/finance" },
        ],
      },
      {
        id: "institution",
        label: "สถาบัน",
        children: [
          { id: "institutions", label: "สถาบันทั้งหมด", path: "/admin/trials" },
          { id: "trial-requests", label: "คำขอทดลองใช้งาน", path: "/admin/trials" },
        ],
      },
      {
        id: "members",
        label: "จัดการสมาชิก",
        children: [
          { id: "approve-members", label: "อนุมัติสมาชิก", path: "/admin/members" },
          { id: "manage-users", label: "จัดการผู้ใช้งาน", path: "/admin/users" },
        ],
      },
      {
        id: "platform-features",
        label: "ฟีเจอร์แพลตฟอร์ม",
        children: [
          { id: "live-sessions", label: "Live Sessions", path: "/admin/live" },
          { id: "reviews", label: "รีวิวคอร์ส", path: "/admin/reviews" },
          { id: "forum", label: "Forum", path: "/admin/forum" },
        ],
      },
      {
        id: "commerce",
        label: "ระบบขาย",
        children: [
          { id: "orders", label: "จัดการคำสั่งซื้อ", path: "/admin/orders" },
          { id: "products", label: "จัดการสินค้า", path: "/admin/products" },
          { id: "coupons", label: "คูปอง/โปรโมชั่น", path: "/admin/coupons" },
        ],
      },
      {
        id: "content",
        label: "จัดการเนื้อหา",
        children: [
          { id: "courses", label: "จัดการคอร์ส", path: "/admin/courses" },
          { id: "course-content", label: "เนื้อหาการเรียน", path: "/admin/content" },
          { id: "student-schedule", label: "ตารางเรียน", path: "/admin/schedule" },
          { id: "teacher-schedule", label: "ตารางสอน", path: "/admin/teacher-schedule" },
          { id: "certificates", label: "ใบรับรอง", path: "/admin/certificates" },
          {
            id: "categories",
            label: "หมวดหมู่",
            children: [
              { id: "categories-online", label: "หมวดหมู่ online", path: "/admin/categories" },
              { id: "categories-onsite", label: "หมวดหมู่ onsite", path: "/admin/categories/onsite" },
            ],
          },
        ],
      },
      {
        id: "system",
        label: "จัดการระบบ",
        children: [
          { id: "banners", label: "จัดการแบนเนอร์", path: "/admin/banners" },
          { id: "roles", label: "จัดการ Role", path: "/super-admin/roles" },
          { id: "menu-config", label: "จัดการเมนู", path: "/super-admin/menu-config" },
          { id: "activity-logs", label: "ประวัติการใช้งาน", path: "/admin/activity-logs" },
          { id: "settings", label: "ตั้งค่าทั่วไป", path: "/admin/settings" },
        ],
      },
    ];
  };

  const fetchMenuConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/menu-config/${selectedRole}`);
      if (res.ok) {
        const data = await res.json();
        // Convert flat items array to grouped structure
        const groups: MenuGroup[] = [];
        let currentGroup: MenuGroup | null = null;

        (data.items || []).forEach((item: any) => {
          // Check isSingleItem flag first, then fallback to path detection
          const isSingle = item.isSingleItem || (item.path && (!item.children || item.children.length === 0));

          if (isSingle) {
            groups.push({
              id: item.id,
              label: item.label,
              path: item.path,
              children: [],
              isSingleItem: true,
            });
          } else {
            // This is a group (may or may not have children)
            groups.push({
              id: item.id,
              label: item.label,
              children: item.children || [],
              isSingleItem: false,
            });
          }
        });

        console.log("Loaded menu groups:", groups);
        // Keep empty array if no items (user deleted all)
        setMenuGroups(groups);
      } else {
        // API error - no response, use defaults
        setMenuGroups(getDefaultMenus());
      }
      setModified(false);
      setEditingId(null);
    } catch (error) {
      console.error("Error fetching menu config:", error);
      setMenuGroups(getDefaultMenus());
    } finally {
      setLoading(false);
    }
  };

  const saveDefaultMenu = async () => {
    try {
      const defaultMenus = getDefaultMenus();
      const items: any[] = [];
      defaultMenus.forEach(group => {
        const item: any = {
          id: group.id,
          label: group.label,
        };
        if (group.isSingleItem) {
          item.path = group.path;
          item.isSingleItem = true;
          item.children = [];
        } else {
          item.children = group.children;
        }
        items.push(item);
      });

      const res = await fetch(`/api/admin/menu-config/${selectedRole}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      if (res.ok) {
        setMenuGroups(defaultMenus);
        setModified(false);
      }
    } catch (error) {
      console.error("Error saving default menu:", error);
    }
  };

  const saveMenuConfig = async () => {
    setSaving(true);
    try {
      // Convert groups back to flat items array
      const items: any[] = [];
      menuGroups.forEach(group => {
        const item: any = {
          id: group.id,
          label: group.label,
        };
        if (group.isSingleItem) {
          item.path = group.path;
          item.children = [];
          item.isSingleItem = true;
        } else {
          item.children = group.children;
        }
        items.push(item);
      });

      const res = await fetch(`/api/admin/menu-config/${selectedRole}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      if (res.ok) {
        alert("บันทึกสำเร็จ!");
        setModified(false);
        setEditingId(null);
      } else {
        alert("บันทึกไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Error saving menu config:", error);
      alert("เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  };

  const handleEditStart = (id: string, currentText: string) => {
    setEditingId(id);
    setEditingText(currentText);
  };

  const handleEditSave = (id: string) => {
    // Find and update the item
    const updatedGroups = menuGroups.map(group => {
      if (group.id === id) {
        return { ...group, label: editingText };
      }
      return {
        ...group,
        children: group.children.map(child =>
          child.id === id ? { ...child, label: editingText } : child
        ),
      };
    });
    
    setMenuGroups(updatedGroups);
    setModified(true);
    setEditingId(null);
  };

  const addMenuItem = (groupId: string, routePath: string) => {
    const route = getAvailableRoutes(selectedRole).find(r => r.path === routePath);
    if (!route) return;

    const newId = `item-${Date.now()}`;
    const updatedGroups = menuGroups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          children: [...group.children, { id: newId, label: route.label, path: route.path }],
        };
      }
      return group;
    });
    setMenuGroups(updatedGroups);
    setModified(true);
    setShowAddItemModal(null);
  };

  const deleteItem = (groupId: string, itemId?: string) => {
    console.log("deleteItem called:", { groupId, itemId });
    if (!confirm("ยืนยันการลบหรือไม่?")) {
      console.log("Delete cancelled by user");
      return;
    }

    let deleted = false;
    console.log("Before delete - menuGroups:", menuGroups);

    if (itemId) {
      // Delete child item
      const updatedGroups = menuGroups.map(group => {
        if (group.id === groupId) {
          const filtered = group.children.filter(child => child.id !== itemId);
          if (filtered.length < group.children.length) {
            deleted = true;
          }
          return {
            ...group,
            children: filtered,
          };
        }
        return group;
      });
      if (deleted) {
        console.log("Updating menuGroups - delete child item");
        setMenuGroups(updatedGroups);
      }
    } else {
      // Delete group
      const filtered = menuGroups.filter(g => g.id !== groupId);
      console.log("Filtered groups:", filtered);
      if (filtered.length < menuGroups.length) {
        deleted = true;
        console.log("Updating menuGroups - delete group");
        setMenuGroups(filtered);
      }
    }

    if (deleted) {
      console.log("Delete successful");
      setModified(true);
      alert("ลบเรียบร้อยแล้ว");
    } else {
      console.log("Delete failed - item not found");
      alert("ไม่พบรายการที่ต้องการลบ");
    }
  };

  const moveGroup = (fromIndex: number, toIndex: number) => {
    const newGroups = [...menuGroups];
    [newGroups[fromIndex], newGroups[toIndex]] = [newGroups[toIndex], newGroups[fromIndex]];
    setMenuGroups(newGroups);
    setModified(true);
  };

  const moveItem = (groupId: string, fromIndex: number, toIndex: number) => {
    const updatedGroups = menuGroups.map(group => {
      if (group.id === groupId) {
        const newChildren = [...group.children];
        [newChildren[fromIndex], newChildren[toIndex]] = [newChildren[toIndex], newChildren[fromIndex]];
        return { ...group, children: newChildren };
      }
      return group;
    });
    setMenuGroups(updatedGroups);
    setModified(true);
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">กำลังโหลด...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">จัดการเมนู</h1>
        <p className="text-gray-600">ปรับแต่งเมนูสำหรับแต่ละบทบาท</p>
      </div>

      {/* Role Selector */}
      <div className="mb-8 flex gap-3 flex-wrap">
        {ROLES.map((role) => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedRole === role
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {role === "super_admin" ? "Super Admin" : role.charAt(0).toUpperCase() + role.slice(1)}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={saveMenuConfig}
          disabled={!modified || saving}
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? "กำลังบันทึก..." : "บันทึก"}
        </button>
        <button
          onClick={() => fetchMenuConfig()}
          disabled={!modified}
          className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg disabled:opacity-50"
        >
          <RotateCcw className="w-5 h-5" />
          รีเซต
        </button>
        <button
          onClick={() => {
            const groupName = prompt("ป้อนชื่อหมวดหมู่ใหม่:");
            if (groupName) {
              const newGroup: MenuGroup = {
                id: `group-${Date.now()}`,
                label: groupName,
                children: [],
              };
              setMenuGroups([...menuGroups, newGroup]);
              setModified(true);
            }
          }}
          className="inline-flex items-center gap-2 px-6 py-3 border border-green-300 text-green-700 font-semibold rounded-lg hover:bg-green-50"
        >
          <Plus className="w-5 h-5" />
          เพิ่มหมวดหมู่ใหม่
        </button>
        <button
          onClick={() => setShowAddSingleItemModal(true)}
          className="inline-flex items-center gap-2 px-6 py-3 border border-blue-300 text-blue-700 font-semibold rounded-lg hover:bg-blue-50"
        >
          <Plus className="w-5 h-5" />
          เพิ่มรายการเดี่ยว
        </button>
      </div>

      {/* Menu Editor */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        {menuGroups.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-6">ยังไม่มีเมนู</p>
            <button
              onClick={saveDefaultMenu}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-5 h-5" />
              สร้างเมนูเริ่มต้น
            </button>
          </div>
        ) : (
          menuGroups.map((group, groupIdx) => {
            // Single item rendering
            if (group.isSingleItem) {
              return (
                <div key={group.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-white p-4 flex items-center gap-3 justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                      {editingId === group.id ? (
                        <input
                          autoFocus
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onBlur={() => handleEditSave(group.id)}
                          onKeyDown={(e) => e.key === "Enter" && handleEditSave(group.id)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">{group.label}</span>
                          <div className="text-xs text-gray-500">{group.path}</div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {groupIdx > 0 && (
                        <button
                          onClick={() => {
                            const newGroups = [...menuGroups];
                            [newGroups[groupIdx], newGroups[groupIdx - 1]] = [newGroups[groupIdx - 1], newGroups[groupIdx]];
                            setMenuGroups(newGroups);
                            setModified(true);
                          }}
                          className="p-2 text-gray-600 hover:bg-gray-200 rounded"
                          title="ขึ้น"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                      )}
                      {groupIdx < menuGroups.length - 1 && (
                        <button
                          onClick={() => {
                            const newGroups = [...menuGroups];
                            [newGroups[groupIdx], newGroups[groupIdx + 1]] = [newGroups[groupIdx + 1], newGroups[groupIdx]];
                            setMenuGroups(newGroups);
                            setModified(true);
                          }}
                          className="p-2 text-gray-600 hover:bg-gray-200 rounded"
                          title="ลง"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEditStart(group.id, group.label)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteItem(group.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            // Group rendering
            return (
            <div
              key={group.id}
              draggable
              onDragStart={() => setDraggedGroupId(group.id)}
              onDragEnd={() => setDraggedGroupId(null)}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverGroupId(group.id);
              }}
              onDragLeave={() => setDragOverGroupId(null)}
              onDrop={() => {
                if (draggedGroupId && draggedGroupId !== group.id) {
                  const fromIdx = menuGroups.findIndex(g => g.id === draggedGroupId);
                  const toIdx = menuGroups.findIndex(g => g.id === group.id);
                  if (fromIdx !== -1 && toIdx !== -1) {
                    moveGroup(fromIdx, toIdx);
                  }
                }
                setDragOverGroupId(null);
              }}
              className={`border border-gray-200 rounded-lg overflow-hidden transition-colors ${
                dragOverGroupId === group.id ? "bg-blue-50 border-blue-300" : ""
              }`}
            >
              {/* Group Header */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 flex items-center gap-3 justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                  {editingId === group.id ? (
                    <input
                      autoFocus
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onBlur={() => handleEditSave(group.id)}
                      onKeyDown={(e) => e.key === "Enter" && handleEditSave(group.id)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                  ) : (
                    <span className="font-bold text-gray-900">{group.label}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  {groupIdx > 0 && (
                    <button
                      onClick={() => moveGroup(groupIdx, groupIdx - 1)}
                      className="p-2 text-gray-600 hover:bg-gray-200 rounded"
                      title="ขึ้น"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                  )}
                  {groupIdx < menuGroups.length - 1 && (
                    <button
                      onClick={() => moveGroup(groupIdx, groupIdx + 1)}
                      className="p-2 text-gray-600 hover:bg-gray-200 rounded"
                      title="ลง"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleEditStart(group.id, group.label)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteItem(group.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Group Children */}
              <div className="bg-gray-50 p-4 space-y-2">
                {group.children.map((child, childIdx) => (
                  <div key={child.id} className="flex items-center gap-3 p-3 bg-white rounded border border-gray-200">
                    <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    {editingId === child.id ? (
                      <input
                        autoFocus
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onBlur={() => handleEditSave(child.id)}
                        onKeyDown={(e) => e.key === "Enter" && handleEditSave(child.id)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                    ) : (
                      <span className="flex-1 text-gray-700">{child.label}</span>
                    )}
                    <div className="flex gap-2">
                      {childIdx > 0 && (
                        <button
                          onClick={() => moveItem(group.id, childIdx, childIdx - 1)}
                          className="p-2 text-gray-600 hover:bg-gray-200 rounded"
                          title="ขึ้น"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                      )}
                      {childIdx < group.children.length - 1 && (
                        <button
                          onClick={() => moveItem(group.id, childIdx, childIdx + 1)}
                          className="p-2 text-gray-600 hover:bg-gray-200 rounded"
                          title="ลง"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEditStart(child.id, child.label)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => deleteItem(group.id, child.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => setShowAddItemModal(group.id)}
                  className="w-full py-2 px-3 text-sm text-indigo-600 hover:bg-indigo-50 rounded border border-dashed border-gray-300 font-medium flex items-center gap-2 justify-center"
                >
                  <Plus className="w-4 h-4" />
                  เพิ่มเมนูย่อย
                </button>
              </div>
            </div>
            );
          })
        )}
      </div>

      {modified && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-900">
          <p className="font-semibold">⚠️ มีการเปลี่ยนแปลง - กดบันทึกเพื่อบันทึก</p>
        </div>
      )}

      {/* Add Single Item Modal */}
      {showAddSingleItemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">เลือกหน้าที่ต้องการเพิ่ม</h3>
              <button onClick={() => setShowAddSingleItemModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {getAvailableRoutes(selectedRole).map(route => {
                const used = isRouteUsed(route.path);
                return (
                  <button
                    key={route.path}
                    onClick={() => {
                      if (!used) {
                        const newItem: MenuGroup = {
                          id: `single-${Date.now()}`,
                          label: route.label,
                          path: route.path,
                          children: [],
                          isSingleItem: true,
                        };
                        setMenuGroups([...menuGroups, newItem]);
                        setModified(true);
                        setShowAddSingleItemModal(false);
                      }
                    }}
                    disabled={used}
                    className={`w-full text-left px-4 py-3 rounded border transition-colors ${
                      used
                        ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                        : "border-gray-200 hover:bg-blue-50 hover:border-blue-300"
                    }`}
                  >
                    <div className="font-medium">{route.label}</div>
                    <div className="text-xs">{route.path}</div>
                    {used && <div className="text-xs mt-1">✓ ใช้แล้ว</div>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">เลือกหน้าที่ต้องการเพิ่ม</h3>
              <button onClick={() => setShowAddItemModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {getAvailableRoutes(selectedRole).map(route => {
                const used = isRouteUsed(route.path);
                return (
                  <button
                    key={route.path}
                    onClick={() => {
                      if (showAddItemModal && !used) {
                        addMenuItem(showAddItemModal, route.path);
                      }
                    }}
                    disabled={used}
                    className={`w-full text-left px-4 py-3 rounded border transition-colors ${
                      used
                        ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                        : "border-gray-200 hover:bg-indigo-50 hover:border-indigo-300"
                    }`}
                  >
                    <div className="font-medium">{route.label}</div>
                    <div className="text-xs">{route.path}</div>
                    {used && <div className="text-xs mt-1">✓ ใช้แล้ว</div>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
