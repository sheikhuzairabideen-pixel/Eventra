import { useDocumentTitle } from "@/hooks/use-document-title";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  CreateEventRequest,
  CreateTicketTypeRequest,
  EventDetails,
  EventStatusEnum,
  UpdateEventRequest,
  UpdateTicketTypeRequest,
} from "@/domain/domain";
import { createEvent, getEvent, updateEvent } from "@/lib/api";
import { format } from "date-fns";
import { AlertCircle, CalendarIcon, Pencil, Plus, Trash2, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "react-oidc-context";
import { useNavigate, useParams } from "react-router";
import DashboardShell from "@/components/dashboard-shell";
import { toast } from "@/components/toaster";
import PageHeader from "@/components/page-header";

interface DateTimeSelectProperties {
  label: string;
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  time: string | undefined;
  setTime: (time: string) => void;
}

const DateTimeSelect: React.FC<DateTimeSelectProperties> = ({
  label,
  date,
  setDate,
  time,
  setTime,
}) => {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dateObj = date ? (date instanceof Date ? date : new Date(date)) : undefined;
  const isValidDate = dateObj && !isNaN(dateObj.getTime());

  useEffect(() => {
    if (!calendarOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setCalendarOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCalendarOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [calendarOpen]);

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">{label}</legend>
      <div className="flex flex-wrap items-center gap-2">
        {/* Date picker */}
        <div ref={containerRef} className="relative">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCalendarOpen((prev) => !prev)}
            aria-expanded={calendarOpen}
            aria-label={`${label}: choose a date`}
            className="border-input bg-card hover:bg-accent hover:text-foreground h-11 min-w-[11rem] justify-start font-normal"
          >
            <CalendarIcon aria-hidden="true" />
            {isValidDate ? (
              format(dateObj, "d MMM yyyy")
            ) : (
              <span className="text-muted-foreground">Pick a date</span>
            )}
          </Button>

          {calendarOpen && (
            <div className="bg-popover absolute top-full left-0 z-50 mt-2 border p-1 shadow-[0_18px_30px_-12px_rgb(31_28_23_/_0.25)]">
              <Calendar
                mode="single"
                selected={isValidDate ? dateObj : undefined}
                onSelect={(selectedDate) => {
                  if (!selectedDate) return;
                  const correctedDate = new Date(
                    Date.UTC(
                      selectedDate.getFullYear(),
                      selectedDate.getMonth(),
                      selectedDate.getDate(),
                    ),
                  );
                  setDate(correctedDate);
                  setCalendarOpen(false);
                }}
              />
            </div>
          )}
        </div>

        {/* Time picker */}
        <input
          type="time"
          aria-label={`${label}: time`}
          className="border-input bg-card focus-visible:border-ring focus-visible:ring-brand/60 h-11 w-[8.5rem] rounded-md border px-3.5 text-base tabular-nums outline-none focus-visible:ring-[3px] md:text-sm"
          value={time ?? ""}
          onChange={(e) => setTime(e.target.value)}
        />

        {/* Clear button */}
        {date && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Clear ${label.toLowerCase()}`}
            className="text-muted-foreground"
            onClick={() => setDate(undefined)}
          >
            <X aria-hidden="true" />
          </Button>
        )}
      </div>
    </fieldset>
  );
};

const generateTempId = () => `temp_${crypto.randomUUID()}`;
const isTempId = (id: string | undefined) => id && id.startsWith("temp_");

interface TicketTypeData {
  id: string | undefined;
  name: string;
  price: number;
  totalAvailable?: number;
  description: string;
}

interface EventData {
  id: string | undefined;
  name: string;
  description: string;
  imageUrl: string;
  startDate: Date | undefined;
  startTime: string | undefined;
  endDate: Date | undefined;
  endTime: string | undefined;
  venueDetails: string;
  salesStartDate: Date | undefined;
  salesStartTime: string | undefined;
  salesEndDate: Date | undefined;
  salesEndTime: string | undefined;
  ticketTypes: TicketTypeData[];
  status: EventStatusEnum;
  createdAt: Date | undefined;
  updatedAt: Date | undefined;
}

const DashboardManageEventPage: React.FC = () => {
  useDocumentTitle("Edit event | Eventra");
  const { isLoading, user } = useAuth();
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [eventData, setEventData] = useState<EventData>({
    id: undefined,
    name: "",
    description: "",
    imageUrl: "",
    startDate: undefined,
    startTime: undefined,
    endDate: undefined,
    endTime: undefined,
    venueDetails: "",
    salesStartDate: undefined,
    salesStartTime: undefined,
    salesEndDate: undefined,
    salesEndTime: undefined,
    ticketTypes: [],
    status: EventStatusEnum.DRAFT,
    createdAt: undefined,
    updatedAt: undefined,
  });

  const [currentTicketType, setCurrentTicketType] = useState<
    TicketTypeData | undefined
  >();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | undefined>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateField = (field: keyof EventData, value: any) => {
    setEventData((prev) => ({ ...prev, [field]: value }));
  };

  const formatTimeFromDate = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  useEffect(() => {
    if (isEditMode && !isLoading && user?.access_token) {
      const fetchEvent = async () => {
        const event: EventDetails = await getEvent(user.access_token, id);
        setEventData({
          id: event.id,
          name: event.name,
          description: event.description ?? "",
          imageUrl: event.imageUrl ?? "",
          startDate: event.start ? new Date(event.start) : undefined,
          startTime: event.start
            ? formatTimeFromDate(new Date(event.start))
            : undefined,
          endDate: event.end ? new Date(event.end) : undefined,
          endTime: event.end
            ? formatTimeFromDate(new Date(event.end))
            : undefined,
          venueDetails: event.venue,
          salesStartDate: event.salesStart ? new Date(event.salesStart) : undefined,
          salesStartTime: event.salesStart
            ? formatTimeFromDate(new Date(event.salesStart))
            : undefined,
          salesEndDate: event.salesEnd ? new Date(event.salesEnd) : undefined,
          salesEndTime: event.salesEnd
            ? formatTimeFromDate(new Date(event.salesEnd))
            : undefined,
          status: event.status,
          ticketTypes: event.ticketTypes.map((ticket) => ({
            id: ticket.id,
            name: ticket.name,
            description: ticket.description,
            price: ticket.price,
            totalAvailable: ticket.totalAvailable,
          })),
          createdAt: event.createdAt ? new Date(event.createdAt) : undefined,
          updatedAt: event.updatedAt ? new Date(event.updatedAt) : undefined,
        });
      };
      fetchEvent();
    }
  }, [id, user]);

  const combineDateTime = (date: Date, time: string): Date => {
    const [hours, minutes] = time
      .split(":")
      .map((num) => Number.parseInt(num, 10));

    const combinedDateTime = new Date(date);
    combinedDateTime.setHours(hours);
    combinedDateTime.setMinutes(minutes);
    combinedDateTime.setSeconds(0);

    const utcResult = new Date(
      Date.UTC(
        combinedDateTime.getFullYear(),
        combinedDateTime.getMonth(),
        combinedDateTime.getDate(),
        hours,
        minutes,
        0,
        0,
      ),
    );

    return utcResult;
  };

  const handleEventUpdateSubmit = async (accessToken: string, id: string) => {
    const ticketTypes: UpdateTicketTypeRequest[] = eventData.ticketTypes.map(
      (ticketType) => {
        return {
          id: isTempId(ticketType.id) ? undefined : ticketType.id,
          name: ticketType.name,
          price: ticketType.price,
          description: ticketType.description,
          totalAvailable: ticketType.totalAvailable,
        };
      },
    );

    const request: UpdateEventRequest = {
      id: id,
      name: eventData.name,
      description: eventData.description || undefined,
      imageUrl: eventData.imageUrl || undefined,
      start:
        eventData.startDate
          ? combineDateTime(eventData.startDate, eventData.startTime || "00:00")
          : undefined,
      end:
        eventData.endDate
          ? combineDateTime(eventData.endDate, eventData.endTime || "00:00")
          : undefined,
      venue: eventData.venueDetails,
      salesStart:
        eventData.salesStartDate
          ? combineDateTime(eventData.salesStartDate, eventData.salesStartTime || "00:00")
          : undefined,
      salesEnd:
        eventData.salesEndDate
          ? combineDateTime(eventData.salesEndDate, eventData.salesEndTime || "23:59")
          : undefined,
      status: eventData.status,
      ticketTypes: ticketTypes,
    };

    try {
      await updateEvent(accessToken, id, request);
      toast("Event saved");
      navigate("/dashboard/events");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === "string") {
        setError(err);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  const handleEventCreateSubmit = async (accessToken: string) => {
    const ticketTypes: CreateTicketTypeRequest[] = eventData.ticketTypes.map(
      (ticketType) => {
        return {
          name: ticketType.name,
          price: ticketType.price,
          description: ticketType.description,
          totalAvailable: ticketType.totalAvailable,
        };
      },
    );

    const request: CreateEventRequest = {
      name: eventData.name,
      description: eventData.description || undefined,
      imageUrl: eventData.imageUrl || undefined,
      start:
        eventData.startDate
          ? combineDateTime(eventData.startDate, eventData.startTime || "00:00")
          : undefined,
      end:
        eventData.endDate
          ? combineDateTime(eventData.endDate, eventData.endTime || "00:00")
          : undefined,
      venue: eventData.venueDetails,
      salesStart:
        eventData.salesStartDate
          ? combineDateTime(eventData.salesStartDate, eventData.salesStartTime || "00:00")
          : undefined,
      salesEnd:
        eventData.salesEndDate
          ? combineDateTime(eventData.salesEndDate, eventData.salesEndTime || "23:59")
          : undefined,
      status: eventData.status,
      ticketTypes: ticketTypes,
    };

    try {
      await createEvent(accessToken, request);
      toast("Event created");
      navigate("/dashboard/events");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === "string") {
        setError(err);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);

    if (isLoading || !user || !user.access_token) {
      console.error("User not found!");
      return;
    }

    if (isEditMode) {
      if (!eventData.id) {
        setError("Event does not have an ID");
        return;
      }
      await handleEventUpdateSubmit(user.access_token, eventData.id);
    } else {
      await handleEventCreateSubmit(user.access_token);
    }
  };

  const handleAddTicketType = () => {
    setCurrentTicketType({
      id: undefined,
      name: "",
      price: 0,
      totalAvailable: 0,
      description: "",
    });
    setDialogOpen(true);
  };

  const handleSaveTicketType = () => {
    if (!currentTicketType) {
      return;
    }

    const newTicketTypes = [...eventData.ticketTypes];

    if (currentTicketType.id) {
      const index = newTicketTypes.findIndex(
        (t) => t.id === currentTicketType.id,
      );
      if (index !== -1) {
        newTicketTypes[index] = currentTicketType;
      }
    } else {
      newTicketTypes.push({
        ...currentTicketType,
        id: generateTempId(),
      });
    }

    updateField("ticketTypes", newTicketTypes);
    setDialogOpen(false);
  };

  const handleEditTicketType = (ticketType: TicketTypeData) => {
    setCurrentTicketType(ticketType);
    setDialogOpen(true);
  };

  const handleDeleteTicketType = (id: string | undefined) => {
    if (!id) {
      return;
    }
    updateField(
      "ticketTypes",
      eventData.ticketTypes.filter((t) => t.id !== id),
    );
  };

  return (
    <DashboardShell>
      <PageHeader
        ruled
        back={{ to: "/dashboard/events", label: "Your events" }}
        title={isEditMode ? "Edit event" : "Create an event"}
        description={
          isEditMode ? (
            <>
              {eventData.createdAt && <>Created {format(eventData.createdAt, "PPP")}. </>}
              {eventData.updatedAt && <>Last updated {format(eventData.updatedAt, "PPP")}.</>}
            </>
          ) : (
            "Fill in the details below. You can save it as a draft and publish later."
          )
        }
      />

      <form onSubmit={handleFormSubmit} className="pb-8">
          <section className="bg-card border-edge mb-8 grid gap-x-12 gap-y-6 border p-6 shadow-sm sm:p-8 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2 className="text-2xl font-normal tracking-[-0.01em]">The basics</h2>
              <p className="text-muted-foreground mt-2 max-w-xs text-[0.95rem] leading-relaxed">
                What guests see first on the public event page.
              </p>
            </div>
            <div className="space-y-7 lg:col-span-8">
              <div className="space-y-2">
                <Label htmlFor="event-name">Event name</Label>
                <Input
                  id="event-name"
                  placeholder="e.g. Tech Summit 2026"
                  value={eventData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell guests what to expect"
                  className="min-h-[140px]"
                  value={eventData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                />
                <p className="text-muted-foreground text-sm">Optional. Shown on the public event page.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Banner image URL</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder="https://example.com/event-banner.jpg"
                  value={eventData.imageUrl}
                  onChange={(e) => updateField("imageUrl", e.target.value)}
                />
                <p className="text-muted-foreground text-sm">
                  Optional. Paste a direct link to an image.
                </p>
                {eventData.imageUrl && (
                  <div className="bg-secondary mt-3 aspect-[16/7] w-full overflow-hidden border">
                    <img
                      src={eventData.imageUrl}
                      alt="Banner preview"
                      className="size-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue-details">Venue</Label>
                <Textarea
                  id="venue-details"
                  className="min-h-[96px]"
                  placeholder="Address, room, or online link"
                  value={eventData.venueDetails}
                  onChange={(e) => updateField("venueDetails", e.target.value)}
                  required
                />
                <p className="text-muted-foreground text-sm">
                  Add what guests need to find you: address, floor, parking.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-card border-edge mb-8 grid gap-x-12 gap-y-6 border p-6 shadow-sm sm:p-8 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2 className="text-2xl font-normal tracking-[-0.01em]">Dates</h2>
              <p className="text-muted-foreground mt-2 max-w-xs text-[0.95rem] leading-relaxed">
                When the event runs, and when tickets can be bought.
              </p>
            </div>
            <div className="space-y-7 lg:col-span-8">
              <div className="grid gap-7 sm:grid-cols-2">
                <DateTimeSelect
                  label="Event starts"
                  date={eventData.startDate}
                  setDate={(date) => updateField("startDate", date)}
                  time={eventData.startTime}
                  setTime={(time) => updateField("startTime", time)}
                />
                <DateTimeSelect
                  label="Event ends"
                  date={eventData.endDate}
                  setDate={(date) => updateField("endDate", date)}
                  time={eventData.endTime}
                  setTime={(time) => updateField("endTime", time)}
                />
                <DateTimeSelect
                  label="Ticket sales open"
                  date={eventData.salesStartDate}
                  setDate={(date) => updateField("salesStartDate", date)}
                  time={eventData.salesStartTime}
                  setTime={(time) => updateField("salesStartTime", time)}
                />
                <DateTimeSelect
                  label="Ticket sales close"
                  date={eventData.salesEndDate}
                  setDate={(date) => updateField("salesEndDate", date)}
                  time={eventData.salesEndTime}
                  setTime={(time) => updateField("salesEndTime", time)}
                />
              </div>
            </div>
          </section>

          <section className="bg-card border-edge mb-8 grid gap-x-12 gap-y-6 border p-6 shadow-sm sm:p-8 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2 className="text-2xl font-normal tracking-[-0.01em]">Tickets</h2>
              <p className="text-muted-foreground mt-2 max-w-xs text-[0.95rem] leading-relaxed">
                Each ticket type has its own price and quantity. You can add as many as you need.
              </p>
            </div>
            <div className="space-y-7 lg:col-span-8">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                {eventData.ticketTypes.length === 0 ? (
                  <p className="text-muted-foreground border-y py-8">
                    No ticket types yet. Add one so guests have something to buy.
                  </p>
                ) : (
                  <ul className="border-t">
                    {eventData.ticketTypes.map((ticketType) => (
                      <li
                        key={ticketType.id}
                        className="flex items-start justify-between gap-4 border-b py-5"
                      >
                        <div>
                          <p className="font-serif text-xl font-medium tracking-tight">
                            {ticketType.name}
                            <span className="ml-3 font-light tabular-nums">
                              ${ticketType.price}
                            </span>
                          </p>
                          {ticketType.totalAvailable ? (
                            <p className="text-muted-foreground mt-0.5 text-sm tabular-nums">
                              {ticketType.totalAvailable} available
                            </p>
                          ) : null}
                          {ticketType.description && (
                            <p className="text-muted-foreground mt-1 max-w-md text-sm">
                              {ticketType.description}
                            </p>
                          )}
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Edit ${ticketType.name}`}
                            onClick={() => handleEditTicketType(ticketType)}
                          >
                            <Pencil aria-hidden="true" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Remove ${ticketType.name}`}
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleDeleteTicketType(ticketType.id)}
                          >
                            <Trash2 aria-hidden="true" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <Button type="button" variant="outline" onClick={() => handleAddTicketType()}>
                  <Plus aria-hidden="true" />
                  Add ticket type
                </Button>

                {/* Add/Edit ticket type dialog */}
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-normal">
                      {currentTicketType?.id ? "Edit ticket type" : "Add ticket type"}
                    </DialogTitle>
                    <DialogDescription>
                      Name it, set a price, and say what’s included.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="ticket-type-name">Name</Label>
                      <Input
                        id="ticket-type-name"
                        value={currentTicketType?.name ?? ""}
                        onChange={(e) =>
                          setCurrentTicketType(
                            currentTicketType
                              ? { ...currentTicketType, name: e.target.value }
                              : undefined,
                          )
                        }
                        placeholder="e.g. General admission, VIP"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ticket-type-price">Price ($)</Label>
                        <Input
                          id="ticket-type-price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={currentTicketType?.price ?? 0}
                          onChange={(e) =>
                            setCurrentTicketType(
                              currentTicketType
                                ? {
                                    ...currentTicketType,
                                    price: Number.parseFloat(e.target.value),
                                  }
                                : undefined,
                            )
                          }
                          className="tabular-nums"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ticket-type-total-available">Quantity</Label>
                        <Input
                          id="ticket-type-total-available"
                          type="number"
                          min="0"
                          value={currentTicketType?.totalAvailable ?? ""}
                          onChange={(e) =>
                            setCurrentTicketType(
                              currentTicketType
                                ? {
                                    ...currentTicketType,
                                    totalAvailable: Number.parseFloat(
                                      e.target.value,
                                    ),
                                  }
                                : undefined,
                            )
                          }
                          className="tabular-nums"
                          placeholder="Leave blank for unlimited"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ticket-type-description">Description</Label>
                      <Textarea
                        id="ticket-type-description"
                        value={currentTicketType?.description ?? ""}
                        onChange={(e) =>
                          setCurrentTicketType(
                            currentTicketType
                              ? {
                                  ...currentTicketType,
                                  description: e.target.value,
                                }
                              : undefined,
                          )
                        }
                        placeholder="What’s included with this ticket?"
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" onClick={handleSaveTicketType}>
                      Save ticket type
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </section>

          <section className="bg-card border-edge mb-8 grid gap-x-12 gap-y-6 border p-6 shadow-sm sm:p-8 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2 className="text-2xl font-normal tracking-[-0.01em]">Publishing</h2>
              <p className="text-muted-foreground mt-2 max-w-xs text-[0.95rem] leading-relaxed">
                Drafts are only visible to you. Published events appear on the public site.
              </p>
            </div>
            <div className="space-y-7 lg:col-span-8">
              <div className="space-y-2">
                <Label htmlFor="event-status">Status</Label>
                <Select
                  value={eventData.status}
                  onValueChange={(value) => updateField("status", value)}
                >
                  <SelectTrigger id="event-status" className="bg-card h-11 w-full sm:w-[220px]">
                    <SelectValue placeholder="Choose a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EventStatusEnum.DRAFT}>Draft</SelectItem>
                    <SelectItem value={EventStatusEnum.PUBLISHED}>
                      Published
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle />
            <AlertTitle>Couldn’t save the event</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" size="lg">
            {isEditMode ? "Save changes" : "Create event"}
          </Button>
          <Button
            type="button"
            size="lg"
            variant="ghost"
            onClick={() => navigate("/dashboard/events")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </DashboardShell>
  );
};

export default DashboardManageEventPage;
