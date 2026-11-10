import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PublishedEventSummary, SpringBootPagination } from "@/domain/domain";
import { listPublishedEvents, searchPublishedEvents } from "@/lib/api";
import { Search, X } from "lucide-react";
import { SimplePagination } from "@/components/simple-pagination";
import PublishedEventCard from "@/components/published-event-card";
import RandomEventImage from "@/components/random-event-image";
import { TicketMark } from "@/components/logo";
import { Link } from "react-router";
import { format } from "date-fns";
import PageShell from "@/components/page-shell";
import { EmptyState, ErrorState, SkeletonBlock } from "@/components/state-views";
import { useDocumentTitle } from "@/hooks/use-document-title";

const AttendeeLandingPage: React.FC = () => {
  useDocumentTitle(
    "Eventra: find an event, get your ticket",
    "Browse upcoming events, buy your ticket, and show the QR code at the door.",
  );
  const [page, setPage] = useState(0);
  const [publishedEvents, setPublishedEvents] = useState<
    SpringBootPagination<PublishedEventSummary> | undefined
  >();
  const [error, setError] = useState<string | undefined>();
  const [query, setQuery] = useState<string>("");
  const [activeSearch, setActiveSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  // The next event, shown in the hero. Set once, from the first unfiltered page.
  const [heroEvent, setHeroEvent] = useState<PublishedEventSummary | undefined>();

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
      if (pageNumber === 0) {
        setHeroEvent((prev) => prev ?? res.content?.[0]);
      }
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

  const events = publishedEvents?.content ?? [];

  return (
    <PageShell width="full">
      {/* Hero */}
      <section aria-labelledby="hero-title" className="bg-background">
        <div className="mx-auto grid max-w-[1280px] gap-14 px-5 pt-12 pb-20 sm:px-8 sm:pt-20 sm:pb-28 lg:grid-cols-12 lg:gap-10">
          <div className="flex flex-col justify-between lg:col-span-7">
            <h1
              id="hero-title"
              className="text-[clamp(2.5rem,9.5vw,6rem)] leading-[0.94] font-light tracking-[-0.035em]"
            >
              <span className="settle block" style={{ "--i": 0 } as React.CSSProperties}>
                Find an event.
              </span>
              <span className="settle block" style={{ "--i": 1 } as React.CSSProperties}>
                Get your ticket.
              </span>
              <span className="settle block" style={{ "--i": 2 } as React.CSSProperties}>
                Walk in.
              </span>
            </h1>

            <div className="mt-12 lg:mt-20">
              <p className="text-muted-foreground max-w-md text-lg leading-relaxed">
                Browse upcoming events, buy your pass, and show the QR code at the
                door.
              </p>

              <form onSubmit={handleSearchSubmit} role="search" className="mt-8">
                <label htmlFor="event-search" className="sr-only">
                  Search events by name, venue, city or topic
                </label>
                <div className="bg-card border-edge flex items-center gap-2 border-2 py-1.5 pr-1.5 pl-4 shadow-sm focus-within:border-foreground">
                  <Search className="text-muted-foreground size-5 shrink-0" aria-hidden="true" />
                  <input
                    id="event-search"
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Name, venue, city or topic"
                    className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent py-2 font-serif text-xl outline-none"
                    autoComplete="off"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      aria-label="Clear search text"
                      className="hover:bg-accent cursor-pointer rounded-md p-1.5 transition-colors"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                  <Button type="submit" size="lg">
                    Search
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* The next event, as a ticket over its banner */}
          <div className="relative lg:col-span-5">
            <div className="bg-secondary border-edge aspect-[4/5] w-full overflow-hidden border shadow-md">
              {heroEvent?.imageUrl ? (
                <img
                  src={heroEvent.imageUrl}
                  alt=""
                  fetchPriority="high"
                  decoding="async"
                  className="size-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : heroEvent || (!loading && publishedEvents) ? (
                <RandomEventImage className="size-full" />
              ) : (
                <SkeletonBlock className="size-full" />
              )}
            </div>

            {heroEvent && (
              <div className="ticket absolute right-4 -bottom-10 left-4 sm:right-auto sm:-left-8 sm:w-[19rem]">
                <div className="ticket-top bg-ink text-ink-foreground px-5 pt-5 pb-7">
                  <p className="text-ink-muted flex items-center gap-2 text-sm">
                    <TicketMark className="text-brand" />
                    Next up
                  </p>
                  <p className="mt-3 line-clamp-2 font-serif text-2xl leading-tight font-light">
                    {heroEvent.name}
                  </p>
                </div>
                <div className="ticket-bottom bg-card px-5 pt-4 pb-5">
                  <div className="perforation -mt-4 mb-4" aria-hidden="true" />
                  <p className="text-[0.95rem] tabular-nums">
                    {heroEvent.start && heroEvent.end
                      ? format(new Date(heroEvent.start), "EEE d MMM yyyy")
                      : "Dates to be announced"}
                  </p>
                  <p className="text-muted-foreground line-clamp-1 text-sm">{heroEvent.venue}</p>
                  <Link
                    to={`/events/${heroEvent.id}`}
                    className="mt-3 inline-block text-[0.95rem] font-semibold underline underline-offset-4 hover:underline-offset-[6px]"
                  >
                    Get tickets
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Events: a tonal band with its own edges */}
      <section
        aria-labelledby="events-title"
        className="bg-secondary border-edge border-y-2 pt-16 pb-20"
      >
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
          <div className="border-edge flex flex-col gap-3 border-b pb-6 sm:flex-row sm:items-baseline sm:justify-between">
            <h2
              id="events-title"
              className="text-3xl font-light tracking-[-0.015em] sm:text-4xl"
            >
              {activeSearch ? <>Results for “{activeSearch}”</> : "Upcoming events"}
            </h2>
            <div className="flex items-center gap-5 text-sm">
              <p className="text-muted-foreground tabular-nums" role="status">
                {publishedEvents
                  ? `${publishedEvents.totalElements} ${
                      publishedEvents.totalElements === 1 ? "event" : "events"
                    }`
                  : "Loading events…"}
              </p>
              {activeSearch && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="link-underline cursor-pointer"
                >
                  Show all events
                </button>
              )}
            </div>
          </div>

          <div className="mt-10">
            {error && (
              <ErrorState
                className="mb-10"
                title="Events didn’t load"
                message={`${error}. Check your connection and try again.`}
                action={
                  <Button
                    variant="outline"
                    onClick={() =>
                      activeSearch ? executeSearch(activeSearch, page) : loadPublishedEvents(page)
                    }
                  >
                    Try again
                  </Button>
                }
              />
            )}

            {loading ? (
              <div
                className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
                aria-busy="true"
              >
                {[0, 1, 2].map((i) => (
                  <SkeletonBlock key={i} className="border-edge h-[28rem] border" />
                ))}
              </div>
            ) : events.length > 0 ? (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {events.map((publishedEvent) => (
                  <PublishedEventCard publishedEvent={publishedEvent} key={publishedEvent.id} />
                ))}
              </div>
            ) : (
              !error && (
                <EmptyState
                  className="bg-card border-edge border px-8 shadow-sm"
                  title={activeSearch ? "No events match that search" : "No events on sale yet"}
                  message={
                    activeSearch
                      ? `Nothing matched “${activeSearch}”. Try a shorter phrase, or a city or venue name.`
                      : "New events appear here as soon as organizers publish them."
                  }
                  action={
                    activeSearch ? (
                      <Button variant="outline" onClick={handleClearSearch}>
                        Show all events
                      </Button>
                    ) : undefined
                  }
                />
              )
            )}
          </div>

          {publishedEvents && publishedEvents.totalPages > 1 && (
            <div className="flex justify-center pt-14">
              <SimplePagination pagination={publishedEvents} onPageChange={setPage} />
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
};

export default AttendeeLandingPage;
