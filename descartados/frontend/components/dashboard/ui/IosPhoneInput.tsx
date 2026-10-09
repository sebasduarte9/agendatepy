"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { ChevronDown, Search, Check, Globe } from "lucide-react";
import { COUNTRY_LIST, type CountryOption, findCountryByPhone } from "@/lib/countries";
import { triggerHaptic } from "@/lib/haptics";

interface IosPhoneInputProps {
  value: string;
  onChange: (fullE164: string) => void;
  placeholder?: string;
  className?: string;
}

export default function IosPhoneInput({
  value,
  onChange,
  placeholder,
  className = "",
}: IosPhoneInputProps) {
  // Parse initial country and number
  const parsed = useMemo(() => findCountryByPhone(value || ""), [value]);
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(parsed.country);
  const [nationalNumber, setNationalNumber] = useState<string>(parsed.nationalNumber);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync if value changes externally (e.g. editing different client)
  useEffect(() => {
    const res = findCountryByPhone(value || "");
    setSelectedCountry(res.country);
    setNationalNumber(res.nationalNumber);
  }, [value]);

  // Filter countries in search
  const filteredCountries = useMemo(() => {
    if (!search.trim()) return COUNTRY_LIST;
    const q = search.toLowerCase().trim();
    return COUNTRY_LIST.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [search]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleCountrySelect = (c: CountryOption) => {
    triggerHaptic("selection");
    setSelectedCountry(c);
    setDropdownOpen(false);
    setSearch("");
    // Recompute full number
    const cleanDigits = nationalNumber.replace(/\D/g, "");
    onChange(`${c.dialCode}${cleanDigits}`);
  };

  const handleNumberChange = (raw: string) => {
    let clean = raw.replace(/\D/g, "");
    // Remove leading 0 if in Paraguay / Argentina format for international standardization if user wants
    if (clean.length > selectedCountry.maxDigits) {
      clean = clean.slice(0, selectedCountry.maxDigits);
    }
    setNationalNumber(clean);
    onChange(`${selectedCountry.dialCode}${clean}`);
  };

  return (
    <div className={`relative flex items-center w-full ${className}`} ref={dropdownRef}>
      {/* Country Selector Button */}
      <button
        type="button"
        onClick={() => {
          triggerHaptic("selection");
          setDropdownOpen(!dropdownOpen);
        }}
        className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-white text-xs font-bold transition shrink-0 active:scale-95 cursor-pointer"
        title="Seleccionar país y prefijo"
      >
        <span className="text-base leading-none">{selectedCountry.flag}</span>
        <span className="font-mono text-xs text-slate-700 dark:text-zinc-200">{selectedCountry.dialCode}</span>
        <ChevronDown className={`h-3 w-3 text-slate-400 dark:text-zinc-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Phone Number Input */}
      <input
        type="tel"
        inputMode="numeric"
        value={nationalNumber}
        onChange={(e) => handleNumberChange(e.target.value)}
        placeholder={placeholder || selectedCountry.placeholder}
        className="w-full bg-transparent px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none tracking-wide"
      />

      {/* Country Dropdown Popover */}
      {dropdownOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-72 rounded-2xl bg-white dark:bg-[#18181b] border border-slate-200/80 dark:border-white/10 shadow-2xl overflow-hidden p-2 text-xs animate-in fade-in zoom-in-95 duration-150">
          {/* Search Bar */}
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              autoFocus
              placeholder="Buscar país o prefijo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl bg-slate-100 dark:bg-white/5 py-1.5 pl-8 pr-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none"
            />
          </div>

          {/* List of Countries */}
          <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5 space-y-0.5">
            {filteredCountries.map((c) => {
              const isSelected = c.code === selectedCountry.code;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => handleCountrySelect(c)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition text-left cursor-pointer ${
                    isSelected
                      ? "bg-primary/10 text-primary font-bold dark:bg-primary/20"
                      : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-zinc-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{c.flag}</span>
                    <span className="text-xs truncate">{c.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-mono text-[11px] text-slate-400 dark:text-zinc-400 font-semibold">{c.dialCode}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
