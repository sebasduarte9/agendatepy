"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Search,
  Plus,
  Package,
  AlertTriangle,
  TrendingUp,
  ExternalLink,
  Edit2,
  Trash2,
  Check,
  Copy,
  Layers,
  Tag,
  X,
  FolderPlus,
  Clock,
  Percent,
} from "lucide-react";
import { useEffect } from "react";
import { useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";
import StatCard from "@/components/dashboard/ui/StatCard";
import Modal from "@/components/dashboard/ui/Modal";
import ProductImageUploader from "@/components/dashboard/ProductImageUploader";
import { triggerHaptic } from "@/lib/haptics";
import { formatGs } from "@/lib/dashboard-dates";
import type { ProductItem } from "@/lib/dashboard-types";

const DEFAULT_CATEGORIES = ["Peinado", "Cuidado Barba", "Lavado & Cuidado", "Fragancias", "Accesorios"];

function ProductImageFallback({ category, name }: { category: string; name: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-tr from-slate-100 to-indigo-50/50 dark:from-slate-800 dark:to-slate-700/60 p-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 text-primary shadow-sm">
        <Package className="h-6 w-6" />
      </div>
      <p className="mt-2 text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{name}</p>
      <span className="text-[10px] text-slate-400 font-medium">{category}</span>
    </div>
  );
}

export default function ProductosPage() {
  const products = useDashboardStore((s) => s.products);
  const business = useDashboardStore((s) => s.business);
  const addProduct = useDashboardStore((s) => s.addProduct);
  const updateProduct = useDashboardStore((s) => s.updateProduct);
  const deleteProduct = useDashboardStore((s) => s.deleteProduct);
  const updateProductStock = useDashboardStore((s) => s.updateProductStock);
  const pushToast = useDashboardStore((s) => s.pushToast);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  // Dynamic Categories state
  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("agendate_product_categories");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_CATEGORIES;
  });
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  // Form state for creating/editing a product
  const [form, setForm] = useState<{
    name: string;
    description: string;
    price: number;
    cost: number;
    imageUrl: string;
    category: string;
    stock: number;
    active: boolean;
  }>({
    name: "",
    description: "",
    price: 60000,
    cost: 30000,
    imageUrl: "",
    category: "Peinado",
    stock: 10,
    active: true,
  });

  // Dedicated Promotion & Discount Modal State
  const [promoModalProduct, setPromoModalProduct] = useState<ProductItem | null>(null);
  const [promoForm, setPromoForm] = useState({
    isOnSale: false,
    promoPercent: 20,
    salePrice: 0,
    saleType: "both" as "time" | "quantity" | "both",
    saleExpiresAt: "",
    saleMaxUnits: 10,
  });

  // Unique list of categories combining defaults, custom, and product categories
  const allCategories = useMemo(() => {
    const set = new Set<string>(customCategories);
    products.forEach((p) => {
      if (p.category && p.category.trim()) set.add(p.category.trim());
    });
    return Array.from(set);
  }, [customCategories, products]);

  // Sync categories to localStorage
  const saveCategories = (cats: string[]) => {
    setCustomCategories(cats);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("agendate_product_categories", JSON.stringify(cats));
      } catch {}
    }
  };

  const handleAddCategory = (nameToAdd?: string) => {
    const raw = (nameToAdd || newCategoryInput).trim();
    if (!raw) return;
    if (allCategories.some((c) => c.toLowerCase() === raw.toLowerCase())) {
      pushToast("error", "Esa categoría ya existe.");
      return;
    }
    const next = [...customCategories, raw];
    saveCategories(next);
    setNewCategoryInput("");
    setIsAddingCategory(false);
    setForm((prev) => ({ ...prev, category: raw }));
    pushToast("success", `Categoría "${raw}" agregada con éxito.`);
  };

  const handleDeleteCategory = (cat: string) => {
    const next = customCategories.filter((c) => c.toLowerCase() !== cat.toLowerCase());
    saveCategories(next);
    if (selectedCategory.toLowerCase() === cat.toLowerCase()) {
      setSelectedCategory("Todas");
    }
    setCategoryToDelete(null);
    pushToast("success", `Categoría "${cat}" eliminada.`);
  };

  // Listen to Guided Tour events to open or close product creation modal automatically
  useEffect(() => {
    const handleOpenFromTour = () => {
      openCreateModal();
    };
    const handleCloseFromTour = () => {
      setModalOpen(false);
    };
    window.addEventListener("agendate-open-product-modal", handleOpenFromTour);
    window.addEventListener("agendate-close-product-modal", handleCloseFromTour);
    return () => {
      window.removeEventListener("agendate-open-product-modal", handleOpenFromTour);
      window.removeEventListener("agendate-close-product-modal", handleCloseFromTour);
    };
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());

      const matchesCat =
        selectedCategory === "Todas"
          ? true
          : selectedCategory === "ofertas"
          ? Boolean(p.isOnSale && p.salePrice && p.salePrice < p.price)
          : p.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCat;
    });
  }, [products, search, selectedCategory]);

  // Inventory KPIs
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const totalRetailValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const totalCostValue = products.reduce((sum, p) => sum + p.cost * p.stock, 0);
  const estimatedProfit = totalRetailValue - totalCostValue;
  const lowStockCount = products.filter((p) => p.stock <= 5).length;

  const publicStoreUrl = `/${business.slug || "barberia"}/reservar`;

  function openCreateModal() {
    setEditingProduct(null);
    setForm({
      name: "",
      description: "",
      price: 65000,
      cost: 30000,
      imageUrl: "",
      category: allCategories[0] || "General",
      stock: 15,
      active: true,
    });
    setModalOpen(true);
  }

  function openEditModal(product: ProductItem) {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      cost: product.cost,
      imageUrl: product.imageUrl,
      category: product.category,
      stock: product.stock,
      active: product.active,
    });
    setModalOpen(true);
  }

  function handleOpenPromoModal(product: ProductItem) {
    const hasExistingPromo = Boolean(product.isOnSale && product.salePrice && product.salePrice < product.price);
    const defaultPromoPrice = hasExistingPromo
      ? product.salePrice!
      : Math.max(1000, Math.round((product.price * 0.8) / 1000) * 1000);
    const defaultPercent = Math.round(((product.price - defaultPromoPrice) / product.price) * 100);

    const inOneWeek = new Date();
    inOneWeek.setDate(inOneWeek.getDate() + 7);
    const defaultExpiry = inOneWeek.toISOString().slice(0, 16);

    setPromoForm({
      isOnSale: hasExistingPromo,
      promoPercent: Math.max(1, Math.min(99, defaultPercent)),
      salePrice: defaultPromoPrice,
      saleType: product.saleType || "both",
      saleExpiresAt: product.saleExpiresAt || defaultExpiry,
      saleMaxUnits: product.saleMaxUnits || Math.min(10, product.stock || 10),
    });
    setPromoModalProduct(product);
  }

  function handlePromoPercentChange(pct: number) {
    if (!promoModalProduct) return;
    const clamped = Math.max(1, Math.min(99, pct));
    const calculatedPrice = Math.max(1000, Math.round((promoModalProduct.price * (1 - clamped / 100)) / 1000) * 1000);
    setPromoForm((prev) => ({
      ...prev,
      promoPercent: clamped,
      salePrice: calculatedPrice,
    }));
  }

  function handlePromoPriceChange(rawPrice: number) {
    if (!promoModalProduct) return;
    const price = Math.max(0, rawPrice);
    const calculatedPct = promoModalProduct.price > 0
      ? Math.round(((promoModalProduct.price - price) / promoModalProduct.price) * 100)
      : 0;
    setPromoForm((prev) => ({
      ...prev,
      salePrice: price,
      promoPercent: Math.max(1, Math.min(99, calculatedPct)),
    }));
  }

  function handleSavePromo(e: React.FormEvent) {
    e.preventDefault();
    if (!promoModalProduct) return;

    if (promoForm.isOnSale && (!promoForm.salePrice || promoForm.salePrice >= promoModalProduct.price)) {
      pushToast("error", "El precio de oferta debe ser menor al precio normal");
      return;
    }

    updateProduct(promoModalProduct.id, {
      isOnSale: promoForm.isOnSale,
      salePrice: promoForm.isOnSale ? Number(promoForm.salePrice) : undefined,
      saleType: promoForm.isOnSale ? promoForm.saleType : undefined,
      saleExpiresAt: promoForm.isOnSale && (promoForm.saleType === "time" || promoForm.saleType === "both")
        ? promoForm.saleExpiresAt
        : undefined,
      saleMaxUnits: promoForm.isOnSale && (promoForm.saleType === "quantity" || promoForm.saleType === "both")
        ? Number(promoForm.saleMaxUnits)
        : undefined,
    });

    if (promoForm.isOnSale) {
      pushToast("success", `Oferta activada para ${promoModalProduct.name}`);
    } else {
      pushToast("success", `Oferta desactivada para ${promoModalProduct.name}`);
    }
    setPromoModalProduct(null);
  }

  // Listen to Guided Tour events for promo modal
  useEffect(() => {
    const handleOpenPromo = () => {
      if (products.length > 0) {
        handleOpenPromoModal(products[0]);
      }
    };
    const handleClosePromo = () => {
      setPromoModalProduct(null);
    };
    window.addEventListener("agendate-open-product-promo-modal", handleOpenPromo);
    window.addEventListener("agendate-close-product-promo-modal", handleClosePromo);
    return () => {
      window.removeEventListener("agendate-open-product-promo-modal", handleOpenPromo);
      window.removeEventListener("agendate-close-product-promo-modal", handleClosePromo);
    };
  }, [products]);

  function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      pushToast("error", "El nombre del producto es obligatorio");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      cost: Number(form.cost),
      imageUrl: form.imageUrl.trim(),
      category: form.category,
      stock: Number(form.stock),
      active: form.active,
      ...(editingProduct ? {
        isOnSale: editingProduct.isOnSale,
        salePrice: editingProduct.salePrice,
        saleType: editingProduct.saleType,
        saleExpiresAt: editingProduct.saleExpiresAt,
        saleMaxUnits: editingProduct.saleMaxUnits,
      } : {}),
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, payload);
      pushToast("success", "Producto actualizado correctamente");
    } else {
      addProduct(payload);
      pushToast("success", "Producto agregado al catálogo");
    }
    setModalOpen(false);
  }

  function handleDelete(id: string, name: string) {
    setProductToDelete({ id, name });
  }

  function handleConfirmDeleteProduct() {
    if (!productToDelete) return;
    const prod = products.find((p) => p.id === productToDelete.id);
    if (prod?.imageUrl && prod.imageUrl.startsWith("/uploads/")) {
      fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: prod.imageUrl }),
      }).catch((err) => console.error("Error al registrar retención de imagen:", err));
    }
    deleteProduct(productToDelete.id);
    pushToast("success", `Producto "${productToDelete.name}" eliminado`);
    setProductToDelete(null);
  }

  async function copyStoreLink() {
    const fullUrl = `${window.location.origin}${publicStoreUrl}`;
    await navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    pushToast("success", "Enlace de la tienda copiado");
    setTimeout(() => setCopiedLink(false), 2000);
  }

  const healthyProductsCount = products.filter((p) => p.stock > 5).length;
  const stockHealthyPct = products.length > 0 ? Math.round((healthyProductsCount / products.length) * 100) : 100;
  const avgMarginPct = totalRetailValue > 0 ? Math.round((estimatedProfit / totalRetailValue) * 100) : 0;
  const onSaleCount = products.filter((p) => p.isOnSale && p.salePrice && p.salePrice < p.price).length;

  const topCategoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach((p) => {
      const c = p.category?.trim() || "General";
      map[c] = (map[c] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [products]);

  return (
    <div className="space-y-6">
      {/* Dark Console Hero Header */}
      <div
        data-tour="productos-header"
        className="relative overflow-hidden rounded-2xl bg-[#0c1017] dark:bg-[#0c1017] text-white p-6 sm:p-8 border border-slate-800 shadow-xl"
      >
        <div
          className="absolute -right-12 -top-12 h-64 w-64 rounded-full blur-3xl opacity-25 pointer-events-none transition-all duration-700"
          style={{ backgroundColor: business.primaryColor || "var(--primary, #0ea5e9)" }}
        />

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/90 border border-white/15 backdrop-blur-md">
              <span
                className="h-2 w-2 rounded-full animate-pulse"
                style={{ backgroundColor: business.primaryColor || "var(--primary, #0ea5e9)" }}
              />
              <span>CATÁLOGO DIGITAL & INVENTARIO</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white">
              Productos, Tienda & Inventario
            </h1>
            <p className="hidden sm:block text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Control de existencias en tiempo real, márgenes por unidad, alertas de stock bajo y pedidos directos a tu WhatsApp.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={copyStoreLink}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-xs font-semibold text-white shadow-xs backdrop-blur-md transition cursor-pointer"
            >
              {copiedLink ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-slate-300" />}
              <span>{copiedLink ? "¡Copiado!" : "Copiar Enlace Tienda"}</span>
            </button>

            <Link
              href={publicStoreUrl}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-xs font-semibold text-white shadow-xs backdrop-blur-md transition"
            >
              <ExternalLink className="h-4 w-4 text-slate-300" />
              <span>Ver Tienda Web</span>
            </Link>

            <button
              type="button"
              data-tour="productos-new-btn"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-lg transition active:scale-95 cursor-pointer hover:brightness-110"
              style={{
                backgroundColor: business.primaryColor || "var(--primary, #0ea5e9)",
                boxShadow: `0 8px 20px -4px ${business.primaryColor || "rgba(14, 165, 233, 0.4)"}`,
              }}
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Producto</span>
            </button>
          </div>
        </div>
      </div>

      {/* ═══ MOBILE APPLE GLANCEABLE STAT CARD ═══ */}
      <div className="block md:hidden p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Inventario Total
            </span>
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              {totalStock} <span className="text-xs font-normal text-slate-400">unidades</span>
            </span>
          </div>
          {lowStockCount > 0 ? (
            <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              ⚠️ {lowStockCount} por reponer
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              ✓ Stock saludable
            </span>
          )}
        </div>
        <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>PVP Total: <strong className="text-slate-800 dark:text-slate-200 font-mono">{formatGs(totalRetailValue)}</strong></span>
          <span>Margen Prom.: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">+{avgMarginPct}%</strong></span>
        </div>
      </div>

      {/* Apple Inset Telemetry & Intelligence Container (Desktop) */}
      <div data-tour="productos-kpis" className="hidden md:block rounded-[28px] bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card 1: Stock Health & Financial Overview */}
          <div className="rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/60 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-white font-bold"
                  style={{ backgroundColor: business.primaryColor || "var(--primary, #0ea5e9)" }}
                >
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                    Salud del Inventario & Márgenes
                  </h3>
                  <p className="text-[11px] text-slate-400">Existencias operativas y rentabilidad</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-bold text-slate-400 block">Total Ítems</span>
                <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
                  {products.length} productos
                </span>
              </div>
            </div>

            {/* Circular SVG Gauges */}
            <div className="py-4 grid grid-cols-2 gap-4">
              {/* Gauge 1: Stock Health */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800">
                <div className="relative h-12 w-12 shrink-0 flex items-center justify-center">
                  <svg className="h-12 w-12 -rotate-90" viewBox="0 0 44 44">
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      className="stroke-slate-200 dark:stroke-slate-700"
                      strokeWidth="4"
                      fill="none"
                    />
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      stroke={business.primaryColor || "var(--primary, #0ea5e9)"}
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={113}
                      strokeDashoffset={113 - (113 * Math.min(100, Math.max(0, stockHealthyPct))) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-700"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-black text-slate-800 dark:text-white font-mono">
                    {stockHealthyPct}%
                  </span>
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-slate-900 dark:text-white block truncate">
                    Stock Óptimo
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {healthyProductsCount} de {products.length} con &gt;5 u.
                  </span>
                </div>
              </div>

              {/* Gauge 2: Average Margin */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800">
                <div className="relative h-12 w-12 shrink-0 flex items-center justify-center">
                  <svg className="h-12 w-12 -rotate-90" viewBox="0 0 44 44">
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      className="stroke-slate-200 dark:stroke-slate-700"
                      strokeWidth="4"
                      fill="none"
                    />
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      stroke="#10b981"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={113}
                      strokeDashoffset={113 - (113 * Math.min(100, Math.max(0, avgMarginPct))) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-700"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {avgMarginPct}%
                  </span>
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-slate-900 dark:text-white block truncate">
                    Margen Comercial
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    Rentabilidad media
                  </span>
                </div>
              </div>
            </div>

            {/* Financial Telemetry Rows */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-700/60 text-xs">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] font-medium text-slate-400 block">Total Unidades</span>
                <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                  {totalStock} u.
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] font-medium text-slate-400 block">Valor Venta (PVP)</span>
                <span className="text-xs font-black text-slate-900 dark:text-white font-mono truncate block">
                  {formatGs(totalRetailValue)}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] font-medium text-slate-400 block">Margen Bruto Est.</span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono truncate block">
                  {formatGs(estimatedProfit)}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Restock Alerts & Category Distribution */}
          <div className="rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/60 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
              <div className="flex items-center gap-2.5">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-white font-bold ${
                  lowStockCount > 0 ? "bg-amber-500" : "bg-emerald-600"
                }`}>
                  {lowStockCount > 0 ? <AlertTriangle className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                    Alertas & Segmentación
                  </h3>
                  <p className="text-[11px] text-slate-400">Reabastecimiento y categorías principales</p>
                </div>
              </div>

              {onSaleCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Tag className="h-3 w-3" />
                  <span>{onSaleCount} en oferta</span>
                </span>
              )}
            </div>

            {/* Low Stock Warning or All Clear */}
            <div className="py-3">
              {lowStockCount > 0 ? (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-ping" />
                    <div>
                      <span className="text-xs font-black text-amber-700 dark:text-amber-300 block">
                        {lowStockCount} {lowStockCount === 1 ? "producto requiere" : "productos requieren"} reposición
                      </span>
                      <span className="text-[10px] text-amber-600/90 dark:text-amber-400/90">
                        Existencias menores o iguales a 5 unidades en bodega.
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="text-[11px] font-bold text-amber-700 dark:text-amber-300 underline cursor-pointer hover:opacity-80"
                  >
                    Ver críticos
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <div>
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">
                      Inventario con niveles saludables
                    </span>
                    <span className="text-[10px] text-emerald-600/90 dark:text-emerald-400/90">
                      Todos los productos activos cuentan con stock superior a 5 unidades.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Category Breakdown Bars */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Distribución por Categoría
              </span>
              <div className="space-y-1.5">
                {topCategoryBreakdown.map(([cat, count]) => {
                  const pct = products.length > 0 ? Math.round((count / products.length) * 100) : 0;
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{cat}</span>
                        <span className="font-mono text-slate-400">{count} u. ({pct}%)</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: business.primaryColor || "var(--primary, #0ea5e9)",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div data-tour="productos-filters" className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por producto, categoría o descripción..."
            className="w-full rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 shadow-xs outline-none focus:border-primary"
          />
        </div>

        <div data-tour="productos-categories-bar" className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => {
              triggerHaptic("selection");
              setSelectedCategory("Todas");
            }}
            style={selectedCategory === "Todas" ? { backgroundColor: business.primaryColor || "#0f172a", color: "#ffffff" } : undefined}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              selectedCategory === "Todas"
                ? "shadow-xs font-bold"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            Todas
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic("selection");
              setSelectedCategory("ofertas");
            }}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === "ofertas"
                ? "bg-amber-500 text-white shadow-xs"
                : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25 hover:bg-amber-500/20"
            }`}
          >
            <Tag className="h-3.5 w-3.5" />
            <span>En Oferta</span>
          </button>

          {allCategories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const isCustom = !DEFAULT_CATEGORIES.includes(cat);
            return (
              <div key={cat} className="relative group shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("selection");
                    setSelectedCategory(cat);
                  }}
                  style={isSelected ? { backgroundColor: business.primaryColor || "#0f172a", color: "#ffffff" } : undefined}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? "shadow-xs font-bold"
                      : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <span>{cat}</span>
                  {isCustom && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setCategoryToDelete(cat);
                      }}
                      className="opacity-50 hover:opacity-100 hover:text-rose-500 transition p-0.5 rounded cursor-pointer"
                      title={`Eliminar categoría "${cat}"`}
                    >
                      <X className="h-3 w-3" />
                    </span>
                  )}
                </button>
              </div>
            );
          })}

          {/* Quick add category input in filter bar */}
          {isAddingCategory ? (
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-primary rounded-xl px-2 py-1 shadow-xs shrink-0">
              <input
                type="text"
                autoFocus
                value={newCategoryInput}
                onChange={(e) => setNewCategoryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCategory();
                  } else if (e.key === "Escape") {
                    setIsAddingCategory(false);
                  }
                }}
                placeholder="Nueva categoría..."
                className="text-xs bg-transparent outline-none w-28 text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => handleAddCategory()}
                className="text-[11px] font-bold text-primary hover:underline px-1 cursor-pointer"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setIsAddingCategory(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingCategory(true)}
              className="inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition cursor-pointer shrink-0"
            >
              <FolderPlus className="h-3.5 w-3.5" />
              <span>+ Categoría</span>
            </button>
          )}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <Card data-tour="productos-grid" className="py-12 text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">No se encontraron productos</h3>
          <p className="mt-1 text-xs text-slate-500">
            Ajustá el término de búsqueda o agregá un nuevo producto al catálogo.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary/90 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Crear Producto
          </button>
        </Card>
      ) : (
        <>
          {/* Mobile Apple Inset Grouped Inventory List */}
          <div className="block sm:hidden space-y-3">
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden shadow-xs">
              {filteredProducts.map((p) => {
                const isLowStock = p.stock <= 5;
                const marginPercent = Math.round(((p.price - p.cost) / p.price) * 100);
                const isBroken = brokenImages[p.id] || !p.imageUrl;

                return (
                  <div key={p.id} className="p-3.5 space-y-2.5">
                    <div className="flex items-center gap-3">
                      {/* Squircle Thumbnail */}
                      <div className="relative h-14 w-14 shrink-0 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 overflow-hidden flex items-center justify-center">
                        {isBroken ? (
                          <Package className="h-6 w-6 text-slate-400" />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            onError={() => setBrokenImages((prev) => ({ ...prev, [p.id]: true }))}
                            className="h-full w-full object-contain p-1"
                          />
                        )}
                        {p.isOnSale && (
                          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-amber-500" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {p.category}
                          </span>
                          {!p.active && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-rose-500/10 text-rose-600">
                              Pausado
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate">
                          {p.name}
                        </h4>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          {p.isOnSale && p.salePrice && p.salePrice < p.price ? (
                            <>
                              <span className="font-mono font-black text-amber-600 dark:text-amber-400 text-xs">
                                {formatGs(p.salePrice)}
                              </span>
                              <span className="font-mono text-[10px] text-slate-400 line-through">
                                {formatGs(p.price)}
                              </span>
                            </>
                          ) : (
                            <span className="font-mono font-black text-slate-900 dark:text-white text-xs">
                              {formatGs(p.price)}
                            </span>
                          )}
                          <span className="text-[10px] text-emerald-600 font-semibold">
                            · {marginPercent}% mg
                          </span>
                        </div>
                      </div>

                      {/* Apple Stepper Control */}
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/60 dark:border-white/5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic("medium");
                            updateProductStock(p.id, -1);
                          }}
                          disabled={p.stock <= 0}
                          className="h-7 w-7 rounded-xl bg-white dark:bg-slate-700 font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center text-xs shadow-2xs active:scale-90 transition disabled:opacity-30 cursor-pointer"
                          title="Restar 1 unidad"
                        >
                          -
                        </button>
                        <span
                          className={`w-7 text-center font-mono font-black text-xs ${
                            isLowStock ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white"
                          }`}
                        >
                          {p.stock}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic("selection");
                            updateProductStock(p.id, 1);
                          }}
                          className="h-7 w-7 rounded-xl bg-white dark:bg-slate-700 font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center text-xs shadow-2xs active:scale-90 transition cursor-pointer"
                          title="Sumar 1 unidad"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Mobile Quick Action Footer */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100/70 dark:border-slate-800/60 text-xs">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic("light");
                            handleOpenPromoModal(p);
                          }}
                          className={`px-2 py-0.5 rounded-lg text-[10.5px] font-bold flex items-center gap-1 transition cursor-pointer ${
                            p.isOnSale && p.salePrice && p.salePrice < p.price
                              ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                              : "bg-slate-50 dark:bg-slate-800 text-slate-500 border border-slate-200/60 dark:border-slate-700"
                          }`}
                        >
                          <Tag className="h-3 w-3 text-amber-500" />
                          <span>{p.isOnSale ? "Oferta activa" : "Descuento"}</span>
                        </button>

                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                          isLowStock
                            ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-200 dark:border-rose-900"
                            : "text-slate-400"
                        }`}>
                          {isLowStock ? "Stock bajo" : `${p.stock} dispon.`}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic("selection");
                            openEditModal(p);
                          }}
                          className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-primary transition cursor-pointer"
                          title="Editar producto"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic("light");
                            handleDelete(p.id, p.name);
                          }}
                          className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                          title="Eliminar producto"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Desktop Product Grid */}
          <div data-tour="productos-grid" className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((p, index) => {
            const isLowStock = p.stock <= 5;
            const marginPercent = Math.round(((p.price - p.cost) / p.price) * 100);
            const isBroken = brokenImages[p.id] || !p.imageUrl;

            return (
              <Card key={p.id} className="flex flex-col justify-between overflow-hidden p-0 border border-slate-200/90 dark:border-white/10 shadow-xs hover:border-primary/40 transition">
                {/* Image and badges */}
                <div className="relative h-48 w-full bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200/80 dark:from-slate-800 dark:via-slate-850 dark:to-slate-900/90 overflow-hidden flex items-center justify-center p-3">
                  {/* Subtle soft studio lighting behind cutout products */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/70 via-transparent to-transparent dark:from-white/5 pointer-events-none" />

                  {isBroken ? (
                    <ProductImageFallback category={p.category} name={p.name} />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      onError={() => setBrokenImages((prev) => ({ ...prev, [p.id]: true }))}
                      className="relative z-10 max-h-full max-w-full object-contain drop-shadow-md transition-transform duration-300 hover:scale-105"
                    />
                  )}

                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-20">
                    <span className="rounded-lg bg-black/70 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                      {p.category}
                    </span>
                    {p.isOnSale && p.salePrice && p.salePrice < p.price && (
                      <span className="rounded-lg bg-amber-500 px-2 py-1 text-[10px] font-black text-white shadow-xs uppercase tracking-wide flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        <span>OFERTA</span>
                      </span>
                    )}
                    {!p.active && (
                      <span className="rounded-lg bg-rose-500/90 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                        Pausado
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3 flex items-center gap-1 z-20">
                    <button
                      type="button"
                      onClick={() => openEditModal(p)}
                      aria-label="Editar producto"
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-200 shadow-sm hover:text-primary transition cursor-pointer"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id, p.name)}
                      aria-label="Eliminar producto"
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/95 dark:bg-slate-900/95 text-rose-600 shadow-sm hover:bg-rose-50 transition cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{p.name}</h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  </div>

                  {/* Financials & Stock */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5">
                    <div className="flex items-baseline justify-between">
                      {p.isOnSale && p.salePrice && p.salePrice < p.price ? (
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-black text-amber-600 dark:text-amber-400 font-mono">
                            {formatGs(p.salePrice)}
                          </span>
                          <span className="text-xs text-slate-400 line-through font-mono">
                            {formatGs(p.price)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                          {formatGs(p.price)}
                        </span>
                      )}
                      <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                        Margen: {marginPercent}%
                      </span>
                    </div>

                    {/* Promotion limit status */}
                    {p.isOnSale && p.salePrice && p.salePrice < p.price && (
                      <div className="flex items-center justify-between text-[10px] bg-amber-500/10 px-2 py-1 rounded-lg text-amber-700 dark:text-amber-300 font-semibold gap-1">
                        {(p.saleType === "time" || p.saleType === "both") && p.saleExpiresAt ? (
                          <span className="flex items-center gap-1 truncate">
                            <Clock className="h-3 w-3 shrink-0" />
                            <span>Expira: {new Date(p.saleExpiresAt).toLocaleDateString("es-PY", { day: "2-digit", month: "short" })}</span>
                          </span>
                        ) : null}
                        {(p.saleType === "quantity" || p.saleType === "both") && p.saleMaxUnits ? (
                          <span className="flex items-center gap-1 truncate">
                            <Package className="h-3 w-3 shrink-0" />
                            <span>Promo: {p.saleUnitsSold || 0}/{p.saleMaxUnits} vendidas</span>
                          </span>
                        ) : null}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Costo compra: {formatGs(p.cost)}</span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded-lg text-[11px] ${
                          isLowStock
                            ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                        }`}
                      >
                        Stock: {p.stock} u.
                      </span>
                    </div>

                    {/* Standalone Promo / Descuento Button */}
                    <button
                      type="button"
                      data-tour={index === 0 ? "productos-promo-btn" : undefined}
                      onClick={() => handleOpenPromoModal(p)}
                      className={`w-full flex items-center justify-between rounded-xl py-1.5 px-3 text-xs font-bold transition cursor-pointer ${
                        p.isOnSale && p.salePrice && p.salePrice < p.price
                          ? "border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20"
                          : "border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-amber-600 hover:border-amber-400/40"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5 text-amber-500" />
                        <span>
                          {p.isOnSale && p.salePrice && p.salePrice < p.price
                            ? `Oferta: ${formatGs(p.salePrice)} (-${Math.round(((p.price - p.salePrice) / p.price) * 100)}%)`
                            : "Poner en oferta / descuento"}
                        </span>
                      </span>
                      <span className="text-[10px] opacity-75 font-bold">
                        {p.isOnSale ? "Modificar" : "Configurar"}
                      </span>
                    </button>

                    {/* Stock quick adjuster */}
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-slate-400 text-[11px]">Ajustar stock:</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateProductStock(p.id, -1)}
                          className="h-7 w-7 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition active:scale-95 cursor-pointer"
                        >
                          -1
                        </button>
                        <button
                          type="button"
                          onClick={() => updateProductStock(p.id, 1)}
                          className="h-7 w-7 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition active:scale-95 cursor-pointer"
                        >
                          +1
                        </button>
                        <button
                          type="button"
                          onClick={() => updateProductStock(p.id, 5)}
                          className="h-7 px-2 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-xs transition active:scale-95 cursor-pointer"
                        >
                          +5
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </>
    )}

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="max-w-xl"
        title={editingProduct ? "Editar Producto" : "Nuevo Producto para la Tienda"}
      >
        <form onSubmit={handleSaveProduct} data-tour="product-modal-container" className="space-y-4 pt-1">
          <div data-tour="product-name-input">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Nombre del Producto *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej. Cera Capilar Mate 100ml"
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-primary"
            />
          </div>

          <div data-tour="product-category-selector">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Categoría del Producto
              </label>
              <button
                type="button"
                onClick={() => {
                  const cat = prompt("Ingresá el nombre de la nueva categoría:");
                  if (cat && cat.trim()) {
                    handleAddCategory(cat.trim());
                  }
                }}
                className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <FolderPlus className="h-3 w-3" />
                <span>+ Nueva Categoría</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {allCategories.map((cat) => {
                const isSelected = form.category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setForm({ ...form, category: cat })}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary shadow-xs font-bold"
                        : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Package className={`h-3.5 w-3.5 ${isSelected ? "text-primary" : "text-slate-400"}`} />
                    <span className="truncate">{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subir foto y Quitar Fondo en Servidor */}
          <ProductImageUploader
            value={form.imageUrl}
            onChange={(url) => setForm({ ...form, imageUrl: url })}
            categoryHint={form.category}
          />

          <div data-tour="product-pricing-inputs" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Stock Inicial (unidades)</label>
              <input
                type="number"
                min={0}
                required
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Costo Compra Proveedor (Gs.)</label>
              <input
                type="number"
                step={5000}
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Precio Venta al Público (Gs.) *</label>
              <input
                type="number"
                step={5000}
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-primary font-bold text-primary"
              />
            </div>
          </div>

          {/* Real-time Profit Preview */}
          {form.price > 0 && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <span className="text-slate-600 dark:text-slate-400">Ganancia neta estimada:</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">
                  {formatGs(Math.max(0, form.price - form.cost))} / u.
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${
                form.price > form.cost
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
              }`}>
                Margen: {form.price > 0 ? Math.round(((form.price - form.cost) / form.price) * 100) : 0}%
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Descripción Breve</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Fijación mate, aroma a menta, para todo tipo de cabello..."
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="h-4 w-4 rounded text-primary focus:ring-primary accent-primary"
              />
              <span>Producto Activo en Catálogo</span>
            </label>

            <button
              type="submit"
              className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/20 hover:brightness-110 transition cursor-pointer"
            >
              {editingProduct ? "Guardar Cambios" : "Crear Producto"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Dedicated Special Offer & Discount Modal */}
      <Modal
        open={!!promoModalProduct}
        onClose={() => setPromoModalProduct(null)}
        maxWidth="max-w-lg"
        title={promoModalProduct ? `Descuento & Oferta: ${promoModalProduct.name}` : "Oferta"}
      >
        {promoModalProduct && (
          <form onSubmit={handleSavePromo} className="space-y-4 text-xs" data-tour="product-offer-section">
            {/* Promo Header & Switch */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white font-black shadow-xs">
                  <Tag className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white block">
                    Activar Precio Promocional / Oferta
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Precio normal: <strong className="text-slate-800 dark:text-slate-200 font-mono">{formatGs(promoModalProduct.price)}</strong>
                  </span>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={promoForm.isOnSale}
                onClick={() => {
                  const nextState = !promoForm.isOnSale;
                  setPromoForm((prev) => ({
                    ...prev,
                    isOnSale: nextState,
                    salePrice: nextState && (!prev.salePrice || prev.salePrice >= promoModalProduct.price)
                      ? Math.max(1000, Math.round((promoModalProduct.price * 0.8) / 1000) * 1000)
                      : prev.salePrice,
                  }));
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  promoForm.isOnSale ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    promoForm.isOnSale ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {promoForm.isOnSale ? (
              <div className="space-y-4 pt-1">
                {/* Quick Preset Discount Pills */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Atajos rápidos de descuento
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[10, 15, 20, 25, 30, 40, 50].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => handlePromoPercentChange(pct)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          promoForm.promoPercent === pct
                            ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                            : "bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-amber-400"
                        }`}
                      >
                        -{pct}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dual Inputs: % vs Monto */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                      Porcentaje de Descuento (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={promoForm.promoPercent}
                        onChange={(e) => handlePromoPercentChange(Number(e.target.value))}
                        className="w-full rounded-xl border border-amber-500/40 bg-white dark:bg-slate-900 py-2 pl-3 pr-8 text-xs font-mono font-bold text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-amber-600">
                        %
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] text-slate-400">
                      Calcula el monto final en Gs. automáticamente.
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                      Precio de Oferta (Gs.) *
                    </label>
                    <input
                      type="number"
                      min="1000"
                      step="1000"
                      value={promoForm.salePrice}
                      onChange={(e) => handlePromoPriceChange(Number(e.target.value))}
                      className="w-full rounded-xl border border-amber-500/40 bg-white dark:bg-slate-900 py-2 px-3 text-xs font-mono font-bold text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none"
                    />
                    <p className="mt-1 text-[10px] text-slate-400">
                      Calcula el % de descuento automáticamente.
                    </p>
                  </div>
                </div>

                {/* Live Preview Card */}
                <div className="p-3 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">Comparación en catálogo público:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 line-through font-mono">
                        {formatGs(promoModalProduct.price)}
                      </span>
                      <span className="text-sm font-black text-amber-600 dark:text-amber-400 font-mono">
                        {formatGs(promoForm.salePrice)}
                      </span>
                      <span className="bg-amber-500 text-white font-extrabold text-[10px] px-1.5 py-0.5 rounded-md">
                        -{promoForm.promoPercent}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-amber-500/20 text-slate-500 dark:text-slate-400">
                    <span>
                      Ahorro para el cliente: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{formatGs(Math.max(0, promoModalProduct.price - promoForm.salePrice))}</strong>
                    </span>
                    <span>
                      Margen con promo: <strong className="text-slate-800 dark:text-slate-200">{promoForm.salePrice > 0 ? Math.round(((promoForm.salePrice - promoModalProduct.cost) / promoForm.salePrice) * 100) : 0}%</strong>
                    </span>
                  </div>
                </div>

                {/* Limiting modality: Time or Quantity */}
                <div className="pt-2 border-t border-slate-100 dark:border-white/10 space-y-2.5">
                  <label className="block font-bold text-slate-700 dark:text-slate-200">
                    Modalidad de Límite de la Oferta
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPromoForm({ ...promoForm, saleType: "time" })}
                      className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                        promoForm.saleType === "time"
                          ? "border-amber-500 bg-amber-500/20 text-amber-800 dark:text-amber-200 font-bold"
                          : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <Clock className="h-4 w-4 mx-auto mb-1 text-amber-500" />
                      <span className="block text-[11px] font-black">Por Tiempo</span>
                      <span className="text-[9px] opacity-75">Fecha límite</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPromoForm({ ...promoForm, saleType: "quantity" })}
                      className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                        promoForm.saleType === "quantity"
                          ? "border-amber-500 bg-amber-500/20 text-amber-800 dark:text-amber-200 font-bold"
                          : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <Package className="h-4 w-4 mx-auto mb-1 text-amber-500" />
                      <span className="block text-[11px] font-black">Por Cantidad</span>
                      <span className="text-[9px] opacity-75">Cupo de unidades</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPromoForm({ ...promoForm, saleType: "both" })}
                      className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                        promoForm.saleType === "both"
                          ? "border-amber-500 bg-amber-500/20 text-amber-800 dark:text-amber-200 font-bold"
                          : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <Percent className="h-4 w-4 mx-auto mb-1 text-amber-500" />
                      <span className="block text-[11px] font-black">Ambos</span>
                      <span className="text-[9px] opacity-75">Tiempo y cupo</span>
                    </button>
                  </div>

                  {(promoForm.saleType === "time" || promoForm.saleType === "both") && (
                    <div className="pt-1">
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                        <Clock className="h-3.5 w-3.5 text-amber-500" />
                        <span>Fecha y hora de expiración de la oferta</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={promoForm.saleExpiresAt}
                        onChange={(e) => setPromoForm({ ...promoForm, saleExpiresAt: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-primary"
                      />
                    </div>
                  )}

                  {(promoForm.saleType === "quantity" || promoForm.saleType === "both") && (
                    <div className="pt-1">
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                        <Package className="h-3.5 w-3.5 text-amber-500" />
                        <span>Cantidad máxima de unidades en oferta</span>
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={promoForm.saleMaxUnits || ""}
                        onChange={(e) => setPromoForm({ ...promoForm, saleMaxUnits: Number(e.target.value) })}
                        placeholder="Ej: 10 unidades"
                        className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-primary"
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-white/10 text-center text-slate-500 dark:text-slate-400">
                <p className="font-semibold text-xs">La oferta está actualmente desactivada para este producto.</p>
                <p className="text-[11px] mt-1">El producto se venderá al precio estándar de {formatGs(promoModalProduct.price)}.</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/10">
              <button
                type="button"
                onClick={() => setPromoModalProduct(null)}
                className="rounded-xl border border-slate-200/80 dark:border-white/10 px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-xl bg-amber-500 hover:bg-amber-600 px-5 py-2 font-bold text-white shadow-md shadow-amber-500/20 transition cursor-pointer"
              >
                {promoForm.isOnSale ? "Guardar Oferta" : "Guardar Desactivación"}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Web Modal for Delete Product Confirmation */}
      <Modal
        open={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        title="¿Eliminar producto del catálogo?"
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 text-rose-800 dark:text-rose-200">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white font-bold">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-900 dark:text-white">
                {productToDelete?.name}
              </p>
              <p className="text-[11px] text-rose-600 dark:text-rose-300 mt-0.5 leading-relaxed">
                Este producto se quitará de tu inventario y catálogo de mostrador.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
            <button
              type="button"
              onClick={() => setProductToDelete(null)}
              className="rounded-xl border border-slate-200/80 dark:border-white/10 px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmDeleteProduct}
              className="rounded-xl bg-rose-600 hover:bg-rose-700 px-5 py-2 font-bold text-white shadow-md transition cursor-pointer"
            >
              Eliminar Producto
            </button>
          </div>
        </div>
      </Modal>

      {/* Web Modal for Delete Category Confirmation */}
      <Modal
        open={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        title="¿Eliminar categoría de producto?"
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-amber-800 dark:text-amber-200">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-white font-bold">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-900 dark:text-white">
                Categoría: &quot;{categoryToDelete}&quot;
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5 leading-relaxed">
                Esta categoría se quitará del catálogo. Los productos asociados no se eliminarán.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
            <button
              type="button"
              onClick={() => setCategoryToDelete(null)}
              className="rounded-xl border border-slate-200/80 dark:border-white/10 px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => categoryToDelete && handleDeleteCategory(categoryToDelete)}
              className="rounded-xl bg-rose-600 hover:bg-rose-700 px-5 py-2 font-bold text-white shadow-md transition cursor-pointer"
            >
              Eliminar Categoría
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
