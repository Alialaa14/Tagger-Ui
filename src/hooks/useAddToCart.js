import { useCallback, useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

function resolveProductId(product) {
  return product?._id || product?.id || product?.image?.public_id || null;
}

export default function useAddToCart() {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [error, setError] = useState("");

  const add = useCallback(
    async (product) => {
      const role = String(
        user?.role ||
          user?.accountType ||
          localStorage.getItem("user_role") ||
          "",
      ).toLowerCase();
      if (role !== "customer" && role !== "user") {
        const msg = "الإضافة للسلة متاحة للعملاء فقط.";
        setError(msg);
        return { ok: false, message: msg };
      }

      const productId = resolveProductId(product);
      if (!productId) {
        setError("لا يمكن إضافة المنتج لأن معرف المنتج غير متوفر.");
        return { ok: false, message: "Missing productId" };
      }

      setIsAddingToCart(true);
      setError("");
      try {
        const res = await addToCart(product, 1);
        if (!res?.ok) {
          const msg = res?.message || "فشل إضافة المنتج إلى السلة.";
          setError(msg);
          return { ok: false, message: msg };
        }
        return { ok: true, data: res?.data };
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "فشل إضافة المنتج إلى السلة.";
        setError(msg);
        return { ok: false, message: msg };
      } finally {
        setIsAddingToCart(false);
      }
    },
    [addToCart, user],
  );

  return {
    isAddingToCart,
    addToCartRequest: add,
    addToCartError: error,
    clearAddToCartError: () => setError(""),
  };
}
