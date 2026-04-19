import Link from "next/link";

import { cn } from "@/lib/utils";

type LogoProps = {
  href?: string;
  className?: string;
  muted?: boolean;
  compact?: boolean;
  asChild?: boolean;
};

export default function Logo({ href = "/", className, muted = false, compact = false, asChild = false }: LogoProps) {
  const content = (
    <>
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#15307d_0%,#1f7a68_52%,#c89d53_100%)] shadow-[0_18px_48px_rgba(13,26,44,0.24)]">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-5 w-5 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 17.5h14" />
          <path d="M7.5 14V9.5a4.5 4.5 0 0 1 9 0V14" />
          <path d="M10 11.5h4" />
        </svg>
      </div>
      {!compact ? (
        <div className="leading-none">
          <div className={cn("text-[0.7rem] font-semibold uppercase tracking-[0.35em]", muted ? "text-white/55" : "text-[var(--ink-soft)]")}>
            Adaptive Finance
          </div>
          <div className={cn("text-lg font-semibold tracking-[-0.04em]", muted ? "text-white" : "text-[var(--ink)]")}>
            AFOCE
          </div>
        </div>
      ) : null}
    </>
  );

  if (asChild) {
    return <>{content}</>;
  }

  return (
    <Link href={href} className={cn("inline-flex items-center gap-3", className)}>
      {content}
    </Link>
  );
}
