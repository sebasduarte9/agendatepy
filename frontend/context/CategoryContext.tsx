"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {
  getCategory,
  type CategoryContent,
  type CategoryId,
} from "@/lib/categories";

type CategoryContextValue = {
  selectedCategory: CategoryId;
  setSelectedCategory: (id: CategoryId) => void;
  category: CategoryContent;
};

const CategoryContext = createContext<CategoryContextValue | null>(null);

const VALID_CATEGORIES: CategoryId[] = [
  "peluqueria",
  "odontologia",
  "pilates",
  "spas",
  "medicos",
  "veterinarias",
  "gimnasios",
  "talleres",
  "padel",
];

function getInitialCategory(): CategoryId {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const rubroParam = params.get("rubro") as CategoryId;
    if (rubroParam && VALID_CATEGORIES.includes(rubroParam)) {
      return rubroParam;
    }
  }
  return "odontologia";
}

export function CategoryProvider({ children }: { children: ReactNode }) {
  // Rubro activo en toda la landing (Hero, WhatsApp y widget).
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryId>(getInitialCategory);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const rubroParam = params.get("rubro") as CategoryId;
      if (rubroParam && VALID_CATEGORIES.includes(rubroParam)) {
        setSelectedCategory(rubroParam);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const value = useMemo(
    () => ({
      selectedCategory,
      setSelectedCategory,
      category: getCategory(selectedCategory),
    }),
    [selectedCategory],
  );

  return (
    <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>
  );
}

export function useCategory() {
  const ctx = useContext(CategoryContext);
  if (!ctx) {
    throw new Error("useCategory debe usarse dentro de CategoryProvider");
  }
  return ctx;
}
