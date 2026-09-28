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
} from "lucide-react";
import { useEffect } from "react";
import { useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";
import StatCard from "@/components/dashboard/ui/StatCard";
import Modal from "@/components/dashboard/ui/Modal";
import ProductImageUploader from "@/components/dashboard/ProductImageUploader";
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

  // Form state
  const [form, setForm] = useState<{
    name: string;
    description: string;
    price: number;
    cost: number;
    imageUrl: string;
    category: string;
    stock: number;
    active: boolean;
    isOnSale: boolean;
    salePrice: number;
    saleType: "time" | "quantity" | "both";
    saleExpiresAt: string;
    saleMaxUnits: number;
  }>({
    name: "",
    description: "",
    price: 60000,
    cost: 30000,
    imageUrl: "",
    category: "Peinado",
    stock: 10,
    active: true,
    isOnSale: false,
    salePrice: 0,
    saleType: "time",
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
      isOnSale: false,
      salePrice: 0,
      saleType: "time",
      saleExpiresAt: "",
      saleMaxUnits: 10,
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
      isOnSale: !!product.isOnSale,
      salePrice: product.salePrice || 0,
      saleType: product.saleType || "time",
      saleExpiresAt: product.saleExpiresAt || "",
      saleMaxUnits: product.saleMaxUnits || 10,
    });
    setModalOpen(true);
  }

  function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      pushToast("error", "El nombre del producto es obligatorio");
      return;
    }

    if (form.isOnSale && (!form.salePrice || form.salePrice >= form.price)) {
      pushToast("error", "El precio de oferta debe ser menor al precio normal");
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
      isOnSale: form.isOnSale,
      salePrice: form.isOnSale ? Number(form.salePrice) : undefined,
      saleType: form.isOnSale ? form.saleType : undefined,
      saleExpiresAt: form.isOnSale && (form.saleType === "time" || form.saleType === "both") ? form.saleExpiresAt : undefined,
      saleMaxUnits: form.isOnSale && (form.saleType === "quantity" || form.saleType === "both") ? Number(form.saleMaxUnits) : undefined,
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div data-tour="productos-header" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Productos, Tienda & Inventario
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Catálogo web con pedidos directos a tu WhatsApp y venta rápida al mostrador.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={copyStoreLink}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            {copiedLink ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-slate-400" />}
            <span>Copiar Enlace Tienda</span>
          </button>

          <Link
            href={publicStoreUrl}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <ExternalLink className="h-4 w-4 text-slate-400" />
            <span>Ver Tienda Web</span>
          </Link>

          <button
            type="button"
            data-tour="productos-new-btn"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/25 hover:brightness-110 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div data-tour="productos-kpis" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Unidades en Stock"
          value={`${totalStock} u.`}
          icon={Package}
        />
        <StatCard
          label="Valor del Inventario (Venta)"
          value={formatGs(totalRetailValue)}
          icon={ShoppingBag}
        />
        <StatCard
          label="Margen Bruto Estimado"
          value={formatGs(estimatedProfit)}
          icon={TrendingUp}
        />
        <StatCard
          label="Stock Bajo o Crítico (≤5)"
          value={`${lowStockCount} items`}
          icon={AlertTriangle}
          delta={lowStockCount > 0 ? -lowStockCount : undefined}
        />
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

        <div data-tour="productos-categories-bar" className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setSelectedCategory("Todas")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              selectedCategory === "Todas"
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            Todas
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory("ofertas")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
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
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
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
        <div data-tour="productos-grid" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((p) => {
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

          {/* Special Offer / Promotional Campaign Section */}
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-white font-black shadow-xs">
                  <Tag className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Poner este producto en Oferta</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Descuento con límite de tiempo o cupo máximo de unidades
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isOnSale}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setForm({
                      ...form,
                      isOnSale: checked,
                      salePrice: checked && (!form.salePrice || form.salePrice >= form.price)
                        ? Math.max(1000, Math.round(form.price * 0.8 / 1000) * 1000)
                        : form.salePrice,
                    });
                  }}
                  className="sr-only peer"
                />
                <div className="w-10 h-5.5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-amber-500" />
              </label>
            </div>

            {form.isOnSale && (
              <div className="space-y-3 pt-2.5 border-t border-amber-500/20 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Precio de Oferta Promocional (Gs.) *
                    </label>
                    <input
                      type="number"
                      step={5000}
                      min={1000}
                      required={form.isOnSale}
                      value={form.salePrice || ""}
                      onChange={(e) => setForm({ ...form, salePrice: Number(e.target.value) })}
                      placeholder="Ej: 45000"
                      className="mt-1 w-full rounded-xl border border-amber-400/80 dark:border-amber-500/40 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-black text-amber-600 dark:text-amber-400 outline-none focus:border-amber-500 shadow-xs"
                    />
                    {form.price > 0 && form.salePrice > 0 && form.salePrice < form.price && (
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                        Ahorro del {Math.round(((form.price - form.salePrice) / form.price) * 100)}% ({formatGs(form.price - form.salePrice)} menos)
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Modalidad del Límite de Oferta
                    </label>
                    <select
                      value={form.saleType}
                      onChange={(e) => setForm({ ...form, saleType: e.target.value as any })}
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-primary"
                    >
                      <option value="time">Por Tiempo (Fecha y hora de expiración)</option>
                      <option value="quantity">Por Cantidad Máxima de Unidades</option>
                      <option value="both">Ambos (Tiempo y Cantidad)</option>
                    </select>
                  </div>
                </div>

                {(form.saleType === "time" || form.saleType === "both") && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-amber-500" />
                      <span>Fecha y hora límite de la oferta</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={form.saleExpiresAt}
                      onChange={(e) => setForm({ ...form, saleExpiresAt: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-primary"
                    />
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Cumplida esta fecha, la tienda volverá al precio regular automáticamente.
                    </p>
                  </div>
                )}

                {(form.saleType === "quantity" || form.saleType === "both") && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Package className="h-3.5 w-3.5 text-amber-500" />
                      <span>Cantidad máxima de unidades en oferta</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={form.saleMaxUnits || ""}
                      onChange={(e) => setForm({ ...form, saleMaxUnits: Number(e.target.value) })}
                      placeholder="Ej: 10 unidades"
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-primary"
                    />
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Al venderse el cupo asignado, el precio se normalizará de forma automática.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

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

          <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
            🔒 <strong>Política de Privacidad & Retención:</strong> Las imágenes asociadas se quitan de inmediato de la tienda pública y se conservan de forma segura durante 90 días como respaldo y prevención de fraude antes de su eliminación definitiva.
          </p>

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
