"use client";

import { useCart } from "@/context/CartContext";
import { ICourse } from "@/types";

interface AddToCartButtonProps {
  course: ICourse;
}

export default function AddToCartButton({ course }: AddToCartButtonProps) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(course);
  };

  return (
    <button
      onClick={handleAddToCart}
      className="w-full border-2 border-purple-600 text-purple-600 font-semibold py-3 rounded-xl hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
    >
      🛒 เพิ่มลงตะกร้า
    </button>
  );
}
