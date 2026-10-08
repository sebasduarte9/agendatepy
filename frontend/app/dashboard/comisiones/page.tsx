"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Coins,
  DollarSign,
  Users,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Receipt,
  Percent,
  Download,
  Printer,
  Send,
  Scissors,
  Crown,
  Banknote,
  Brush,
  Sliders,
  Plus,
  Search,
  FileText,
  ChevronDown,
  ChevronRight,
  Check,
  AlertCircle,
  X,
  ExternalLink,
  ShieldCheck,
  Package,
  ShoppingBag,
  Sparkles,
  Wallet,
  ArrowDownRight,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";
import StatCard from "@/components/dashboard/ui/StatCard";
import Modal from "@/components/dashboard/ui/Modal";
import CustomSelect from "@/components/dashboard/ui/CustomSelect";
import IosSegmentedControl from "@/components/dashboard/ui/IosSegmentedControl";
import { triggerHaptic } from "@/lib/haptics";
import { formatGs } from "@/lib/dashboard-dates";
import type { StaffMember, CommissionPayoutRecord, Appointment } from "@/lib/dashboard-types";

// Role Icons & Visual Tokens
const ROLE_CONFIG: Record<string, { label: string; icon: any; badgeClass: string }> = {
  admin: {
    label: "Dueño / Admin",
    icon: Crown,
    badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  },
  cajero: {
    label: "Caja / Mostrador",
    icon: Banknote,
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  },
  barbero: {
    label: "Barbero",
    icon: Scissors,
    badgeClass: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20",
  },
  estilista: {
    label: "Estilista",
    icon: Brush,
    badgeClass: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  },
};

