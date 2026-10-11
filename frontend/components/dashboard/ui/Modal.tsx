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
          className={`fixed inset-0 z-[100] flex bg-slate-950/70 backdrop-blur-md ${
            isMobile
              ? "items-end justify-center p-0"
              : isSide
              ? "items-stretch justify-end p-0 overflow-hidden"
              : "items-center justify-center p-3 sm:p-6 overflow-y-auto"
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
        >
          <motion.div
            key="modal-card"
            initial={
              isMobile
                ? { y: "100%", opacity: 0.9 }
                : isSide
                ? { x: "100%", opacity: 1 }
                : { opacity: 0, scale: 0.94 }
            }
            animate={
              isMobile
                ? { y: 0, opacity: 1 }
                : isSide
                ? { x: 0, opacity: 1 }
                : { opacity: 1, scale: 1 }
            }
            exit={
              isMobile
                ? { y: "100%", opacity: 0.9 }
                : isSide
                ? { x: "100%", opacity: 1 }
                : { opacity: 0, scale: 0.94 }
            }
            transition={
              isMobile
                ? { type: "spring", stiffness: 400, damping: 30 }
                : isSide
                ? { type: "spring", stiffness: 360, damping: 34 }
                : { duration: 0.18, ease: [0.16, 1, 0.3, 1] }
            }
            onClick={(event) => event.stopPropagation()}
            className={`${
              isMobile
                ? "w-full max-h-[90dvh] rounded-t-[32px] pb-4"
                : isSide
                ? "h-full max-h-full max-w-2xl rounded-l-[32px] w-full"
                : `max-h-[min(90vh,760px)] ${maxWidth} rounded-[28px] my-auto w-full`
            } ${className} flex flex-col glass-modal text-slate-900 dark:text-white shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden relative`}
          >
            {isMobile && (
              <div 
                className="w-full flex justify-center pt-3 pb-2 shrink-0 cursor-grab active:cursor-grabbing"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-white/20" />
              </div>
            )}

            {/* Modal Header */}
            <div 
              className={`shrink-0 select-none px-5 sm:px-6 ${isMobile ? 'pt-1' : 'pt-5'} pb-3 border-b border-slate-200/80 dark:border-white/10`}
              onTouchStart={isMobile ? handleTouchStart : undefined}
              onTouchMove={isMobile ? handleTouchMove : undefined}
              onTouchEnd={isMobile ? handleTouchEnd : undefined}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  {title}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Cerrar"
                  className="h-8 w-8 rounded-full bg-slate-200/60 dark:bg-white/10 hover:bg-slate-300/60 dark:hover:bg-white/20 flex items-center justify-center text-slate-600 dark:text-slate-300 transition active:scale-90 cursor-pointer shrink-0"
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
              className="overflow-y-auto overscroll-contain flex-1 min-h-0 px-5 sm:px-6 py-4 pb-6"
            >
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
