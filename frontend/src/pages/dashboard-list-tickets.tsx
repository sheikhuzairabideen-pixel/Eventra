import { useDocumentTitle } from "@/hooks/use-document-title";
import { SimplePagination } from "@/components/simple-pagination";
import { Button } from "@/components/ui/button";
import { SpringBootPagination, TicketSummary } from "@/domain/domain";
import { listTickets } from "@/lib/api";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { Link, useNavigate } from "react-router";
import DashboardShell from "@/components/dashboard-shell";
import PageHeader from "@/components/page-header";
import StatusTag from "@/components/status-tag";
import { EmptyState, ErrorState, LoadingState } from "@/components/state-views";

const DashboardListTickets: React.FC = () => {
  useDocumentTitle("My tickets | Eventra");
  const { isLoading, user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<
    SpringBootPagination<TicketSummary> | undefined
  >();
  const [error, setError] = useState<string | undefined>();
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (isLoading || !user?.access_token) {
      return;
    }

    const fetchTickets = async () => {
      try {
        setError(undefined);
        setTickets(await listTickets(user.access_token, page));
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to fetch tickets");
        }
      }
    };

    fetchTickets();
  }, [isLoading, user, page]);

  if (error) {
    return (
      <DashboardShell>
        <div className="py-20">
          <ErrorState
            title="Your tickets didn’t load"
            message={`${error}. Refresh the page to try again.`}
          />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <PageHeader
        ruled
        title="My tickets"
        description="Open a ticket to show its QR code at the entrance."
      />

      {!tickets ? (
        <LoadingState label="Loading your tickets…" />
      ) : tickets.content.length > 0 ? (
        <ul className="bg-card border-edge border shadow-md">
          {tickets.content.map((ticketItem) => (
            <li key={ticketItem.id} className="border-border border-b last:border-b-0">
              <Link
                to={`/dashboard/tickets/${ticketItem.id}`}
                className="group hover:bg-secondary/70 flex flex-col gap-4 px-6 py-6 transition-colors sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-normal tracking-[-0.01em] sm:text-3xl">
                      {ticketItem.ticketType.name}
                    </h2>
                    <StatusTag status={ticketItem.status} />
                  </div>
                  <p className="text-muted-foreground mt-2 text-sm break-all">
                    Ticket {ticketItem.id}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-8 sm:justify-end">
                  <span className="font-serif text-2xl font-light tabular-nums">
                    ${ticketItem.ticketType.price.toFixed(2)}
                  </span>
                  <span className="inline-flex items-center gap-2 font-semibold whitespace-nowrap underline underline-offset-4 group-hover:underline-offset-[6px]">
                    Show QR code
                    <ArrowRight
                      aria-hidden="true"
                      className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
                    />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          className="bg-card border-edge border px-8 shadow-sm"
          title="No tickets yet"
          message="Tickets you buy show up here with a QR code you can scan at the door."
          action={<Button onClick={() => navigate("/")}>Browse events</Button>}
        />
      )}

      {tickets && tickets.totalPages > 1 && (
        <div className="flex justify-center py-12">
          <SimplePagination pagination={tickets} onPageChange={setPage} />
        </div>
      )}
    </DashboardShell>
  );
};

export default DashboardListTickets;
