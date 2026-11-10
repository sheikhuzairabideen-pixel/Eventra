import { cn } from "@/lib/utils";
import NavBar from "./nav-bar";
import SiteFooter from "./site-footer";
import { Toaster } from "./toaster";

interface PageShellProps {
  children: React.ReactNode;
  /** Content measure. "full" lets the page draw its own full-bleed sections. */
  width?: "narrow" | "default" | "wide" | "full";
  /** Pass false on pages that draw their own footer treatment. */
  footer?: boolean;
  className?: string;
}

const widths: Record<NonNullable<PageShellProps["width"]>, string> = {
  narrow: "mx-auto w-full max-w-[640px] px-5 sm:px-8",
  default: "mx-auto w-full max-w-[960px] px-5 sm:px-8",
  wide: "mx-auto w-full max-w-[1280px] px-5 sm:px-8",
  full: "",
};

const PageShell: React.FC<PageShellProps> = ({
  children,
  width = "wide",
  footer = true,
  className,
}) => (
  <div className="bg-background text-foreground flex min-h-screen flex-col">
    <a
      href="#main"
      className="bg-brand text-brand-foreground sr-only z-[60] px-4 py-2 font-medium focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
    >
      Skip to content
    </a>
    <NavBar />
    {/* A short fade on every route change: the only page transition we use. */}
    <main
      id="main"
      className={cn(
        "flex-1 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300",
        widths[width],
        className,
      )}
    >
      {children}
    </main>
    {footer && <SiteFooter className={width === "full" ? "mt-0" : undefined} />}
    <Toaster />
  </div>
);

export default PageShell;
