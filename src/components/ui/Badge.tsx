import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "green" | "amber" | "dark" | "neutral";
  dot?: boolean;
  className?: string;
}

const variants = {
  green: "bg-[var(--gp)] text-[var(--gm)]",
  amber: "bg-[var(--ab)] text-[var(--am)]",
  dark: "bg-[var(--dark)] text-white",
  neutral: "bg-[var(--bg2)] text-[var(--ts)] border border-[var(--border)]",
};

export function Badge({ children, variant = "green", dot, className = "" }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full",
        "text-[11px] font-medium tracking-[0.06em] uppercase",
        variants[variant],
        className,
      ].join(" ")}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full bg-current pulse-dot"
          style={{ background: "var(--green)" }}
        />
      )}
      {children}
    </span>
  );
}
