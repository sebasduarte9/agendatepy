"use client";

import React, { useState, useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { X } from "lucide-react";
import { triggerHaptic } from "@/lib/haptics";

export default function Modal({
  open,
  title,
  onClose,
  children,
  id,
  maxWidth = "max-w-lg",
  minHeight = "",
  className = "",
  variant = "center",
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  id?: string;
  maxWidth?: string;
  minHeight?: string;
  className?: string;
  variant?: "center" | "side";
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const dragControls = useDragControls();
  const bodyRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close on Escape key press
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Touch pull-to-dismiss gesture on scrollable body when at the top
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    if (bodyRef.current && bodyRef.current.scrollTop <= 0) {
      touchStartY.current = e.touches[0].clientY;
    } else {
      touchStartY.current = null;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || touchStartY.current === null) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;
    if (deltaY < 0) {
      touchStartY.current = null;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isMobile || touchStartY.current === null) return;
    const currentY = e.changedTouches[0].clientY;
    const deltaY = currentY - touchStartY.current;
    if (deltaY > 80 && bodyRef.current && bodyRef.current.scrollTop <= 0) {
      triggerHaptic("light");
      onClose();
    }
    touchStartY.current = null;
  };

  const isSide = variant === "side" && isDesktop;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id={id}
          className={`fixed inset-0 z-[80] flex bg-black/60 dark:bg-black/75 backdrop-blur-md overflow-hidden ${isSide ? "items-stretch justify-end p-0" : "items-end sm:items-center justify-center p-0 sm:p-4"}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.14 }}
          onClick={onClose}
        >
          <motion.div
            key="modal-card"
            drag={isMobile ? "y" : false}
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.05, bottom: 0.7 }}
            onDragEnd={(_, info) => {
              if (isMobile && (info.offset.y > 80 || info.velocity.y > 350)) {
                triggerHaptic("light");
                onClose();
              }
            }}
            initial={
              isSide
                ? { x: "100%", opacity: 1 }
                : isMobile
                ? { y: "100%", opacity: 1 }
                : { y: 24, opacity: 0, scale: 0.98 }
            }
            animate={
              isSide
                ? { x: 0, opacity: 1 }
                : isMobile
                ? { y: 0, opacity: 1 }
                : { y: 0, opacity: 1, scale: 1 }
            }
            exit={
              isSide
                ? { x: "100%", opacity: 1 }
                : isMobile
                ? { y: "100%", opacity: 1 }
                : { y: 16, opacity: 0, scale: 0.98 }
            }
            transition={
              isMobile || isSide
                ? { type: "spring", stiffness: 360, damping: 34 }
                : { duration: 0.18, ease: [0.16, 1, 0.3, 1] }
            }
            onClick={(event) => event.stopPropagation()}
            className={`${isSide ? "h-full max-h-full max-w-2xl rounded-l-3xl" : `max-h-[92dvh] sm:max-h-[88dvh] ${maxWidth} ${minHeight} rounded-t-[32px] sm:rounded-3xl`} w-full ${className} flex flex-col border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#121215] text-slate-900 dark:text-white shadow-2xl overflow-hidden`}
          >
            {/* Drag Handle & Header Area */}
            <div
              onPointerDown={(e) => {
                if (!isMobile) return;
                if ((e.target as HTMLElement)?.closest("button, a, input, select, textarea")) return;
                dragControls.start(e);
              }}
              style={{ touchAction: isMobile ? "none" : "auto" }}
              className="shrink-0 select-none cursor-grab active:cursor-grabbing sm:cursor-default px-5 sm:px-6 pt-3.5 sm:pt-6 pb-3 border-b border-slate-100 dark:border-white/10 group"
            >
              {/* iOS Native Drag Handle Pill for Mobile */}
              <div className="sm:hidden -mt-1 mb-2.5 flex justify-center py-0.5">
                <span className="h-1.5 w-12 group-hover:w-16 group-active:w-20 rounded-full bg-slate-300 dark:bg-zinc-700 group-hover:bg-slate-400 dark:group-hover:bg-zinc-600 transition-all duration-200 mx-auto" />
              </div>

              {/* Modal Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  {title}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Cerrar"
                  className="h-7 w-7 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white transition active:scale-90 cursor-pointer shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Modal Body with smooth internal scroll */}
            <div
              ref={bodyRef}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="overflow-y-auto overscroll-contain flex-1 min-h-0 px-5 sm:px-6 py-4 pb-[calc(1.5rem+env(safe-area-inset-bottom,16px))] sm:pb-6"
            >
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
