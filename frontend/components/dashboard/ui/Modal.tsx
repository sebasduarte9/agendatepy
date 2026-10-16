"use client";

import React, { useState, useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useDragControls, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { triggerHaptic } from "@/lib/haptics";

export default function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  id,
  maxWidth = "max-w-lg",
  minHeight = "",
  className = "",
  footerClassName = "",
  variant = "center",
  animateContentSize = false,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  id?: string;
  maxWidth?: string;
  minHeight?: string;
  className?: string;
  footerClassName?: string;
  variant?: "center" | "side";
  animateContentSize?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const dragControls = useDragControls();
  const prefersReducedMotion = useReducedMotion();
  const titleId = `dashboard-modal-title-${useId()}`;
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  // Keep focus inside the dialog, close it on Escape, and restore the opener on dismissal.
  useEffect(() => {
    if (!open || !mounted) return;
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusFrame = window.requestAnimationFrame(() => {
      (closeButtonRef.current ?? dialogRef.current)?.focus();
    });
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => element.getAttribute("aria-hidden") !== "true");
      if (focusable.length === 0) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialogRef.current.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialogRef.current.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      const previousFocus = previousFocusRef.current;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [open, mounted]);

  const isSide = variant === "side" && isDesktop;

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          id={id}
          className={`fixed inset-0 z-[9999] flex bg-slate-950/75 backdrop-blur-sm sm:backdrop-blur-md ${
            isMobile
              ? "items-end justify-center p-0"
              : isSide
                ? "items-stretch justify-end p-0 overflow-hidden"
                : "items-center justify-center p-3 sm:p-6 overflow-y-auto"
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={prefersReducedMotion ? { duration: 0.01 } : { duration: 0.22, ease: "easeOut" }}
          onClick={onClose}
        >
          <motion.div
            ref={dialogRef}
            key="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            layout={animateContentSize ? "size" : undefined}
            drag={isMobile ? "y" : false}
            dragListener={false}
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={isMobile ? { top: 0, bottom: 0.62 } : false}
            dragMomentum={false}
            dragTransition={{ bounceStiffness: 360, bounceDamping: 34 }}
            onDragEnd={(_, info) => {
              if (isMobile && (info.offset.y > 72 || info.velocity.y > 550)) {
                triggerHaptic("light");
                onClose();
              }
            }}
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
              prefersReducedMotion
                ? {
                    duration: 0.01,
                    ...(animateContentSize ? { layout: { duration: 0.01 } } : {}),
                  }
                : isMobile
                  ? {
                      type: "spring",
                      stiffness: 340,
                      damping: 34,
                      mass: 0.9,
                      ...(animateContentSize
                        ? { layout: { type: "spring", stiffness: 300, damping: 34, mass: 0.9 } }
                        : {}),
                    }
                  : isSide
                    ? {
                        type: "spring",
                        stiffness: 360,
                        damping: 34,
                        ...(animateContentSize
                          ? { layout: { type: "spring", stiffness: 300, damping: 34, mass: 0.9 } }
                          : {}),
                      }
                    : {
                        duration: 0.18,
                        ease: [0.16, 1, 0.3, 1],
                        ...(animateContentSize
                          ? { layout: { type: "spring", stiffness: 300, damping: 34, mass: 0.9 } }
                          : {}),
                      }
            }
            onClick={(event) => event.stopPropagation()}
            className={`${
              isMobile
                ? "w-full max-h-[90dvh] rounded-t-[32px] pb-[max(1rem,env(safe-area-inset-bottom))]"
                : isSide
                  ? "h-full max-h-full max-w-2xl rounded-l-[32px] w-full"
                  : `max-h-[min(90vh,760px)] ${maxWidth} rounded-[28px] my-auto w-full`
            } ${minHeight} ${className} flex flex-col glass-modal text-slate-900 dark:text-white shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden relative`}
          >
            {isMobile && (
              <div
                className="flex min-h-10 w-full shrink-0 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
                onPointerDown={(event) => dragControls.start(event)}
                aria-label="Desliza hacia abajo para cerrar"
              >
                <div className="h-1.5 w-12 rounded-full bg-slate-300 dark:bg-white/20" />
                <span className="sr-only">Desliza hacia abajo para cerrar</span>
              </div>
            )}

            {/* Modal Header */}
            <div
              className={`shrink-0 select-none px-5 sm:px-6 ${isMobile ? "touch-none pt-0" : "pt-5"} pb-3 border-b border-slate-200/80 dark:border-white/10`}
              onPointerDown={isMobile ? (event) => dragControls.start(event) : undefined}
            >
              <div className="flex items-center justify-between">
                <h3 id={titleId} className="text-base sm:text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                  {title}
                </h3>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={onClose}
                  onPointerDown={(event) => event.stopPropagation()}
                  aria-label="Cerrar"
                  className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-full bg-slate-200/60 text-slate-600 transition hover:bg-slate-300/60 active:scale-90 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/20 sm:h-8 sm:w-8"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Modal Body with smooth internal scroll */}
            <div className="overflow-y-auto overscroll-contain flex-1 min-h-0 px-5 sm:px-6 py-4 pb-6">
              {children}
            </div>

            {footer && (
              <div
                className={`z-10 shrink-0 border-t border-slate-200/80 bg-white/95 px-5 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95 sm:px-6 ${footerClassName}`}
              >
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
