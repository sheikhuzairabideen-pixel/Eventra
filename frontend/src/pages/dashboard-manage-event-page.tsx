import NavBar from "@/components/nav-bar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import {
  AlertCircle,
  CalendarIcon,
  Edit,
  Plus,
  Ticket,
  Trash,
  Image as ImageIcon,
  X,
  Clock,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { useNavigate, useParams } from "react-router";

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
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-slate-200">{label}</label>
      <div className="flex flex-wrap gap-2 items-center">
        {/* Date picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white min-w-[160px] justify-start"
            >
              <CalendarIcon className="h-4 w-4 mr-2 text-purple-400" />
              {date ? format(date, "dd MMM yyyy") : <span className="text-slate-500">Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-slate-900 border-slate-700" align="start">
            <Calendar
              mode="single"
              selected={date}
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
              }}
              className="rounded-md text-white"
            />
          </PopoverContent>
        </Popover>

        {/* Time picker */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-md px-3 py-2">
          <Clock className="h-4 w-4 text-purple-400 shrink-0" />
          <input
            type="time"
            className="bg-transparent text-slate-200 text-sm outline-none w-[90px] [&::-webkit-calendar-picker-indicator]:invert"
            value={time ?? ""}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>

        {/* Clear button */}
        {date && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-slate-500 hover:text-red-400 hover:bg-red-950/30 px-2"
            onClick={() => setDate(undefined)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
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
          startDate: event.start,
          startTime: event.start
            ? formatTimeFromDate(new Date(event.start))
            : undefined,
          endDate: event.end,
          endTime: event.end
            ? formatTimeFromDate(new Date(event.end))
            : undefined,
          venueDetails: event.venue,
          salesStartDate: event.salesStart,
          salesStartTime: event.salesStart
            ? formatTimeFromDate(new Date(event.salesStart))
            : undefined,
          salesEndDate: event.salesEnd,
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
          createdAt: event.createdAt,
          updatedAt: event.updatedAt,
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
        eventData.startDate && eventData.startTime
          ? combineDateTime(eventData.startDate, eventData.startTime)
          : undefined,
      end:
        eventData.endDate && eventData.endTime
          ? combineDateTime(eventData.endDate, eventData.endTime)
          : undefined,
      venue: eventData.venueDetails,
      salesStart:
        eventData.salesStartDate && eventData.salesStartTime
          ? combineDateTime(eventData.salesStartDate, eventData.salesStartTime)
          : undefined,
      salesEnd:
        eventData.salesEndDate && eventData.salesEndTime
          ? combineDateTime(eventData.salesEndDate, eventData.salesEndTime)
          : undefined,
      status: eventData.status,
      ticketTypes: ticketTypes,
    };

    try {
      await updateEvent(accessToken, id, request);
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
        eventData.startDate && eventData.startTime
          ? combineDateTime(eventData.startDate, eventData.startTime)
          : undefined,
      end:
        eventData.endDate && eventData.endTime
          ? combineDateTime(eventData.endDate, eventData.endTime)
          : undefined,
      venue: eventData.venueDetails,
      salesStart:
        eventData.salesStartDate && eventData.salesStartTime
          ? combineDateTime(eventData.salesStartDate, eventData.salesStartTime)
          : undefined,
      salesEnd:
        eventData.salesEndDate && eventData.salesEndTime
          ? combineDateTime(eventData.salesEndDate, eventData.salesEndTime)
          : undefined,
      status: eventData.status,
      ticketTypes: ticketTypes,
    };

    try {
      await createEvent(accessToken, request);
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
    <div className="min-h-screen bg-slate-950 text-white">
      <NavBar />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            {isEditMode ? "Edit Event" : "Create a New Event"}
          </h1>
          {isEditMode ? (
            <>
              {eventData.id && (
                <p className="text-sm text-slate-400 mt-1">ID: {eventData.id}</p>
              )}
              {eventData.createdAt && (
                <p className="text-sm text-slate-400">
                  Created: {format(eventData.createdAt, "PPP")}
                </p>
              )}
              {eventData.updatedAt && (
                <p className="text-sm text-slate-400">
                  Updated: {format(eventData.updatedAt, "PPP")}
                </p>
              )}
            </>
          ) : (
            <p className="text-slate-400 mt-1">
              Fill out the form below to create your event
            </p>
          )}
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-6">

          {/* ── Event Name ── */}
          <div className="space-y-1.5">
            <label htmlFor="event-name" className="text-sm font-semibold text-slate-200">
              Event Name <span className="text-red-400">*</span>
            </label>
            <Input
              id="event-name"
              className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
              placeholder="e.g. Tech Summit 2025"
              value={eventData.name}
              onChange={(e) => updateField("name", e.target.value)}
              required
            />
            <p className="text-slate-500 text-xs">The public name of your event.</p>
          </div>

          {/* ── Description ── */}
          <div className="space-y-1.5">
            <label htmlFor="description" className="text-sm font-semibold text-slate-200">
              Description
            </label>
            <Textarea
              id="description"
              placeholder="Tell attendees what to expect..."
              className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 min-h-[120px]"
              value={eventData.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
            <p className="text-slate-500 text-xs">Optional. Shown on the public event page.</p>
          </div>

          {/* ── Image URL ── */}
          <div className="space-y-1.5">
            <label htmlFor="imageUrl" className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
              <ImageIcon className="h-4 w-4 text-purple-400" />
              Event Banner Image URL
            </label>
            <Input
              id="imageUrl"
              placeholder="https://example.com/event-banner.jpg"
              className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
              value={eventData.imageUrl}
              onChange={(e) => updateField("imageUrl", e.target.value)}
            />
            {eventData.imageUrl && (
              <div className="mt-2 rounded-xl overflow-hidden border border-slate-700 h-44 w-full">
                <img
                  src={eventData.imageUrl}
                  alt="Event banner preview"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
            <p className="text-slate-500 text-xs">Optional. Paste a direct image URL for the banner.</p>
          </div>

          {/* ── Venue Details ── */}
          <div className="space-y-1.5">
            <label htmlFor="venue-details" className="text-sm font-semibold text-slate-200">
              Venue Details <span className="text-red-400">*</span>
            </label>
            <Textarea
              id="venue-details"
              className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 min-h-[80px]"
              placeholder="Address, room number, or online link..."
              value={eventData.venueDetails}
              onChange={(e) => updateField("venueDetails", e.target.value)}
            />
            <p className="text-slate-500 text-xs">
              Include as much detail as possible (address, floor, parking, etc.)
            </p>
          </div>

          {/* ── Event Start ── */}
          <DateTimeSelect
            label="Event Start"
            date={eventData.startDate}
            setDate={(date) => updateField("startDate", date)}
            time={eventData.startTime}
            setTime={(time) => updateField("startTime", time)}
          />

          {/* ── Event End ── */}
          <DateTimeSelect
            label="Event End"
            date={eventData.endDate}
            setDate={(date) => updateField("endDate", date)}
            time={eventData.endTime}
            setTime={(time) => updateField("endTime", time)}
          />

          {/* ── Ticket Sales Start ── */}
          <DateTimeSelect
            label="Ticket Sales Start"
            date={eventData.salesStartDate}
            setDate={(date) => updateField("salesStartDate", date)}
            time={eventData.salesStartTime}
            setTime={(time) => updateField("salesStartTime", time)}
          />

          {/* ── Ticket Sales End ── */}
          <DateTimeSelect
            label="Ticket Sales End"
            date={eventData.salesEndDate}
            setDate={(date) => updateField("salesEndDate", date)}
            time={eventData.salesEndTime}
            setTime={(time) => updateField("salesEndTime", time)}
          />

          {/* ── Ticket Types ── */}
          <div>
            <Card className="bg-slate-900 border-slate-700 text-white">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex gap-2 items-center text-sm font-semibold">
                      <Ticket className="h-4 w-4 text-purple-400" />
                      Ticket Types
                    </CardTitle>
                    <Button
                      type="button"
                      onClick={() => handleAddTicketType()}
                      className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700 text-xs"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Ticket Type
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-2">
                  {eventData.ticketTypes.length === 0 && (
                    <p className="text-slate-500 text-sm text-center py-4">
                      No ticket types yet. Click "Add Ticket Type" to get started.
                    </p>
                  )}
                  {eventData.ticketTypes.map((ticketType) => (
                    <div
                      key={ticketType.id}
                      className="bg-slate-800 w-full p-4 rounded-lg border border-slate-700"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex gap-3 items-center">
                            <p className="text-sm font-medium">{ticketType.name}</p>
                            <Badge
                              variant="outline"
                              className="border-slate-600 text-slate-300 font-normal text-xs"
                            >
                              ${ticketType.price}
                            </Badge>
                          </div>
                          {ticketType.totalAvailable && (
                            <p className="text-slate-400 text-xs mt-0.5">
                              {ticketType.totalAvailable} tickets available
                            </p>
                          )}
                          {ticketType.description && (
                            <p className="text-slate-500 text-xs mt-0.5 truncate max-w-xs">
                              {ticketType.description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditTicketType(ticketType)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300"
                            onClick={() => handleDeleteTicketType(ticketType.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>

                {/* Add/Edit Ticket Type Dialog */}
                <DialogContent className="bg-slate-900 border-slate-700 text-white">
                  <DialogHeader>
                    <DialogTitle>
                      {currentTicketType?.id ? "Edit Ticket Type" : "Add Ticket Type"}
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                      Please enter details of the ticket type
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    {/* Name */}
                    <div className="space-y-1">
                      <Label htmlFor="ticket-type-name">Name</Label>
                      <Input
                        id="ticket-type-name"
                        className="bg-slate-800 border-slate-700"
                        value={currentTicketType?.name ?? ""}
                        onChange={(e) =>
                          setCurrentTicketType(
                            currentTicketType
                              ? { ...currentTicketType, name: e.target.value }
                              : undefined,
                          )
                        }
                        placeholder="e.g General Admission, VIP, etc."
                      />
                    </div>

                    <div className="flex gap-4">
                      {/* Price */}
                      <div className="space-y-1 w-full">
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
                          className="bg-slate-800 border-slate-700"
                        />
                      </div>

                      {/* Total Available */}
                      <div className="space-y-1 w-full">
                        <Label htmlFor="ticket-type-total-available">
                          Total Available
                        </Label>
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
                          className="bg-slate-800 border-slate-700"
                          placeholder="Leave blank for unlimited"
                        />
                      </div>
                    </div>

                    {/* Ticket Description */}
                    <div className="space-y-1">
                      <Label htmlFor="ticket-type-description">Description</Label>
                      <Textarea
                        id="ticket-type-description"
                        className="bg-slate-800 border-slate-700"
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
                        placeholder="What's included with this ticket?"
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      className="bg-white text-black hover:bg-slate-200"
                      onClick={handleSaveTicketType}
                    >
                      Save
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </Card>
          </div>

          {/* ── Status ── */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-slate-200">Status</Label>
            <Select
              value={eventData.status}
              onValueChange={(value) => updateField("status", value)}
            >
              <SelectTrigger className="w-[180px] bg-slate-900 border-slate-700 text-white">
                <SelectValue placeholder="Select Event Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700 text-white">
                <SelectItem value={EventStatusEnum.DRAFT}>Draft</SelectItem>
                <SelectItem value={EventStatusEnum.PUBLISHED}>
                  Published
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-slate-500 text-xs">
              Set to "Published" to make the event publicly visible.
            </p>
          </div>

          {/* ── Error ── */}
          {error && (
            <Alert variant="destructive" className="bg-red-950/40 border-red-700">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* ── Submit ── */}
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold px-6"
            >
              {isEditMode ? "Update Event" : "Create Event"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
              onClick={() => navigate("/dashboard/events")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DashboardManageEventPage;
