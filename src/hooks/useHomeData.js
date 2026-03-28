import { useEffect, useMemo, useState } from "react";
import axios from "axios";

// ─── Normalizers ──────────────────────────────────────────────────────────────

function normalizeCategory(raw) {
  return {
    id: raw?._id || raw?.id || raw?.image?.public_id || raw?.name,
    name: raw?.name || "بدون اسم",
    description: raw?.description || "لا يوجد وصف متاح.",
    image: {
      public_id: raw?.image?.public_id || "",
      url: raw?.image?.url || "",
    },
  };
}

function normalizeProduct(raw) {
  return {
    ...raw,
    id: raw?._id || raw?.id,
    name: raw?.name || "",
    price: Number(raw?.price || 0),
    image: raw?.image || { public_id: "", url: "" },
    discount: Array.isArray(raw?.discount) ? raw.discount : [],
    category: raw?.category || "",
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useHomeData
 *
 * Fetches both categories and best-selling products in a single request
 * from GET /api/v1/home  →  { categories: [], bestSelling: [] }
 *
 * Falls back to seed data if the request fails so the page never shows empty.
 */
export default function useHomeData() {
  const [categories, setCategories] = useState([]);
  const [bestSelling, setBestSelling] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      setIsLoading(true);
      setError("");

      try {
        const { data } = await axios.get(
          "http://localhost:3000/api/v1/pages/home",
          { withCredentials: true },
        );

        // Support flexible response shapes from the controller:
        //   { data: { categories: [], bestSelling: [] } }
        //   { categories: [], bestSelling: [] }
        const payload = data?.data ?? data;
        const rawCategories = payload?.categories ?? [];
        const rawProducts = payload?.bestSelling ?? payload?.products ?? [];

        if (!mounted) return;

        setCategories(
          Array.isArray(rawCategories)
            ? rawCategories.map(normalizeCategory)
            : [],
        );
        setBestSelling(
          Array.isArray(rawProducts) ? rawProducts.map(normalizeProduct) : [],
        );
      } catch (err) {
        if (!mounted) return;

        // Graceful degradation — show seed data so the UI is never blank
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "تعذر تحميل البيانات.",
        );
        setCategories(seedCategories.map(normalizeCategory));
        setBestSelling(seedProducts.slice(0, 8).map(normalizeProduct));
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []); // single fetch on mount — no deps needed

  const hasCategories = useMemo(
    () => categories.length > 0,
    [categories.length],
  );
  const hasBestSelling = useMemo(
    () => bestSelling.length > 0,
    [bestSelling.length],
  );

  return {
    categories,
    bestSelling,
    isLoading,
    error,
    hasCategories,
    hasBestSelling,
  };
}
