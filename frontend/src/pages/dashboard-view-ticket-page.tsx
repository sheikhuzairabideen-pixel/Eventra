import { useDocumentTitle } from "@/hooks/use-document-title";
import { TicketDetails } from "@/domain/domain";
import { getTicket, getTicketQr } from "@/lib/api";
import { format, isSameDay } from "date-fns";
import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import DashboardShell from "@/components/dashboard-shell";
import StatusTag from "@/components/status-tag";
import { ErrorState, LoadingState } from "@/components/state-views";
import { TicketMark } from "@/components/logo";

const DashboardViewTicketPage: React.FC = () => {
  useDocumentTitle("Your ticket | Eventra");
  const [ticket, setTicket] = useState<TicketDetails | undefined>();
  const [qrCodeUrl, setQrCodeUrl] = useState<string | undefined>();
  const [isQrLoading, setIsQrCodeLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const { id } = useParams();
  const { isLoading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading || !user?.access_token || !id) {
      return;
    }

    // Tracked locally so the cleanup below always revokes the URL it created.
    let objectUrl: string | undefined;

    const fetchTicketData = async (accessToken: string, ticketId: string) => {
      try {
        setIsQrCodeLoading(true);
        setError(undefined);

        const ticketData = await getTicket(accessToken, ticketId);
        setTicket(ticketData);

        const qrBlob = await getTicketQr(accessToken, ticketId);
        objectUrl = URL.createObjectURL(qrBlob);
        setQrCodeUrl(objectUrl);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An error occurred while loading ticket");
        }
      } finally {
        setIsQrCodeLoading(false);
      }
    };

    fetchTicketData(user.access_token, id);

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [user?.access_token, isLoading, id]);

  if (error) {
    return (
      <DashboardShell size="narrow">
        <div className="py-20">
          <ErrorState
            title="This ticket didn’t load"
            message={`${error}. Go back to your tickets and open it again.`}
            action={
              <Button onClick={() => navigate("/dashboard/tickets")}>Back to my tickets</Button>
            }
          />
        </div>
      </DashboardShell>
    );
  }

  const start = ticket?.eventStart ? new Date(ticket.eventStart) : undefined;
  const end = ticket?.eventEnd ? new Date(ticket.eventEnd) : undefined;

  return (
    <DashboardShell size="narrow">
      <div className="pt-10 pb-6 sm:pt-14">
        <button
          type="button"
          onClick={() => navigate("/dashboard/tickets")}
          className="text-muted-foreground hover:text-foreground cursor-pointer text-sm transition-colors"
        >
          ← My tickets
        </button>
      </div>

      {ticket ? (
        <div className="ticket mt-4">
          {/* Identity */}
          <div className="ticket-top bg-ink text-ink-foreground px-7 pt-8 pb-11 sm:px-10">
            <p className="text-ink-muted flex items-center gap-2 text-sm">
              <TicketMark className="text-brand" />
              Admit one
            </p>
            <h1 className="mt-6 text-4xl leading-[1.05] font-light tracking-[-0.02em] sm:text-5xl">
              {ticket.eventName}
            </h1>
            <dl className="text-ink-muted mt-7 space-y-1.5 text-[0.95rem]">
              <div className="flex gap-3">
                <dt className="sr-only">Venue</dt>
                <dd>{ticket.eventVenue}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="sr-only">Date</dt>
                <dd className="tabular-nums">
                  {start && end
                    ? isSameDay(start, end)
                      ? format(start, "EEEE d MMMM yyyy")
                      : `${format(start, "d MMM yyyy")} to ${format(end, "d MMM yyyy")}`
                    : "Date to be announced"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Entry */}
          <div className="ticket-bottom bg-card px-7 pt-7 pb-9 sm:px-10">
            <div className="perforation -mt-7 mb-9" aria-hidden="true" />

            <div className="mx-auto flex size-64 items-center justify-center border-2 border-foreground bg-white p-3">
              {isQrLoading ? (
                <span
                  role="status"
                  aria-label="Loading QR code"
                  className="border-foreground/20 border-t-foreground size-7 rounded-full border-2 motion-safe:animate-spin"
                />
              ) : qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt={`QR code for ${ticket.eventName}`}
                  className="size-full object-contain"
                />
              ) : (
                <p role="alert" className="text-destructive text-center text-sm font-medium">
                  The QR code couldn’t load. Refresh to try again.
                </p>
              )}
            </div>
            <p className="text-muted-foreground mx-auto mt-5 max-w-xs text-center text-sm">
              Show this code to staff at the entrance. Turn your screen
              brightness up if it won’t scan.
            </p>

            <dl className="border-edge mt-10 grid grid-cols-2 gap-x-6 gap-y-6 border-t pt-7">
              <div>
                <dt className="text-muted-foreground text-sm">Ticket</dt>
                <dd className="mt-1 font-serif text-xl">
                  {ticket.description || "Admission pass"}
                </dd>
              </div>
              <div className="text-right">
                <dt className="text-muted-foreground text-sm">Paid</dt>
                <dd className="mt-1 font-serif text-xl tabular-nums">
                  ${ticket.price.toFixed(2)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-sm">Status</dt>
                <dd className="mt-1.5">
                  <StatusTag status={ticket.status} />
                </dd>
              </div>
              <div className="text-right">
                <dt className="text-muted-foreground text-sm">Ticket ID</dt>
                <dd className="mt-1.5 text-xs break-all">{ticket.id}</dd>
              </div>
            </dl>
          </div>
        </div>
      ) : (
        <LoadingState label="Loading your ticket…" />
      )}
    </DashboardShell>
  );
};

export default DashboardViewTicketPage;
