import { useSyncExternalStore } from "react";
import { Check, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "success" | "error";
interface ToastItem {
  id: number;
  message: string;
  tone: Tone;
}

/* A tiny module-level store, so any file can call toast("Saved") without a provider. */
let toasts: ToastItem[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

const dismiss = (id: number) => {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
};

export function toast(message: string, tone: Tone = "success") {
  const id = nextId++;
  toasts = [...toasts, { id, message, tone }];
  emit();
  setTimeout(() => dismiss(id), tone === "error" ? 7000 : 4000);
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getSnapshot = () => toasts;

/** Rendered once, inside PageShell. Announces messages politely to screen readers. */
export const Toaster: React.FC = () => {
  const items = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return (
    <div
      role="region"
      aria-label="Notifications"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex flex-col items-center gap-3 p-4 sm:items-end sm:p-6"
    >
      {items.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex w-full max-w-sm items-start gap-3 border-l-4 border-y border-r border-edge bg-card px-4 py-3.5 shadow-lg",
            "motion-safe:animate-in motion-safe:slide-in-from-bottom-2 motion-safe:fade-in",
            t.tone === "success" ? "border-l-success" : "border-l-destructive",
          )}
        >
          {t.tone === "success" ? (
            <Check className="text-success mt-0.5 size-5 shrink-0" aria-hidden="true" />
          ) : (
            <AlertCircle className="text-destructive mt-0.5 size-5 shrink-0" aria-hidden="true" />
          )}
          <p className="flex-1 text-[0.95rem] leading-snug font-medium">{t.message}</p>
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            aria-label="Dismiss notification"
            className="hover:bg-accent -m-1 cursor-pointer rounded-md p-1 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
