import NavBar from "@/components/nav-bar";
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
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  EventSummary,
  EventStatusEnum,
  SpringBootPagination,
} from "@/domain/domain";
import { deleteEvent, listEvents } from "@/lib/api";
import {
  AlertCircle,
  Calendar,
  Clock,
  Edit,
  MapPin,
  Tag,
  Trash,
  Plus,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { Link, useNavigate } from "react-router";

const DashboardListEventsPage: React.FC = () => {
  const { isLoading, user } = useAuth();
  const navigate = useNavigate();
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

  const formatStatusBadge = (status: EventStatusEnum) => {
    switch (status) {
      case EventStatusEnum.DRAFT:
        return "bg-amber-950/60 text-amber-300 border-amber-600/40";
      case EventStatusEnum.PUBLISHED:
        return "bg-emerald-950/60 text-emerald-300 border-emerald-500/40";
      case EventStatusEnum.CANCELLED:
        return "bg-red-950/60 text-red-300 border-red-600/40";
      case EventStatusEnum.COMPLETED:
        return "bg-blue-950/60 text-blue-300 border-blue-600/40";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
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
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <NavBar showBackHome={true} />
        <div className="container mx-auto px-4 py-16 max-w-xl flex-1 flex flex-col justify-center">
          <Alert variant="destructive" className="bg-red-950/50 border-red-700 text-white rounded-2xl p-6 shadow-xl">
            <AlertCircle className="h-6 w-6 text-red-400" />
            <AlertTitle className="text-lg font-bold">Error Loading Events</AlertTitle>
            <AlertDescription className="mt-2 text-sm text-red-200">{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 flex flex-col selection:bg-purple-500 selection:text-white">
      <NavBar showBackHome={true} />

      <main className="container mx-auto px-4 py-10 flex-1 max-w-4xl">
        {/* Navigation & Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="text-slate-400 hover:text-white hover:bg-slate-900 cursor-pointer rounded-xl -ml-2 text-xs flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Events Directory</span>
              </Button>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Organizer Dashboard</h1>
            <p className="text-sm text-slate-400">
              Manage your created events, configure ticket tiers, and view publishing status.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/dashboard/events/create">
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl px-4 py-2 text-sm cursor-pointer shadow-lg shadow-purple-900/30 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span>Create New Event</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Event Cards */}
        <div className="space-y-4">
          {events?.content && events.content.length > 0 ? (
            events.content.map((eventItem) => (
              <Card
                key={eventItem.id}
                className="bg-slate-900/80 border-slate-800 hover:border-slate-700 text-white rounded-2xl overflow-hidden shadow-xl transition-all"
              >
                <CardHeader className="pb-3 border-b border-slate-800/80">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-xl text-white">{eventItem.name}</h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${formatStatusBadge(
                            eventItem.status
                          )}`}
                        >
                          {eventItem.status}
                        </span>
                      </div>
                      {eventItem.description && (
                        <p className="text-xs text-slate-400 line-clamp-1">
                          {eventItem.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-2 sm:pt-0">
                      {eventItem.status === EventStatusEnum.PUBLISHED && (
                        <Link to={`/events/${eventItem.id}`} target="_blank">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs bg-slate-950 border-slate-800 hover:bg-slate-800 text-purple-300 rounded-lg cursor-pointer h-8 px-2.5 flex items-center gap-1.5"
                            title="View Public Page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </Button>
                        </Link>
                      )}
                      <Link to={`/dashboard/events/update/${eventItem.id}`}>
                        <Button
                          size="sm"
                          className="bg-slate-800 hover:bg-slate-700 text-white rounded-lg cursor-pointer h-8 px-2.5 flex items-center gap-1.5"
                          title="Edit Event"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/60 rounded-lg cursor-pointer h-8 px-2.5"
                        onClick={() => handleOpenDeleteEventDialog(eventItem)}
                        title="Delete Event"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-300">
                      <MapPin className="h-4 w-4 text-purple-400 shrink-0" />
                      <span className="font-semibold text-white">{eventItem.venue}</span>
                    </div>

                    <div className="flex items-start gap-2 text-slate-300">
                      <Calendar className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">
                          {formatDate(eventItem.start)} — {formatDate(eventItem.end)}
                        </span>
                        {(eventItem.start || eventItem.end) && (
                          <span className="text-slate-400 block text-[11px]">
                            {formatTime(eventItem.start)} - {formatTime(eventItem.end)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-slate-300">
                      <Clock className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-400 font-medium">Ticket Sales Window:</span>
                        <p className="text-slate-200">
                          {formatDate(eventItem.salesStart)} — {formatDate(eventItem.salesEnd)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-slate-300">
                      <Tag className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="text-slate-400 font-medium">Ticket Tiers:</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {eventItem.ticketTypes.map((ticketType) => (
                            <span
                              key={ticketType.id}
                              className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[11px] text-slate-300"
                            >
                              <strong>{ticketType.name}</strong>: ${ticketType.price}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-3xl p-8 space-y-4">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-900/30 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">No events created yet</h3>
              <p className="text-sm text-slate-400 max-w-sm mx-auto">
                Start by creating your first event. You can upload an image banner, write details, and configure ticket tiers.
              </p>
              <Link to="/dashboard/events/create" className="inline-block pt-2">
                <Button className="bg-purple-600 hover:bg-purple-500 text-white rounded-xl px-4 py-2 text-xs font-semibold cursor-pointer">
                  Create Your First Event
                </Button>
              </Link>
            </div>
          )}
        </div>

        {events && events.totalPages > 1 && (
          <div className="flex justify-center py-8">
            <SimplePagination pagination={events} onPageChange={setPage} />
          </div>
        )}
      </main>

      <AlertDialog open={dialogOpen}>
        <AlertDialogContent className="bg-slate-900 border-slate-800 text-white rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-white">
              Delete Event?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-400">
              Are you sure you want to delete <strong className="text-white">"{eventToDelete?.name}"</strong>? This will remove all associated ticket types and sales data permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteEventError && (
            <Alert variant="destructive" className="border-red-700 bg-red-950/50">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{deleteEventError}</AlertDescription>
            </Alert>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleCancelDeleteEventDialog}
              className="bg-slate-800 hover:bg-slate-700 text-white border-0 rounded-xl cursor-pointer"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteEvent()}
              className="bg-red-600 hover:bg-red-500 text-white rounded-xl cursor-pointer"
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DashboardListEventsPage;
