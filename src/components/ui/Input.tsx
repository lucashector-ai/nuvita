"use client";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-[var(--ts)] uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={[
          "w-full px-4 py-3 bg-[var(--bg2)] border border-[var(--border)] rounded-xl",
          "font-[family-name:var(--font-inter)] text-[15px] text-[var(--tx)]",
          "outline-none transition-all duration-150",
          "placeholder:text-[var(--ts)]",
          "focus:border-[var(--green)] focus:bg-white focus:shadow-[0_0_0_3px_rgba(94,201,145,0.1)]",
          error ? "border-[var(--am)]" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-[var(--am)]">{error}</p>}
    </div>
  )
);
Input.displayName = "Input";
