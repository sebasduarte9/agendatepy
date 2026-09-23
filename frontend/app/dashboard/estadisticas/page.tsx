"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { CalendarDays, Wallet, UserRound, Ban } from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import StatCard from "@/components/dashboard/ui/StatCard";
import Card from "@/components/dashboard/ui/Card";
import { formatGs } from "@/lib/dashboard-dates";
import Link from "next/link";

const FILTERS = ["Hoy", "Ayer", "Esta Semana", "Mes Pasado"] as const;

export default function EstadisticasPage() {
  const { appointments, services, business } = useDashboardStore();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Esta Semana");
  const confirmed = appointments.filter((a) => a.status === "confirmed");
  const cancelled = appointments.filter((a) => a.status === "cancelled");
  const revenue = confirmed.reduce(
    (sum, item) => sum + (services.find((s) => s.id === item.serviceId)?.price ?? 0),
    0,
  );
  const unique = new Set(appointments.map((a) => a.clientEmail)).size;

  const lineData = useMemo(
    () => [
      { name: "Lun", ingresos: 280000 },
      { name: "Mar", ingresos: 430000 },
      { name: "Mié", ingresos: 150000 },
      { name: "Jue", ingresos: 520000 },
      { name: "Vie", ingresos: 610000 },
      { name: "Sáb", ingresos: 390000 },
    ],
    [],
  );
  const pieData = [
    { name: "Transferencia SIPAP", value: 4, color: "#10b981" },
    { name: "POS Bancard", value: 3, color: "#3b82f6" },
    { name: "Efectivo", value: 2, color: "#f59e0b" },
    { name: "Billeteras Móviles", value: 1, color: "#8b5cf6" },
  ];
  const hourData = [
    { hour: "09", n: 1 },
    { hour: "10", n: 2 },
    { hour: "12", n: 3 },
    { hour: "14", n: 2 },
    { hour: "16", n: 4 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Estadísticas</h1>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={`rounded-full px-3 py-1.5 text-sm ${
              filter === item ? "bg-primary text-white" : "border border-border"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="advanced-stats grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total de turnos" value={String(appointments.length)} icon={CalendarDays} delta={12} />
        <StatCard label="Ingresos" value={formatGs(revenue)} icon={Wallet} delta={8} />
        <StatCard label="Cancelaciones" value={String(cancelled.length)} icon={Ban} delta={-4} />
        <StatCard label="Clientes únicos" value={String(unique)} icon={UserRound} delta={6} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-bold">Evolución de ingresos</h2>
          <div className="h-56 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <XAxis dataKey="name" />
                <YAxis hide />
                <Tooltip />
                <Line type="monotone" dataKey="ingresos" stroke="#6366f1" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h2 className="mb-3 font-bold">Métodos de pago</h2>
          <div className="h-56 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" innerRadius={50} outerRadius={80}>
                  {pieData.map((item) => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <h2 className="mb-3 font-bold">Distribución horaria</h2>
          <div className="h-56 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourData}>
                <XAxis dataKey="hour" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="n" fill="#6366f1" radius={8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      <div className="relative overflow-hidden rounded-[20px] border border-border">
        <div className="p-6 blur-sm">
          <h2 className="font-bold">Retención y análisis de cancelaciones</h2>
          <p className="mt-2 text-sm text-slate-500">
            Cohortes, motivos de cancelación y clientes en riesgo.
          </p>
          <div className="mt-4 h-32 rounded-2xl bg-slate-100" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-sm">
          {business.plan !== "basico" ? (
            <p className="font-semibold text-slate-800">Métricas Pro / Empresa activas</p>
          ) : (
            <Link
              href="/dashboard/suscripcion"
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm"
            >
              Mejorar a Plan Pro
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
