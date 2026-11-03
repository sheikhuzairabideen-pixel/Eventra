import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PublishedEventSummary, SpringBootPagination } from "@/domain/domain";
import { listPublishedEvents, searchPublishedEvents } from "@/lib/api";
import { AlertCircle, Search, Sparkles, X, Compass, Filter, CalendarDays } from "lucide-react";
import { SimplePagination } from "@/components/simple-pagination";
import PublishedEventCard from "@/components/published-event-card";
import NavBar from "@/components/nav-bar";

const AttendeeLandingPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [publishedEvents, setPublishedEvents] = useState<
    SpringBootPagination<PublishedEventSummary> | undefined
  >();
  const [error, setError] = useState<string | undefined>();
  const [query, setQuery] = useState<string>("");
  const [activeSearch, setActiveSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (activeSearch && activeSearch.trim().length > 0) {
      executeSearch(activeSearch, page);
    } else {
      loadPublishedEvents(page);
    }
  }, [page, activeSearch]);

  const loadPublishedEvents = async (pageNumber: number) => {
    setLoading(true);
    try {
      setError(undefined);
      const res = await listPublishedEvents(pageNumber);
      setPublishedEvents(res);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load events");
      }
    } finally {
      setLoading(false);
    }
  };

  const executeSearch = async (searchTerm: string, pageNumber: number) => {
    setLoading(true);
    try {
      setError(undefined);
      const res = await searchPublishedEvents(searchTerm, pageNumber);
      setPublishedEvents(res);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to perform event search");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPage(0);
    setActiveSearch(query.trim());
  };

  const handleClearSearch = () => {
    setQuery("");
    setActiveSearch("");
    setPage(0);
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      {/* Dynamic Global Top Navigation */}
      <NavBar showBackHome={false} />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-b border-slate-800/60 pb-12 pt-8">
        {/* Glow ambient background elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-purple-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[350px] h-[250px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-900/30 border border-purple-500/30 text-purple-300 text-xs font-semibold backdrop-blur-md shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Discover Unforgettable Moments on Eventra</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
              Find and Book Tickets for{" "}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-300 bg-clip-text text-transparent">
                World-Class Events
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto font-normal">
              From tech conferences and music festivals to creator meetups. Browse upcoming events, reserve your passes, and enter seamlessly with digital QR tickets.
            </p>

            {/* Search Box */}
            <form onSubmit={handleSearchSubmit} className="pt-4 max-w-2xl mx-auto">
              <div className="relative flex items-center bg-slate-900/90 border border-slate-700/80 rounded-2xl p-2 shadow-2xl shadow-purple-950/20 backdrop-blur-md focus-within:border-purple-500 transition-all">
                <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
                <Input
                  className="bg-transparent border-0 text-white placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm sm:text-base py-3 px-3 shadow-none"
                  placeholder="Search by event name, venue, city or topic..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition mr-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl px-5 py-2.5 cursor-pointer shadow-md shadow-purple-900/30 transition shrink-0"
                >
                  Explore
                </Button>
              </div>
            </form>

            {/* Active filter banner / Clear search button */}
            {activeSearch && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <div className="inline-flex items-center gap-2 bg-slate-800/80 border border-purple-500/40 text-purple-300 px-3.5 py-1.5 rounded-full text-xs font-medium backdrop-blur">
                  <span>Filtered by: <strong>"{activeSearch}"</strong></span>
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="hover:text-white cursor-pointer ml-1 p-0.5"
                    title="Clear filter"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <Button
                  variant="link"
                  size="sm"
                  onClick={handleClearSearch}
                  className="text-xs text-slate-400 hover:text-white p-0 h-auto cursor-pointer underline underline-offset-4"
                >
                  View all events
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-10 flex-1">
        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <Alert variant="destructive" className="bg-red-950/40 border-red-700/80 text-white rounded-xl">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <AlertTitle className="font-bold text-red-200">Unable to load events</AlertTitle>
              <AlertDescription className="text-red-300/90 text-sm">{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
              <Compass className="w-4 h-4" />
              <span>Featured Schedule</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
              {activeSearch ? `Search Results for "${activeSearch}"` : "Upcoming Events"}
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
            <CalendarDays className="w-4 h-4 text-slate-400" />
            <span>
              {publishedEvents ? `${publishedEvents.totalElements} Total Events` : "Loading..."}
            </span>
          </div>
        </div>

        {/* Event Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="h-72 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : publishedEvents?.content && publishedEvents.content.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {publishedEvents.content.map((publishedEvent) => (
              <PublishedEventCard
                publishedEvent={publishedEvent}
                key={publishedEvent.id}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-4 bg-slate-900/40 border border-slate-800 rounded-2xl max-w-xl mx-auto space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400">
              <Filter className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">No published events found</h3>
            <p className="text-sm text-slate-400">
              {activeSearch
                ? `We couldn't find any events matching "${activeSearch}". Try searching for something else or clear the filter.`
                : "There are currently no active public events. Check back soon or create your own!"}
            </p>
            {activeSearch && (
              <Button
                onClick={handleClearSearch}
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs rounded-xl px-4 py-2 cursor-pointer"
              >
                Clear Search Filter
              </Button>
            )}
          </div>
        )}

        {/* Pagination */}
        {publishedEvents && publishedEvents.totalPages > 1 && (
          <div className="w-full flex justify-center py-12">
            <SimplePagination
              pagination={publishedEvents}
              onPageChange={setPage}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-200">Eventra</span>
            <span>— The Modern Event Ticket Platform</span>
          </div>
          <p>© {new Date().getFullYear()} Eventra. Local Development Environment.</p>
        </div>
      </footer>
    </div>
  );
};

export default AttendeeLandingPage;
