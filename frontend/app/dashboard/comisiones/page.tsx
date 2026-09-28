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
  Check,
  AlertCircle,
  X,
  ExternalLink,
  ShieldCheck,
  Package,
} from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import Card from "@/components/dashboard/ui/Card";
import StatCard from "@/components/dashboard/ui/StatCard";
import Modal from "@/components/dashboard/ui/Modal";
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
    label: "Barbero / Especialista",
    icon: Scissors,
    badgeClass: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
  },
  estilista: {
    label: "Estilista / Especialista",
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
    cashMovements,
    commissionPayouts,
    addCommissionPayout,
    updateStaffCommission,
    pushToast,
  } = useDashboardStore();

  // Filters state
  const [selectedStaffId, setSelectedStaffId] = useState<string>("ALL");
  const [period, setPeriod] = useState<string>("30d");
  const [activeTab, setActiveTab] = useState<"overview" | "staff" | "items" | "payouts">("overview");

  // Modals state
  const [isLiquidarModalOpen, setIsLiquidarModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [selectedPayoutReceipt, setSelectedPayoutReceipt] = useState<CommissionPayoutRecord | null>(null);

  // Liquidation form state
  const [liqStaffId, setLiqStaffId] = useState<string>("");
  const [liqPaymentMethod, setLiqPaymentMethod] = useState<"SIPAP" | "Efectivo" | "POS Bancard">("SIPAP");
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

  // Filtered completed appointments that generated commission
  const completedAppointments = useMemo(() => {
    return appointments.filter((app) => {
      const isCompleted = app.status === "completed";
      const matchStaff = selectedStaffId === "ALL" || app.staffId === selectedStaffId;
      const appDate = new Date(app.start);
      const inDateRange = period === "all" || (appDate >= dateRange.start && appDate <= dateRange.end);
      return isCompleted && matchStaff && inDateRange;
    });
  }, [appointments, selectedStaffId, period, dateRange]);

  // Build service lookup map
  const serviceMap = useMemo(() => {
    const map = new Map<string, (typeof services)[0]>();
    services.forEach((s) => map.set(s.id, s));
    return map;
  }, [services]);

  // Build staff lookup map
  const staffMap = useMemo(() => {
    const map = new Map<string, StaffMember>();
    staff.forEach((st) => map.set(st.id, st));
    return map;
  }, [staff]);

  // Calculate detailed items earned (Services commissions)
  const earnedItems = useMemo(() => {
    return completedAppointments.map((app) => {
      const svc = serviceMap.get(app.serviceId);
      const st = staffMap.get(app.staffId);
      const chargedAmount = svc?.price || 80000;
      const commissionPercentage = st?.commissionPercentage ?? 50;
      const commissionAmount = Math.round((chargedAmount * commissionPercentage) / 100);

      return {
        id: app.id,
        appointmentId: app.id,
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
  }, [completedAppointments, serviceMap, staffMap]);

  // Aggregated KPIs
  const metrics = useMemo(() => {
    const totalBilled = earnedItems.reduce((acc, i) => acc + i.chargedAmount, 0);
    const totalCommissionEarned = earnedItems.reduce((acc, i) => acc + i.commissionAmount, 0);

    // Filter payouts matching current staff selection
    const relevantPayouts = commissionPayouts.filter(
      (p) => selectedStaffId === "ALL" || p.staffId === selectedStaffId
    );
    const totalPaidCommission = relevantPayouts.reduce((acc, p) => acc + p.amountPaid, 0);

    // Pending commission = earned - paid (bounded to positive)
    const pendingCommission = Math.max(0, totalCommissionEarned - totalPaidCommission);

    return {
      totalBilled,
      totalCommissionEarned,
      totalPaidCommission,
      pendingCommission,
      totalCompletedTurns: earnedItems.length,
      payoutsCount: relevantPayouts.length,
    };
  }, [earnedItems, commissionPayouts, selectedStaffId]);

  // Per-staff summary calculation
  const staffSummaries = useMemo(() => {
    return staff.map((st) => {
      const staffItems = earnedItems.filter((i) => i.staffId === st.id);
      const staffBilled = staffItems.reduce((acc, i) => acc + i.chargedAmount, 0);
      const staffEarned = staffItems.reduce((acc, i) => acc + i.commissionAmount, 0);
      const staffPayouts = commissionPayouts.filter((p) => p.staffId === st.id);
      const staffPaid = staffPayouts.reduce((acc, p) => acc + p.amountPaid, 0);
      const staffPending = Math.max(0, staffEarned - staffPaid);

      return {
        staff: st,
        turnsCount: staffItems.length,
        billedAmount: staffBilled,
        earnedCommission: staffEarned,
        paidCommission: staffPaid,
        pendingCommission: staffPending,
        advanceBalance: st.advanceBalance || 0,
      };
    });
  }, [staff, earnedItems, commissionPayouts]);

  // Open liquidation modal preselecting a staff member
  const handleOpenLiquidar = (preferredStaffId?: string) => {
    const targetId = preferredStaffId || (selectedStaffId !== "ALL" ? selectedStaffId : staff[0]?.id || "");
    const targetStaff = staffMap.get(targetId);
    setLiqStaffId(targetId);
    setLiqAdvancesDeducted(targetStaff?.advanceBalance || 0);
    setLiqPaymentMethod("SIPAP");
    setLiqNotes("");
    setIsLiquidarModalOpen(true);
  };

  // Target staff selected inside liquidation modal
  const selectedLiquidationStaff = useMemo(() => {
    return staffMap.get(liqStaffId) || staff[0];
  }, [staffMap, liqStaffId, staff]);

  // Eligible items for current staff inside liquidation modal
  const liquidationEligibleItems = useMemo(() => {
    if (!selectedLiquidationStaff) return [];
    return earnedItems.filter((i) => i.staffId === selectedLiquidationStaff.id);
  }, [earnedItems, selectedLiquidationStaff]);

  const liquidationGross = useMemo(() => {
    return liquidationEligibleItems.reduce((acc, i) => acc + i.commissionAmount, 0);
  }, [liquidationEligibleItems]);

  const liquidationServicesBilled = useMemo(() => {
    return liquidationEligibleItems.reduce((acc, i) => acc + i.chargedAmount, 0);
  }, [liquidationEligibleItems]);

  const liquidationNet = useMemo(() => {
    return Math.max(0, liquidationGross - Number(liqAdvancesDeducted || 0));
  }, [liquidationGross, liqAdvancesDeducted]);

  // Handle saving liquidation
  const handleConfirmLiquidation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLiquidationStaff) return;

    if (liquidationNet <= 0 && liquidationGross <= 0) {
      pushToast("error", "No hay comisiones para liquidar a este profesional.");
      return;
    }

    const newPayout = addCommissionPayout({
      staffId: selectedLiquidationStaff.id,
      staffName: selectedLiquidationStaff.name,
      staffRole: selectedLiquidationStaff.role,
      periodStart: dateRange.start.toISOString(),
      periodEnd: dateRange.end.toISOString(),
      servicesAmount: liquidationServicesBilled,
      productsAmount: 0,
      grossCommission: liquidationGross,
      advancesDeducted: Number(liqAdvancesDeducted || 0),
      amountPaid: liquidationNet,
      paymentMethod: liqPaymentMethod,
      status: "PAID",
      paidBy: business.email || "administracion@agendate.py",
      notes: liqNotes.trim() || undefined,
      itemsCount: liquidationEligibleItems.length,
    });

    pushToast("success", `Liquidación #${newPayout.receiptNumber} emitida a ${selectedLiquidationStaff.name}`);
    setIsLiquidarModalOpen(false);

    // Open receipt modal right away
    setSelectedPayoutReceipt(newPayout);
  };

  // Handle saving updated commission rules
  const handleSaveRules = () => {
    Object.entries(rulesDraft).forEach(([stId, rule]) => {
      updateStaffCommission(stId, rule.servicePct, rule.productPct);
    });
    pushToast("success", "Reglas y porcentajes de comisión actualizados");
    setIsRulesModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with Title, Actions & Global Filters */}
      <div
        data-tour="comisiones-header"
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 shadow-xs"
      >
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Comisiones & Liquidaciones del Equipo
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Auditoría transparente de servicios cobrados, reglas de comisión y recibos oficiales.
              </p>
            </div>
          </div>
        </div>

        {/* Global Filters & Primary Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Staff Filter */}
          <div className="relative">
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200/90 dark:border-white/10 rounded-xl px-3 py-2 pr-8 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary cursor-pointer appearance-none"
            >
              <option value="ALL">👥 Todo el equipo ({staff.length})</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.commissionPercentage}%)
                </option>
              ))}
            </select>
            <ChevronDown className="h-3.5 w-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Period Filter */}
          <div className="relative">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200/90 dark:border-white/10 rounded-xl px-3 py-2 pr-8 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary cursor-pointer appearance-none"
            >
              <option value="today">Hoy</option>
              <option value="7d">Últimos 7 días</option>
              <option value="15d">Esta Quincena</option>
              <option value="30d">Últimos 30 días</option>
              <option value="all">Histórico completo</option>
            </select>
            <ChevronDown className="h-3.5 w-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Configure Rules Button */}
          <button
            type="button"
            data-tour="comisiones-rules"
            onClick={() => setIsRulesModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 px-3.5 py-2 rounded-xl transition cursor-pointer"
          >
            <Sliders className="h-3.5 w-3.5 text-slate-500" />
            <span>Reglas & %</span>
          </button>

          {/* Liquidar Comisiones Button */}
          <button
            type="button"
            data-tour="comisiones-liquidar-btn"
            onClick={() => handleOpenLiquidar()}
            className="inline-flex items-center gap-1.5 text-xs font-black text-white bg-primary hover:brightness-110 shadow-md shadow-primary/20 px-4 py-2 rounded-xl transition cursor-pointer active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Liquidar Comisiones</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div data-tour="comisiones-kpis" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Comisión Devengada"
          value={formatGs(metrics.totalCommissionEarned)}
          hint={`Sobre ${formatGs(metrics.totalBilled)} cobrados`}
          icon={Coins}
        />
        <StatCard
          label="Pendiente de Pago"
          value={formatGs(metrics.pendingCommission)}
          hint={metrics.pendingCommission > 0 ? "Saldo acumulado a liquidar" : "Al día con el equipo"}
          icon={Clock}
        />
        <StatCard
          label="Total Liquidado"
          value={formatGs(metrics.totalPaidCommission)}
          hint={`${metrics.payoutsCount} liquidaciones emitidas`}
          icon={CheckCircle2}
        />
        <StatCard
          label="Facturación del Equipo"
          value={formatGs(metrics.totalBilled)}
          hint={`${metrics.totalCompletedTurns} servicios completados`}
          icon={ArrowUpRight}
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-white/10 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === "overview"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Equipo & Saldos</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {staff.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("items")}
          className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === "items"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Citas Devengadas</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {earnedItems.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("payouts")}
          className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === "payouts"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Receipt className="h-4 w-4" />
          <span>Historial de Liquidaciones</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {commissionPayouts.length}
          </span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & TEAM CARDS */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staffSummaries.map((summary) => {
            const st = summary.staff;
            const roleDef = ROLE_CONFIG[st.systemRole || "barbero"] || ROLE_CONFIG.barbero;
            const RoleIcon = roleDef.icon;

            return (
              <Card
                key={st.id}
                className="p-5 flex flex-col justify-between border border-slate-200/90 dark:border-white/10 hover:border-primary/40 transition shadow-xs"
              >
                <div>
                  {/* Top Bar: Avatar, Role Badge & Commission Rate */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-2xl font-black text-white text-sm shadow-xs"
                        style={{ backgroundColor: st.color || "#4f46e5" }}
                      >
                        {st.avatar}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {st.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
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

                  {/* Commission Rates Pills */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-white/5 text-xs">
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2.5 border border-slate-100 dark:border-white/5">
                      <span className="text-[10px] text-slate-400 block font-semibold">Comisión Servicios</span>
                      <span className="text-sm font-black text-primary font-mono">
                        {st.commissionPercentage}%
                      </span>
                    </div>

                    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2.5 border border-slate-100 dark:border-white/5">
                      <span className="text-[10px] text-slate-400 block font-semibold">Comisión Productos</span>
                      <span className="text-sm font-black text-amber-600 dark:text-amber-400 font-mono">
                        {st.productCommissionPercentage ?? 10}%
                      </span>
                    </div>
                  </div>

                  {/* Metrics Summary */}
                  <div className="space-y-2 mt-3.5 text-xs">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span>Citas completadas:</span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">
                        {summary.turnsCount} turnos
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span>Total facturado al local:</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">
                        {formatGs(summary.billedAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span>Total comisionado:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {formatGs(summary.earnedCommission)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer with Balance and Action */}
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/5">
                  <div className="flex items-baseline justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-500">Saldo pendiente:</span>
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
                      className="flex-1 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white py-2 text-xs font-bold hover:opacity-90 transition cursor-pointer text-center"
                    >
                      Liquidar Saldo
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStaffId(st.id);
                        setActiveTab("items");
                      }}
                      className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition cursor-pointer"
                    >
                      Auditar
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* TAB 2: AUDITED APPOINTMENTS / ITEMS */}
      {activeTab === "items" && (
        <Card data-tour="comisiones-turnos-table" className="overflow-hidden p-0 border border-slate-200/80 dark:border-white/10 shadow-xs">
          <div className="p-4 border-b border-slate-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Citas y Servicios Completados Devengando Comisión
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Cálculo sobre el valor cobrado en caja con el porcentaje correspondiente de cada especialista.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl">
              {earnedItems.length} registros auditados
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-white/5 font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                  <th className="py-3 px-4">Fecha y Hora</th>
                  <th className="py-3 px-4">Profesional</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Servicio / Concepto</th>
                  <th className="py-3 px-4 text-right">Monto Cobrado</th>
                  <th className="py-3 px-4 text-center">% Pactado</th>
                  <th className="py-3 px-4 text-right">Comisión</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {earnedItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                      No hay citas completadas en el rango y filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  earnedItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
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
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {item.staffName}
                        </span>
                        <span className="text-[10px] text-slate-400">{item.staffRole}</span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {item.clientName}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 text-[11px] font-semibold border border-indigo-500/20">
                          {item.concept}
                        </span>
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
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                          <Clock className="h-3 w-3" />
                          Acumulada
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 3: PAYOUTS HISTORY */}
      {activeTab === "payouts" && (
        <Card data-tour="comisiones-payouts-table" className="overflow-hidden p-0 border border-slate-200/80 dark:border-white/10 shadow-xs">
          <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Historial de Liquidaciones & Comprobantes Oficiales
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Comprobantes emitidos, pagos asentados en caja y recibos firmados.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenLiquidar()}
              className="text-xs font-bold text-primary hover:underline cursor-pointer flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              Nueva Liquidación
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-white/5 font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                  <th className="py-3 px-4">Recibo #</th>
                  <th className="py-3 px-4">Fecha Pago</th>
                  <th className="py-3 px-4">Profesional</th>
                  <th className="py-3 px-4">Período Liquidado</th>
                  <th className="py-3 px-4">Método</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Monto Pagado</th>
                  <th className="py-3 px-4 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {commissionPayouts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No hay liquidaciones emitidas hasta el momento.
                    </td>
                  </tr>
                ) : (
                  commissionPayouts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono font-black text-primary">
                        {p.receiptNumber || `#${p.id.slice(0, 8)}`}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400">
                        {new Date(p.paidAt).toLocaleDateString("es-PY")}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {p.staffName}
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {new Date(p.periodStart).toLocaleDateString("es-PY", { day: "2-digit", month: "short" })} -{" "}
                        {new Date(p.periodEnd).toLocaleDateString("es-PY", { day: "2-digit", month: "short" })}
                      </td>
                      <td className="py-3 px-4">
                        <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                          {p.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3" />
                          Pagado
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                        {formatGs(p.amountPaid)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedPayoutReceipt(p)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline px-2.5 py-1 rounded-lg hover:bg-primary/10 transition cursor-pointer"
                        >
                          <Receipt className="h-3.5 w-3.5" />
                          <span>Ver Recibo</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* MODAL 1: LIQUIDAR COMISIONES */}
      <Modal
        open={isLiquidarModalOpen}
        onClose={() => setIsLiquidarModalOpen(false)}
        maxWidth="max-w-xl"
        title="Liquidar Comisiones a Profesional"
      >
        <form onSubmit={handleConfirmLiquidation} className="space-y-4 text-xs">
          {/* Staff Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Seleccionar Colaborador *
            </label>
            <select
              value={liqStaffId}
              onChange={(e) => {
                setLiqStaffId(e.target.value);
                const s = staffMap.get(e.target.value);
                setLiqAdvancesDeducted(s?.advanceBalance || 0);
              }}
              required
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-primary"
            >
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.role} ({s.commissionPercentage}% servicios, {s.productCommissionPercentage ?? 10}% productos)
                </option>
              ))}
            </select>
          </div>

          {/* Breakdown calculation card */}
          {selectedLiquidationStaff && (
            <div className="rounded-2xl border border-primary/20 bg-primary/5 dark:bg-primary/10 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-primary/10">
                <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                  Auditoría del Período ({period})
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {liquidationEligibleItems.length} servicios auditados
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Total facturado en servicios:</span>
                  <span className="font-mono">{formatGs(liquidationServicesBilled)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                  <span>Comisión calculada ({selectedLiquidationStaff.commissionPercentage}%):</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">
                    +{formatGs(liquidationGross)}
                  </span>
                </div>
              </div>

              {/* Advances Deduction */}
              <div className="pt-2 border-t border-primary/10">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    Deducir Adelantos Previos / Vales (Gs.):
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
                  Monto Neto a Liquidar:
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
                Método de Pago *
              </label>
              <select
                value={liqPaymentMethod}
                onChange={(e) => setLiqPaymentMethod(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-primary"
              >
                <option value="SIPAP">Transferencia Bancaria SIPAP</option>
                <option value="Efectivo">Efectivo (Caja Mostrador)</option>
                <option value="POS Bancard">POS Bancard / Tarjeta</option>
              </select>
            </div>

            {/* Auto Cash Movement Switch (As requested by user!) */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/5">
              <div>
                <span className="block font-bold text-xs text-slate-900 dark:text-white">
                  Asentar Egreso en Caja
                </span>
                <span className="text-[10px] text-slate-500">Descuenta de Caja Diaria</span>
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
              className="rounded-xl bg-primary hover:brightness-110 px-5 py-2 font-black text-white shadow-md shadow-primary/20 transition cursor-pointer"
            >
              Confirmar y Emitir Recibo
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: OFFICIAL PRINTABLE RECEIPT */}
      <Modal
        open={!!selectedPayoutReceipt}
        onClose={() => setSelectedPayoutReceipt(null)}
        maxWidth="max-w-lg"
        title="Comprobante Oficial de Liquidación"
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
                  <span className="font-mono font-black text-primary text-sm block">
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
                  <span className="text-slate-500">Beneficiario:</span>
                  <strong className="text-slate-900 dark:text-white">{selectedPayoutReceipt.staffName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cargo / Rol:</span>
                  <span>{selectedPayoutReceipt.staffRole || "Especialista"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Período:</span>
                  <span className="font-mono text-[11px]">
                    {new Date(selectedPayoutReceipt.periodStart).toLocaleDateString("es-PY")} al{" "}
                    {new Date(selectedPayoutReceipt.periodEnd).toLocaleDateString("es-PY")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Método de Pago:</span>
                  <span className="font-bold">{selectedPayoutReceipt.paymentMethod}</span>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="space-y-1.5 pt-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Facturación de servicios asistidos:</span>
                  <span className="font-mono">{formatGs(selectedPayoutReceipt.servicesAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Comisión bruta devengada:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    +{formatGs(selectedPayoutReceipt.grossCommission)}
                  </span>
                </div>
                {selectedPayoutReceipt.advancesDeducted > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Adelantos previos descontados:</span>
                    <span className="font-mono">-{formatGs(selectedPayoutReceipt.advancesDeducted)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black pt-2 border-t border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                  <span>Monto Total Cobrado:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">
                    {formatGs(selectedPayoutReceipt.amountPaid)}
                  </span>
                </div>
              </div>

              {/* Signatures simulation */}
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
                    `*Comprobante de Liquidación #${selectedPayoutReceipt.receiptNumber}*\n` +
                      `Negocio: ${business.name}\n` +
                      `Colaborador: ${selectedPayoutReceipt.staffName}\n` +
                      `Monto pagado: ${formatGs(selectedPayoutReceipt.amountPaid)}\n` +
                      `Método: ${selectedPayoutReceipt.paymentMethod}\n` +
                      `¡Gracias por tu gran trabajo en el equipo!`
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

      {/* MODAL 3: COMMISSION RULES CONFIGURATION */}
      <Modal
        open={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
        maxWidth="max-w-xl"
        title="Configurar Reglas y Porcentajes de Comisión"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-500 dark:text-slate-400">
            Ajustá el porcentaje de comisión para servicios y venta de productos de reventa para cada rol de tu equipo.
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
                      style={{ backgroundColor: st.color || "#4f46e5" }}
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
              className="rounded-xl bg-primary hover:brightness-110 px-5 py-2 font-bold text-white shadow-md shadow-primary/20 transition cursor-pointer"
            >
              Guardar Reglas
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
