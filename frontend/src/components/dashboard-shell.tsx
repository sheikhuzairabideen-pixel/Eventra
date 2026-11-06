import { NavLink, useLocation } from "react-router";
import { CalendarDays, ScanLine, Ticket } from "lucide-react";
import { useRoles } from "@/hooks/use-roles";
import PageShell from "./page-shell";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  children: React.ReactNode;
  /** Content measure inside the dashboard column. */
  size?: "default" | "narrow";
}

interface Item {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: (p: string) => boolean;
}

/**
 * The application frame: a sunken sidebar on the left, content on the page
 * colour to the right. Below `lg` the sidebar becomes a scrollable tab strip.
 */
const DashboardShell: React.FC<DashboardShellProps> = ({ children, size = "default" }) => {
  const { isOrganizer, isStaff } = useRoles();
  const { pathname } = useLocation();

  const items: Item[] = [];
  if (isOrganizer) {
    items.push({
      to: "/dashboard/events",
      label: "My events",
      icon: CalendarDays,
      active: (p) => p.startsWith("/dashboard/events"),
    });
  }
  items.push({
    to: "/dashboard/tickets",
    label: "My tickets",
    icon: Ticket,
    active: (p) => p.startsWith("/dashboard/tickets"),
  });
  if (isStaff) {
    items.push({
      to: "/dashboard/validate-qr",
      label: "Scan tickets",
      icon: ScanLine,
      active: (p) => p.startsWith("/dashboard/validate-qr"),
    });
  }

  return (
    <PageShell width="full">
      <div className="dash-frame">
        <div className="mx-auto max-w-[1280px] lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
          {/* Tablet and phone: tab strip */}
          <nav
            aria-label="Dashboard"
            className="bg-secondary border-edge sticky top-16 z-30 -mb-px flex gap-1 overflow-x-auto border-b px-4 lg:hidden"
          >
            {items.map((item) => {
              const current = item.active(pathname);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "flex shrink-0 items-center gap-2 border-b-2 px-3 py-3.5 text-[0.95rem] font-medium",
                    current
                      ? "border-brand text-foreground"
                      : "text-muted-foreground hover:text-foreground border-transparent",
                  )}
                >
                  <item.icon className="size-4" aria-hidden="true" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Desktop: sidebar */}
          <aside className="border-edge hidden border-r lg:block">
            <nav aria-label="Dashboard" className="sticky top-16 px-4 py-10">
              <p className="text-muted-foreground mb-4 px-3 text-sm font-medium">Dashboard</p>
              <ul className="space-y-1">
                {items.map((item) => {
                  const current = item.active(pathname);
                  return (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        aria-current={current ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-3 border border-transparent px-3 py-2.5 text-[0.95rem] font-medium transition-colors",
                          current
                            ? "bg-card border-edge text-foreground [box-shadow:inset_4px_0_0_var(--brand),0_1px_0_rgb(31_28_23/0.1),0_2px_6px_-2px_rgb(31_28_23/0.18)]"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground",
                        )}
                      >
                        <item.icon className="size-[1.1rem]" aria-hidden="true" />
                        {item.label}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          <div className={cn("min-w-0 px-5 pb-16 sm:px-8 lg:px-12", size === "narrow" && "lg:max-w-[760px]")}>
            {children}
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default DashboardShell;
