"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
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

export function CategoryProvider({ children }: { children: ReactNode }) {
  // Rubro activo en toda la landing (Hero, WhatsApp y widget).
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryId>("odontologia");

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
