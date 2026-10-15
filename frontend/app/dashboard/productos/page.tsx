"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
  Tag,
  X,
  FolderPlus,
  Clock,
  Percent,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import Modal from "@/components/dashboard/ui/Modal";
import ProductImageUploader from "@/components/dashboard/ProductImageUploader";
import { triggerHaptic } from "@/lib/haptics";
import { formatGs } from "@/lib/dashboard-dates";
import type { ProductItem } from "@/lib/dashboard-types";

const DEFAULT_CATEGORIES = ["Peinado", "Cuidado Barba", "Lavado & Cuidado", "Fragancias", "Accesorios"];

const PRODUCT_LABEL_CLASS = "mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300";
const PRODUCT_INPUT_CLASS =
  "min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-slate-800 dark:text-white sm:min-h-10 sm:text-sm";

function ProductImageFallback({ category, name }: { category: string; name: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-primary dark:border-white/10 dark:bg-white/[0.04]">
        <Package className="h-5 w-5" />
      </div>
      <p className="mt-2 line-clamp-1 text-xs font-semibold text-slate-700 dark:text-slate-200">{name}</p>
      <span className="text-[11px] font-medium text-slate-500">{category || "General"}</span>
    </div>
  );
}

export default function ProductosPage() {
  const prefersReducedMotion = useReducedMotion();
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

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());

      const matchesCat =
        selectedCategory === "Todas"
          ? true
          : selectedCategory === "__stock_bajo__"
          ? p.stock <= 5
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

  const openCreateModal = useCallback(() => {
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
  }, [allCategories]);

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
  }, [openCreateModal]);

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

  const avgMarginPct = totalRetailValue > 0 ? Math.round((estimatedProfit / totalRetailValue) * 100) : 0;
  const onSaleCount = products.filter((p) => p.isOnSale && p.salePrice && p.salePrice < p.price).length;

  return (
    <div className="w-full max-w-full space-y-5 overflow-hidden pb-24 sm:space-y-6 sm:pb-10">
      <header data-tour="productos-header" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Catálogo y existencias</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Productos &amp; Inventario</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-zinc-400">Administrá tu catálogo, controlá existencias y ajustá tus precios.</p>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:flex sm:flex-wrap">
          <button type="button" onClick={copyStoreLink} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 glass-panel-subtle px-3.5 text-xs font-semibold text-slate-700 transition hover:bg-white/10 dark:text-zinc-200 sm:order-1">
            {copiedLink ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-slate-400" />}
            <span>{copiedLink ? "¡Copiado!" : "Copiar enlace"}</span>
          </button>
          <Link href={publicStoreUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 glass-panel-subtle px-3.5 text-xs font-semibold text-slate-700 transition hover:bg-white/10 dark:text-zinc-200 sm:order-2">
            <ExternalLink className="h-4 w-4 text-slate-400" /> <span>Ver tienda</span>
          </Link>
          <button type="button" data-tour="productos-new-btn" onClick={openCreateModal} className="col-span-2 order-first inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 active:scale-[0.98] sm:order-3 sm:col-span-1" style={{ backgroundColor: business.primaryColor || "#FF4F2B" }}>
            <Plus className="h-4 w-4" /> Nuevo producto
          </button>
        </div>
      </header>

      <section data-tour="productos-kpis" className="rounded-3xl glass-panel p-3 sm:p-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white sm:text-base">Resumen del inventario</h2>
            <p className="mt-0.5 hidden text-xs text-slate-500 dark:text-zinc-400 sm:block">Valor y disponibilidad de tus productos.</p>
          </div>
          <span className="hidden text-xs text-slate-500 dark:text-zinc-400 sm:inline">{products.length} {products.length === 1 ? "producto" : "productos"} en catálogo</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-white/10 pt-3 sm:mt-4 sm:grid-cols-4 sm:gap-y-0 sm:pt-4">
          {[
            { label: "Productos", value: products.length.toLocaleString("es-PY"), detail: "en catálogo" },
            { label: "Unidades", value: totalStock.toLocaleString("es-PY"), detail: "en existencia" },
            { label: "Valor de venta", value: formatGs(totalRetailValue), detail: "a precio de lista" },
            { label: "Ganancia estimada", value: formatGs(estimatedProfit), detail: `${avgMarginPct}% de margen promedio` },
          ].map((metric) => (
            <div key={metric.label} className="min-w-0">
              <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">{metric.label}</p>
              <p className="mt-1 truncate text-base font-semibold tabular-nums text-slate-900 dark:text-white sm:text-xl">{metric.value}</p>
              <p className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-zinc-500">{metric.detail}</p>
            </div>
          ))}
        </div>
        <div className={`mt-3 flex items-center justify-between gap-2 rounded-2xl border px-2.5 py-2.5 sm:mt-4 sm:px-3.5 sm:py-3 ${lowStockCount > 0 ? "border-amber-500/20 bg-amber-500/[0.06]" : "border-emerald-500/15 bg-emerald-500/[0.04]"}`}>
          <div className="flex min-w-0 items-start gap-2.5">
            <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${lowStockCount > 0 ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"}`}>
              {lowStockCount > 0 ? <AlertTriangle className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
            </span>
            <span className="min-w-0">
              <span className={`block text-xs font-semibold ${lowStockCount > 0 ? "text-amber-300" : "text-emerald-300"}`}>
                {lowStockCount > 0 ? `${lowStockCount} ${lowStockCount === 1 ? "producto necesita" : "productos necesitan"} reposición` : "Todo el inventario tiene stock suficiente"}
              </span>
              <span className="mt-0.5 block text-[11px] text-slate-500 dark:text-zinc-400">{lowStockCount > 0 ? "Cinco unidades o menos disponibles." : "No hay productos con cinco unidades o menos."}</span>
            </span>
          </div>
          {lowStockCount > 0 && (
            <button type="button" onClick={() => { setSearch(""); setSelectedCategory("__stock_bajo__"); }} className="inline-flex min-h-9 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 px-2.5 text-[11px] font-semibold text-amber-300 transition hover:bg-amber-500/10 sm:min-h-10 sm:px-3 sm:text-xs">
              Ver stock
            </button>
          )}
        </div>
      </section>

      {/* Filters & Search */}
      <section data-tour="productos-filters" className="rounded-3xl glass-panel p-3.5 sm:p-4">
        <div className="flex flex-col gap-3 border-b border-white/10 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Catálogo</h2>
            <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">{filteredProducts.length} de {products.length}</span>
          </div>
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              aria-label="Buscar productos"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar producto o categoría"
              className="min-h-11 w-full rounded-2xl border border-white/10 bg-black/10 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary/50 focus:ring-2 focus:ring-primary/15 dark:text-white"
            />
            {search && (
              <button type="button" onClick={() => setSearch("")} aria-label="Borrar búsqueda" className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white/10 hover:text-slate-700 dark:hover:text-white">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div data-tour="productos-categories-bar" className="-mx-1 mt-3 flex items-center gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => { triggerHaptic("selection"); setSelectedCategory("Todas"); }}
            style={selectedCategory === "Todas" ? { backgroundColor: business.primaryColor || "#FF4F2B", color: "#ffffff" } : undefined}
            className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-3.5 text-xs font-semibold transition ${selectedCategory === "Todas" ? "shadow-sm" : "border border-white/10 bg-white/[0.025] text-slate-600 hover:bg-white/[0.06] dark:text-zinc-300"}`}
          >
            Todas <span className="rounded-full bg-black/10 px-1.5 py-0.5 text-[11px] tabular-nums">{products.length}</span>
          </button>

          <button
            type="button"
            onClick={() => { triggerHaptic("selection"); setSelectedCategory("ofertas"); }}
            className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border px-3.5 text-xs font-semibold transition ${selectedCategory === "ofertas" ? "border-amber-500 bg-amber-500 text-white shadow-sm" : "border-amber-500/20 bg-amber-500/[0.06] text-amber-300 hover:bg-amber-500/10"}`}
          >
            <Tag className="h-3.5 w-3.5" /> En oferta
            <span className="rounded-full bg-black/10 px-1.5 py-0.5 text-[11px] tabular-nums">{onSaleCount}</span>
          </button>

          {lowStockCount > 0 && (
            <button
              type="button"
              onClick={() => { triggerHaptic("selection"); setSelectedCategory("__stock_bajo__"); }}
              className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border px-3.5 text-xs font-semibold transition ${selectedCategory === "__stock_bajo__" ? "border-rose-500 bg-rose-500 text-white shadow-sm" : "border-rose-500/20 bg-rose-500/[0.06] text-rose-300 hover:bg-rose-500/10"}`}
            >
              <AlertTriangle className="h-3.5 w-3.5" /> Stock bajo
              <span className="rounded-full bg-black/10 px-1.5 py-0.5 text-[11px] tabular-nums">{lowStockCount}</span>
            </button>
          )}

          {allCategories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const isCustom = !DEFAULT_CATEGORIES.includes(cat);
            const categoryCount = products.filter((product) => product.category.toLowerCase() === cat.toLowerCase()).length;
            return (
              <div key={cat} className={`inline-flex min-h-10 shrink-0 items-center overflow-hidden rounded-xl border transition ${isSelected ? "border-transparent shadow-sm" : "border-white/10 bg-white/[0.025] hover:bg-white/[0.06]"}`} style={isSelected ? { backgroundColor: business.primaryColor || "#FF4F2B" } : undefined}>
                <button type="button" onClick={() => { triggerHaptic("selection"); setSelectedCategory(cat); }} className={`inline-flex min-h-10 items-center gap-2 px-3.5 text-xs font-semibold ${isSelected ? "text-white" : "text-slate-600 dark:text-zinc-300"}`}>
                  <span>{cat}</span>
                  <span className={`rounded-full px-1.5 py-0.5 text-[11px] tabular-nums ${isSelected ? "bg-black/10" : "bg-white/[0.06] text-slate-400"}`}>{categoryCount}</span>
                </button>
                {isCustom && (
                  <button type="button" onClick={() => setCategoryToDelete(cat)} aria-label={`Eliminar categoría ${cat}`} title={`Eliminar categoría ${cat}`} className={`flex h-10 w-9 items-center justify-center border-l transition ${isSelected ? "border-white/20 text-white/75 hover:bg-black/10 hover:text-white" : "border-white/10 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400"}`}>
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            );
          })}

          {isAddingCategory ? (
            <div className="flex min-h-10 shrink-0 items-center gap-1 rounded-xl border border-primary/40 bg-white/[0.04] px-2">
              <input
                type="text"
                autoFocus
                value={newCategoryInput}
                onChange={(e) => setNewCategoryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); handleAddCategory(); }
                  else if (e.key === "Escape") setIsAddingCategory(false);
                }}
                placeholder="Nueva categoría"
                aria-label="Nombre de la nueva categoría"
                className="w-28 bg-transparent text-xs text-white outline-none placeholder:text-slate-500"
              />
              <button type="button" onClick={() => handleAddCategory()} className="px-1 text-[11px] font-semibold text-primary hover:underline">Guardar</button>
              <button type="button" onClick={() => setIsAddingCategory(false)} aria-label="Cancelar nueva categoría" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"><X className="h-3.5 w-3.5" /></button>
            </div>
          ) : (
            <button type="button" onClick={() => setIsAddingCategory(true)} className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl border border-primary/20 bg-primary/[0.06] px-3 text-xs font-semibold text-primary transition hover:bg-primary/10">
              <FolderPlus className="h-3.5 w-3.5" /> Nueva categoría
            </button>
          )}
        </div>
      </section>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div data-tour="productos-grid" className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-12 text-center sm:py-16">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><ShoppingBag className="h-6 w-6" /></span>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">{products.length === 0 ? "Todavía no hay productos" : "No encontramos resultados"}</h3>
          <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-zinc-400">
            {products.length === 0 ? "Agregá los productos que vendés para controlar el stock y mostrarlos en tu tienda." : "Probá con otro nombre o categoría, o limpiá los filtros aplicados."}
          </p>
          {products.length === 0 ? (
            <button type="button" onClick={openCreateModal} className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold text-white transition hover:brightness-110" style={{ backgroundColor: business.primaryColor || "#FF4F2B" }}>
              <Plus className="h-4 w-4" /> Crear producto
            </button>
          ) : (
            <button type="button" onClick={() => { setSearch(""); setSelectedCategory("Todas"); }} className="mt-4 inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/10 px-4 text-sm font-medium text-slate-700 transition hover:bg-white/10 dark:text-zinc-200">Limpiar filtros</button>
          )}
        </div>
      ) : (
        <div data-tour="productos-grid">
        <div className="space-y-2.5 sm:hidden">
          {filteredProducts.map((p, index) => {
            const isLowStock = p.stock <= 5;
            const hasPromo = Boolean(p.isOnSale && p.salePrice && p.salePrice < p.price);
            const marginPercent = p.price > 0 ? Math.round(((p.price - p.cost) / p.price) * 100) : 0;
            const isBroken = brokenImages[p.id] || !p.imageUrl;

            return (
              <article key={p.id} className="rounded-3xl border border-white/10 glass-panel p-3">
                <div className="flex min-w-0 gap-3">
                  <div className="relative h-[76px] w-[76px] shrink-0 overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.05] to-black/20">
                    {isBroken ? (
                      <div className="flex h-full w-full items-center justify-center text-primary"><Package className="h-6 w-6" /></div>
                ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.imageUrl} alt={p.name} onError={() => setBrokenImages((prev) => ({ ...prev, [p.id]: true }))} className="h-full w-full object-contain p-2" />
                    )}
                    {hasPromo && <span className="absolute right-1.5 top-1.5 flex h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-slate-950/70" />}
                  </div>
                  <div className="min-w-0 flex-1 py-0.5">
                    <div className="flex min-w-0 items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                      <span className="truncate">{p.category || "General"}</span>
                      {!p.active && <span className="shrink-0 rounded-full bg-rose-500/10 px-1.5 py-0.5 font-semibold text-rose-300">Pausado</span>}
                    </div>
                    <h3 className="mt-0.5 truncate text-sm font-semibold text-slate-900 dark:text-white">{p.name}</h3>
                    <p className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-zinc-400">{p.description || "Sin descripción"}</p>
                    <div className="mt-1.5 flex min-w-0 items-baseline gap-2">
                      <span className={`truncate text-sm font-semibold tabular-nums ${hasPromo ? "text-amber-300" : "text-slate-900 dark:text-white"}`}>{formatGs(hasPromo ? p.salePrice! : p.price)}</span>
                      {hasPromo && <span className="shrink-0 text-[11px] text-slate-500 line-through">{formatGs(p.price)}</span>}
                      <span className="ml-auto shrink-0 text-[11px] font-semibold text-emerald-300">{marginPercent}%</span>
                    </div>
                  </div>
                </div>

                {hasPromo && ((p.saleType === "time" || p.saleType === "both") && p.saleExpiresAt || (p.saleType === "quantity" || p.saleType === "both") && p.saleMaxUnits) && (
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 rounded-xl border border-amber-500/15 bg-amber-500/[0.05] px-2.5 py-1.5 text-[11px] font-medium text-amber-200">
                    {(p.saleType === "time" || p.saleType === "both") && p.saleExpiresAt && <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> Vence {new Date(p.saleExpiresAt).toLocaleDateString("es-PY", { day: "2-digit", month: "short" })}</span>}
                    {(p.saleType === "quantity" || p.saleType === "both") && p.saleMaxUnits && <span className="inline-flex items-center gap-1"><Package className="h-3 w-3" /> {p.saleUnitsSold || 0}/{p.saleMaxUnits}</span>}
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between gap-2 rounded-2xl border border-white/5 bg-white/[0.025] px-2.5 py-2">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Stock</span>
                    <span className={`text-sm font-semibold tabular-nums ${isLowStock ? "text-amber-300" : "text-slate-900 dark:text-white"}`}>{p.stock}</span>
                    {isLowStock && <span className="rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-amber-300">Bajo</span>}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button type="button" onClick={() => { triggerHaptic("selection"); updateProductStock(p.id, -1); }} disabled={p.stock <= 0} aria-label={`Restar una unidad de ${p.name}`} className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-sm font-semibold text-slate-600 dark:text-slate-300 transition active:scale-95 disabled:opacity-35">−</button>
                    <button type="button" onClick={() => { triggerHaptic("selection"); updateProductStock(p.id, 1); }} aria-label={`Sumar una unidad a ${p.name}`} className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-sm font-semibold text-slate-600 dark:text-slate-300 transition active:scale-95">+</button>
                    <button type="button" onClick={() => { triggerHaptic("selection"); updateProductStock(p.id, 5); }} aria-label={`Sumar cinco unidades a ${p.name}`} className="flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-2 text-[11px] font-semibold text-slate-600 dark:text-slate-300 transition active:scale-95">+5</button>
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <button type="button" data-tour={index === 0 ? "productos-promo-btn" : undefined} onClick={() => { triggerHaptic("light"); handleOpenPromoModal(p); }} className={`inline-flex min-h-10 min-w-0 flex-1 items-center justify-between gap-2 rounded-xl border px-3 text-[11px] font-semibold transition active:scale-[0.98] ${hasPromo ? "border-amber-500/20 bg-amber-500/[0.07] text-amber-200" : "border-white/10 bg-white/[0.025] text-slate-600 dark:text-zinc-300"}`}>
                    <span className="inline-flex min-w-0 items-center gap-1.5"><Tag className="h-3.5 w-3.5 shrink-0 text-amber-400" /><span className="truncate">{hasPromo ? `Oferta · ${formatGs(p.salePrice!)}` : "Configurar oferta"}</span></span>
                    <span className="shrink-0 text-[11px] text-slate-500 dark:text-zinc-400">{hasPromo ? "Editar" : "Crear"}</span>
                  </button>
                  <button type="button" onClick={() => { triggerHaptic("selection"); openEditModal(p); }} aria-label={`Editar ${p.name}`} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-slate-400 transition active:scale-95"><Edit2 className="h-4 w-4" /></button>
                  <button type="button" onClick={() => { triggerHaptic("light"); handleDelete(p.id, p.name); }} aria-label={`Eliminar ${p.name}`} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-rose-300 transition active:scale-95"><Trash2 className="h-4 w-4" /></button>
                </div>
              </article>
            );
          })}
        </div>
        <div className="hidden sm:grid sm:grid-cols-2 xl:grid-cols-3 sm:gap-4">

          {filteredProducts.map((p, index) => {
            const isLowStock = p.stock <= 5;
            const hasPromo = Boolean(p.isOnSale && p.salePrice && p.salePrice < p.price);
            const marginPercent = p.price > 0 ? Math.round(((p.price - p.cost) / p.price) * 100) : 0;
            const isBroken = brokenImages[p.id] || !p.imageUrl;

            return (
              <article key={p.id} className="group flex min-w-0 flex-col overflow-hidden rounded-3xl border border-white/10 glass-panel transition-colors hover:border-primary/30">
                <div className="relative aspect-[16/10] max-h-56 overflow-hidden border-b border-white/5 bg-gradient-to-br from-white/[0.05] via-transparent to-black/20">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/[0.07] via-transparent to-transparent" />
                  {isBroken ? (
                    <ProductImageFallback category={p.category} name={p.name} />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imageUrl} alt={p.name} onError={() => setBrokenImages((prev) => ({ ...prev, [p.id]: true }))} className="relative z-10 h-full w-full object-contain p-5 transition-transform duration-300 group-hover:scale-[1.03]" />
                  )}
                  <div className="absolute left-3 top-3 z-20 flex max-w-[70%] flex-wrap gap-1.5">
                    <span className="max-w-full truncate rounded-lg border border-white/10 bg-black/40 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">{p.category || "General"}</span>
                    {hasPromo && <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-2 py-1 text-[11px] font-semibold text-white shadow-sm"><Tag className="h-3 w-3" /> Oferta</span>}
                    {!p.active && <span className="rounded-lg bg-rose-500/90 px-2 py-1 text-[11px] font-semibold text-white">Pausado</span>}
                  </div>
                  <div className="absolute right-3 top-3 z-20 flex gap-1.5">
                    <button type="button" onClick={() => { triggerHaptic("selection"); openEditModal(p); }} aria-label={`Editar ${p.name}`} title="Editar producto" className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-slate-950/65 text-white shadow-sm backdrop-blur-md transition hover:bg-white/15"><Edit2 className="h-4 w-4" /></button>
                    <button type="button" onClick={() => { triggerHaptic("light"); handleDelete(p.id, p.name); }} aria-label={`Eliminar ${p.name}`} title="Eliminar producto" className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-slate-950/65 text-rose-300 shadow-sm backdrop-blur-md transition hover:bg-rose-500/20 hover:text-rose-200"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-white sm:text-base">{p.name}</h3>
                    <p className="mt-1 line-clamp-2 min-h-9 text-xs leading-relaxed text-slate-500 dark:text-zinc-400">{p.description || "Sin descripción"}</p>
                  </div>

                  <div className="flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-zinc-500">Precio de venta</p>
                      <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <span className={`text-base font-semibold tabular-nums ${hasPromo ? "text-amber-300" : "text-slate-900 dark:text-white"}`}>{formatGs(hasPromo ? p.salePrice! : p.price)}</span>
                        {hasPromo && <span className="text-[11px] tabular-nums text-slate-500 line-through">{formatGs(p.price)}</span>}
                      </div>
                    </div>
                    <span className="shrink-0 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.06] px-2.5 py-1.5 text-[11px] font-semibold text-emerald-300">{marginPercent}% margen</span>
                  </div>

                  {hasPromo && (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-amber-500/15 bg-amber-500/[0.05] px-3 py-2 text-[11px] font-medium text-amber-200">
                      {(p.saleType === "time" || p.saleType === "both") && p.saleExpiresAt && <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> Vence {new Date(p.saleExpiresAt).toLocaleDateString("es-PY", { day: "2-digit", month: "short" })}</span>}
                      {(p.saleType === "quantity" || p.saleType === "both") && p.saleMaxUnits && <span className="inline-flex items-center gap-1"><Package className="h-3 w-3" /> {p.saleUnitsSold || 0}/{p.saleMaxUnits} vendidos</span>}
                    </div>
                  )}

                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.025] p-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-zinc-500">Existencias</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className={`text-lg font-semibold tabular-nums ${isLowStock ? "text-amber-300" : "text-slate-900 dark:text-white"}`}>{p.stock}</span>
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400">unidades</span>
                        {isLowStock && <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-300">Bajo</span>}
                      </div>
                      <p className="mt-1 truncate text-[11px] text-slate-500 dark:text-zinc-500">Costo {formatGs(p.cost)}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button type="button" onClick={() => { triggerHaptic("selection"); updateProductStock(p.id, -1); }} disabled={p.stock <= 0} aria-label={`Restar una unidad de ${p.name}`} title="Restar 1 unidad" className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-sm font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35">−</button>
                      <button type="button" onClick={() => { triggerHaptic("selection"); updateProductStock(p.id, 1); }} aria-label={`Sumar una unidad a ${p.name}`} title="Sumar 1 unidad" className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-sm font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-white/10">+</button>
                      <button type="button" onClick={() => { triggerHaptic("selection"); updateProductStock(p.id, 5); }} aria-label={`Sumar cinco unidades a ${p.name}`} title="Sumar 5 unidades" className="flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-2 text-[11px] font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-white/10">+5</button>
                    </div>
                  </div>

                  <button type="button" data-tour={index === 0 ? "productos-promo-btn" : undefined} onClick={() => { triggerHaptic("light"); handleOpenPromoModal(p); }} className={`mt-auto inline-flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border px-3 text-xs font-semibold transition ${hasPromo ? "border-amber-500/20 bg-amber-500/[0.07] text-amber-200 hover:bg-amber-500/10" : "border-white/10 bg-white/[0.025] text-slate-600 hover:bg-white/[0.06] dark:text-zinc-300"}`}>
                    <span className="inline-flex min-w-0 items-center gap-2"><Tag className="h-4 w-4 shrink-0 text-amber-400" /><span className="truncate">{hasPromo ? `Oferta activa · ${formatGs(p.salePrice!)}` : "Crear oferta o descuento"}</span></span>
                    <span className="shrink-0 text-[11px] text-slate-500 dark:text-zinc-400">{hasPromo ? "Editar" : "Configurar"}</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
      )}

      {/* Create / Edit Modal */}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="max-w-xl"
        title={editingProduct ? "Editar Producto" : "Nuevo Producto para la Tienda"}
        footer={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 sm:min-h-0">
              <input
                type="checkbox"
                form="product-form"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="h-4 w-4 rounded accent-primary"
              />
              <span>Activo en catálogo</span>
            </label>
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="min-h-11 rounded-xl border border-slate-200/80 px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5 sm:min-h-10"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="product-form"
                className="min-h-11 rounded-xl bg-primary px-5 text-xs font-semibold text-white shadow-md shadow-primary/20 transition hover:brightness-110 sm:min-h-10"
              >
                {editingProduct ? "Guardar Cambios" : "Crear Producto"}
              </button>
            </div>
          </div>
        }
      >
        <form id="product-form" onSubmit={handleSaveProduct} data-tour="product-modal-container" className="space-y-5 pt-1">
          <div data-tour="product-name-input">
            <label htmlFor="product-name" className={PRODUCT_LABEL_CLASS}>Nombre del producto *</label>
            <input
              id="product-name"
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej. Cera Capilar Mate 100ml"
              className={PRODUCT_INPUT_CLASS}
            />
          </div>

          <div data-tour="product-category-selector">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className={PRODUCT_LABEL_CLASS}>Categoría</span>
              <button
                type="button"
                onClick={() => {
                  const cat = prompt("Ingresá el nombre de la nueva categoría:");
                  if (cat && cat.trim()) {
                    handleAddCategory(cat.trim());
                  }
                }}
                className="-my-1 flex min-h-8 cursor-pointer items-center gap-1 rounded-lg px-2 text-[11px] font-semibold text-primary transition hover:bg-primary/10"
              >
                <FolderPlus className="h-3.5 w-3.5" />
                <span>Nueva categoría</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {allCategories.map((cat) => {
                const isSelected = form.category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setForm({ ...form, category: cat })}
                    className={`flex min-h-10 min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-2.5 text-xs font-semibold transition ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/[0.07]"
                    }`}
                  >
                    <Package className={`h-3.5 w-3.5 shrink-0 ${isSelected ? "text-primary" : "text-slate-400"}`} />
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

          <div data-tour="product-pricing-inputs" className="space-y-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="min-w-0">
                <label htmlFor="product-stock" className={PRODUCT_LABEL_CLASS}>Stock (u.)</label>
                <input
                  id="product-stock"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  required
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                  className={`${PRODUCT_INPUT_CLASS} tabular-nums`}
                />
              </div>
              <div className="min-w-0">
                <label htmlFor="product-cost" className={PRODUCT_LABEL_CLASS}>Costo proveedor (Gs.)</label>
                <input
                  id="product-cost"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={5000}
                  value={form.cost}
                  onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
                  className={`${PRODUCT_INPUT_CLASS} tabular-nums`}
                />
              </div>
              <div className="col-span-2 min-w-0 sm:col-span-1">
                <label htmlFor="product-price" className={PRODUCT_LABEL_CLASS}>Precio de venta (Gs.) *</label>
                <input
                  id="product-price"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={5000}
                  required
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  className={`${PRODUCT_INPUT_CLASS} tabular-nums font-semibold text-primary!`}
                />
              </div>
            </div>

            {/* Real-time Profit Preview */}
            {form.price > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-2.5 text-xs dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex min-w-0 items-center gap-2">
                  <TrendingUp className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span className="text-slate-600 dark:text-slate-400">Ganancia por unidad</span>
                  <span className="tabular-nums font-semibold text-slate-900 dark:text-white">
                    {formatGs(Math.max(0, form.price - form.cost))}
                  </span>
                </div>
                <span className={`rounded-lg border px-2 py-0.5 text-[11px] font-semibold tabular-nums ${
                  form.price > form.cost
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                }`}>
                  Margen {Math.round(((form.price - form.cost) / form.price) * 100)}%
                </span>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="product-description" className={PRODUCT_LABEL_CLASS}>Descripción breve</label>
            <textarea
              id="product-description"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Fijación mate, aroma a menta, para todo tipo de cabello..."
              className={`${PRODUCT_INPUT_CLASS} min-h-[84px] resize-y`}
            />
          </div>
        </form>
      </Modal>

      {/* Dedicated Special Offer & Discount Modal */}
      <Modal
        open={!!promoModalProduct}
        onClose={() => setPromoModalProduct(null)}
        maxWidth="max-w-lg"
        title={promoModalProduct ? `Descuento & Oferta: ${promoModalProduct.name}` : "Oferta"}
        animateContentSize
      >
        {promoModalProduct && (
          <form onSubmit={handleSavePromo} className="space-y-4 text-xs" data-tour="product-offer-section">
            {/* Promo Header & Switch */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white font-semibold shadow-xs">
                  <Tag className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-semibold text-xs text-slate-900 dark:text-white block">
                    Activar Precio Promocional / Oferta
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Precio normal: <strong className="text-slate-800 dark:text-slate-200 tabular-nums">{formatGs(promoModalProduct.price)}</strong>
                  </span>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={promoForm.isOnSale}
                aria-label="Activar precio promocional"
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
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950 ${
                  promoForm.isOnSale ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <motion.span
                  animate={{ x: promoForm.isOnSale ? 20 : 0 }}
                  transition={prefersReducedMotion ? { duration: 0.01 } : { type: "spring", stiffness: 520, damping: 32 }}
                  className="pointer-events-none absolute left-1 top-1 h-4 w-4 rounded-full bg-[#ffffff] shadow-[0_1px_3px_rgba(0,0,0,0.28)]"
                />
              </button>
            </div>

            <motion.div
              layout="size"
              transition={{
                layout: prefersReducedMotion
                  ? { duration: 0.01 }
                  : { type: "spring", stiffness: 300, damping: 34, mass: 0.85 },
              }}
              className="relative overflow-hidden"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {promoForm.isOnSale ? (
                  <motion.div
                    key="offer-enabled"
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                    transition={prefersReducedMotion ? { duration: 0.01 } : { duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-4 pt-1"
                  >
                    {/* Quick Preset Discount Pills */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Atajos rápidos de descuento
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {[10, 15, 20, 25, 30, 40, 50].map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => handlePromoPercentChange(pct)}
                            className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition cursor-pointer ${
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
                        <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                          Porcentaje de Descuento (%)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="1"
                            max="99"
                            value={promoForm.promoPercent}
                            onChange={(e) => handlePromoPercentChange(Number(e.target.value))}
                            className="w-full rounded-xl border border-amber-500/40 bg-white dark:bg-slate-900 py-2 pl-3 pr-8 text-xs tabular-nums font-semibold text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 font-semibold text-amber-600">
                            %
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-400">
                          Calcula el monto final en Gs. automáticamente.
                        </p>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                          Precio de Oferta (Gs.) *
                        </label>
                        <input
                          type="number"
                          min="1000"
                          step="1000"
                          value={promoForm.salePrice}
                          onChange={(e) => handlePromoPriceChange(Number(e.target.value))}
                          className="w-full rounded-xl border border-amber-500/40 bg-white dark:bg-slate-900 py-2 px-3 text-xs tabular-nums font-semibold text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none"
                        />
                        <p className="mt-1 text-[11px] text-slate-400">
                          Calcula el % de descuento automáticamente.
                        </p>
                      </div>
                    </div>

                    {/* Live Preview Card */}
                    <div className="p-3 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-300 font-medium">Comparación en catálogo público:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 line-through tabular-nums">
                            {formatGs(promoModalProduct.price)}
                          </span>
                          <span className="text-sm font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
                            {formatGs(promoForm.salePrice)}
                          </span>
                          <span className="bg-amber-500 text-white font-semibold text-[11px] px-1.5 py-0.5 rounded-md">
                            -{promoForm.promoPercent}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-amber-500/20 text-slate-500 dark:text-slate-400">
                        <span>
                          Ahorro para el cliente: <strong className="text-emerald-600 dark:text-emerald-400 tabular-nums">{formatGs(Math.max(0, promoModalProduct.price - promoForm.salePrice))}</strong>
                        </span>
                        <span>
                          Margen con promo: <strong className="text-slate-800 dark:text-slate-200">{promoForm.salePrice > 0 ? Math.round(((promoForm.salePrice - promoModalProduct.cost) / promoForm.salePrice) * 100) : 0}%</strong>
                        </span>
                      </div>
                    </div>

                    {/* Limiting modality: Time or Quantity */}
                    <div className="pt-2 border-t border-slate-100 dark:border-white/10 space-y-2.5">
                      <label className="block font-semibold text-slate-700 dark:text-slate-200">
                        Modalidad de Límite de la Oferta
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setPromoForm({ ...promoForm, saleType: "time" })}
                          className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                            promoForm.saleType === "time"
                              ? "border-amber-500 bg-amber-500/20 text-amber-800 dark:text-amber-200 font-semibold"
                              : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <Clock className="h-4 w-4 mx-auto mb-1 text-amber-500" />
                          <span className="block text-[11px] font-semibold">Por Tiempo</span>
                          <span className="text-[11px] opacity-75">Fecha límite</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPromoForm({ ...promoForm, saleType: "quantity" })}
                          className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                            promoForm.saleType === "quantity"
                              ? "border-amber-500 bg-amber-500/20 text-amber-800 dark:text-amber-200 font-semibold"
                              : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <Package className="h-4 w-4 mx-auto mb-1 text-amber-500" />
                          <span className="block text-[11px] font-semibold">Por Cantidad</span>
                          <span className="text-[11px] opacity-75">Cupo de unidades</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPromoForm({ ...promoForm, saleType: "both" })}
                          className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                            promoForm.saleType === "both"
                              ? "border-amber-500 bg-amber-500/20 text-amber-800 dark:text-amber-200 font-semibold"
                              : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <Percent className="h-4 w-4 mx-auto mb-1 text-amber-500" />
                          <span className="block text-[11px] font-semibold">Ambos</span>
                          <span className="text-[11px] opacity-75">Tiempo y cupo</span>
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
                  </motion.div>
                ) : (
                  <motion.div
                    key="offer-disabled"
                    initial={prefersReducedMotion ? false : { opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
                    transition={prefersReducedMotion ? { duration: 0.01 } : { duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-white/10 text-center text-slate-500 dark:text-slate-400"
                  >
                    <p className="font-semibold text-xs">La oferta está actualmente desactivada para este producto.</p>
                    <p className="text-[11px] mt-1">El producto se venderá al precio estándar de {formatGs(promoModalProduct.price)}.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

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
                className="rounded-xl bg-amber-500 hover:bg-amber-600 px-5 py-2 font-semibold text-white shadow-md shadow-amber-500/20 transition cursor-pointer"
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
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white font-semibold">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-900 dark:text-white">
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
              className="rounded-xl bg-rose-600 hover:bg-rose-700 px-5 py-2 font-semibold text-white shadow-md transition cursor-pointer"
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
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-white font-semibold">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-900 dark:text-white">
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
              className="rounded-xl bg-rose-600 hover:bg-rose-700 px-5 py-2 font-semibold text-white shadow-md transition cursor-pointer"
            >
              Eliminar Categoría
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
