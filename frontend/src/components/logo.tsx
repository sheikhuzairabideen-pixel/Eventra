import { Link } from "react-router";
import { cn } from "@/lib/utils";

/** A ticket silhouette: rectangle with a notch on each side. */
export const TicketMark: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className={cn("h-[1.15em] w-[1.15em]", className)}
    fill="currentColor"
  >
    <path d="M3 5h18v5a2 2 0 0 0 0 4v5H3v-5a2 2 0 0 0 0-4V5Z" />
  </svg>
);

interface LogoProps {
  className?: string;
  inverted?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className, inverted }) => (
  <Link
    to="/"
    aria-label="Eventra home"
    className={cn(
      "inline-flex items-center gap-2 font-serif text-[1.55rem] leading-none font-medium tracking-tight",
      inverted ? "text-ink-foreground" : "text-foreground",
      className,
    )}
  >
    <TicketMark className="text-brand" />
    <span>Eventra</span>
  </Link>
);

export default Logo;
