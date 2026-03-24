"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "dark" | "outline" | "green" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  children: ReactNode;
}

const variants = {
  dark: "bg-[var(--dark)] text-white hover:bg-[var(--dark2)]",
  outline: "bg-transparent text-[var(--tm)] border border-[var(--border)] hover:border-[var(--border2)] hover:text-[var(--tx)]",
  green: "bg-[var(--green)] text-[var(--dark)] hover:opacity-90",
  ghost: "bg-transparent text-[var(--ts)] hover:text-[var(--tx)]",
};

const sizes = {
  sm: "px-4 py-2 text-xs",
  md: "px-5 py-3 text-sm",
  lg: "px-6 py-3.5 text-sm",
};

export function Button({
  variant = "dark",
  size = "md",
  fullWidth = false,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        "inline-flex items-center justify-center gap-1.5 font-medium rounded-full transition-all duration-150 cursor-pointer",
        "font-[family-name:var(--font-inter)]",
        "tracking-[-0.01em] whitespace-nowrap",
        variants[variant],
        sizes[size],
        fullWidth ? "w-full" : "",
        disabled ? "opacity-30 cursor-not-allowed" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
