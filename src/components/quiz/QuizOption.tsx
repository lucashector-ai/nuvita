"use client";

interface QuizOptionProps {
  icon: string;
  title: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
}

export function QuizOption({ icon, title, description, selected, onClick }: QuizOptionProps) {
  return (
    <div
      onClick={onClick}
      className={[
        "flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all duration-150",
        "border",
        selected
          ? "border-[var(--green)] bg-[#F2FCF7]"
          : "border-[var(--border)] bg-[var(--bg2)] hover:border-[var(--border2)]",
      ].join(" ")}
    >
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
      <div
        className={[
          "w-[17px] h-[17px] rounded-full border flex-shrink-0 mt-0.5",
          "flex items-center justify-center transition-all duration-150",
          selected
            ? "bg-[var(--green)] border-[var(--green)]"
            : "border-[var(--border2)]",
        ].join(" ")}
      >
        {selected && <div className="w-[5px] h-[5px] bg-white rounded-full" />}
      </div>
    </div>
  );
}
