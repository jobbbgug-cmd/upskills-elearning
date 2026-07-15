"use client";

import { useState, useEffect } from "react";
import { Save, RotateCcw, Edit2, Trash2, Plus, GripVertical, ChevronDown, ChevronRight, X } from "lucide-react";

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
}

const ROLES = ["super_admin", "owner", "admin", "teacher", "parent", "student"];

export default function MenuConfigContent() {
  const [selectedRole, setSelectedRole] = useState<string>("super_admin");
  const [menuGroups, setMenuGroups] = useState<MenuGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modified, setModified] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>("");

  useEffect(() => {
    fetchMenuConfig();
  }, [selectedRole]);

  const fetchMenuConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/menu-config/${selectedRole}`);
      if (res.ok) {
        const data = await res.json();
        // Convert flat items array to grouped structure
        const groups: MenuGroup[] = [];
        let currentGroup: MenuGroup | null = null;
        
        (data.items || []).forEach((item: MenuItem) => {
          if (!item.children || item.children.length === 0) {
            // This is a group
            currentGroup = { id: item.id, label: item.label, children: [] };
            groups.push(currentGroup);
          } else if (currentGroup) {
            // This is a child item
            currentGroup.children.push(item);
          }
        });
        
        setMenuGroups(groups);
      } else {
        setMenuGroups([]);
      }
      setModified(false);
      setEditingId(null);
    } catch (error) {
      console.error("Error fetching menu config:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveMenuConfig = async () => {
    setSaving(true);
    try {
      // Convert groups back to flat items array
      const items: MenuItem[] = [];
      menuGroups.forEach(group => {
        items.push({
          id: group.id,
          label: group.label,
          children: group.children,
        });
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

  const addMenuItem = (groupId: string) => {
    const newId = `item-${Date.now()}`;
    const updatedGroups = menuGroups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          children: [...group.children, { id: newId, label: "เมนูใหม่", path: "" }],
        };
      }
      return group;
    });
    setMenuGroups(updatedGroups);
    setModified(true);
  };

  const deleteItem = (groupId: string, itemId?: string) => {
    if (itemId) {
      // Delete child item
      const updatedGroups = menuGroups.map(group => {
        if (group.id === groupId) {
          return {
            ...group,
            children: group.children.filter(child => child.id !== itemId),
          };
        }
        return group;
      });
      setMenuGroups(updatedGroups);
    } else {
      // Delete group
      setMenuGroups(menuGroups.filter(g => g.id !== groupId));
    }
    setModified(true);
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
      </div>

      {/* Menu Editor */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        {menuGroups.length === 0 ? (
          <p className="text-gray-500 text-center py-8">ยังไม่มีเมนู</p>
        ) : (
          menuGroups.map((group, groupIdx) => (
            <div key={group.id} className="border border-gray-200 rounded-lg overflow-hidden">
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
                  onClick={() => addMenuItem(group.id)}
                  className="w-full py-2 px-3 text-sm text-indigo-600 hover:bg-indigo-50 rounded border border-dashed border-gray-300 font-medium flex items-center gap-2 justify-center"
                >
                  <Plus className="w-4 h-4" />
                  เพิ่มเมนูย่อย
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {modified && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-900">
          <p className="font-semibold">⚠️ มีการเปลี่ยนแปลง - กดบันทึกเพื่อบันทึก</p>
        </div>
      )}
    </div>
  );
}

function ChevronUp({ className }: { className: string }) {
  return <ChevronDown className={`${className} rotate-180`} />;
}
