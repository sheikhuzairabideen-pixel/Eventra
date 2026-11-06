import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Primary action(s), aligned to the right on wide screens. */
  action?: React.ReactNode;
  back?: { to: string; label: string };
  /** Draw a clear edge under the header (used inside the dashboard). */
  ruled?: boolean;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  action,
  back,
  ruled = false,
  className,
}) => (
  <header
    className={cn(
      "pt-10 pb-8 sm:pt-14 sm:pb-10",
      ruled && "border-edge mb-10 border-b-2",
      className,
    )}
  >
    {back && (
      <Link
        to={back.to}
        className="text-muted-foreground hover:text-foreground -ml-0.5 mb-6 inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {back.label}
      </Link>
    )}
    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <h1 className="text-[2.5rem] leading-[1.05] font-light tracking-[-0.02em] sm:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground mt-4 max-w-xl text-base leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex shrink-0 items-center gap-3">{action}</div>}
    </div>
  </header>
);

export default PageHeader;
