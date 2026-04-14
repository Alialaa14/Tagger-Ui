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
        const msg = "??????? ????? ????? ??????? ???.";
        setError(msg);
        return { ok: false, message: msg };
      }

      const productId = resolveProductId(product);
      if (!productId) {
        setError("?? ???? ????? ?????? ??? ???? ?????? ??? ?????.");
        return { ok: false, message: "Missing productId" };
      }

      setIsAddingToCart(true);
      setError("");
      try {
        const res = await addToCart(product, 1);
        if (!res?.ok) {
          const msg = res?.message || "??? ????? ?????? ??? ?????.";
          setError(msg);
          return { ok: false, message: msg };
        }
        return { ok: true, data: res?.data };
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "??? ????? ?????? ??? ?????.";
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
