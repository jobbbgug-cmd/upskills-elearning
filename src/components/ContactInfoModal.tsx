"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface ContactInfoData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  taxId: string;
  needsTaxInvoice: boolean;
}

interface ContactInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ContactInfoData) => void;
  initialData?: ContactInfoData;
}

export default function ContactInfoModal({
  isOpen,
  onClose,
  onSave,
  initialData
}: ContactInfoModalProps) {
  const [formData, setFormData] = useState<ContactInfoData>(
    initialData || {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      taxId: "",
      needsTaxInvoice: false
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">ข้อมูลติดต่อ / ขอใบกำกับภาษี</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="firstName"
              placeholder="ชื่อ"
              value={formData.firstName}
              onChange={handleChange}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              name="lastName"
              placeholder="นามสกุล"
              value={formData.lastName}
              onChange={handleChange}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input
              type="email"
              name="email"
              placeholder="อีเมล"
              value={formData.email}
              onChange={handleChange}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="tel"
              name="phone"
              placeholder="เบอร์โทรศัพท์"
              value={formData.phone}
              onChange={handleChange}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <input
            type="text"
            name="address"
            placeholder="ที่อยู่"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            type="text"
            name="taxId"
            placeholder="เลขประจำตัวผู้เสียภาษี"
            value={formData.taxId}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Checkbox */}
        <label className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            name="needsTaxInvoice"
            checked={formData.needsTaxInvoice}
            onChange={handleChange}
            className="w-4 h-4 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-700">
            ต้องการรับใบกำกับภาษี/ใบเสร็จรับเงินในนามบริษัท
          </span>
        </label>

        {/* Warning Text */}
        <div className="mb-4">
          <p className="text-xs text-red-600 mb-2 ml-2">
            *<span className="text-xs text-gray-700 ml-1">ทาง UPSkill ขขอสงวนสิทธิ์ในการออกใบกำกับภาษีเต็มรูปแบบ หลังจากที่คุณได้ชำระเงินแล้วทุกกรณี</span></p>
          <p className="text-xs text-gray-600 mt-5">
            โดยการระบุข้อมูลจะถือว่าคุณยอมรับใน ข้อตกลงการใช้บริการ และ นโยบายความเป็นส่วนตัวเรียบร้อยแล้ว
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border-2 border-indigo-600 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}
