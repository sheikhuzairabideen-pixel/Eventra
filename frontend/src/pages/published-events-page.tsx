import RandomEventImage from "@/components/random-event-image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  PublishedEventDetails,
  PublishedEventTicketTypeDetails,
} from "@/domain/domain";
import { getPublishedEvent } from "@/lib/api";
import { AlertCircle, Calendar, MapPin, ArrowLeft, Ticket, Check, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { format } from "date-fns";
import NavBar from "@/components/nav-bar";

const PublishedEventsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [publishedEvent, setPublishedEvent] = useState<
    PublishedEventDetails | undefined
  >();
  const [selectedTicketType, setSelectedTicketType] = useState<
    PublishedEventTicketTypeDetails | undefined
  >();

  useEffect(() => {
    if (!id) {
      setError("Event ID must be provided!");
      setLoading(false);
      return;
    }

    const fetchDetails = async () => {
      try {
        setLoading(true);
        const eventData = await getPublishedEvent(id);
        setPublishedEvent(eventData);
        if (eventData.ticketTypes && eventData.ticketTypes.length > 0) {
          setSelectedTicketType(eventData.ticketTypes[0]);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An error occurred while loading this event");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <NavBar />
        <div className="container mx-auto px-4 py-16 max-w-xl flex-1 flex flex-col justify-center">
          <Alert variant="destructive" className="bg-red-950/50 border-red-700 text-white rounded-2xl p-6 shadow-xl">
            <AlertCircle className="h-6 w-6 text-red-400" />
            <AlertTitle className="text-lg font-bold">Event Not Found</AlertTitle>
            <AlertDescription className="mt-2 text-sm text-red-200">{error}</AlertDescription>
            <div className="mt-6">
              <Button
                onClick={() => navigate("/")}
                variant="outline"
                className="bg-slate-900 border-slate-700 hover:bg-slate-800 text-white cursor-pointer rounded-xl"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Events Directory
              </Button>
            </div>
          </Alert>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <NavBar />
        <div className="container mx-auto px-4 py-24 flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            <p className="text-sm text-slate-400 font-medium">Loading event details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 flex flex-col selection:bg-purple-500 selection:text-white">
      {/* Top Navigation */}
      <NavBar showBackHome={true} />

      <main className="container mx-auto px-4 py-10 flex-1 max-w-5xl">
        {/* Breadcrumb Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-slate-400 hover:text-white hover:bg-slate-900 cursor-pointer rounded-xl -ml-2 text-xs flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Events</span>
          </Button>
        </div>

        {/* Hero Banner Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-12 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl">
          {/* Details Column */}
          <div className="md:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-600/40 text-purple-300 text-xs font-semibold">
              <Ticket className="w-3.5 h-3.5 text-purple-400" />
              <span>Official Event Tickets</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {publishedEvent?.name}
            </h1>

            {publishedEvent?.description && (
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal whitespace-pre-line pt-2">
                {publishedEvent.description}
              </p>
            )}

            <div className="space-y-2.5 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-3 text-slate-300 text-sm">
                <div className="w-8 h-8 rounded-lg bg-purple-900/40 flex items-center justify-center text-purple-400 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Location & Venue</span>
                  <span className="font-semibold text-white">{publishedEvent?.venue}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-300 text-sm">
                <div className="w-8 h-8 rounded-lg bg-indigo-900/40 flex items-center justify-center text-indigo-400 shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Dates & Schedule</span>
                  <span className="font-semibold text-white">
                    {publishedEvent?.start && publishedEvent?.end ? (
                      <>
                        {format(new Date(publishedEvent.start), "EEEE, MMMM d, yyyy")} —{" "}
                        {format(new Date(publishedEvent.end), "MMMM d, yyyy")}
                      </>
                    ) : (
                      "Dates to be announced"
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Image Column */}
          <div className="md:col-span-5 h-72 md:h-80 w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl relative">
            {publishedEvent?.imageUrl ? (
              <img
                src={publishedEvent.imageUrl}
                alt={publishedEvent.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <RandomEventImage />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
          </div>
        </div>

        {/* Available Tickets Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Select Ticket Type</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Choose your pass tier to proceed to immediate booking
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Ticket Cards */}
            <div className="lg:col-span-7 space-y-3">
              {publishedEvent?.ticketTypes && publishedEvent.ticketTypes.length > 0 ? (
                publishedEvent.ticketTypes.map((ticketType) => {
                  const isSelected = selectedTicketType?.id === ticketType.id;
                  return (
                    <div
                      key={ticketType.id}
                      onClick={() => setSelectedTicketType(ticketType)}
                      className={`cursor-pointer rounded-2xl p-5 border transition-all duration-200 ${
                        isSelected
                          ? "bg-slate-900 border-purple-500 shadow-lg shadow-purple-950/40 ring-1 ring-purple-500"
                          : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-white">{ticketType.name}</h3>
                            {isSelected && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider bg-purple-600/30 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">
                                <Check className="w-3 h-3" /> Selected
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed max-w-md">
                            {ticketType.description}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-2xl font-black text-white block">
                            ${ticketType.price.toFixed(2)}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">per ticket</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                  <p className="text-slate-400 text-sm">No ticket types currently available for this event.</p>
                </div>
              )}
            </div>

            {/* Right: Order Summary Box */}
            <div className="lg:col-span-5">
              <div className="sticky top-24 bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
                <div className="space-y-1">
                  <span className="text-xs uppercase font-bold tracking-wider text-purple-400">
                    Order Summary
                  </span>
                  <h3 className="text-xl font-bold text-white">
                    {selectedTicketType ? selectedTicketType.name : "Select a Ticket"}
                  </h3>
                </div>

                {selectedTicketType && (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-2">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Admission Type</span>
                        <span className="text-white font-medium">{selectedTicketType.name}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Unit Price</span>
                        <span className="text-white font-medium">${selectedTicketType.price.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-slate-800 pt-2 flex justify-between items-baseline">
                        <span className="text-sm font-semibold text-white">Total Amount</span>
                        <span className="text-2xl font-black text-purple-400">
                          ${selectedTicketType.price.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed italic">
                      "{selectedTicketType.description}"
                    </p>

                    <Link
                      to={`/events/${publishedEvent?.id}/purchase/${selectedTicketType.id}`}
                      className="block"
                    >
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 text-sm rounded-xl cursor-pointer shadow-lg shadow-purple-900/40 transition">
                        Proceed to Checkout
                      </Button>
                    </Link>

                    <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Instant digital QR issuance upon checkout</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PublishedEventsPage;
