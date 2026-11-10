import { useDocumentTitle } from "@/hooks/use-document-title";
import { SimplePagination } from "@/components/simple-pagination";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { EventSummary, EventStatusEnum, SpringBootPagination } from "@/domain/domain";
import { deleteEvent, listEvents } from "@/lib/api";
import { AlertCircle, ExternalLink, BarChart2, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { Link } from "react-router";
import DashboardShell from "@/components/dashboard-shell";
import { toast } from "@/components/toaster";
import PageHeader from "@/components/page-header";
import StatusTag from "@/components/status-tag";
import { EmptyState, ErrorState, LoadingState } from "@/components/state-views";

const DashboardListEventsPage: React.FC = () => {
  useDocumentTitle("My events | Eventra");
  const { isLoading, user } = useAuth();
  const [events, setEvents] = useState<
    SpringBootPagination<EventSummary> | undefined
  >();
  const [error, setError] = useState<string | undefined>();
  const [deleteEventError, setDeleteEventError] = useState<
    string | undefined
  >();

  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<
    EventSummary | undefined
  >();

  useEffect(() => {
    if (isLoading || !user?.access_token) {
      return;
    }
    refreshEvents(user.access_token);
  }, [isLoading, user, page]);

  const refreshEvents = async (accessToken: string) => {
    try {
      setEvents(await listEvents(accessToken, page));
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === "string") {
        setError(err);
      } else {
        setError("An unknown error has occurred");
      }
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) {
      return "TBD";
    }
    return new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date?: Date) => {
    if (!date) {
      return "";
    }
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleOpenDeleteEventDialog = (event: EventSummary) => {
    setDeleteEventError(undefined);
    setEventToDelete(event);
    setDialogOpen(true);
  };

  const handleCancelDeleteEventDialog = () => {
    setDeleteEventError(undefined);
    setEventToDelete(undefined);
    setDialogOpen(false);
  };

  const handleDeleteEvent = async () => {
    if (!user?.access_token || !eventToDelete) {
      return;
    }

    try {
      await deleteEvent(user.access_token, eventToDelete.id);
      setDeleteEventError(undefined);
      setEventToDelete(undefined);
      setDialogOpen(false);
      toast("Event deleted");
      refreshEvents(user.access_token);
    } catch (err) {
      if (err instanceof Error) {
        setDeleteEventError(err.message);
      } else if (typeof err === "string") {
        setDeleteEventError(err);
      } else {
        setDeleteEventError("An unknown error occurred while deleting event");
      }
    }
  };

  if (error) {
    return (
      <DashboardShell>
        <div className="py-20">
          <ErrorState
            title="Your events didn’t load"
            message={`${error}. Refresh the page to try again.`}
          />
        </div>
      </DashboardShell>
    );
  }

  const actions = (eventItem: EventSummary) => (
    <>
      <Button asChild size="sm" variant="outline">
        <Link to={`/dashboard/events/update/${eventItem.id}`}>
          <Pencil aria-hidden="true" />
          Edit
          <span className="sr-only"> {eventItem.name}</span>
        </Link>
      </Button>
      <Button asChild size="sm" variant="outline">
        <Link to={`/dashboard/events/${eventItem.id}/analytics`}>
          <BarChart2 aria-hidden="true" />
          Analytics
          <span className="sr-only"> for {eventItem.name}</span>
        </Link>
      </Button>
      {eventItem.status === EventStatusEnum.PUBLISHED && (
        <Button asChild size="sm" variant="ghost">
          <Link to={`/events/${eventItem.id}`} target="_blank" rel="noreferrer">
            <ExternalLink aria-hidden="true" />
            View page
            <span className="sr-only"> for {eventItem.name} (opens in a new tab)</span>
          </Link>
        </Button>
      )}
      <Button
        size="sm"
        variant="ghost"
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => handleOpenDeleteEventDialog(eventItem)}
      >
        <Trash2 aria-hidden="true" />
        Delete
        <span className="sr-only"> {eventItem.name}</span>
      </Button>
    </>
  );

  const ticketTypeList = (eventItem: EventSummary) =>
    eventItem.ticketTypes.length > 0 ? (
      <ul>
        {eventItem.ticketTypes.map((ticketType) => (
          <li key={ticketType.id} className="flex justify-between gap-4">
            <span>{ticketType.name}</span>
            <span className="tabular-nums">${ticketType.price}</span>
          </li>
        ))}
      </ul>
    ) : (
      <span className="text-muted-foreground">None yet</span>
    );

  return (
    <DashboardShell>
      <PageHeader
        ruled
        title="My events"
        description="Create events, set ticket types, and publish when you’re ready to sell."
        action={
          <Button asChild size="lg">
            <Link to="/dashboard/events/create">
              <Plus aria-hidden="true" />
              Create event
            </Link>
          </Button>
        }
      />

      {!events ? (
        <LoadingState label="Loading your events…" />
      ) : events.content.length > 0 ? (
        <>
          {/* Desktop and tablet: a table */}
          <div className="bg-card border-edge hidden border shadow-md md:block">
            <table className="w-full border-collapse text-left text-[0.95rem]">
              <caption className="sr-only">Your events</caption>
              <thead className="bg-secondary border-edge border-b text-sm">
                <tr>
                  <th scope="col" className="px-5 py-3.5 font-semibold">Event</th>
                  <th scope="col" className="px-5 py-3.5 font-semibold">When</th>
                  <th scope="col" className="px-5 py-3.5 font-semibold">Tickets</th>
                  <th scope="col" className="px-5 py-3.5 text-right font-semibold">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {events.content.map((eventItem) => (
                  <tr key={eventItem.id} className="border-border border-b align-top last:border-b-0">
                    <td className="max-w-[18rem] px-5 py-6">
                      <h2 className="text-2xl leading-tight font-normal tracking-[-0.01em]">
                        {eventItem.name}
                      </h2>
                      <div className="mt-2">
                        <StatusTag status={eventItem.status} />
                      </div>
                      <p className="text-muted-foreground mt-3 text-sm">{eventItem.venue}</p>
                    </td>
                    <td className="px-5 py-6 tabular-nums">
                      <p>
                        {formatDate(eventItem.start)} to {formatDate(eventItem.end)}
                      </p>
                      {(eventItem.start || eventItem.end) && (
                        <p className="text-muted-foreground text-sm">
                          {formatTime(eventItem.start)} – {formatTime(eventItem.end)}
                        </p>
                      )}
                      <p className="text-muted-foreground mt-3 text-sm">On sale</p>
                      <p>
                        {formatDate(eventItem.salesStart)} to {formatDate(eventItem.salesEnd)}
                      </p>
                    </td>
                    <td className="min-w-[11rem] px-5 py-6">{ticketTypeList(eventItem)}</td>
                    <td className="px-5 py-6">
                      <div className="flex flex-col items-stretch gap-1.5">{actions(eventItem)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Phone: one bordered tile per event */}
          <ul className="space-y-6 md:hidden">
            {events.content.map((eventItem) => (
              <li key={eventItem.id} className="bg-card border-edge border shadow-md">
                <div className="p-5">
                  <h2 className="text-2xl leading-tight font-normal tracking-[-0.01em]">
                    {eventItem.name}
                  </h2>
                  <div className="mt-2">
                    <StatusTag status={eventItem.status} />
                  </div>
                  <dl className="mt-5 space-y-4 text-[0.95rem]">
                    <div>
                      <dt className="text-muted-foreground text-sm">When</dt>
                      <dd className="tabular-nums">
                        {formatDate(eventItem.start)} to {formatDate(eventItem.end)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-sm">Venue</dt>
                      <dd>{eventItem.venue}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-sm">Tickets on sale</dt>
                      <dd className="tabular-nums">
                        {formatDate(eventItem.salesStart)} to {formatDate(eventItem.salesEnd)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-sm">Ticket types</dt>
                      <dd>{ticketTypeList(eventItem)}</dd>
                    </div>
                  </dl>
                </div>
                <div className="border-edge bg-secondary flex flex-wrap items-center gap-2 border-t px-3 py-3">
                  {actions(eventItem)}
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <EmptyState
          className="bg-card border-edge border px-8 shadow-sm"
          title="You haven’t created an event yet"
          message="Start with a name, a venue and dates. Add ticket types, then publish when you’re ready to sell."
          action={
            <Button asChild size="lg">
              <Link to="/dashboard/events/create">Create your first event</Link>
            </Button>
          }
        />
      )}

      {events && events.totalPages > 1 && (
        <div className="flex justify-center py-12">
          <SimplePagination pagination={events} onPageChange={setPage} />
        </div>
      )}

      <AlertDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) handleCancelDeleteEventDialog();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-normal">Delete this event?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong className="text-foreground font-medium">{eventToDelete?.name}</strong>{" "}
              and all of its ticket types and sales data will be permanently removed.
              This can’t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteEventError && (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertTitle>Couldn’t delete the event</AlertTitle>
              <AlertDescription>{deleteEventError}</AlertDescription>
            </Alert>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDeleteEventDialog}>
              Keep event
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteEvent()}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardShell>
  );
};

export default DashboardListEventsPage;
