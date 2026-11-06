import { cn } from "@/lib/utils";
import { EventStatusEnum, TicketStatus } from "@/domain/domain";

type Tone = "success" | "warning" | "danger" | "neutral";

const tones: Record<Tone, string> = {
  success: "text-success border-success/50 bg-success/10",
  warning: "text-warning border-warning/50 bg-warning/10",
  danger: "text-destructive border-destructive/50 bg-destructive/10",
  neutral: "text-muted-foreground border-input bg-secondary",
};

const dot: Record<Tone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-destructive",
  neutral: "bg-muted-foreground",
};

const toneFor = (status: string): Tone => {
  switch (status) {
    case EventStatusEnum.PUBLISHED:
    case TicketStatus.PURCHASED:
      return "success";
    case EventStatusEnum.DRAFT:
      return "warning";
    case EventStatusEnum.CANCELLED:
      return "danger";
    default:
      return status === EventStatusEnum.COMPLETED ? "neutral" : "danger";
  }
};

const sentenceCase = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1).toLowerCase().replace(/_/g, " ");

/** Status is shown with a dot and a word, never colour alone. */
const StatusTag: React.FC<{ status: string; className?: string }> = ({
  status,
  className,
}) => {
  const tone = toneFor(status);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", dot[tone])} />
      {sentenceCase(status)}
    </span>
  );
};

export default StatusTag;
