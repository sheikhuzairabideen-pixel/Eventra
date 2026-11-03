import { useAuth } from "react-oidc-context";
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
import { LogOut, Sparkles, Calendar, Ticket, CheckSquare, Home, ArrowLeft } from "lucide-react";
import { useRoles } from "@/hooks/use-roles";
import { Link, useNavigate, useLocation } from "react-router";

interface NavBarProps {
  showBackHome?: boolean;
}

const NavBar: React.FC<NavBarProps> = ({ showBackHome = true }) => {
  const { user, isAuthenticated, signinRedirect, signoutRedirect } = useAuth();
  const { isOrganizer, isStaff } = useRoles();
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/";

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/85 border-b border-slate-800 text-white shadow-lg transition-all">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-4 sm:gap-8">
            <Link
              to="/"
              className="flex items-center gap-2.5 group transition-transform active:scale-95"
            >
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 p-0.5 shadow-md shadow-purple-900/30">
                <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center group-hover:bg-transparent transition-colors">
                  <Sparkles className="h-5 w-5 text-purple-400 group-hover:text-white transition-colors" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-purple-300 bg-clip-text text-transparent">
                  Eventra
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-purple-400 -mt-1 hidden sm:block">
                  Live Experiences
                </span>
              </div>
            </Link>

            {/* Back to Home pill if inside dashboard/events */}
            {showBackHome && !isHome && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/")}
                className="hidden md:flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-900/80 border-slate-700/80 hover:bg-slate-800 rounded-full cursor-pointer px-3 py-1 shadow-sm transition"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Events</span>
              </Button>
            )}

            {/* Navigation links */}
            {isAuthenticated && (
              <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
                <Link
                  to="/"
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    isHome ? "text-purple-400 bg-purple-950/40" : "text-slate-300 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <Home className="h-4 w-4" />
                  <span>Discover</span>
                </Link>

                {isOrganizer && (
                  <Link
                    to="/dashboard/events"
                    className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                      location.pathname.startsWith("/dashboard/events")
                        ? "text-purple-400 bg-purple-950/40 font-semibold"
                        : "text-slate-300 hover:text-white hover:bg-slate-900"
                    }`}
                  >
                    <Calendar className="h-4 w-4" />
                    <span>My Events</span>
                  </Link>
                )}

                <Link
                  to="/dashboard/tickets"
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    location.pathname.startsWith("/dashboard/tickets")
                      ? "text-purple-400 bg-purple-950/40 font-semibold"
                      : "text-slate-300 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <Ticket className="h-4 w-4" />
                  <span>My Tickets</span>
                </Link>

                {isStaff && (
                  <Link
                    to="/dashboard/validate-qr"
                    className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                      location.pathname.startsWith("/dashboard/validate-qr")
                        ? "text-purple-400 bg-purple-950/40 font-semibold"
                        : "text-slate-300 hover:text-white hover:bg-slate-900"
                    }`}
                  >
                    <CheckSquare className="h-4 w-4" />
                    <span>Scan Tickets</span>
                  </Link>
                )}
              </nav>
            )}
          </div>

          {/* Right Action buttons & Profile */}
          <div className="flex items-center gap-3">
            {showBackHome && !isHome && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="md:hidden flex items-center gap-1 text-xs text-slate-300 hover:text-white cursor-pointer px-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Home</span>
              </Button>
            )}

            {isAuthenticated ? (
              <>
                <Button
                  onClick={() => navigate("/dashboard")}
                  variant="outline"
                  size="sm"
                  className="hidden sm:inline-flex bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700 cursor-pointer rounded-lg text-xs font-semibold px-3.5 py-1.5 shadow-sm"
                >
                  Dashboard
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-purple-500/50 transition cursor-pointer outline-none">
                      <Avatar className="h-8 w-8 ring-2 ring-purple-600/60 shadow">
                        <AvatarFallback className="bg-gradient-to-br from-purple-700 to-indigo-800 text-white font-bold text-xs">
                          {user?.profile?.preferred_username?.slice(0, 2).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56 bg-slate-900 border-slate-700/80 text-white shadow-xl shadow-black/60 rounded-xl p-1.5"
                    align="end"
                  >
                    <DropdownMenuLabel className="font-normal px-2 py-2">
                      <p className="text-sm font-semibold text-white">
                        {user?.profile?.name || user?.profile?.preferred_username}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{user?.profile?.email}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-slate-800" />
                    <DropdownMenuItem
                      className="cursor-pointer text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg py-2"
                      onClick={() => navigate("/dashboard/tickets")}
                    >
                      <Ticket className="h-4 w-4 mr-2 text-purple-400" />
                      <span>My Tickets</span>
                    </DropdownMenuItem>
                    {isOrganizer && (
                      <DropdownMenuItem
                        className="cursor-pointer text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg py-2"
                        onClick={() => navigate("/dashboard/events")}
                      >
                        <Calendar className="h-4 w-4 mr-2 text-indigo-400" />
                        <span>Manage Events</span>
                      </DropdownMenuItem>
                    )}
                    {isStaff && (
                      <DropdownMenuItem
                        className="cursor-pointer text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg py-2"
                        onClick={() => navigate("/dashboard/validate-qr")}
                      >
                        <CheckSquare className="h-4 w-4 mr-2 text-emerald-400" />
                        <span>Staff Validation</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-slate-800" />
                    <DropdownMenuItem
                      className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg py-2"
                      onClick={() => signoutRedirect()}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      <span>Log Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => signinRedirect()}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer shadow-md shadow-purple-900/30 transition-all hover:shadow-purple-900/50"
                >
                  Log in / Sign up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
