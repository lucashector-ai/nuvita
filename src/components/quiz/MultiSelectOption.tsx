"use client";

interface MultiSelectOptionProps {
  icon: string;
  title: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
}

export function MultiSelectOption({
  icon, title, description, selected, onClick,
}: MultiSelectOptionProps) {
  return (
    <div
      onClick={onClick}
      className={[
        "flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all duration-150",
        "border-2 relative",
        selected
          ? "border-[var(--green)] bg-[#F2FCF7]"
          : "border-[var(--border)] bg-[var(--bg2)] hover:border-[var(--border2)]",
      ].join(" ")}
    >
      {/* Checkbox */}
      <div
        className={[
          "w-[17px] h-[17px] rounded flex-shrink-0 mt-0.5 border-2",
          "flex items-center justify-center transition-all duration-150",
          selected
            ? "bg-[var(--green)] border-[var(--green)]"
            : "border-[var(--border2)]",
        ].join(" ")}
      >
        {selected && (
          <svg width="9" height="9" fill="none" viewBox="0 0 9 9">
            <path
              d="M1.5 4.5l2 2L7.5 2"
              stroke="white"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <span className="text-lg flex-shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1">
        <div className="text-sm font-medium text-[var(--tx)] mb-0.5 tracking-[-0.02em]">
          {title}
        </div>
        {description && (
          <div className="text-xs text-[var(--ts)] leading-snug tracking-[-0.01em]">
            {description}
          </div>
        )}
      </div>
    </div>
  );
}
