"use client";

interface ScaleButtonProps {
  emoji: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}

export function ScaleButton({ emoji, label, selected, onClick }: ScaleButtonProps) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex-1 aspect-square rounded-xl flex flex-col items-center justify-center gap-1",
        "cursor-pointer transition-all duration-150 border font-medium",
        "text-[var(--tm)]",
        selected
          ? "border-[var(--green)] bg-[#F2FCF7] text-[var(--tx)]"
          : "border-[var(--border)] bg-[var(--bg2)] hover:border-[var(--border2)]",
      ].join(" ")}
    >
      <span className="text-xl leading-none">{emoji}</span>
      <span
        className={[
          "text-[9px] font-medium uppercase tracking-[0.05em]",
          selected ? "text-[var(--gm)]" : "text-[var(--ts)]",
        ].join(" ")}
      >
        {label}
      </span>
    </button>
  );
}
