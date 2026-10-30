import { PublishedEventSummary } from "@/domain/domain";
import { Card } from "./ui/card";
import { Calendar, Heart, MapPin, Share2, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router";
import RandomEventImage from "./random-event-image";
import { useState } from "react";

interface PublishedEventCardProperties {
  publishedEvent: PublishedEventSummary;
}

const PublishedEventCard: React.FC<PublishedEventCardProperties> = ({
  publishedEvent,
}) => {
  const [liked, setLiked] = useState(false);

  return (
    <div className="group h-full">
      <Link to={`/events/${publishedEvent.id}`} className="block h-full">
        <Card className="h-full flex flex-col justify-between overflow-hidden bg-slate-900/90 hover:bg-slate-800/90 border-slate-800 hover:border-purple-500/50 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-purple-950/40 hover:-translate-y-1">
          {/* Top: Image Banner */}
          <div>
            <div className="relative h-44 w-full overflow-hidden bg-slate-950">
              {publishedEvent.imageUrl ? (
                <img
                  src={publishedEvent.imageUrl}
                  alt={publishedEvent.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    // Fallback if image fails to load
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <RandomEventImage />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />

              {/* Status Badge */}
              <div className="absolute top-3 left-3 bg-purple-600/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
                Live Event
              </div>
            </div>

            {/* Content info */}
            <div className="p-4 space-y-2.5">
              <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                {publishedEvent.name}
              </h3>

              {publishedEvent.description && (
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {publishedEvent.description}
                </p>
              )}

              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="truncate">{publishedEvent.venue}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  {publishedEvent.start && publishedEvent.end ? (
                    <span className="truncate">
                      {format(new Date(publishedEvent.start), "MMM d, yyyy")}
                    </span>
                  ) : (
                    <span>Dates to be announced</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card footer */}
          <div className="p-3 px-4 border-t border-slate-800/80 flex items-center justify-between text-slate-400 bg-slate-950/40">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setLiked(!liked);
                }}
                className={`p-1.5 rounded-full hover:bg-slate-800 transition cursor-pointer ${
                  liked ? "text-pink-500 fill-pink-500" : "hover:text-pink-400"
                }`}
                title="Save event"
              >
                <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (navigator.share) {
                    navigator.share({
                      title: publishedEvent.name,
                      url: window.location.origin + `/events/${publishedEvent.id}`,
                    }).catch(() => {});
                  } else {
                    navigator.clipboard.writeText(
                      window.location.origin + `/events/${publishedEvent.id}`
                    );
                    alert("Event link copied to clipboard!");
                  }
                }}
                className="p-1.5 rounded-full hover:bg-slate-800 hover:text-slate-200 transition cursor-pointer"
                title="Share event"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>

            <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-400 group-hover:text-purple-300">
              Get Tickets
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </Card>
      </Link>
    </div>
  );
};

export default PublishedEventCard;
