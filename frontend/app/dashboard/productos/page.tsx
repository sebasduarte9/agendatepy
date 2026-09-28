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
  Sparkles,
  Layers,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";
import StatCard from "@/components/dashboard/ui/StatCard";
import Modal from "@/components/dashboard/ui/Modal";
import { formatGs } from "@/lib/dashboard-dates";
import type { ProductItem } from "@/lib/dashboard-types";

const CATEGORIES = ["Todas", "Peinado", "Cuidado Barba", "Lavado & Cuidado", "Fragancias", "Accesorios"] as const;

function ProductImageFallback({ category, name }: { category: string; name: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-tr from-slate-100 to-indigo-50/50 dark:from-slate-800 dark:to-slate-700/60 p-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 text-brand shadow-sm">
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

  // Form state
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: 60000,
    cost: 30000,
    imageUrl: "",
    category: "Peinado",
    stock: 10,
    active: true,
  });

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());

      const matchesCat =
        selectedCategory === "Todas" || p.category.toLowerCase() === selectedCategory.toLowerCase();

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
      imageUrl: "https://images.unsplash.com/photo-1597354984706-aec992b7d0d1?w=500&auto=format&fit=crop&q=80",
      category: "Peinado",
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

  function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      pushToast("error", "El nombre del producto es obligatorio");
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        cost: Number(form.cost),
        imageUrl: form.imageUrl.trim(),
        category: form.category,
        stock: Number(form.stock),
        active: form.active,
      });
      pushToast("success", "Producto actualizado correctamente");
    } else {
      addProduct({
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        cost: Number(form.cost),
        imageUrl: form.imageUrl.trim() || "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80",
        category: form.category,
        stock: Number(form.stock),
        active: form.active,
      });
      pushToast("success", "Producto agregado al catálogo");
    }
    setModalOpen(false);
  }

  function handleDelete(id: string, name: string) {
    setProductToDelete({ id, name });
  }

  function handleConfirmDeleteProduct() {
    if (!productToDelete) return;
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
            className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition"
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
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-2xl bg-brand px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-brand/25 hover:brightness-110 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por producto, categoría o descripción..."
            className="w-full rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 shadow-xs outline-none focus:border-brand"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <Card className="py-12 text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">No se encontraron productos</h3>
          <p className="mt-1 text-xs text-slate-500">
            Ajustá el término de búsqueda o agregá un nuevo producto al catálogo.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-xs font-semibold text-white shadow-xs"
          >
            <Plus className="h-4 w-4" />
            Crear Producto
          </button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((p) => {
            const isLowStock = p.stock <= 5;
            const marginPercent = Math.round(((p.price - p.cost) / p.price) * 100);
            const isBroken = brokenImages[p.id] || !p.imageUrl;

            return (
              <Card key={p.id} className="flex flex-col justify-between overflow-hidden p-0 border border-slate-200/90 dark:border-white/10 shadow-xs hover:border-brand/40 transition">
                {/* Image and badges */}
                <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  {isBroken ? (
                    <ProductImageFallback category={p.category} name={p.name} />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      onError={() => setBrokenImages((prev) => ({ ...prev, [p.id]: true }))}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  )}

                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="rounded-lg bg-black/70 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                      {p.category}
                    </span>
                    {!p.active && (
                      <span className="rounded-lg bg-rose-500/90 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                        Pausado
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(p)}
                      aria-label="Editar producto"
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-200 shadow-sm hover:text-brand transition"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id, p.name)}
                      aria-label="Eliminar producto"
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/95 dark:bg-slate-900/95 text-rose-600 shadow-sm hover:bg-rose-50 transition"
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
                      <span className="text-base font-black text-slate-900 dark:text-white font-mono">{formatGs(p.price)}</span>
                      <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                        Margen: {marginPercent}%
                      </span>
                    </div>

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
                          className="h-7 w-7 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition active:scale-95"
                        >
                          -1
                        </button>
                        <button
                          type="button"
                          onClick={() => updateProductStock(p.id, 1)}
                          className="h-7 w-7 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition active:scale-95"
                        >
                          +1
                        </button>
                        <button
                          type="button"
                          onClick={() => updateProductStock(p.id, 5)}
                          className="h-7 px-2 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-xs transition active:scale-95"
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
        title={editingProduct ? "Editar Producto" : "Nuevo Producto para la Tienda"}
      >
        <form onSubmit={handleSaveProduct} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Nombre del Producto *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej. Cera Capilar Mate 100ml"
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-brand"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Categoría</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-brand"
              >
                {CATEGORIES.filter((c) => c !== "Todas").map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Stock Inicial (unidades)</label>
              <input
                type="number"
                min={0}
                required
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-brand"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Precio Venta (Gs.) *</label>
              <input
                type="number"
                step={5000}
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Costo de Compra (Gs.)</label>
              <input
                type="number"
                step={5000}
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-brand"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">URL Imagen del Producto</label>
            <input
              type="url"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://..."
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-brand"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Descripción Breve</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Fijación mate, aroma a menta, para todo tipo de cabello..."
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-brand"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="h-4 w-4 rounded text-brand focus:ring-brand"
              />
              <span>Producto Activo en Catálogo</span>
            </label>

            <button
              type="submit"
              className="rounded-xl bg-brand px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-brand/20 hover:brightness-110 transition"
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
    </div>
  );
}
