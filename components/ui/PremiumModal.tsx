"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: "default" | "destructive" | "success";
}

export function PremiumModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  variant = "default",
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const accentColor =
    variant === "destructive"
      ? "#ef4444"
      : variant === "success"
        ? "#10b981"
        : "#f40009";

  const modalContent = (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#050505]/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-[#0c0c0e] border border-white/5 rounded-3xl shadow-[0_32px_64px_rgba(0,0,0,0.8)] overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
        {/* Glow Accent Top */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] opacity-50"
          style={{
            background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
          }}
        ></div>

        <div className="p-10 text-center">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/5 text-text-tertiary hover:bg-white/10 hover:text-white transition-all"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header */}
          <div className="mb-8 flex flex-col items-center">
            <div
              className="w-12 h-1 mb-6 rounded-full opacity-30"
              style={{ backgroundColor: accentColor }}
            ></div>
            <h2 className="font-display text-3xl font-black uppercase tracking-tighter text-white mb-2">
              {title}
            </h2>
            {description && (
              <p className="text-[10px] font-display font-bold uppercase tracking-[0.25em] text-brand-primary opacity-80">
                {description}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="font-body text-[15px] text-text-secondary leading-relaxed mb-10">
            {children}
          </div>

          {/* Footer */}
          {footer && <div className="flex flex-col gap-3">{footer}</div>}
        </div>

        {/* Inner Border Light Effect */}
        <div className="absolute inset-0 border border-white/5 rounded-3xl pointer-events-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"></div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
