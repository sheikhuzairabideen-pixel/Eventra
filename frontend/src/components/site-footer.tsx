import { Link } from "react-router";
import Logo from "./logo";
import { cn } from "@/lib/utils";

const SiteFooter: React.FC<{ className?: string }> = ({ className }) => (
  <footer className={cn("bg-ink text-ink-foreground mt-24", className)}>
    <div className="mx-auto grid max-w-[1280px] gap-12 px-5 py-16 sm:px-8 md:grid-cols-12">
      <div className="md:col-span-6">
        <Logo inverted />
        <p className="text-ink-muted mt-5 max-w-sm text-[0.95rem] leading-relaxed">
          Create an event, sell tickets, and check people in at the door with a
          QR code.
        </p>
      </div>

      <nav aria-label="Attendees" className="md:col-span-3">
        <h2 className="font-sans text-sm font-semibold">For attendees</h2>
        <ul className="text-ink-muted mt-4 space-y-2.5 text-[0.95rem]">
          <li>
            <Link className="hover:text-ink-foreground transition-colors" to="/">
              Browse events
            </Link>
          </li>
          <li>
            <Link className="hover:text-ink-foreground transition-colors" to="/dashboard/tickets">
              My tickets
            </Link>
          </li>
        </ul>
      </nav>

      <nav aria-label="Organizers and staff" className="md:col-span-3">
        <h2 className="font-sans text-sm font-semibold">For organizers and staff</h2>
        <ul className="text-ink-muted mt-4 space-y-2.5 text-[0.95rem]">
          <li>
            <Link className="hover:text-ink-foreground transition-colors" to="/organizers">
              Sell tickets with Eventra
            </Link>
          </li>
          <li>
            <Link className="hover:text-ink-foreground transition-colors" to="/dashboard/events">
              Manage events
            </Link>
          </li>
          <li>
            <Link className="hover:text-ink-foreground transition-colors" to="/dashboard/validate-qr">
              Scan tickets
            </Link>
          </li>
        </ul>
      </nav>
    </div>
    <div className="border-ink-foreground/15 border-t">
      <p className="text-ink-muted mx-auto max-w-[1280px] px-5 py-6 text-sm sm:px-8">
        © {new Date().getFullYear()} Eventra
      </p>
    </div>
  </footer>
);

export default SiteFooter;
