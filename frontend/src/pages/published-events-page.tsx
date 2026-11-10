import RandomEventImage from "@/components/random-event-image";
import { Button } from "@/components/ui/button";
import {
  PublishedEventDetails,
  PublishedEventTicketTypeDetails,
} from "@/domain/domain";
import { getPublishedEvent } from "@/lib/api";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { format, isSameDay } from "date-fns";
import { useDocumentTitle } from "@/hooks/use-document-title";
import PageShell from "@/components/page-shell";
import { ErrorState, LoadingState } from "@/components/state-views";
import { TicketMark } from "@/components/logo";
import { cn } from "@/lib/utils";

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

  useDocumentTitle(
    publishedEvent?.name ? `${publishedEvent.name} | Eventra` : "Event | Eventra",
    publishedEvent?.description?.slice(0, 155),
  );

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
      <PageShell width="default">
        <div className="py-20">
          <ErrorState
            title="We couldn’t find that event"
            message={`${error}. It may have been unpublished or the link may be wrong.`}
            action={<Button onClick={() => navigate("/")}>Browse all events</Button>}
          />
        </div>
      </PageShell>
    );
  }

  if (loading) {
    return (
      <PageShell width="default">
        <LoadingState label="Loading event…" />
      </PageShell>
    );
  }

  const start = publishedEvent?.start ? new Date(publishedEvent.start) : undefined;
  const end = publishedEvent?.end ? new Date(publishedEvent.end) : undefined;

  return (
    <PageShell>
      <article>
        {/* Title block */}
        <header className="pt-10 pb-10 sm:pt-14 sm:pb-14">
          <Link
            to="/"
            className="text-muted-foreground hover:text-foreground mb-8 inline-block text-sm transition-colors"
          >
            ← All events
          </Link>
          <h1 className="max-w-[16ch] text-[clamp(2.75rem,8vw,6.5rem)] leading-[0.95] font-light tracking-[-0.03em]">
            {publishedEvent?.name}
          </h1>

          <dl className="mt-10 grid gap-x-12 gap-y-6 sm:grid-cols-2 md:max-w-2xl">
            <div>
              <dt className="text-muted-foreground text-sm">When</dt>
              <dd className="mt-1 font-serif text-xl tabular-nums">
                {start && end ? (
                  isSameDay(start, end) ? (
                    format(start, "EEEE d MMMM yyyy")
                  ) : (
                    <>
                      {format(start, "EEE d MMM")} to {format(end, "EEE d MMM yyyy")}
                    </>
                  )
                ) : (
                  "Dates to be announced"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm">Where</dt>
              <dd className="mt-1 font-serif text-xl">{publishedEvent?.venue}</dd>
            </div>
          </dl>
        </header>

        {/* Image */}
        <div className="bg-secondary border-edge aspect-[4/3] w-full overflow-hidden border shadow-md sm:aspect-[21/9]">
          {publishedEvent?.imageUrl ? (
            <img
              src={publishedEvent.imageUrl}
              alt=""
              className="size-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <RandomEventImage className="size-full" />
          )}
        </div>

        {/* About + tickets */}
        <div className="mt-14 grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            {publishedEvent?.description && (
              <section aria-labelledby="about-title" className="mb-16">
                <h2 id="about-title" className="text-3xl font-light tracking-[-0.01em]">
                  About this event
                </h2>
                <p className="mt-5 max-w-[62ch] font-serif text-xl leading-[1.6] whitespace-pre-line">
                  {publishedEvent.description}
                </p>
              </section>
            )}

            <fieldset>
              <legend className="text-3xl font-light tracking-[-0.01em]">Choose a ticket</legend>

              {publishedEvent?.ticketTypes && publishedEvent.ticketTypes.length > 0 ? (
                <div className="bg-card border-edge mt-6 border shadow-sm" role="radiogroup">
                  {publishedEvent.ticketTypes.map((ticketType) => {
                    const isSelected = selectedTicketType?.id === ticketType.id;
                    return (
                      <label
                        key={ticketType.id}
                        className={cn(
                          "border-border relative flex cursor-pointer items-start justify-between gap-6 border-b py-6 pr-5 pl-6 transition-colors last:border-b-0",
                          "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-foreground",
                          isSelected ? "bg-secondary" : "hover:bg-secondary/60",
                        )}
                      >
                        <input
                          type="radio"
                          name="ticket-type"
                          value={ticketType.id}
                          checked={isSelected}
                          onChange={() => setSelectedTicketType(ticketType)}
                          className="sr-only"
                        />
                        <span
                          aria-hidden="true"
                          className={cn(
                            "absolute inset-y-0 left-0 w-1 transition-colors",
                            isSelected ? "bg-brand" : "bg-transparent",
                          )}
                        />
                        <span className="block">
                          <span className="block font-serif text-2xl font-medium tracking-tight">
                            {ticketType.name}
                          </span>
                          {ticketType.description && (
                            <span className="text-muted-foreground mt-1.5 block max-w-md text-[0.95rem] leading-relaxed">
                              {ticketType.description}
                            </span>
                          )}
                        </span>
                        <span className="shrink-0 text-right font-serif text-3xl font-light tabular-nums">
                          ${ticketType.price.toFixed(2)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground bg-card border-edge mt-6 border p-8">
                  Tickets for this event aren’t on sale yet. Check back soon.
                </p>
              )}
            </fieldset>
          </div>

          {/* The ticket */}
          <aside className="lg:col-span-5" aria-label="Your ticket">
            <div className="ticket sticky top-24">
              <div className="ticket-top bg-ink text-ink-foreground px-7 pt-7 pb-9">
                <p className="text-ink-muted flex items-center gap-2 text-sm">
                  <TicketMark className="text-brand" />
                  Admit one
                </p>
                <p className="mt-6 font-serif text-3xl leading-tight font-light tracking-tight">
                  {selectedTicketType ? selectedTicketType.name : "Select a ticket"}
                </p>
                <p className="text-ink-muted mt-1 text-[0.95rem]">{publishedEvent?.name}</p>
              </div>
              <div className="ticket-bottom bg-card px-7 pt-7 pb-7">
                <div className="perforation -mt-7 mb-6" aria-hidden="true" />
                {selectedTicketType ? (
                  <>
                    <div className="flex items-baseline justify-between">
                      <span className="text-muted-foreground text-sm">Total</span>
                      <span className="font-serif text-5xl font-light tracking-tight tabular-nums">
                        ${selectedTicketType.price.toFixed(2)}
                      </span>
                    </div>
                    <Button asChild size="lg" className="mt-7 w-full">
                      <Link
                        to={`/events/${publishedEvent?.id}/purchase/${selectedTicketType.id}`}
                      >
                        Continue to checkout
                        <ArrowRight aria-hidden="true" />
                      </Link>
                    </Button>
                    <p className="text-muted-foreground mt-4 text-center text-sm">
                      Your QR ticket is issued as soon as you check out.
                    </p>
                  </>
                ) : (
                  <p className="text-muted-foreground text-[0.95rem]">
                    Pick a ticket to see your total.
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </article>
    </PageShell>
  );
};

export default PublishedEventsPage;
