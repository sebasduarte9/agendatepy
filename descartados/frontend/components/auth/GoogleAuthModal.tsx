"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, ArrowRight, ShieldCheck, Check } from "lucide-react";

interface GoogleAccount {
  name: string;
  email: string;
  avatarBg: string;
}

const DEFAULT_ACCOUNTS: GoogleAccount[] = [
  {
    name: "Sebastián Duarte",
    email: "sebasduarte9@gmail.com",
    avatarBg: "bg-blue-600",
  },
  {
    name: "Marcos Benítez (Dueño)",
    email: "marcos@barberia.py",
    avatarBg: "bg-indigo-600",
  },
  {
    name: "Admin AgendatePY",
    email: "admin@agendate.py",
    avatarBg: "bg-purple-600",
  },
];

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (email: string, name: string) => void;
  isLoading: boolean;
}

export default function GoogleAuthModal({
  isOpen,
  onClose,
  onSelectAccount,
  isLoading,
}: GoogleAuthModalProps) {
  const [isCustom, setIsCustom] = useState(false);
  const [customEmail, setCustomEmail] = useState("");
  const [customName, setCustomName] = useState("");
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelect = (email: string, name: string) => {
    setSelectedEmail(email);
    onSelectAccount(email, name);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes("@")) return;
    const name = customName.trim() || customEmail.split("@")[0];
    handleSelect(customEmail, name);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-[420px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 shadow-2xl text-slate-900"
      >
        {/* Top Google progress bar when loading */}
        {isLoading && (
          <div className="absolute top-0 left-0 right-0 h-1 overflow-hidden bg-slate-100">
            <div className="h-full w-full bg-gradient-to-r from-blue-500 via-red-500 via-yellow-500 to-green-500 animate-[pulse_1s_infinite]" />
          </div>
        )}

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Google Header */}
        <div className="text-center pb-5 border-b border-slate-100">
          <div className="inline-flex items-center justify-center">
            <svg className="h-7 w-7" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>
          <h3 className="mt-2.5 text-lg font-bold text-slate-900">Elegir una cuenta</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            para continuar en <span className="font-semibold text-slate-700">AgendatePY</span>
          </p>
        </div>

        {/* Account List */}
        {!isCustom ? (
          <div className="mt-4 space-y-1">
            {DEFAULT_ACCOUNTS.map((acc) => {
              const isChosen = selectedEmail === acc.email && isLoading;
              return (
                <button
                  key={acc.email}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSelect(acc.email, acc.name)}
                  className={`flex w-full items-center gap-3.5 rounded-xl p-3 text-left transition hover:bg-slate-50 border border-transparent hover:border-slate-200/80 active:scale-[0.99] ${
                    isChosen ? "bg-blue-50/70 border-blue-200" : ""
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white font-bold text-sm shadow-xs ${acc.avatarBg}`}
                  >
                    {acc.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-800">{acc.name}</p>
                    <p className="truncate text-[11px] text-slate-500">{acc.email}</p>
                  </div>
                  {isChosen && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                  )}
                </button>
              );
            })}

            {/* Option to use another account */}
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setIsCustom(true)}
              className="flex w-full items-center gap-3.5 rounded-xl p-3 text-left transition hover:bg-slate-50 border-t border-slate-100 text-slate-700 font-semibold text-xs mt-2"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <UserPlus className="h-4 w-4" />
              </div>
              <span>Usar otra cuenta de Google</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleCustomSubmit} className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Correo de Gmail o Google Workspace
              </label>
              <input
                type="email"
                required
                autoFocus
                placeholder="tu.correo@gmail.com"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Nombre de Usuario (Opcional)
              </label>
              <input
                type="text"
                placeholder="Tu Nombre"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsCustom(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                Volver a la lista
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
              >
                <span>Acceder</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        )}

        {/* Security Notice Footer */}
        <div className="mt-5 border-t border-slate-100 pt-3 text-center">
          <p className="flex items-center justify-center gap-1 text-[11px] text-slate-600 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Acceso seguro protegido por Google OAuth 2.0
          </p>
        </div>
      </motion.div>
    </div>
  );
}
