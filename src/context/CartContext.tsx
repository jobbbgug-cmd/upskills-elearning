"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ICourse } from "@/types";

export interface CartItem {
  courseId: string;
  course: ICourse;
  selected: boolean;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (course: ICourse) => void;
  removeFromCart: (courseId: string) => void;
  toggleItem: (courseId: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load cart", e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (course: ICourse) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.courseId === course._id);
      if (existing) return prev;
      return [...prev, { courseId: course._id, course, selected: true }];
    });
  };

  const removeFromCart = (courseId: string) => {
    setItems((prev) => prev.filter((item) => item.courseId !== courseId));
  };

  const toggleItem = (courseId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.courseId === courseId ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalPrice = () => {
    return items.reduce((sum, item) => sum + (item.course.price || 0), 0);
  };

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, toggleItem, clearCart, getTotalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
