import { Link } from "react-router";
import { format } from "date-fns";
import { Bookmark, Share2 } from "lucide-react";
import { useState } from "react";
import { PublishedEventSummary } from "@/domain/domain";
import RandomEventImage from "./random-event-image";
import { toast } from "./toaster";
import { cn } from "@/lib/utils";

interface PublishedEventCardProperties {
  publishedEvent: PublishedEventSummary;
}

/**
 * Every event tile is the same size, whatever banner was uploaded:
 * the image is cropped to a fixed 4:3 frame, text slots have fixed line
 * counts, and the footer is pinned to the bottom edge.
 */
const PublishedEventCard: React.FC<PublishedEventCardProperties> = ({ publishedEvent }) => {
  const [saved, setSaved] = useState(false);

  const eventUrl = `${window.location.origin}/events/${publishedEvent.id}`;

  const handleShare = async () => {
    if (navigator.share) {
      navigator.share({ title: publishedEvent.name, url: eventUrl }).catch(() => {});
      return;
    }
    try {
      await navigator.clipboard.writeText(eventUrl);
      toast("Event link copied");
    } catch {
      toast("Couldn’t copy the link. Copy it from the address bar instead.", "error");
    }
  };

  return (
    <article className="group bg-card border-edge hover:border-foreground relative flex h-full flex-col border shadow-sm transition-[border-color,box-shadow] duration-200 hover:shadow-md">
      <div className="bg-secondary border-edge aspect-[4/3] w-full shrink-0 overflow-hidden border-b">
        {publishedEvent.imageUrl ? (
          <img
            src={publishedEvent.imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            width={640}
            height={480}
            className="size-full object-cover"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        ) : (
          <RandomEventImage className="size-full" />
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-brand-ink text-[0.95rem] font-semibold tabular-nums">
          {publishedEvent.start && publishedEvent.end
            ? format(new Date(publishedEvent.start), "EEE d MMM yyyy")
            : "Dates to be announced"}
        </p>

        <h3 className="mt-1.5 line-clamp-2 min-h-[2.3em] text-[1.65rem] leading-[1.15] font-normal tracking-[-0.015em]">
          {/* The title link covers the whole tile; the action buttons sit above it. */}
          <Link
            to={`/events/${publishedEvent.id}`}
            className="decoration-1 underline-offset-[0.2em] group-hover:underline after:absolute after:inset-0"
          >
            {publishedEvent.name}
          </Link>
        </h3>

        <p className="text-muted-foreground mt-2 line-clamp-1 text-[0.95rem]">
          {publishedEvent.venue}
        </p>

        <p
          className={cn(
            "text-muted-foreground mt-3 line-clamp-2 min-h-[3.2em] text-[0.95rem] leading-relaxed",
          )}
        >
          {publishedEvent.description}
        </p>
      </div>

      <div className="border-edge relative z-10 flex items-center justify-between border-t px-3 py-2.5">
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setSaved((s) => !s)}
            aria-pressed={saved}
            aria-label={saved ? "Remove from saved" : "Save event"}
            className="hover:bg-accent cursor-pointer rounded-md p-2 transition-colors"
          >
            <Bookmark className={cn("size-[1.15rem]", saved && "fill-brand text-brand-ink")} />
          </button>
          <button
            type="button"
            onClick={handleShare}
            aria-label={`Share ${publishedEvent.name}`}
            className="hover:bg-accent cursor-pointer rounded-md p-2 transition-colors"
          >
            <Share2 className="size-[1.15rem]" />
          </button>
        </div>
        <span className="pr-2 text-[0.95rem] font-semibold underline underline-offset-4 group-hover:underline-offset-[6px]">
          Get tickets
        </span>
      </div>
    </article>
  );
};

export default PublishedEventCard;
