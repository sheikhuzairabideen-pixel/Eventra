import NavBar from "@/components/nav-bar";
import { TicketDetails, TicketStatus } from "@/domain/domain";
import { getTicket, getTicketQr } from "@/lib/api";
import { format } from "date-fns";
import { Calendar, DollarSign, MapPin, Tag, ArrowLeft, Download, ShieldCheck, Ticket } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const DashboardViewTicketPage: React.FC = () => {
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

    const fetchTicketData = async (accessToken: string, ticketId: string) => {
      try {
        setIsQrCodeLoading(true);
        setError(undefined);

        const ticketData = await getTicket(accessToken, ticketId);
        setTicket(ticketData);

        const qrBlob = await getTicketQr(accessToken, ticketId);
        setQrCodeUrl(URL.createObjectURL(qrBlob));
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
      if (qrCodeUrl) {
        URL.revokeObjectURL(qrCodeUrl);
      }
    };
  }, [user?.access_token, isLoading, id]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <NavBar showBackHome={true} />
        <div className="container mx-auto px-4 py-16 max-w-xl flex-1 flex flex-col justify-center">
          <Alert variant="destructive" className="bg-red-950/50 border-red-700 text-white rounded-2xl p-6 shadow-xl">
            <AlertTitle className="text-lg font-bold">Error Loading Ticket</AlertTitle>
            <AlertDescription className="mt-2 text-sm text-red-200">{error}</AlertDescription>
            <div className="mt-6">
              <Button
                onClick={() => navigate("/dashboard/tickets")}
                className="bg-slate-800 hover:bg-slate-700 text-white rounded-xl"
              >
                Back to Tickets List
              </Button>
            </div>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 flex flex-col selection:bg-purple-500 selection:text-white">
      <NavBar showBackHome={true} />

      <main className="container mx-auto px-4 py-10 flex-1 max-w-2xl">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex justify-between items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard/tickets")}
            className="text-slate-400 hover:text-white hover:bg-slate-900 cursor-pointer rounded-xl -ml-2 text-xs flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Tickets</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/")}
            className="text-xs bg-slate-900 border-slate-800 text-slate-300 hover:text-white rounded-xl"
          >
            Events Directory
          </Button>
        </div>

        {ticket ? (
          <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            {/* Header / Event Summary Banner */}
            <div className="p-6 sm:p-8 border-b border-slate-800/80 bg-purple-950/20">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
                    Official Digital Pass
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {ticket.eventName}
                  </h1>
                </div>
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                    ticket.status === TicketStatus.PURCHASED
                      ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/40"
                      : "bg-red-950/60 text-red-300 border-red-500/40"
                  }`}
                >
                  {ticket.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-400 shrink-0" />
                  <span className="font-medium truncate">{ticket.eventVenue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="font-medium">
                    {ticket.eventStart && ticket.eventEnd
                      ? `${format(new Date(ticket.eventStart), "MMM d, yyyy")} - ${format(
                          new Date(ticket.eventEnd),
                          "MMM d, yyyy"
                        )}`
                      : "Date to be determined"}
                  </span>
                </div>
              </div>
            </div>

            {/* Middle: QR Code Section */}
            <div className="p-8 text-center bg-slate-950/60 border-b border-dashed border-slate-800 space-y-4">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400 block">
                Scan at Door for Admission
              </span>

              <div className="w-64 h-64 mx-auto p-4 bg-white rounded-2xl shadow-xl flex items-center justify-center">
                {isQrLoading ? (
                  <div className="w-8 h-8 border-4 border-slate-400 border-t-purple-600 rounded-full animate-spin" />
                ) : qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt="Ticket QR Code"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <p className="text-xs text-red-500 font-medium">QR code unavailable</p>
                )}
              </div>

              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Present this code on your mobile device to event staff at the entrance.
              </p>
            </div>

            {/* Bottom details */}
            <div className="p-6 sm:p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4 bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Tier Name</span>
                  <span className="text-sm font-bold text-white">{ticket.description || "Admission Pass"}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block font-medium">Amount Paid</span>
                  <span className="text-sm font-bold text-purple-400">${ticket.price.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-2 text-center text-[11px] text-slate-500 font-mono">
                Ticket Identifier: {ticket.id}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400 mt-3">Loading ticket details...</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardViewTicketPage;
