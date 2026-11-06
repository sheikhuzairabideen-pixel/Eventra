import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { Link, NavLink, useLocation, useNavigate } from "react-router";
import { LogOut, Menu, X } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import Logo from "./logo";
import { useRoles } from "@/hooks/use-roles";
import { cn } from "@/lib/utils";

interface NavBarProps {
  /** Kept for compatibility with existing pages; the nav now always links home. */
  showBackHome?: boolean;
}

interface NavItem {
  to: string;
  label: string;
  match: (path: string) => boolean;
}

const linkBase =
  "relative inline-flex h-16 items-center text-[0.95rem] font-medium text-muted-foreground transition-colors hover:text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-transparent aria-[current=page]:text-foreground aria-[current=page]:after:bg-brand";

const NavBar: React.FC<NavBarProps> = () => {
  const { user, isAuthenticated, signinRedirect, signoutRedirect } = useAuth();
  const { isOrganizer, isStaff } = useRoles();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const items: NavItem[] = [
    { to: "/", label: "Discover", match: (p) => p === "/" || p.startsWith("/events") },
  ];
  if (!isAuthenticated) {
    items.push({
      to: "/organizers",
      label: "For organizers",
      match: (p) => p.startsWith("/organizers"),
    });
  }
  if (isAuthenticated) {
    if (isOrganizer) {
      items.push({
        to: "/dashboard/events",
        label: "My events",
        match: (p) => p.startsWith("/dashboard/events"),
      });
    }
    items.push({
      to: "/dashboard/tickets",
      label: "My tickets",
      match: (p) => p.startsWith("/dashboard/tickets"),
    });
    if (isStaff) {
      items.push({
        to: "/dashboard/validate-qr",
        label: "Scan tickets",
        match: (p) => p.startsWith("/dashboard/validate-qr"),
      });
    }
  }

  const initials =
    user?.profile?.preferred_username?.slice(0, 2).toUpperCase() || "U";

  return (
    <header className="bg-card border-edge sticky top-0 z-50 border-b-2">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-6 px-5 sm:px-8">
        <div className="flex items-center gap-10">
          <Logo />
          <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                aria-current={item.match(location.pathname) ? "page" : undefined}
                className={linkBase}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated ? (
            <>
              <Button
                onClick={() => navigate("/dashboard")}
                variant="outline"
                size="sm"
                className="hidden sm:inline-flex"
              >
                Dashboard
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label="Open account menu"
                    className="cursor-pointer rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-brand/60"
                  >
                    <Avatar className="size-9">
                      <AvatarFallback className="text-xs font-semibold tracking-wide">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-60" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <p className="font-serif text-base font-medium">
                      {user?.profile?.name || user?.profile?.preferred_username}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      {user?.profile?.email}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/dashboard/tickets")}>
                    My tickets
                  </DropdownMenuItem>
                  {isOrganizer && (
                    <DropdownMenuItem onClick={() => navigate("/dashboard/events")}>
                      Manage events
                    </DropdownMenuItem>
                  )}
                  {isStaff && (
                    <DropdownMenuItem onClick={() => navigate("/dashboard/validate-qr")}>
                      Scan tickets
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={() => signoutRedirect()}>
                    <LogOut className="size-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button onClick={() => signinRedirect()} size="sm">
              Log in or sign up
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile navigation */}
      <nav
        id="mobile-nav"
        aria-label="Primary mobile"
        hidden={!menuOpen}
        className={cn("border-edge border-t md:hidden", !menuOpen && "hidden")}
      >
        <ul className="mx-auto max-w-[1280px] px-5 py-2 sm:px-8">
          {items.map((item) => (
            <li key={item.to} className="border-b last:border-b-0">
              <Link
                to={item.to}
                aria-current={item.match(location.pathname) ? "page" : undefined}
                className="aria-[current=page]:text-foreground text-muted-foreground flex items-center justify-between py-4 font-serif text-xl aria-[current=page]:font-medium"
              >
                {item.label}
              </Link>
            </li>
          ))}
          {isAuthenticated && (
            <li className="border-t py-3">
              <Link
                to="/dashboard"
                className="text-muted-foreground flex items-center py-1 text-sm underline underline-offset-4"
              >
                Dashboard
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default NavBar;