export default function ComisionesPage() {
  const {
    business,
    staff,
    services,
    products,
    appointments,
    productOrders,
    commissionPayouts,
    addCommissionPayout,
    updateStaffCommission,
    pushToast,
  } = useDashboardStore();

  const brandColor = business.primaryColor || "var(--primary, #FF4F2B)";

  // Filters state
  const [selectedStaffId, setSelectedStaffId] = useState<string>("ALL");
  const [period, setPeriod] = useState<string>("30d");

  // Modals state
  const [isLiquidarModalOpen, setIsLiquidarModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [selectedPayoutReceipt, setSelectedPayoutReceipt] = useState<CommissionPayoutRecord | null>(null);

  // Liquidation form state
  const [liqStaffId, setLiqStaffId] = useState<string>("");
  const [liqPaymentMethod, setLiqPaymentMethod] = useState<"Transferencia" | "Efectivo" | "POS Bancard">("Transferencia");
  const [liqAutoCashExpense, setLiqAutoCashExpense] = useState(true);
  const [liqAdvancesDeducted, setLiqAdvancesDeducted] = useState(0);
  const [liqNotes, setLiqNotes] = useState("");

  // Commission rules draft state (for rules modal)
  const [rulesDraft, setRulesDraft] = useState<Record<string, { servicePct: number; productPct: number }>>({});

  // Initialize rules draft when modal opens
  useEffect(() => {
    const draft: Record<string, { servicePct: number; productPct: number }> = {};
    staff.forEach((s) => {
      draft[s.id] = {
        servicePct: s.commissionPercentage ?? 50,
        productPct: s.productCommissionPercentage ?? 10,
      };
    });
    setRulesDraft(draft);
  }, [staff, isRulesModalOpen]);

  // Determine date boundary based on period
  const dateRange = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    if (period === "today") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    } else if (period === "7d") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === "15d" || period === "quincena") {
      startDate = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
    } else if (period === "30d") {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else {
      startDate = new Date(2020, 0, 1);
    }

    return { start: startDate, end: now };
  }, [period]);

  // Build service and staff lookup maps
  const serviceMap = useMemo(() => {
    const map = new Map<string, (typeof services)[0]>();
    services.forEach((s) => map.set(s.id, s));
    return map;
  }, [services]);

  const staffMap = useMemo(() => {
    const map = new Map<string, StaffMember>();
    staff.forEach((st) => map.set(st.id, st));
    return map;
  }, [staff]);

  // 1. Calculate Earned Services (Appointments)
  const earnedServicesItems = useMemo(() => {
    return appointments
      .filter((app) => {
        const isCompleted = app.status === "completed";
        const matchStaff = selectedStaffId === "ALL" || app.staffId === selectedStaffId;
        const appDate = new Date(app.start);
        const inDateRange = period === "all" || (appDate >= dateRange.start && appDate <= dateRange.end);
        return isCompleted && matchStaff && inDateRange;
      })
      .map((app) => {
        const svc = serviceMap.get(app.serviceId);
        const st = staffMap.get(app.staffId);
        const chargedAmount = svc?.price || 80000;
        const commissionPercentage = st?.commissionPercentage ?? 50;
        const commissionAmount = Math.round((chargedAmount * commissionPercentage) / 100);

        return {
          id: `svc-${app.id}`,
          originalId: app.id,
          type: "service" as const,
          date: app.start,
          clientName: app.clientName,
          staffId: app.staffId,
          staffName: st?.name || "Colaborador",
          staffRole: st?.role || "Especialista",
          concept: svc?.name || "Servicio",
          chargedAmount,
          commissionPercentage,
          commissionAmount,
          paymentMethod: app.paymentMethod,
        };
      });
  }, [appointments, selectedStaffId, period, dateRange, serviceMap, staffMap]);

  // 2. Calculate Earned Products (Orders sold by staff)
  const earnedProductsItems = useMemo(() => {
    return productOrders
      .filter((order) => {
        const isDelivered = order.status === "delivered" || order.status === "confirmed";
        const sellerId = order.sellerStaffId || "st-leticia"; // Default to counter if not specified
        const matchStaff = selectedStaffId === "ALL" || sellerId === selectedStaffId;
        const orderDate = new Date(order.createdAt);
        const inDateRange = period === "all" || (orderDate >= dateRange.start && orderDate <= dateRange.end);
        return isDelivered && matchStaff && inDateRange;
      })
      .map((order) => {
        const sellerId = order.sellerStaffId || "st-leticia";
        const st = staffMap.get(sellerId);
        const chargedAmount = order.totalAmount;
        const commissionPercentage = st?.productCommissionPercentage ?? 10;
        const commissionAmount = Math.round((chargedAmount * commissionPercentage) / 100);
        const productNames = order.items.map((i) => i.productName).join(", ");

        return {
          id: `prod-${order.id}`,
          originalId: order.id,
          type: "product" as const,
          date: order.createdAt,
          clientName: order.clientName,
          staffId: sellerId,
          staffName: st?.name || "Cajero Mostrador",
          staffRole: st?.role || "Caja / Mostrador",
          concept: productNames || "Venta de productos",
          chargedAmount,
          commissionPercentage,
          commissionAmount,
          paymentMethod: order.paymentMethod,
        };
      });
  }, [productOrders, selectedStaffId, period, dateRange, staffMap]);

  // Combined Earned Items (Services + Products)
  const allEarnedItems = useMemo(() => {
    return [...earnedServicesItems, ...earnedProductsItems].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [earnedServicesItems, earnedProductsItems]);

  // Aggregated KPIs
  const metrics = useMemo(() => {
    const totalServicesBilled = earnedServicesItems.reduce((acc, i) => acc + i.chargedAmount, 0);
    const totalProductsBilled = earnedProductsItems.reduce((acc, i) => acc + i.chargedAmount, 0);
    const totalBilled = totalServicesBilled + totalProductsBilled;

    const totalServicesCommission = earnedServicesItems.reduce((acc, i) => acc + i.commissionAmount, 0);
    const totalProductsCommission = earnedProductsItems.reduce((acc, i) => acc + i.commissionAmount, 0);
    const totalCommissionEarned = totalServicesCommission + totalProductsCommission;

    // Filter payouts matching current staff selection
    const relevantPayouts = commissionPayouts.filter(
      (p) => selectedStaffId === "ALL" || p.staffId === selectedStaffId
    );
    const totalPaidCommission = relevantPayouts.reduce((acc, p) => acc + p.amountPaid, 0);
    const pendingCommission = Math.max(0, totalCommissionEarned - totalPaidCommission);

    const payoutRate = totalCommissionEarned > 0 
      ? Math.min(100, Math.round((totalPaidCommission / totalCommissionEarned) * 100))
      : 100;

    const servicesSharePct = totalCommissionEarned > 0
      ? Math.round((totalServicesCommission / totalCommissionEarned) * 100)
      : 80;

    return {
      totalBilled,
      totalServicesBilled,
      totalProductsBilled,
      totalCommissionEarned,
      totalServicesCommission,
      totalProductsCommission,
      totalPaidCommission,
      pendingCommission,
      payoutRate,
      servicesSharePct,
      productsSharePct: 100 - servicesSharePct,
      totalServicesCount: earnedServicesItems.length,
      totalProductsCount: earnedProductsItems.length,
      payoutsCount: relevantPayouts.length,
    };
  }, [earnedServicesItems, earnedProductsItems, commissionPayouts, selectedStaffId]);

  // Per-staff summary calculation with Services vs Products % Breakdown
  const staffSummaries = useMemo(() => {
    return staff.map((st) => {
      const staffServices = earnedServicesItems.filter((i) => i.staffId === st.id);
      const staffProducts = earnedProductsItems.filter((i) => i.staffId === st.id);

      const servicesBilled = staffServices.reduce((acc, i) => acc + i.chargedAmount, 0);
      const productsBilled = staffProducts.reduce((acc, i) => acc + i.chargedAmount, 0);

      const servicesCommission = staffServices.reduce((acc, i) => acc + i.commissionAmount, 0);
      const productsCommission = staffProducts.reduce((acc, i) => acc + i.commissionAmount, 0);
      const totalEarned = servicesCommission + productsCommission;

      let servicesSharePercent = 0;
      let productsSharePercent = 0;

      if (totalEarned > 0) {
        servicesSharePercent = Math.round((servicesCommission / totalEarned) * 100);
        productsSharePercent = 100 - servicesSharePercent;
      } else {
        servicesSharePercent = (st.commissionPercentage ?? 0) > 0 ? 80 : 0;
        productsSharePercent = 100 - servicesSharePercent;
      }

      const staffPayouts = commissionPayouts.filter((p) => p.staffId === st.id);
      const staffPaid = staffPayouts.reduce((acc, p) => acc + p.amountPaid, 0);
      const staffPending = Math.max(0, totalEarned - staffPaid);

      return {
        staff: st,
        servicesCount: staffServices.length,
        productsCount: staffProducts.length,
        servicesBilled,
        productsBilled,
        totalBilled: servicesBilled + productsBilled,
        servicesCommission,
        productsCommission,
        totalEarned,
        servicesSharePercent,
        productsSharePercent,
        paidCommission: staffPaid,
        pendingCommission: staffPending,
        advanceBalance: st.advanceBalance || 0,
      };
    });
  }, [staff, earnedServicesItems, earnedProductsItems, commissionPayouts]);

  // Open liquidation modal preselecting a staff member
  const handleOpenLiquidar = (preferredStaffId?: string) => {
    const targetId = preferredStaffId || (selectedStaffId !== "ALL" ? selectedStaffId : staff[0]?.id || "");
    const targetStaff = staffMap.get(targetId);
    setLiqStaffId(targetId);
    setLiqAdvancesDeducted(targetStaff?.advanceBalance || 0);
    setLiqPaymentMethod("Transferencia");
    setLiqNotes("");
    setIsLiquidarModalOpen(true);
  };

  // Target staff selected inside liquidation modal
  const selectedLiquidationStaff = useMemo(() => {
    return staffMap.get(liqStaffId) || staff[0];
  }, [staffMap, liqStaffId, staff]);

  // Eligible services and products for current staff inside liquidation modal
  const liquidationData = useMemo(() => {
    if (!selectedLiquidationStaff) {
      return {
        servicesBilled: 0,
        productsBilled: 0,
        servicesCommission: 0,
        productsCommission: 0,
        grossCommission: 0,
        servicesShare: 50,
        productsShare: 50,
        itemsCount: 0,
      };
    }
    const stServices = earnedServicesItems.filter((i) => i.staffId === selectedLiquidationStaff.id);
    const stProducts = earnedProductsItems.filter((i) => i.staffId === selectedLiquidationStaff.id);

    const servicesBilled = stServices.reduce((acc, i) => acc + i.chargedAmount, 0);
    const productsBilled = stProducts.reduce((acc, i) => acc + i.chargedAmount, 0);

    const servicesCommission = stServices.reduce((acc, i) => acc + i.commissionAmount, 0);
    const productsCommission = stProducts.reduce((acc, i) => acc + i.commissionAmount, 0);
    const grossCommission = servicesCommission + productsCommission;

    let servicesShare = 0;
    let productsShare = 0;
    if (grossCommission > 0) {
      servicesShare = Math.round((servicesCommission / grossCommission) * 100);
      productsShare = 100 - servicesShare;
    } else {
      servicesShare = (selectedLiquidationStaff.commissionPercentage ?? 0) > 0 ? 80 : 0;
      productsShare = 100 - servicesShare;
    }

    return {
      servicesBilled,
      productsBilled,
      servicesCommission,
      productsCommission,
      grossCommission,
      servicesShare,
      productsShare,
      itemsCount: stServices.length + stProducts.length,
    };
  }, [selectedLiquidationStaff, earnedServicesItems, earnedProductsItems]);

  const liquidationNet = useMemo(() => {
    return Math.max(0, liquidationData.grossCommission - Number(liqAdvancesDeducted || 0));
  }, [liquidationData.grossCommission, liqAdvancesDeducted]);

  // Handle saving liquidation
  const handleConfirmLiquidation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLiquidationStaff) return;

    if (liquidationNet <= 0 && liquidationData.grossCommission <= 0) {
      pushToast("error", "No hay ganancias pendientes para pagar a este colaborador.");
      return;
    }

    const newPayout = addCommissionPayout({
      staffId: selectedLiquidationStaff.id,
      staffName: selectedLiquidationStaff.name,
      staffRole: selectedLiquidationStaff.role,
      periodStart: dateRange.start.toISOString(),
      periodEnd: dateRange.end.toISOString(),
      servicesAmount: liquidationData.servicesBilled,
      productsAmount: liquidationData.productsBilled,
      servicesCommission: liquidationData.servicesCommission,
      productsCommission: liquidationData.productsCommission,
      servicesSharePercent: liquidationData.servicesShare,
      productsSharePercent: liquidationData.productsShare,
      grossCommission: liquidationData.grossCommission,
      advancesDeducted: Number(liqAdvancesDeducted || 0),
      amountPaid: liquidationNet,
      paymentMethod: liqPaymentMethod,
      status: "PAID",
      paidBy: business.email || "administracion@agendate.py",
      notes: liqNotes.trim() || undefined,
      itemsCount: liquidationData.itemsCount,
    });

    pushToast("success", `Pago #${newPayout.receiptNumber} emitido a ${selectedLiquidationStaff.name}`);
    setIsLiquidarModalOpen(false);

    // Open receipt modal right away
    setSelectedPayoutReceipt(newPayout);
  };

  // Handle saving updated commission rules
  const handleSaveRules = () => {
    Object.entries(rulesDraft).forEach(([stId, rule]) => {
      updateStaffCommission(stId, rule.servicePct, rule.productPct);
    });
    pushToast("success", "Porcentajes de ganancia actualizados");
    setIsRulesModalOpen(false);
  };

  // Custom select options
  const staffFilterOptions = useMemo(
    () => [
      {
        value: "ALL",
        label: `Todo el equipo (${staff.length})`,
        icon: <Users className="h-3.5 w-3.5 text-primary" />,
      },
      ...staff.map((s) => ({
        value: s.id,
        label: s.name,
        subtitle: `${s.commissionPercentage}% serv. / ${s.productCommissionPercentage ?? 10}% prod.`,
        color: s.color,
      })),
    ],
    [staff]
  );

  const periodFilterOptions = useMemo(
    () => [
      { value: "today", label: "Hoy" },
      { value: "7d", label: "Últimos 7 días" },
      { value: "15d", label: "Esta quincena" },
      { value: "30d", label: "Últimos 30 días" },
      { value: "all", label: "Todo el historial" },
    ],
    []
  );

  const liqStaffOptions = useMemo(
    () =>
      staff.map((s) => ({
        value: s.id,
        label: `${s.name} — ${s.role}`,
        subtitle: `${s.commissionPercentage}% serv. / ${s.productCommissionPercentage ?? 10}% prod.`,
        color: s.color,
      })),
    [staff]
  );

  const liqPaymentMethodOptions = useMemo(
    () => [
      { value: "Transferencia", label: "Transferencia Bancaria" },
      { value: "Efectivo", label: "Efectivo (Caja Mostrador)" },
      { value: "POS Bancard", label: "POS Bancard / Tarjeta" },
    ],
    []
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-20">
      {/* ═══ CLEAN NATIVE PAGE HEADER ═══ */}
      <div
        data-tour="comisiones-header"
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-1"
      >
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Comisiones al Equipo
        </h1>

        {/* Action Dock & Global Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Staff Selector */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-white/10 shadow-xs">
            <CustomSelect
              value={selectedStaffId}
              onChange={(val) => setSelectedStaffId(val)}
              options={staffFilterOptions}
              buttonClassName="min-w-[170px] bg-transparent text-slate-800 dark:text-slate-100 border-0 py-1.5 text-xs font-semibold"
            />
          </div>

          {/* Period Selector */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-white/10 shadow-xs">
            <CustomSelect
              value={period}
              onChange={(val) => setPeriod(val)}
              options={periodFilterOptions}
              buttonClassName="min-w-[125px] bg-transparent text-slate-800 dark:text-slate-100 border-0 py-1.5 text-xs font-semibold"
            />
          </div>

          {/* Configure Rules */}
          <button
            type="button"
            data-tour="comisiones-rules"
            onClick={() => setIsRulesModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition shadow-xs cursor-pointer"
          >
            <Sliders className="h-3.5 w-3.5 text-slate-400" />
            <span>Reglas %</span>
          </button>

          {/* Liquidar button */}
          <button
            type="button"
            data-tour="comisiones-liquidar-btn"
            onClick={() => handleOpenLiquidar()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs transition-all duration-300 hover:brightness-110 active:scale-95 cursor-pointer"
            style={{
              backgroundColor: brandColor,
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Pagar Comisión</span>
          </button>
        </div>
      </div>

      {/* ═══ MOBILE APPLE GLANCEABLE STAT CARD ═══ */}
      <div className="block md:hidden p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Por Liquidar
            </span>
            <span
              className={`text-2xl font-black font-mono ${
                metrics.pendingCommission > 0
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {formatGs(metrics.pendingCommission)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleOpenLiquidar()}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs active:scale-95 transition cursor-pointer"
            style={{ backgroundColor: brandColor }}
          >
            Pagar
          </button>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Pagado: <strong className="text-slate-800 dark:text-slate-200 font-mono">{formatGs(metrics.totalPaidCommission)}</strong></span>
          <span>Facturado: <strong className="text-slate-800 dark:text-slate-200 font-mono">{formatGs(metrics.totalBilled)}</strong></span>
        </div>
      </div>

      {/* ═══ DESKTOP APPLE INSET CONTAINER: BENTO TELEMETRY & GAUGES ═══ */}
      <div className="hidden md:block rounded-[28px] bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Card 1: Circular Progress Gauges (Liquidation Rate & Source Breakdown) */}
          <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-slate-950 p-5 border border-slate-200/70 dark:border-slate-800/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Coins className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Balance Global de Liquidaciones
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
                  {metrics.totalServicesCount + metrics.totalProductsCount} transacciones
                </span>
              </div>

              {/* Gauges & Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {/* Gauge 1: Payout Rate */}
                <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <div className="relative h-14 w-14 shrink-0 flex items-center justify-center">
                    <svg className="h-14 w-14 -rotate-90" viewBox="0 0 44 44">
                      <circle
                        cx="22"
                        cy="22"
                        r="18"
                        className="text-slate-200 dark:text-slate-800"
                        strokeWidth="4"
                        stroke="currentColor"
                        fill="transparent"
                      />
                      <circle
                        cx="22"
                        cy="22"
                        r="18"
                        strokeWidth="4"
                        strokeDasharray={113}
                        strokeDashoffset={113 - (113 * metrics.payoutRate) / 100}
                        strokeLinecap="round"
                        stroke={brandColor}
                        fill="transparent"
                        className="transition-all duration-700 ease-out"
                      />
                    </svg>
                    <span className="absolute font-mono font-bold text-xs text-slate-800 dark:text-white">
                      {metrics.payoutRate}%
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Tasa de Pago
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      {metrics.payoutsCount} pagos emitidos
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {formatGs(metrics.totalPaidCommission)} pagados
                    </span>
                  </div>
                </div>

                {/* Gauge 2: Source Breakdown (Servicios vs Productos) */}
                <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <div className="relative h-14 w-14 shrink-0 flex items-center justify-center">
                    <svg className="h-14 w-14 -rotate-90" viewBox="0 0 44 44">
                      <circle
                        cx="22"
                        cy="22"
                        r="18"
                        className="text-amber-500/20"
                        strokeWidth="4"
                        stroke="currentColor"
                        fill="transparent"
                      />
                      <circle
                        cx="22"
                        cy="22"
                        r="18"
                        strokeWidth="4"
                        strokeDasharray={113}
                        strokeDashoffset={113 - (113 * metrics.servicesSharePct) / 100}
                        strokeLinecap="round"
                        stroke="#6366f1"
                        fill="transparent"
                        className="transition-all duration-700 ease-out"
                      />
                    </svg>
                    <span className="absolute font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                      {metrics.servicesSharePct}%
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Origen de Ganancia
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      {metrics.servicesSharePct}% Servicios
                    </span>
                    <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">
                      {metrics.productsSharePct}% Productos
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Summary Pill Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-center">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block">Total Ganado</span>
                <span className="font-mono font-extrabold text-xs text-slate-900 dark:text-white">
                  {formatGs(metrics.totalCommissionEarned)}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block">Por Liquidar</span>
                <span
                  className={`font-mono font-extrabold text-xs ${
                    metrics.pendingCommission > 0
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {formatGs(metrics.pendingCommission)}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block">Facturación</span>
                <span className="font-mono font-extrabold text-xs text-slate-900 dark:text-white">
                  {formatGs(metrics.totalBilled)}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block">Equipo Activo</span>
                <span className="font-mono font-extrabold text-xs text-slate-900 dark:text-white">
                  {staff.length} colaboradores
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Quick Jump & Pending Balances Telemetry */}
          <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-slate-950 p-5 border border-slate-200/70 dark:border-slate-800/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Wallet className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Acceso Rápido & Navegación
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold">
                  Secciones
                </span>
              </div>

              {/* Navigation Link Cards */}
              <div className="space-y-2 pt-3">
                <a
                  href="#seccion-equipo"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-100 dark:border-slate-800 transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-600">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-primary transition">
                        Equipo & Desglose
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {staff.length} profesionales con % servicios vs productos
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">↗</span>
                </a>

                <a
                  href="#seccion-turnos"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-100 dark:border-slate-800 transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600">
                      <Scissors className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-primary transition">
                        Servicios & Ventas Detalladas
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {allEarnedItems.length} transacciones auditadas
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">↗</span>
                </a>

                <a
                  href="#seccion-historial"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-100 dark:border-slate-800 transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                      <Receipt className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-primary transition">
                        Recibos Oficiales Emitidos
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {commissionPayouts.length} recibos generados
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">↗</span>
                </a>
              </div>
            </div>

            {/* Direct Payout CTA Banner */}
            <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                ¿Listo para liquidar saldos?
              </span>
              <button
                type="button"
                onClick={() => handleOpenLiquidar()}
                className="text-xs font-bold px-3 py-1.5 rounded-xl text-white transition hover:brightness-110 cursor-pointer"
                style={{ backgroundColor: brandColor }}
              >
                Pagar Comisión
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ SECTION 1: COLLABORATOR CARDS & PROFILE BREAKDOWN (% SERVICIOS VS % PRODUCTOS) ═══ */}
      <div id="seccion-equipo" className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" style={{ color: brandColor }} />
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Equipo & Desglose de Ganancias
            </h2>
          </div>
          <span className="hidden sm:inline text-xs text-slate-400">
            Revisá el origen del dinero (% servicios vs % productos) por cada colaborador.
          </span>
        </div>

        {/* Mobile Apple Inset Grouped Collaborators List */}
        <div className="block md:hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden shadow-xs">
          {staffSummaries.map((summary) => {
            const st = summary.staff;
            const hasPending = summary.pendingCommission > 0;
            return (
              <div
                key={st.id}
                onClick={() => {
                  triggerHaptic("selection");
                  setSelectedStaffId(st.id);
                  const el = document.getElementById("seccion-turnos");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="p-3.5 flex items-center justify-between gap-3 active:bg-slate-50 dark:active:bg-slate-800/50 transition cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-black text-white text-xs shadow-xs"
                    style={{ backgroundColor: st.color || brandColor }}
                  >
                    {st.avatar}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                        {st.name}
                      </h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {st.role}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {st.commissionPercentage}% serv · {st.productCommissionPercentage ?? 10}% prod
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 text-right">
                  <div>
                    <span
                      className={`font-mono font-black text-sm block ${
                        hasPending
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-slate-400"
                      }`}
                    >
                      {formatGs(summary.pendingCommission)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {hasPending ? "Por pagar" : "Al día"}
                    </span>
                  </div>

                  {hasPending ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerHaptic("medium");
                        handleOpenLiquidar(st.id);
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs active:scale-95 transition cursor-pointer"
                      style={{ backgroundColor: brandColor }}
                    >
                      Pagar
                    </button>
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Grid Cards */}
        <div
          data-tour="comisiones-staff-list"
          className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {staffSummaries.map((summary) => {
            const st = summary.staff;
            const roleDef = ROLE_CONFIG[st.systemRole || "barbero"] || ROLE_CONFIG.barbero;
            const RoleIcon = roleDef.icon;

            return (
              <Card
                key={st.id}
                className="p-5 flex flex-col justify-between border border-slate-200/90 dark:border-slate-800 hover:border-primary/50 transition shadow-xs rounded-2xl bg-white dark:bg-slate-950"
              >
                <div>
                  {/* Top Bar: Avatar, Role Badge & Name */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-2xl font-black text-white text-sm shadow-xs"
                        style={{ backgroundColor: st.color || brandColor }}
                      >
                        {st.avatar}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {st.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {st.role}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-xl border ${roleDef.badgeClass}`}
                    >
                      <RoleIcon className="h-3 w-3" />
                      <span>{roleDef.label}</span>
                    </span>
                  </div>

                  {/* Configured Commission Rates */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-900/80 p-2.5 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-semibold">Tasa en Servicios</span>
                      <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 font-mono">
                        {st.commissionPercentage}%
                      </span>
                    </div>

                    <div className="rounded-xl bg-slate-50 dark:bg-slate-900/80 p-2.5 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-semibold">Tasa en Productos</span>
                      <span className="text-sm font-black text-amber-600 dark:text-amber-400 font-mono">
                        {st.productCommissionPercentage ?? 10}%
                      </span>
                    </div>
                  </div>

                  {/* Financial Origin Breakdown */}
                  <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        Origen de sus Ganancias:
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono text-[11px]">
                        {formatGs(summary.totalEarned)}
                      </span>
                    </div>

                    {/* Dual Color Progress Bar */}
                    <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
                      <div
                        className="bg-indigo-600 h-full transition-all duration-500"
                        style={{ width: `${summary.servicesSharePercent}%` }}
                        title={`Servicios: ${summary.servicesSharePercent}% (${formatGs(summary.servicesCommission)})`}
                      />
                      <div
                        className="bg-amber-500 h-full transition-all duration-500"
                        style={{ width: `${summary.productsSharePercent}%` }}
                        title={`Productos: ${summary.productsSharePercent}% (${formatGs(summary.productsCommission)})`}
                      />
                    </div>

                    {/* Percentage and Money Badges */}
                    <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-indigo-600 shrink-0" />
                        <div>
                          <span className="font-bold text-indigo-700 dark:text-indigo-400 block">
                            {summary.servicesSharePercent}% Servicios
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatGs(summary.servicesCommission)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                        <div>
                          <span className="font-bold text-amber-700 dark:text-amber-400 block">
                            {summary.productsSharePercent}% Productos
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatGs(summary.productsCommission)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Advance Balance Warning if any */}
                  {summary.advanceBalance > 0 && (
                    <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 flex items-center justify-between text-xs">
                      <span className="text-rose-700 dark:text-rose-300 font-medium">
                        Vale / Adelanto previo:
                      </span>
                      <span className="font-mono font-bold text-rose-700 dark:text-rose-400">
                        -{formatGs(summary.advanceBalance)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer with Balance & Direct Pay Action */}
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-baseline justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-500">Saldo a cobrar:</span>
                    <span
                      className={`text-base font-black font-mono ${
                        summary.pendingCommission > 0
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {formatGs(summary.pendingCommission)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenLiquidar(st.id)}
                      className="flex-1 rounded-xl py-2 text-xs font-bold text-white transition hover:brightness-110 cursor-pointer text-center"
                      style={{ backgroundColor: brandColor }}
                    >
                      Pagar al Colaborador
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStaffId(st.id);
                        const el = document.getElementById("seccion-turnos");
                        el?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 text-xs font-bold transition cursor-pointer"
                    >
                      Ver Detalle
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ═══ SECTION 2: SERVICES & PRODUCTS BREAKDOWN TABLE ═══ */}
      <div id="seccion-turnos" className="pt-4">
        <Card
          data-tour="comisiones-turnos-table"
          className="overflow-hidden p-0 border border-slate-200/80 dark:border-slate-800 shadow-xs rounded-2xl bg-white dark:bg-slate-950"
        >
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Scissors className="h-4 w-4" style={{ color: brandColor }} />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Servicios y Productos Vendidos en el Período
                </h3>
              </div>
              <p className="hidden sm:block text-xs text-slate-400 mt-0.5">
                Cada servicio completado y producto vendido con su ganancia calculada de forma directa.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-xl border border-slate-200/60 dark:border-slate-800">
                {allEarnedItems.length} ventas y servicios
              </span>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                  <th className="py-3.5 px-4">Fecha y Hora</th>
                  <th className="py-3.5 px-4">Tipo</th>
                  <th className="py-3.5 px-4">Profesional</th>
                  <th className="py-3.5 px-4">Cliente</th>
                  <th className="py-3.5 px-4">Concepto</th>
                  <th className="py-3.5 px-4 text-right">Cobrado</th>
                  <th className="py-3.5 px-4 text-center">% Ganancia</th>
                  <th className="py-3.5 px-4 text-right">Comisión</th>
                  <th className="py-3.5 px-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {allEarnedItems.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                      No hay registros en el período y filtro seleccionado.
                    </td>
                  </tr>
                ) : (
                  allEarnedItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition">
                      <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                        {new Date(item.date).toLocaleDateString("es-PY", {
                          day: "2-digit",
                          month: "short",
                        })}{" "}
                        {new Date(item.date).toLocaleTimeString("es-PY", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        {item.type === "service" ? (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 text-[11px] font-bold border border-indigo-500/20">
                            <Scissors className="h-3 w-3" />
                            Servicio
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 text-[11px] font-bold border border-amber-500/20">
                            <ShoppingBag className="h-3 w-3" />
                            Producto
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {item.staffName}
                        </span>
                        <span className="text-[10px] text-slate-400">{item.staffRole}</span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {item.clientName}
                      </td>
                      <td className="py-3.5 px-4 max-w-[200px] truncate text-slate-800 dark:text-slate-200">
                        {item.concept}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-800 dark:text-slate-200 font-semibold">
                        {formatGs(item.chargedAmount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-bold font-mono text-slate-700 dark:text-slate-300">
                          {item.commissionPercentage}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-600 dark:text-emerald-400">
                        {formatGs(item.commissionAmount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3" />
                          Cobrado
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile View: Apple Inset Grouped List */}
          <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
            {allEarnedItems.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No hay registros en el período y filtro seleccionado.
              </div>
            ) : (
              allEarnedItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 flex items-center justify-between gap-3 active:bg-slate-50 dark:active:bg-slate-900/50 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2.5 rounded-2xl shrink-0 ${
                        item.type === "service"
                          ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {item.type === "service" ? (
                        <Scissors className="h-4 w-4" />
                      ) : (
                        <ShoppingBag className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {item.concept}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                          {item.commissionPercentage}%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {item.staffName} · {item.clientName}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(item.date).toLocaleDateString("es-PY", {
                          day: "2-digit",
                          month: "short",
                        })}{" "}
                        {new Date(item.date).toLocaleTimeString("es-PY", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400 block">
                      +{formatGs(item.commissionAmount)}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 block">
                      Cobrado {formatGs(item.chargedAmount)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* ═══ SECTION 3: PAYOUTS HISTORY & OFFICIAL RECEIPTS ═══ */}
      <div id="seccion-historial" className="pt-4">
        <Card
          data-tour="comisiones-payouts-table"
          className="overflow-hidden p-0 border border-slate-200/80 dark:border-slate-800 shadow-xs rounded-2xl bg-white dark:bg-slate-950"
        >
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4" style={{ color: brandColor }} />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Historial de Pagos & Recibos Emitidos
                </h3>
              </div>
              <p className="hidden sm:block text-xs text-slate-400 mt-0.5">
                Comprobantes de pago con el desglose exacto de servicios y productos.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenLiquidar()}
              className="text-xs font-bold text-primary hover:underline cursor-pointer flex items-center gap-1"
              style={{ color: brandColor }}
            >
              <Plus className="h-3.5 w-3.5" />
              Pagar Comisión
            </button>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                  <th className="py-3.5 px-4">Recibo #</th>
                  <th className="py-3.5 px-4">Fecha Pago</th>
                  <th className="py-3.5 px-4">Profesional</th>
                  <th className="py-3.5 px-4">Período</th>
                  <th className="py-3.5 px-4">Desglose (% Origen)</th>
                  <th className="py-3.5 px-4">Método</th>
                  <th className="py-3.5 px-4 text-right">Total Pagado</th>
                  <th className="py-3.5 px-4 text-center">Recibo Oficial</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {commissionPayouts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No hay pagos registrados hasta el momento.
                    </td>
                  </tr>
                ) : (
                  commissionPayouts.map((p) => {
                    const servPct = p.servicesSharePercent ?? 90;
                    const prodPct = p.productsSharePercent ?? 10;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition">
                        <td className="py-3.5 px-4 font-mono font-black" style={{ color: brandColor }}>
                          {p.receiptNumber || `#${p.id.slice(0, 8)}`}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400">
                          {new Date(p.paidAt).toLocaleDateString("es-PY")}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          {p.staffName}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                          {new Date(p.periodStart).toLocaleDateString("es-PY", { day: "2-digit", month: "short" })} -{" "}
                          {new Date(p.periodEnd).toLocaleDateString("es-PY", { day: "2-digit", month: "short" })}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2 text-[10.5px]">
                            <span className="inline-flex items-center gap-1 font-semibold text-indigo-700 dark:text-indigo-400">
                              <Scissors className="h-3 w-3" />
                              <span>{servPct}%</span>
                            </span>
                            <span className="text-slate-300 dark:text-slate-600">/</span>
                            <span className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-400">
                              <ShoppingBag className="h-3 w-3" />
                              <span>{prodPct}%</span>
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                            {p.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                          {formatGs(p.amountPaid)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedPayoutReceipt(p)}
                            className="inline-flex items-center gap-1 text-xs font-bold hover:underline px-2.5 py-1 rounded-lg transition cursor-pointer"
                            style={{ color: brandColor }}
                          >
                            <Receipt className="h-3.5 w-3.5" />
                            <span>Ver Recibo</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile View: Apple Inset Grouped List */}
          <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
            {commissionPayouts.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No hay pagos registrados hasta el momento.
              </div>
            ) : (
              commissionPayouts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    triggerHaptic("selection");
                    setSelectedPayoutReceipt(p);
                  }}
                  className="p-3.5 flex items-center justify-between gap-3 active:bg-slate-50 dark:active:bg-slate-900/50 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="p-2.5 rounded-2xl shrink-0"
                      style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                    >
                      <Receipt className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {p.staffName}
                        </span>
                        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {p.paymentMethod}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {p.receiptNumber || `#${p.id.slice(0, 8)}`}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(p.periodStart).toLocaleDateString("es-PY", { day: "2-digit", month: "short" })} – {new Date(p.periodEnd).toLocaleDateString("es-PY", { day: "2-digit", month: "short" })}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex items-center gap-2">
                    <div>
                      <span className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400 block">
                        {formatGs(p.amountPaid)}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        Ver recibo
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* ═══ MODAL 1: LIQUIDAR / PAGAR COMISIÓN ═══ */}
      <Modal
        open={isLiquidarModalOpen}
        onClose={() => setIsLiquidarModalOpen(false)}
        maxWidth="max-w-xl"
        title="Pagar Comisión a Profesional"
      >
        <form onSubmit={handleConfirmLiquidation} className="space-y-4 text-xs">
          {/* Staff Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Seleccionar Colaborador *
            </label>
            <CustomSelect
              value={liqStaffId}
              onChange={(val) => {
                setLiqStaffId(val);
                const s = staffMap.get(val);
                setLiqAdvancesDeducted(s?.advanceBalance || 0);
              }}
              options={liqStaffOptions}
              className="w-full"
              buttonClassName="w-full bg-white dark:bg-slate-800"
            />
          </div>

          {/* Breakdown calculation card: SERVICIOS VS PRODUCTOS */}
          {selectedLiquidationStaff && (
            <div className="rounded-2xl border border-primary/20 bg-primary/5 dark:bg-primary/10 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-primary/10">
                <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                  Resumen de Ganancias a Liquidar
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {liquidationData.itemsCount} registros acumulados
                </span>
              </div>

              {/* Service commission line */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Scissors className="h-3.5 w-3.5 text-indigo-500" />
                  <span>
                    Comisión por Servicios ({selectedLiquidationStaff.commissionPercentage}% sobre{" "}
                    {formatGs(liquidationData.servicesBilled)}):
                  </span>
                </span>
                <div className="text-right">
                  <span className="font-mono font-bold text-indigo-700 dark:text-indigo-400 block">
                    +{formatGs(liquidationData.servicesCommission)}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    ({liquidationData.servicesShare}% del total)
                  </span>
                </div>
              </div>

              {/* Products commission line */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <ShoppingBag className="h-3.5 w-3.5 text-amber-500" />
                  <span>
                    Comisión por Productos ({selectedLiquidationStaff.productCommissionPercentage ?? 10}% sobre{" "}
                    {formatGs(liquidationData.productsBilled)}):
                  </span>
                </span>
                <div className="text-right">
                  <span className="font-mono font-bold text-amber-700 dark:text-amber-400 block">
                    +{formatGs(liquidationData.productsCommission)}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    ({liquidationData.productsShare}% del total)
                  </span>
                </div>
              </div>

              {/* Advances Deduction */}
              <div className="pt-2 border-t border-primary/10">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    Descontar Vales / Adelantos Previos (Gs.):
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={10000}
                    value={liqAdvancesDeducted}
                    onChange={(e) => setLiqAdvancesDeducted(Number(e.target.value))}
                    className="w-32 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-right font-mono font-bold text-rose-600 focus:border-primary outline-none"
                  />
                </div>
              </div>

              {/* Net to pay highlight */}
              <div className="flex items-baseline justify-between pt-2 border-t border-primary/20">
                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Monto Total a Pagar:
                </span>
                <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                  {formatGs(liquidationNet)}
                </span>
              </div>
            </div>
          )}

          {/* Payment Method Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Medio de Pago *
              </label>
              <CustomSelect
                value={liqPaymentMethod}
                onChange={(val) => setLiqPaymentMethod(val as any)}
                options={liqPaymentMethodOptions}
                className="w-full"
                buttonClassName="w-full bg-white dark:bg-slate-800"
              />
            </div>

            {/* Auto Cash Movement Switch */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/5">
              <div>
                <span className="block font-bold text-xs text-slate-900 dark:text-white">
                  Descontar de Caja Diaria
                </span>
                <span className="text-[10px] text-slate-500">Registra salida de caja</span>
              </div>
              <input
                type="checkbox"
                checked={liqAutoCashExpense}
                onChange={(e) => setLiqAutoCashExpense(e.target.checked)}
                className="h-4 w-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notas u Observaciones del Pago
            </label>
            <input
              type="text"
              value={liqNotes}
              onChange={(e) => setLiqNotes(e.target.value)}
              placeholder="Ej: Pago quincenal conforme por Itaú / Recibo firmado"
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/5">
            <button
              type="button"
              onClick={() => setIsLiquidarModalOpen(false)}
              className="rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-xl px-5 py-2 font-black text-white shadow-md transition hover:brightness-110 cursor-pointer"
              style={{ backgroundColor: brandColor }}
            >
              Confirmar y Emitir Recibo
            </button>
          </div>
        </form>
      </Modal>

      {/* ═══ MODAL 2: OFFICIAL PRINTABLE RECEIPT / FACTURA ═══ */}
      <Modal
        open={!!selectedPayoutReceipt}
        onClose={() => setSelectedPayoutReceipt(null)}
        maxWidth="max-w-lg"
        title="Recibo Oficial de Pago"
      >
        {selectedPayoutReceipt && (
          <div className="space-y-4 text-xs">
            {/* Printable Receipt Box */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-white/15 space-y-4 text-slate-800 dark:text-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
                <div>
                  <h4 className="font-black text-base text-slate-900 dark:text-white">
                    {business.name || "Barbería & Studio AgendatePY"}
                  </h4>
                  <p className="text-[10px] text-slate-400">RUC: 80099881-2 — Asunción, Paraguay</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-black text-sm block" style={{ color: brandColor }}>
                    {selectedPayoutReceipt.receiptNumber}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(selectedPayoutReceipt.paidAt).toLocaleDateString("es-PY")}
                  </span>
                </div>
              </div>

              {/* Beneficiary Details */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Colaborador:</span>
                  <strong className="text-slate-900 dark:text-white">{selectedPayoutReceipt.staffName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cargo:</span>
                  <span>{selectedPayoutReceipt.staffRole || "Especialista"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Período de Liquidación:</span>
                  <span className="font-mono text-[11px]">
                    {new Date(selectedPayoutReceipt.periodStart).toLocaleDateString("es-PY")} al{" "}
                    {new Date(selectedPayoutReceipt.periodEnd).toLocaleDateString("es-PY")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Medio de Pago:</span>
                  <span className="font-bold">{selectedPayoutReceipt.paymentMethod}</span>
                </div>
              </div>

              {/* Financial breakdown */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-white/10 space-y-2">
                <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider block border-b border-slate-200 dark:border-white/10 pb-1.5">
                  Desglose de Origen del Dinero
                </span>

                {/* Services Share */}
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <Scissors className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Comisión por Servicios:</span>
                  </span>
                  <div className="text-right">
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {formatGs(
                        selectedPayoutReceipt.servicesCommission ??
                          Math.round(selectedPayoutReceipt.grossCommission * 0.9)
                      )}
                    </span>
                    <span className="text-[10px] text-slate-500 ml-1.5 font-bold">
                      ({selectedPayoutReceipt.servicesSharePercent ?? 90}%)
                    </span>
                  </div>
                </div>

                {/* Products Share */}
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <ShoppingBag className="h-3.5 w-3.5 text-amber-500" />
                    <span>Comisión por Productos:</span>
                  </span>
                  <div className="text-right">
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                      {formatGs(
                        selectedPayoutReceipt.productsCommission ??
                          Math.round(selectedPayoutReceipt.grossCommission * 0.1)
                      )}
                    </span>
                    <span className="text-[10px] text-slate-500 ml-1.5 font-bold">
                      ({selectedPayoutReceipt.productsSharePercent ?? 10}%)
                    </span>
                  </div>
                </div>

                {/* Advances Deducted */}
                {selectedPayoutReceipt.advancesDeducted > 0 && (
                  <div className="flex justify-between text-rose-600 pt-1 border-t border-slate-200 dark:border-white/10">
                    <span>Vales / Adelantos descontados:</span>
                    <span className="font-mono font-bold">-{formatGs(selectedPayoutReceipt.advancesDeducted)}</span>
                  </div>
                )}

                {/* Total Paid */}
                <div className="flex justify-between text-sm font-black pt-2 border-t border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                  <span>TOTAL PAGADO:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">
                    {formatGs(selectedPayoutReceipt.amountPaid)}
                  </span>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-6 pt-6 text-center text-[10px] text-slate-400">
                <div className="border-t border-slate-300 dark:border-white/20 pt-1">
                  <span>Firma Administrador</span>
                </div>
                <div className="border-t border-slate-300 dark:border-white/20 pt-1">
                  <span>Firma de Conformidad</span>
                </div>
              </div>
            </div>

            {/* Actions for receipt */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5 text-slate-500" />
                  <span>Imprimir</span>
                </button>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `*Comprobante de Pago #${selectedPayoutReceipt.receiptNumber}*\n` +
                      `Negocio: ${business.name || "AgendatePY"}\n` +
                      `Colaborador: ${selectedPayoutReceipt.staffName}\n` +
                      `Servicios: ${selectedPayoutReceipt.servicesSharePercent ?? 90}%\n` +
                      `Productos: ${selectedPayoutReceipt.productsSharePercent ?? 10}%\n` +
                      `Total pagado: ${formatGs(selectedPayoutReceipt.amountPaid)}\n` +
                      `Método: ${selectedPayoutReceipt.paymentMethod}\n` +
                      `¡Gracias por tu trabajo en el equipo!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPayoutReceipt(null)}
                className="rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ═══ MODAL 3: COMMISSION RULES CONFIGURATION ═══ */}
      <Modal
        open={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
        maxWidth="max-w-xl"
        title="Configurar Porcentajes de Ganancia"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-500 dark:text-slate-400">
            Ajustá cuánto gana cada miembro de tu equipo por realizar servicios y por vender productos en el mostrador.
          </p>

          <div className="divide-y divide-slate-100 dark:divide-white/5 space-y-3">
            {staff.map((st) => {
              const roleDef = ROLE_CONFIG[st.systemRole || "barbero"] || ROLE_CONFIG.barbero;
              const RoleIcon = roleDef.icon;
              const currentRule = rulesDraft[st.id] || { servicePct: 50, productPct: 10 };

              return (
                <div key={st.id} className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-xl font-bold text-white text-xs shrink-0"
                      style={{ backgroundColor: st.color || brandColor }}
                    >
                      {st.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">{st.name}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${roleDef.badgeClass}`}>
                          {roleDef.label}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">{st.role}</span>
                    </div>
                  </div>

                  {/* Inputs for Services % and Products % */}
                  <div className="flex items-center gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400">
                        % Servicios
                      </label>
                      <div className="relative mt-0.5">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={currentRule.servicePct}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setRulesDraft((prev) => ({
                              ...prev,
                              [st.id]: { ...prev[st.id], servicePct: val },
                            }));
                          }}
                          className="w-20 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 py-1 pl-2.5 pr-6 text-xs font-mono font-bold text-primary focus:border-primary outline-none"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[10px]">
                          %
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400">
                        % Productos
                      </label>
                      <div className="relative mt-0.5">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={currentRule.productPct}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setRulesDraft((prev) => ({
                              ...prev,
                              [st.id]: { ...prev[st.id], productPct: val },
                            }));
                          }}
                          className="w-20 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 py-1 pl-2.5 pr-6 text-xs font-mono font-bold text-amber-600 focus:border-amber-500 outline-none"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[10px]">
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-white/5">
            <button
              type="button"
              onClick={() => setIsRulesModalOpen(false)}
              className="rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveRules}
              className="rounded-xl px-5 py-2 font-bold text-white shadow-md transition hover:brightness-110 cursor-pointer"
              style={{ backgroundColor: brandColor }}
            >
              Guardar Porcentajes
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
