"use client";
import { Logo } from "@/components/ui/Logo";

interface QuizNavProps {
  progress: number;
  label: string;
}

export function QuizNav({ progress, label }: QuizNavProps) {
  return (
    <>
      <nav className="border-b border-[var(--border)] bg-white sticky top-0 z-50">
        <div className="max-w-[1216px] mx-auto px-8 h-[58px] flex items-center justify-between">
          <Logo width={88} />
          <span className="text-xs font-medium text-[var(--ts)] tracking-[0.02em]">
            {label}
          </span>
        </div>
      </nav>
      <div className="qpb-wrap">
        <div className="qpb" style={{ width: `${progress}%` }} />
      </div>
    </>
  );
}
