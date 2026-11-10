import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/** Loading: a quiet line of text, not a spinner. Announced to screen readers. */
export const LoadingState: React.FC<{ label?: string; className?: string }> = ({
  label = "Loading…",
  className,
}) => (
  <div
    role="status"
    aria-live="polite"
    className={cn("text-muted-foreground flex items-center gap-3 py-24 text-[0.95rem]", className)}
  >
    <span
      aria-hidden="true"
      className="border-foreground/20 border-t-foreground size-4 rounded-full border-2 motion-safe:animate-spin"
    />
    {label}
  </div>
);

export const SkeletonBlock: React.FC<{ className?: string }> = ({ className }) => (
  <div aria-hidden="true" className={cn("bg-secondary motion-safe:animate-pulse", className)} />
);

interface ErrorStateProps {
  title: string;
  message: string;
  action?: React.ReactNode;
  className?: string;
}

/** Says what went wrong in the interface's voice, and what to do next. */
export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  action,
  className,
}) => (
  <div
    role="alert"
    className={cn("border-destructive max-w-xl border-l-2 py-2 pl-6", className)}
  >
    <div className="text-destructive flex items-center gap-2">
      <AlertCircle className="size-5" aria-hidden="true" />
      <h1 className="font-serif text-2xl font-medium tracking-tight">{title}</h1>
    </div>
    <p className="text-muted-foreground mt-3 leading-relaxed">{message}</p>
    {action && <div className="mt-6">{action}</div>}
  </div>
);

interface EmptyStateProps {
  title: string;
  message: string;
  action?: React.ReactNode;
  className?: string;
}

/** Emptiness is an invitation to act. */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  action,
  className,
}) => (
  <div className={cn("border-y py-16 sm:py-20", className)}>
    <h2 className="max-w-md text-3xl font-light tracking-[-0.01em]">{title}</h2>
    <p className="text-muted-foreground mt-3 max-w-md leading-relaxed">{message}</p>
    {action && <div className="mt-8">{action}</div>}
  </div>
);
