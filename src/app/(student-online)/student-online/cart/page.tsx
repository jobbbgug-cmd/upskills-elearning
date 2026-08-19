"use client";
import { useState, useEffect } from "react";
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

interface CartItem {
  _id: string;
  courseId: string;
  courseName: string;
  price: number;
  quantity: number;
  image?: string;
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    const loadCart = async () => {
      try {
        const res = await fetch("/api/student-online/cart");
        if (res.ok) {
          setItems(await res.json());
        }
      } catch (error) {
        console.error("Error loading cart:", error);
      }
      setLoading(false);
    };
    loadCart();
  }, []);

  const handleRemove = async (itemId: string) => {
    try {
      const res = await fetch(`/api/student-online/cart/${itemId}`, { method: "DELETE" });
      if (res.ok) {
        setItems(items.filter((item) => item._id !== itemId));
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/student-online/checkout", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        window.location.href = data.checkoutUrl || "/student-online/payment";
      }
    } catch (error) {
      console.error("Error during checkout:", error);
    }
    setCheckoutLoading(false);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">ตะกร้าสินค้า</h1>
        <p className="text-sm text-gray-600 mt-1">รายการคอร์สที่เลือก</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">ตะกร้าว่างเปล่า</p>
              <p className="text-sm text-gray-500 mt-1">เพิ่มคอร์สเพื่อเริ่มการเรียน</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item._id} className="bg-white rounded-xl border border-gray-200 p-6 flex gap-4">
                {item.image && (
                  <img src={item.image} alt={item.courseName} className="w-24 h-24 object-cover rounded-lg" />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{item.courseName}</h3>
                  <p className="text-lg font-bold text-violet-600">฿{item.price.toLocaleString()}</p>
                </div>
                <button
                  onClick={() => handleRemove(item._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="ลบ"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-20 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">สรุปคำสั่งซื้อ</h3>

            <div className="border-t border-gray-200 pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">ทั้งหมด ({items.length} รายการ)</span>
                <span className="font-medium text-gray-900">฿{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">ค่าส่ง</span>
                <span className="font-medium text-gray-900">ฟรี</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">รวมทั้งสิ้น</span>
                <span className="text-2xl font-bold text-violet-600">฿{total.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={items.length === 0 || checkoutLoading}
              className="w-full bg-violet-600 text-white py-3 rounded-lg font-semibold hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {checkoutLoading ? "กำลังประมวลผล..." : "ทำการชำระเงิน"}
            </button>

            <button className="w-full border border-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              ซื้อต่อ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
