"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ICourse } from "@/types";

interface CourseFiltersProps {
  categories: { name: string; count: number }[];
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  category?: string;
  priceType?: string;
  priceMin?: number;
  priceMax?: number;
}

export default function CourseFilters({ categories, onFilterChange }: CourseFiltersProps) {
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [filters, setFilters] = useState<FilterState>({});

  const displayedCategories = showMoreCategories ? categories : categories.slice(0, 5);

  const handleCategoryChange = (category: string) => {
    const newFilters = filters.category === category ? { ...filters, category: undefined } : { ...filters, category };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriceTypeChange = (type: string) => {
    const newFilters = { ...filters, priceType: filters.priceType === type ? undefined : type };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriceRangeChange = (key: "min" | "max", value: string) => {
    const newRange = { ...priceRange, [key]: value };
    setPriceRange(newRange);

    const newFilters = {
      ...filters,
      priceMin: newRange.min ? parseInt(newRange.min) : undefined,
      priceMax: newRange.max ? parseInt(newRange.max) : undefined,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
      {/* Categories */}
      <h3 className="font-bold text-gray-900 mb-4">หมวดหมู่ ({categories.length})</h3>
      <div className="space-y-2 mb-4">
        {displayedCategories.map((cat) => (
          <label key={cat.name} className="flex items-center gap-2 cursor-pointer hover:text-indigo-600">
            <input
              type="checkbox"
              checked={filters.category === cat.name}
              onChange={() => handleCategoryChange(cat.name)}
              className="w-4 h-4 rounded cursor-pointer"
            />
            <span className="text-sm text-gray-700 flex-1">{cat.name}</span>
            <span className="text-xs text-gray-500">({cat.count})</span>
          </label>
        ))}
      </div>
      {categories.length > 5 && (
        <button
          onClick={() => setShowMoreCategories(!showMoreCategories)}
          className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
        >
          {showMoreCategories ? "ซ่อน" : "เพิ่มเติม"} →
        </button>
      )}

      {/* Price Type */}
      <div className="mt-6 pt-6 border-t">
        <h4 className="font-semibold text-gray-900 mb-3 text-sm">ระดับ</h4>
        <div className="space-y-2">
          {[
            { id: "free", label: "ฟรี", desc: "Filter คอร์สฟรี" },
            { id: "consultation", label: "ปรึกษา", desc: "Filter ปรึกษา" },
            { id: "paid", label: "บาท", desc: "Filter คอร์สชำระเงิน" },
          ].map((option) => (
            <label key={option.id} className="flex items-start gap-2 cursor-pointer hover:text-indigo-600">
              <input
                type="checkbox"
                checked={filters.priceType === option.id}
                onChange={() => handlePriceTypeChange(option.id)}
                className="w-4 h-4 rounded cursor-pointer mt-0.5"
              />
              <div className="flex-1">
                <div className="text-sm text-gray-700">{option.label}</div>
                <div className="text-xs text-gray-500">{option.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mt-6 pt-6 border-t">
        <h4 className="font-semibold text-gray-900 mb-3 text-sm">ช่วงราคา (บาท)</h4>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="ต่ำสุด"
            value={priceRange.min}
            onChange={(e) => handlePriceRangeChange("min", e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <span className="self-center text-gray-500">-</span>
          <input
            type="number"
            placeholder="สูงสุด"
            value={priceRange.max}
            onChange={(e) => handlePriceRangeChange("max", e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
  );
}
