"use client";

import AnimatedValue from "@/components/dashboard/ui/AnimatedValue";

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
  Landmark,
  CreditCard,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
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

const COMMISSION_LABEL_CLASS = "mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300";
const COMMISSION_INPUT_CLASS =
  "min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-slate-800 dark:text-white sm:min-h-10 sm:text-sm";

const LIQ_PAYMENT_METHODS = [
  { value: "Transferencia", label: "Transferencia", icon: Landmark },
  { value: "Efectivo", label: "Efectivo", icon: Banknote },
  { value: "POS Bancard", label: "POS / Tarjeta", icon: CreditCard },
] as const;

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

  // An item is already settled when it falls inside the period of a previous payout to the same staff member
  const isItemSettled = useMemo(() => {
    const windowsByStaff = new Map<string, Array<[number, number]>>();
    commissionPayouts.forEach((p) => {
      if (p.status !== "PAID") return;
      const windows = windowsByStaff.get(p.staffId) ?? [];
      windows.push([new Date(p.periodStart).getTime(), new Date(p.periodEnd).getTime()]);
      windowsByStaff.set(p.staffId, windows);
    });
    return (staffId: string, date: string) => {
      const time = new Date(date).getTime();
      return (windowsByStaff.get(staffId) ?? []).some(([start, end]) => time >= start && time <= end);
    };
  }, [commissionPayouts]);

  // 1. Calculate Earned Services (Appointments) for every staff member in the period
  const periodServicesItems = useMemo(() => {
    return appointments
      .filter((app) => {
        const isCompleted = app.status === "completed";
        const appDate = new Date(app.start);
        const inDateRange = period === "all" || (appDate >= dateRange.start && appDate <= dateRange.end);
        return isCompleted && inDateRange;
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
          isSettled: isItemSettled(app.staffId, app.start),
        };
      });
  }, [appointments, period, dateRange, serviceMap, staffMap, isItemSettled]);

  // 2. Calculate Earned Products (Orders sold by staff) for every staff member in the period
  const periodProductsItems = useMemo(() => {
    return productOrders
      .filter((order) => {
        const isDelivered = order.status === "delivered" || order.status === "confirmed";
        const sellerId = order.sellerStaffId || "st-leticia"; // Default to counter if not specified
        const orderDate = new Date(order.createdAt);
        const inDateRange = period === "all" || (orderDate >= dateRange.start && orderDate <= dateRange.end);
        return isDelivered && inDateRange;
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
          isSettled: isItemSettled(sellerId, order.createdAt),
        };
      });
  }, [productOrders, period, dateRange, staffMap, isItemSettled]);

  // Items narrowed to the staff filter, used by the summary and the transactions table
  const earnedServicesItems = useMemo(
    () => periodServicesItems.filter((i) => selectedStaffId === "ALL" || i.staffId === selectedStaffId),
    [periodServicesItems, selectedStaffId]
  );
  const earnedProductsItems = useMemo(
    () => periodProductsItems.filter((i) => selectedStaffId === "ALL" || i.staffId === selectedStaffId),
    [periodProductsItems, selectedStaffId]
  );

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

    // Payouts for the current staff selection whose period overlaps the selected range
    const relevantPayouts = commissionPayouts.filter(
      (p) =>
        (selectedStaffId === "ALL" || p.staffId === selectedStaffId) &&
        (period === "all" ||
          (new Date(p.periodEnd) >= dateRange.start && new Date(p.periodStart) <= dateRange.end))
    );
    const allItems = [...earnedServicesItems, ...earnedProductsItems];
    const totalPaidCommission = allItems
      .filter((i) => i.isSettled)
      .reduce((acc, i) => acc + i.commissionAmount, 0);
    const pendingCommission = totalCommissionEarned - totalPaidCommission;

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
  }, [earnedServicesItems, earnedProductsItems, commissionPayouts, selectedStaffId, period, dateRange]);

  // Per-staff summary calculation with Services vs Products % Breakdown
  const staffSummaries = useMemo(() => {
    return staff.map((st) => {
      const staffServices = periodServicesItems.filter((i) => i.staffId === st.id);
      const staffProducts = periodProductsItems.filter((i) => i.staffId === st.id);

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

      const staffPaid = [...staffServices, ...staffProducts]
        .filter((i) => i.isSettled)
        .reduce((acc, i) => acc + i.commissionAmount, 0);
      const staffPending = totalEarned - staffPaid;

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
  }, [staff, periodServicesItems, periodProductsItems]);

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
        alreadyPaidCommission: 0,
        alreadyPaidCount: 0,
      };
    }
    // Only items not covered by a previous payout, so nothing is paid twice
    const staffItems = [...periodServicesItems, ...periodProductsItems].filter(
      (i) => i.staffId === selectedLiquidationStaff.id
    );
    const settledItems = staffItems.filter((i) => i.isSettled);
    const stServices = periodServicesItems.filter((i) => i.staffId === selectedLiquidationStaff.id && !i.isSettled);
    const stProducts = periodProductsItems.filter((i) => i.staffId === selectedLiquidationStaff.id && !i.isSettled);

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
      alreadyPaidCommission: settledItems.reduce((acc, i) => acc + i.commissionAmount, 0),
      alreadyPaidCount: settledItems.length,
    };
  }, [selectedLiquidationStaff, periodServicesItems, periodProductsItems]);

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
    }, { registerCashExpense: liqAutoCashExpense });

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

  const hasLiquidationAmount = liquidationNet > 0;

  // Sum per-staff balances so one collaborator's overpayment never hides another's debt
  const pendingSummaries = staffSummaries.filter(
    (s) => (selectedStaffId === "ALL" || s.staff.id === selectedStaffId) && s.pendingCommission > 0
  );
  const pendingStaffCount = pendingSummaries.length;
  const pendingCommissionTotal = pendingSummaries.reduce((acc, s) => acc + s.pendingCommission, 0);
  const hasPendingCommission = pendingCommissionTotal > 0;
  const hasEarnedCommission = metrics.totalCommissionEarned > 0;
  const transactionsCount = metrics.totalServicesCount + metrics.totalProductsCount;
  const selectedStaffName =
    selectedStaffId === "ALL" ? null : staff.find((s) => s.id === selectedStaffId)?.name ?? null;

  const formatShortDate = (value: string | number | Date) =>
    new Date(value).toLocaleDateString("es-PY", { day: "2-digit", month: "short" });
  const formatTime = (value: string | number | Date) =>
    new Date(value).toLocaleTimeString("es-PY", { hour: "2-digit", minute: "2-digit" });

  const scrollToTransactions = (staffId: string) => {
    triggerHaptic("selection");
    setSelectedStaffId(staffId);
    // The dashboard shell mounts desktop and mobile layouts, so pick the visible copy
    const target = Array.from(document.querySelectorAll<HTMLElement>("#seccion-turnos")).find(
      (el) => el.offsetParent !== null
    );
    target?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="w-full max-w-full space-y-5 pb-24 sm:space-y-6 sm:pb-10">
      {/* ═══ PAGE HEADER ═══ */}
      <header
        data-tour="comisiones-header"
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Equipo y pagos</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Comisiones
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-zinc-400">
            Calculá lo que ganó cada colaborador y registrá sus pagos con recibo.
          </p>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
          <button
            type="button"
            data-tour="comisiones-rules"
            onClick={() => setIsRulesModalOpen(true)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 glass-panel-subtle px-3.5 text-xs font-semibold text-slate-700 transition hover:bg-white/10 dark:text-zinc-200"
          >
            <Sliders className="h-4 w-4 text-slate-400" />
            <span>Reglas %</span>
          </button>
          <button
            type="button"
            data-tour="comisiones-liquidar-btn"
            onClick={() => handleOpenLiquidar()}
            className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-2xl px-4 text-xs font-semibold text-white shadow-sm transition hover:brightness-110 active:scale-[0.98] sm:text-sm"
            style={{ backgroundColor: brandColor }}
          >
            <Plus className="h-4 w-4" />
            <span>Pagar comisión</span>
          </button>
        </div>
      </header>

      {/* ═══ PERIOD SUMMARY ═══ */}
      <section data-tour="comisiones-kpis" className="rounded-3xl glass-panel p-3 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white sm:text-base">Resumen del período</h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
              {transactionsCount} {transactionsCount === 1 ? "transacción" : "transacciones"} ·{" "}
              {staff.length} {staff.length === 1 ? "colaborador" : "colaboradores"}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <CustomSelect
              value={selectedStaffId}
              onChange={(val) => setSelectedStaffId(val)}
              options={staffFilterOptions}
              className="min-w-0"
              buttonClassName="min-h-10 sm:min-w-[180px]"
            />
            <CustomSelect
              value={period}
              onChange={(val) => setPeriod(val)}
              options={periodFilterOptions}
              align="right"
              className="min-w-0"
              buttonClassName="min-h-10 sm:min-w-[150px]"
            />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-white/10 pt-3 sm:mt-4 sm:grid-cols-4 sm:gap-y-0 sm:pt-4">
          {[
            {
              label: "Por liquidar",
              value: formatGs(pendingCommissionTotal),
              detail: hasPendingCommission ? "pendiente de pago" : "equipo al día",
              tone: hasPendingCommission
                ? "text-amber-600 dark:text-amber-400"
                : "text-emerald-600 dark:text-emerald-400",
            },
            {
              label: "Comisiones generadas",
              value: formatGs(metrics.totalCommissionEarned),
              detail: `${metrics.totalServicesCount} serv. · ${metrics.totalProductsCount} prod.`,
            },
            {
              label: "Pagado",
              value: formatGs(metrics.totalPaidCommission),
              detail: "comisión ya liquidada",
            },
            {
              label: "Facturación",
              value: formatGs(metrics.totalBilled),
              detail: "servicios y productos",
            },
          ].map((metric) => (
            <div key={metric.label} className="min-w-0">
              <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">{metric.label}</p>
              <p
                className={`mt-1 truncate text-base font-semibold tabular-nums sm:text-xl ${
                  metric.tone ?? "text-slate-900 dark:text-white"
                }`}
              >
                <AnimatedValue value={metric.value} />
              </p>
              <p className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-zinc-500">{metric.detail}</p>
            </div>
          ))}
        </div>

        {/* Commission origin: services vs products */}
        <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.02] p-3 sm:mt-4 sm:p-3.5">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-slate-700 dark:text-zinc-200">Origen de las comisiones</span>
            {!hasEarnedCommission && (
              <span className="text-[11px] text-slate-500 dark:text-zinc-400">Sin movimientos</span>
            )}
          </div>
          <div className="mt-2.5 flex h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/[0.06]">
            {hasEarnedCommission && (
              <>
                <div
                  className="h-full bg-indigo-500 transition-all duration-500"
                  style={{ width: `${metrics.servicesSharePct}%` }}
                />
                <div
                  className="h-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${metrics.productsSharePct}%` }}
                />
              </>
            )}
          </div>
          <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1.5 text-[11px]">
            <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-zinc-400">
              <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
              Servicios
              <span className="font-semibold tabular-nums text-slate-800 dark:text-zinc-200">
                {hasEarnedCommission ? `${metrics.servicesSharePct}%` : "—"}
              </span>
              <span className="tabular-nums">· {formatGs(metrics.totalServicesCommission)}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-zinc-400">
              <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" />
              Productos
              <span className="font-semibold tabular-nums text-slate-800 dark:text-zinc-200">
                {hasEarnedCommission ? `${metrics.productsSharePct}%` : "—"}
              </span>
              <span className="tabular-nums">· {formatGs(metrics.totalProductsCommission)}</span>
            </span>
          </div>
        </div>

        {/* Payout status banner */}
        <div
          className={`mt-3 flex items-center justify-between gap-2 rounded-2xl border px-2.5 py-2.5 sm:mt-4 sm:px-3.5 sm:py-3 ${
            hasPendingCommission
              ? "border-amber-500/20 bg-amber-500/[0.06]"
              : "border-emerald-500/15 bg-emerald-500/[0.04]"
          }`}
        >
          <div className="flex min-w-0 items-start gap-2.5">
            <span
              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                hasPendingCommission
                  ? "bg-amber-500/10 text-amber-500 dark:text-amber-400"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {hasPendingCommission ? <Wallet className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            </span>
            <span className="min-w-0">
              <span
                className={`block text-xs font-semibold ${
                  hasPendingCommission
                    ? "text-amber-700 dark:text-amber-300"
                    : "text-emerald-700 dark:text-emerald-300"
                }`}
              >
                {hasPendingCommission
                  ? `${pendingStaffCount} ${pendingStaffCount === 1 ? "colaborador tiene" : "colaboradores tienen"} saldo por cobrar`
                  : "Todas las comisiones están pagadas"}
              </span>
              <span className="mt-0.5 block text-[11px] text-slate-500 dark:text-zinc-400">
                {hasPendingCommission
                  ? "Registrá el pago para emitir el recibo y descontarlo del saldo."
                  : "No hay saldos pendientes en el período seleccionado."}
              </span>
            </span>
          </div>
          {hasPendingCommission && (
            <button
              type="button"
              onClick={() => handleOpenLiquidar()}
              className="inline-flex min-h-9 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 px-2.5 text-[11px] font-semibold text-amber-700 transition hover:bg-amber-500/10 dark:text-amber-300 sm:min-h-10 sm:px-3 sm:text-xs"
            >
              Pagar ahora
            </button>
          )}
        </div>
      </section>

      {/* ═══ TEAM CARDS ═══ */}
      <section id="seccion-equipo" className="scroll-mt-6 space-y-3">
        <div className="px-0.5">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Equipo</h2>
            <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
              {staff.length}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
            Saldo de cada colaborador y de dónde viene su ganancia.
          </p>
        </div>

        {staffSummaries.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-12 text-center">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Users className="h-6 w-6" />
            </span>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Todavía no hay colaboradores</h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-zinc-400">
              Agregá a tu equipo para calcular sus comisiones automáticamente.
            </p>
          </div>
        ) : (
          <div data-tour="comisiones-staff-list" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {staffSummaries.map((summary) => {
              const st = summary.staff;
              const roleDef = ROLE_CONFIG[st.systemRole || "barbero"] || ROLE_CONFIG.barbero;
              const RoleIcon = roleDef.icon;
              const hasPending = summary.pendingCommission > 0;
              const isSelected = selectedStaffId === st.id;

              return (
                <article
                  key={st.id}
                  className={`flex flex-col rounded-3xl border glass-panel p-4 transition ${
                    isSelected ? "border-primary/40" : "border-white/10"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold text-white shadow-xs"
                      style={{ backgroundColor: st.color || brandColor }}
                    >
                      {st.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-white">{st.name}</h3>
                      <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                        <RoleIcon className="h-3 w-3" />
                        {roleDef.label}
                      </span>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        hasPending
                          ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                          : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      }`}
                    >
                      {hasPending ? "Por pagar" : "Al día"}
                    </span>
                  </div>

                  <div className="mt-4 flex items-end justify-between gap-3 border-t border-white/10 pt-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Saldo a cobrar</p>
                      <p
                        className={`mt-0.5 truncate text-xl font-semibold tabular-nums ${
                          hasPending ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-zinc-500"
                        }`}
                      >
                        {formatGs(summary.pendingCommission)}
                      </p>
                    </div>
                    <div className="shrink-0 space-y-0.5 text-right text-[11px] text-slate-500 dark:text-zinc-400">
                      <p>
                        Generado{" "}
                        <span className="font-semibold tabular-nums text-slate-700 dark:text-zinc-200">
                          {formatGs(summary.totalEarned)}
                        </span>
                      </p>
                      <p>
                        Pagado{" "}
                        <span className="font-semibold tabular-nums text-slate-700 dark:text-zinc-200">
                          {formatGs(summary.paidCommission)}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Services vs products origin */}
                  <div className="mt-3 flex h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/[0.06]">
                    {summary.totalEarned > 0 && (
                      <>
                        <div
                          className="h-full bg-indigo-500 transition-all duration-500"
                          style={{ width: `${summary.servicesSharePercent}%` }}
                        />
                        <div
                          className="h-full bg-amber-500 transition-all duration-500"
                          style={{ width: `${summary.productsSharePercent}%` }}
                        />
                      </>
                    )}
                  </div>
                  <div className="mt-2.5 grid grid-cols-2 gap-2 text-[11px]">
                    <div className="min-w-0">
                      <span className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400">
                        <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                        Servicios · {st.commissionPercentage}%
                      </span>
                      <span className="mt-0.5 block truncate pl-3.5 font-semibold tabular-nums text-slate-800 dark:text-zinc-200">
                        {formatGs(summary.servicesCommission)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <span className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400">
                        <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                        Productos · {st.productCommissionPercentage ?? 10}%
                      </span>
                      <span className="mt-0.5 block truncate pl-3.5 font-semibold tabular-nums text-slate-800 dark:text-zinc-200">
                        {formatGs(summary.productsCommission)}
                      </span>
                    </div>
                  </div>

                  {summary.advanceBalance > 0 && (
                    <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-rose-500/20 bg-rose-500/[0.06] px-3 py-2 text-[11px]">
                      <span className="font-medium text-rose-700 dark:text-rose-300">Vale / adelanto previo</span>
                      <span className="font-semibold tabular-nums text-rose-700 dark:text-rose-300">
                        -{formatGs(summary.advanceBalance)}
                      </span>
                    </div>
                  )}

                  <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => scrollToTransactions(st.id)}
                      className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.025] px-3 text-xs font-semibold text-slate-600 transition hover:bg-white/[0.06] dark:text-zinc-300"
                    >
                      Ver detalle
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic("medium");
                        handleOpenLiquidar(st.id);
                      }}
                      className={`inline-flex min-h-10 items-center justify-center rounded-xl px-3 text-xs font-semibold transition ${
                        hasPending
                          ? "text-white shadow-sm hover:brightness-110"
                          : "border border-white/10 text-slate-500 hover:bg-white/[0.06] dark:text-zinc-400"
                      }`}
                      style={hasPending ? { backgroundColor: brandColor } : undefined}
                    >
                      Pagar
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ═══ SERVICES & PRODUCTS BREAKDOWN ═══ */}
      <section
        id="seccion-turnos"
        data-tour="comisiones-turnos-table"
        className="scroll-mt-6 overflow-hidden rounded-3xl glass-panel"
      >
        <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Servicios y ventas</h2>
              <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                {allEarnedItems.length}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
              Cada servicio completado y producto vendido con su comisión calculada.
            </p>
          </div>
          {selectedStaffName && (
            <button
              type="button"
              onClick={() => setSelectedStaffId("ALL")}
              aria-label={`Quitar filtro de ${selectedStaffName}`}
              className="inline-flex min-h-9 items-center gap-1.5 self-start rounded-xl border border-primary/20 bg-primary/[0.06] px-3 text-xs font-semibold text-primary transition hover:bg-primary/10 sm:self-auto"
            >
              {selectedStaffName}
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {allEarnedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
            <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Scissors className="h-5 w-5" />
            </span>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Sin movimientos</p>
            <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-zinc-400">
              No hay servicios ni ventas en el período y filtro seleccionado.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] text-slate-500 dark:text-zinc-400">
                    <th className="px-5 py-3 font-medium">Fecha</th>
                    <th className="px-4 py-3 font-medium">Concepto</th>
                    <th className="px-4 py-3 font-medium">Profesional</th>
                    <th className="px-4 py-3 font-medium">Cliente</th>
                    <th className="px-4 py-3 text-right font-medium">Cobrado</th>
                    <th className="px-4 py-3 text-center font-medium">%</th>
                    <th className="px-5 py-3 text-right font-medium">Comisión</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                  {allEarnedItems.map((item) => (
                    <tr key={item.id} className="transition hover:bg-slate-50/60 dark:hover:bg-white/[0.02]">
                      <td className="whitespace-nowrap px-5 py-3 tabular-nums text-slate-500 dark:text-zinc-400">
                        <span className="block font-medium text-slate-700 dark:text-zinc-200">{formatShortDate(item.date)}</span>
                        <span className="text-[11px]">{formatTime(item.date)}</span>
                      </td>
                      <td className="max-w-[240px] px-4 py-3">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                              item.type === "service"
                                ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            }`}
                          >
                            {item.type === "service" ? (
                              <Scissors className="h-3.5 w-3.5" />
                            ) : (
                              <ShoppingBag className="h-3.5 w-3.5" />
                            )}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-semibold text-slate-900 dark:text-white">{item.concept}</span>
                            <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                              {item.type === "service" ? "Servicio" : "Producto"}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="block font-medium text-slate-800 dark:text-zinc-200">{item.staffName}</span>
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400">{item.staffRole}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-zinc-300">{item.clientName}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-slate-700 dark:text-zinc-200">
                        {formatGs(item.chargedAmount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-slate-600 dark:bg-white/[0.06] dark:text-zinc-300">
                          {item.commissionPercentage}%
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-right font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                        +{formatGs(item.commissionAmount)}
                        <span
                          className={`block text-[11px] font-medium ${
                            item.isSettled ? "text-slate-400 dark:text-zinc-500" : "text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {item.isSettled ? "Pagada" : "Pendiente"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
            <div className="divide-y divide-slate-100 dark:divide-white/[0.06] md:hidden">
              {allEarnedItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                        item.type === "service"
                          ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {item.type === "service" ? <Scissors className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{item.concept}</p>
                      <p className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-zinc-400">
                        {item.staffName} · {item.clientName}
                      </p>
                      <p className="text-[11px] tabular-nums text-slate-400 dark:text-zinc-500">
                        {formatShortDate(item.date)} · {formatTime(item.date)}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                      +{formatGs(item.commissionAmount)}
                    </p>
                    <p className="mt-0.5 text-[11px] tabular-nums text-slate-500 dark:text-zinc-400">
                      {item.commissionPercentage}% de {formatGs(item.chargedAmount)}
                    </p>
                    <p
                      className={`text-[11px] font-medium ${
                        item.isSettled ? "text-slate-400 dark:text-zinc-500" : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {item.isSettled ? "Pagada" : "Pendiente"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* ═══ PAYOUTS HISTORY & RECEIPTS ═══ */}
      <section
        id="seccion-historial"
        data-tour="comisiones-payouts-table"
        className="scroll-mt-6 overflow-hidden rounded-3xl glass-panel"
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 p-4 sm:p-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Pagos y recibos</h2>
              <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                {commissionPayouts.length}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
              Comprobantes con el desglose de servicios y productos.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleOpenLiquidar()}
            className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl border border-primary/20 bg-primary/[0.06] px-3 text-xs font-semibold text-primary transition hover:bg-primary/10"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Nuevo pago</span>
            <span className="sm:hidden">Pagar</span>
          </button>
        </div>

        {commissionPayouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
            <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Receipt className="h-5 w-5" />
            </span>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Todavía no hay pagos</p>
            <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-zinc-400">
              Cuando pagues una comisión, el recibo va a aparecer acá.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] text-slate-500 dark:text-zinc-400">
                    <th className="px-5 py-3 font-medium">Recibo</th>
                    <th className="px-4 py-3 font-medium">Profesional</th>
                    <th className="px-4 py-3 font-medium">Período</th>
                    <th className="px-4 py-3 font-medium">Origen</th>
                    <th className="px-4 py-3 font-medium">Método</th>
                    <th className="px-4 py-3 text-right font-medium">Total pagado</th>
                    <th className="px-5 py-3 text-right font-medium">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                  {commissionPayouts.map((p) => {
                    const servPct = p.servicesSharePercent ?? 90;
                    const prodPct = p.productsSharePercent ?? 10;

                    return (
                      <tr key={p.id} className="transition hover:bg-slate-50/60 dark:hover:bg-white/[0.02]">
                        <td className="whitespace-nowrap px-5 py-3">
                          <span className="block font-semibold tabular-nums text-slate-900 dark:text-white">
                            {p.receiptNumber || `#${p.id.slice(0, 8)}`}
                          </span>
                          <span className="text-[11px] tabular-nums text-slate-500 dark:text-zinc-400">
                            {new Date(p.paidAt).toLocaleDateString("es-PY")}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800 dark:text-zinc-200">{p.staffName}</td>
                        <td className="whitespace-nowrap px-4 py-3 tabular-nums text-slate-500 dark:text-zinc-400">
                          {formatShortDate(p.periodStart)} – {formatShortDate(p.periodEnd)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="w-28">
                            <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/[0.06]">
                              <div className="h-full bg-indigo-500" style={{ width: `${servPct}%` }} />
                              <div className="h-full bg-amber-500" style={{ width: `${prodPct}%` }} />
                            </div>
                            <p className="mt-1 text-[11px] tabular-nums text-slate-500 dark:text-zinc-400">
                              {servPct}% serv. · {prodPct}% prod.
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-white/[0.06] dark:text-zinc-300">
                            {p.paymentMethod}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold tabular-nums text-slate-900 dark:text-white">
                          {formatGs(p.amountPaid)}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedPayoutReceipt(p)}
                            className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-white/10 px-3 text-xs font-semibold text-slate-600 transition hover:bg-white/[0.06] dark:text-zinc-300"
                          >
                            <Receipt className="h-3.5 w-3.5" />
                            Ver recibo
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
            <div className="divide-y divide-slate-100 dark:divide-white/[0.06] md:hidden">
              {commissionPayouts.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic("selection");
                    setSelectedPayoutReceipt(p);
                  }}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition active:bg-white/[0.04]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Receipt className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{p.staffName}</p>
                      <p className="mt-0.5 truncate text-[11px] tabular-nums text-slate-500 dark:text-zinc-400">
                        {p.receiptNumber || `#${p.id.slice(0, 8)}`} · {p.paymentMethod}
                      </p>
                      <p className="text-[11px] tabular-nums text-slate-400 dark:text-zinc-500">
                        {formatShortDate(p.periodStart)} – {formatShortDate(p.periodEnd)}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <span className="text-sm font-semibold tabular-nums text-slate-900 dark:text-white">
                      {formatGs(p.amountPaid)}
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </section>

      {/* ═══ MODAL 1: LIQUIDAR / PAGAR COMISIÓN ═══ */}
      <Modal
        open={isLiquidarModalOpen}
        onClose={() => setIsLiquidarModalOpen(false)}
        maxWidth="max-w-xl"
        title="Pagar comisión"
        footer={
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={() => setIsLiquidarModalOpen(false)}
              className="min-h-11 rounded-xl border border-slate-200/80 px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5 sm:min-h-10"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="liquidation-form"
              disabled={!hasLiquidationAmount}
              className="min-h-11 rounded-xl px-5 text-xs font-semibold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:brightness-100 sm:min-h-10"
              style={{ backgroundColor: brandColor }}
            >
              {hasLiquidationAmount ? `Pagar ${formatGs(liquidationNet)}` : "Sin monto a pagar"}
            </button>
          </div>
        }
      >
        <form id="liquidation-form" onSubmit={handleConfirmLiquidation} className="space-y-5 text-xs">
          {/* Staff picker */}
          <fieldset>
            <legend className={COMMISSION_LABEL_CLASS}>Colaborador</legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {staff.map((st) => {
                const summary = staffSummaries.find((s) => s.staff.id === st.id);
                const pending = summary?.pendingCommission ?? 0;
                const isSelected = selectedLiquidationStaff?.id === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      triggerHaptic("selection");
                      setLiqStaffId(st.id);
                      setLiqAdvancesDeducted(st.advanceBalance || 0);
                    }}
                    className={`flex min-h-14 w-full min-w-0 items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition ${
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
                    }`}
                  >
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[11px] font-semibold text-white"
                      style={{ backgroundColor: st.color || brandColor }}
                    >
                      {st.avatar}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold text-slate-900 dark:text-white">{st.name}</span>
                      <span
                        className={`mt-0.5 block truncate text-[11px] tabular-nums ${
                          pending > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-500 dark:text-zinc-400"
                        }`}
                      >
                        {pending > 0 ? `${formatGs(pending)} por cobrar` : "Al día"}
                      </span>
                    </span>
                    {isSelected && <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Breakdown */}
          {selectedLiquidationStaff && (
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 dark:border-white/10 dark:bg-white/[0.02]">
              <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 px-4 py-3 dark:border-white/10">
                <span className="text-xs font-semibold text-slate-900 dark:text-white">Pendiente de pago</span>
                <span className="text-[11px] tabular-nums text-slate-500 dark:text-zinc-400">
                  {liquidationData.itemsCount} {liquidationData.itemsCount === 1 ? "registro sin pagar" : "registros sin pagar"}
                </span>
              </div>

              <div className="space-y-3 px-4 py-3.5">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex min-w-0 items-start gap-2.5">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      <Scissors className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-medium text-slate-800 dark:text-zinc-200">Servicios</span>
                      <span className="block text-[11px] tabular-nums text-slate-500 dark:text-zinc-400">
                        {selectedLiquidationStaff.commissionPercentage}% de {formatGs(liquidationData.servicesBilled)}
                      </span>
                    </span>
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums text-slate-900 dark:text-white">
                    {formatGs(liquidationData.servicesCommission)}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <span className="flex min-w-0 items-start gap-2.5">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <ShoppingBag className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-medium text-slate-800 dark:text-zinc-200">Productos</span>
                      <span className="block text-[11px] tabular-nums text-slate-500 dark:text-zinc-400">
                        {selectedLiquidationStaff.productCommissionPercentage ?? 10}% de {formatGs(liquidationData.productsBilled)}
                      </span>
                    </span>
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums text-slate-900 dark:text-white">
                    {formatGs(liquidationData.productsCommission)}
                  </span>
                </div>

                {liquidationData.alreadyPaidCommission > 0 && (
                  <div className="flex items-center justify-between gap-3 text-[11px] text-slate-500 dark:text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      Ya pagado en este período ({liquidationData.alreadyPaidCount}{" "}
                      {liquidationData.alreadyPaidCount === 1 ? "registro" : "registros"})
                    </span>
                    <span className="shrink-0 tabular-nums line-through">{formatGs(liquidationData.alreadyPaidCommission)}</span>
                  </div>
                )}

                <div className="flex flex-col gap-2 border-t border-slate-200/80 pt-3 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
                  <label htmlFor="liq-advances" className="min-w-0">
                    <span className="block font-medium text-slate-800 dark:text-zinc-200">Descontar vales o adelantos</span>
                    <span className="block text-[11px] text-slate-500 dark:text-zinc-400">
                      {(selectedLiquidationStaff.advanceBalance || 0) > 0
                        ? `Tiene ${formatGs(selectedLiquidationStaff.advanceBalance || 0)} en vales`
                        : "Sin vales registrados"}
                    </span>
                  </label>
                  <div className="relative sm:w-40">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-slate-400">
                      Gs.
                    </span>
                    <input
                      id="liq-advances"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={10000}
                      value={liqAdvancesDeducted}
                      onChange={(e) => setLiqAdvancesDeducted(Math.max(0, Number(e.target.value)))}
                      className={`${COMMISSION_INPUT_CLASS} pl-10 text-right tabular-nums`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-b-2xl border-t border-slate-200/80 bg-white/60 px-4 py-3.5 dark:border-white/10 dark:bg-white/[0.03]">
                <span className="text-xs font-semibold text-slate-700 dark:text-zinc-200">Total a pagar</span>
                <span
                  className={`text-xl font-semibold tabular-nums ${
                    hasLiquidationAmount ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-zinc-500"
                  }`}
                >
                  {formatGs(liquidationNet)}
                </span>
              </div>
            </div>
          )}

          {liquidationData.grossCommission <= 0 && (
            <p className="flex items-start gap-2 rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-2.5 text-[11px] text-slate-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-400">
              <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" />
              {liquidationData.alreadyPaidCount > 0
                ? "Todo lo generado en este período ya fue pagado."
                : "Este colaborador no tiene servicios ni ventas en el período seleccionado."}
            </p>
          )}

          {/* Payment method */}
          <fieldset>
            <legend className={COMMISSION_LABEL_CLASS}>Medio de pago</legend>
            <div className="grid grid-cols-3 gap-2">
              {LIQ_PAYMENT_METHODS.map((method) => {
                const MethodIcon = method.icon;
                const isSelected = liqPaymentMethod === method.value;
                return (
                  <button
                    key={method.value}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setLiqPaymentMethod(method.value)}
                    className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl border px-2 text-[11px] font-semibold transition ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:bg-white/[0.06]"
                    }`}
                  >
                    <MethodIcon className="h-4 w-4" />
                    {method.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <label className="flex min-h-14 cursor-pointer items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 dark:border-white/10 dark:bg-white/[0.03]">
            <span className="min-w-0">
              <span className="block text-xs font-semibold text-slate-900 dark:text-white">Registrar salida de caja</span>
              <span className="block text-[11px] text-slate-500 dark:text-zinc-400">
                Descuenta el pago de la caja del día.
              </span>
            </span>
            <input
              type="checkbox"
              role="switch"
              checked={liqAutoCashExpense}
              onChange={(e) => setLiqAutoCashExpense(e.target.checked)}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className="relative h-6 w-10 shrink-0 rounded-full bg-slate-300 transition after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition peer-checked:bg-primary peer-checked:after:translate-x-4 peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 dark:bg-white/15"
            />
          </label>

          <div>
            <label htmlFor="liq-notes" className={COMMISSION_LABEL_CLASS}>
              Notas <span className="font-normal text-slate-400">(opcional)</span>
            </label>
            <input
              id="liq-notes"
              type="text"
              value={liqNotes}
              onChange={(e) => setLiqNotes(e.target.value)}
              placeholder="Ej: Pago quincenal por Itaú, recibo firmado"
              className={COMMISSION_INPUT_CLASS}
            />
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
                  <h4 className="font-semibold text-base text-slate-900 dark:text-white">
                    {business.name || "Barbería & Studio AgendatePY"}
                  </h4>
                  <p className="text-[11px] text-slate-400">RUC: 80099881-2 — Asunción, Paraguay</p>
                </div>
                <div className="text-right">
                  <span className="tabular-nums font-semibold text-sm block" style={{ color: brandColor }}>
                    {selectedPayoutReceipt.receiptNumber}
                  </span>
                  <span className="text-[11px] text-slate-400">
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
                  <span className="tabular-nums text-[11px]">
                    {new Date(selectedPayoutReceipt.periodStart).toLocaleDateString("es-PY")} al{" "}
                    {new Date(selectedPayoutReceipt.periodEnd).toLocaleDateString("es-PY")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Medio de Pago:</span>
                  <span className="font-semibold">{selectedPayoutReceipt.paymentMethod}</span>
                </div>
              </div>

              {/* Financial breakdown */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-white/10 space-y-2">
                <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider block border-b border-slate-200 dark:border-white/10 pb-1.5">
                  Desglose de Origen del Dinero
                </span>

                {/* Services Share */}
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <Scissors className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Comisión por Servicios:</span>
                  </span>
                  <div className="text-right">
                    <span className="tabular-nums font-semibold text-indigo-600 dark:text-indigo-400">
                      {formatGs(
                        selectedPayoutReceipt.servicesCommission ??
                          Math.round(selectedPayoutReceipt.grossCommission * 0.9)
                      )}
                    </span>
                    <span className="text-[11px] text-slate-500 ml-1.5 font-semibold">
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
                    <span className="tabular-nums font-semibold text-amber-600 dark:text-amber-400">
                      {formatGs(
                        selectedPayoutReceipt.productsCommission ??
                          Math.round(selectedPayoutReceipt.grossCommission * 0.1)
                      )}
                    </span>
                    <span className="text-[11px] text-slate-500 ml-1.5 font-semibold">
                      ({selectedPayoutReceipt.productsSharePercent ?? 10}%)
                    </span>
                  </div>
                </div>

                {/* Advances Deducted */}
                {selectedPayoutReceipt.advancesDeducted > 0 && (
                  <div className="flex justify-between text-rose-600 pt-1 border-t border-slate-200 dark:border-white/10">
                    <span>Vales / Adelantos descontados:</span>
                    <span className="tabular-nums font-semibold">-{formatGs(selectedPayoutReceipt.advancesDeducted)}</span>
                  </div>
                )}

                {/* Total Paid */}
                <div className="flex justify-between text-sm font-semibold pt-2 border-t border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                  <span>TOTAL PAGADO:</span>
                  <span className="tabular-nums text-emerald-600 dark:text-emerald-400">
                    {formatGs(selectedPayoutReceipt.amountPaid)}
                  </span>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-6 pt-6 text-center text-[11px] text-slate-400">
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
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition cursor-pointer"
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
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPayoutReceipt(null)}
                className="rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
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
        title="Porcentajes de comisión"
        footer={
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={() => setIsRulesModalOpen(false)}
              className="min-h-11 rounded-xl border border-slate-200/80 px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5 sm:min-h-10"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveRules}
              className="min-h-11 rounded-xl px-5 text-xs font-semibold text-white shadow-sm transition hover:brightness-110 sm:min-h-10"
              style={{ backgroundColor: brandColor }}
            >
              Guardar cambios
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-500 dark:text-zinc-400">
            Definí qué porcentaje gana cada colaborador por los servicios que realiza y por los productos que vende.
          </p>

          <div className="space-y-2.5">
            {staff.map((st) => {
              const roleDef = ROLE_CONFIG[st.systemRole || "barbero"] || ROLE_CONFIG.barbero;
              const RoleIcon = roleDef.icon;
              const currentRule = rulesDraft[st.id] || { servicePct: 50, productPct: 10 };
              const updateRule = (key: "servicePct" | "productPct", raw: string) => {
                const val = Math.min(100, Math.max(0, Math.round(Number(raw) || 0)));
                setRulesDraft((prev) => ({
                  ...prev,
                  [st.id]: { ...currentRule, ...prev[st.id], [key]: val },
                }));
              };

              return (
                <div
                  key={st.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3 dark:border-white/10 dark:bg-white/[0.02] sm:flex sm:items-center sm:justify-between sm:gap-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[11px] font-semibold text-white"
                      style={{ backgroundColor: st.color || brandColor }}
                    >
                      {st.avatar}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{st.name}</p>
                      <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-zinc-400">
                        <RoleIcon className="h-3 w-3" />
                        {roleDef.label}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-0 sm:w-56 sm:shrink-0">
                    {([
                      { key: "servicePct", label: "Servicios", icon: Scissors, tone: "text-indigo-500" },
                      { key: "productPct", label: "Productos", icon: ShoppingBag, tone: "text-amber-500" },
                    ] as const).map((field) => {
                      const FieldIcon = field.icon;
                      const inputId = `rule-${st.id}-${field.key}`;
                      return (
                        <div key={field.key} className="min-w-0">
                          <label
                            htmlFor={inputId}
                            className="mb-1 flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-zinc-400"
                          >
                            <FieldIcon className={`h-3 w-3 ${field.tone}`} />
                            {field.label}
                          </label>
                          <div className="relative">
                            <input
                              id={inputId}
                              type="number"
                              inputMode="numeric"
                              min={0}
                              max={100}
                              value={currentRule[field.key]}
                              onChange={(e) => updateRule(field.key, e.target.value)}
                              className={`${COMMISSION_INPUT_CLASS} pr-8 font-semibold tabular-nums`}
                            />
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                              %
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="flex items-start gap-2 rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-2.5 text-[11px] text-slate-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-400">
            <Percent className="mt-px h-3.5 w-3.5 shrink-0" />
            Ejemplo: con 45% en servicios, un corte de Gs. 100.000 le deja Gs. 45.000 al colaborador.
          </p>
        </div>
      </Modal>
    </div>
  );
}
