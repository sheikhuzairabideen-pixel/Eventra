import NavBar from "@/components/nav-bar";
import { SimplePagination } from "@/components/simple-pagination";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SpringBootPagination, TicketSummary, TicketStatus } from "@/domain/domain";
import { listTickets } from "@/lib/api";
import { AlertCircle, Calendar, DollarSign, Tag, Ticket, ArrowLeft, ArrowRight, QrCode } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { Link, useNavigate } from "react-router";

const DashboardListTickets: React.FC = () => {
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
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <NavBar showBackHome={true} />
        <div className="container mx-auto px-4 py-16 max-w-xl flex-1 flex flex-col justify-center">
          <Alert variant="destructive" className="bg-red-950/50 border-red-700 text-white rounded-2xl p-6 shadow-xl">
            <AlertCircle className="h-6 w-6 text-red-400" />
            <AlertTitle className="text-lg font-bold">Error Loading Tickets</AlertTitle>
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
        {/* Navigation & Header */}
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
                <span>Explore Events</span>
              </Button>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Your Event Passes</h1>
            <p className="text-sm text-slate-400">
              Access your digital entry passes, view order details, and display ticket QR codes for check-in.
            </p>
          </div>
        </div>

        {/* Tickets Grid */}
        <div className="space-y-4">
          {tickets?.content && tickets.content.length > 0 ? (
            tickets.content.map((ticketItem) => (
              <Link
                to={`/dashboard/tickets/${ticketItem.id}`}
                key={ticketItem.id}
                className="block group"
              >
                <Card className="bg-slate-900/80 hover:bg-slate-800/90 border-slate-800 hover:border-purple-500/50 text-white rounded-2xl overflow-hidden shadow-xl transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-900/40 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                          <Ticket className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5">
                            <h3 className="font-bold text-lg text-white group-hover:text-purple-300 transition-colors">
                              {ticketItem.ticketType.name}
                            </h3>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                ticketItem.status === TicketStatus.PURCHASED
                                  ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/40"
                                  : "bg-red-950/60 text-red-300 border-red-500/40"
                              }`}
                            >
                              {ticketItem.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 font-mono">
                            Pass ID: {ticketItem.id}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 self-end sm:self-center">
                        <div className="text-right">
                          <span className="text-xs text-slate-400 block font-medium">Price</span>
                          <span className="text-xl font-bold text-white">
                            ${ticketItem.ticketType.price.toFixed(2)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-md transition">
                          <QrCode className="w-4 h-4" />
                          <span>Show QR</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-3xl p-8 space-y-4">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400">
                <Ticket className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">No purchased tickets</h3>
              <p className="text-sm text-slate-400 max-w-sm mx-auto">
                You haven't bought any tickets yet. Browse available events on Eventra and get your pass!
              </p>
              <Button
                onClick={() => navigate("/")}
                className="bg-purple-600 hover:bg-purple-500 text-white rounded-xl px-4 py-2 text-xs font-semibold cursor-pointer"
              >
                Browse Events Directory
              </Button>
            </div>
          )}
        </div>

        {tickets && tickets.totalPages > 1 && (
          <div className="flex justify-center py-8">
            <SimplePagination pagination={tickets} onPageChange={setPage} />
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardListTickets;
