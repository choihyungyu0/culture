import { brand } from "@/lib/content";
import { cn } from "@/lib/utils";

/** Brand mark — two overlapping light-density nodes = the TWIN. Inherits currentColor. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <circle cx="9" cy="12" r="6.4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="15" cy="12" r="6.4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="1.7" fill="currentColor" />
    </svg>
  );
}

/** Mark + wordmark lockup. */
export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className="h-5 w-5" />
      {showWordmark && (
        <span className="font-display text-base font-bold tracking-tight">
          {brand.name}
        </span>
      )}
    </span>
  );
}
