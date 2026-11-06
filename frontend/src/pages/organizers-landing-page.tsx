import { Button } from "@/components/ui/button";
import { useAuth } from "react-oidc-context";
import { Link, useNavigate } from "react-router";
import PageShell from "@/components/page-shell";
import Accordion from "@/components/accordion";
import { LoadingState } from "@/components/state-views";
import { TicketMark } from "@/components/logo";
import { Check } from "lucide-react";
import { useDocumentTitle } from "@/hooks/use-document-title";

const features = [
  {
    title: "A public page for every event",
    body: "Add a name, description, banner image, venue and dates. Guests can find your event by searching the home page.",
  },
  {
    title: "Ticket types with their own price",
    body: "Offer general admission, VIP, early bird, or anything else. Set a price and an optional quantity for each.",
  },
  {
    title: "A sales window you control",
    body: "Choose when ticket sales open and close. Keep the event as a draft until you’re ready to publish it.",
  },
  {
    title: "QR tickets, issued instantly",
    body: "Guests get a QR ticket the moment they check out, and can open it from their phone at the door.",
  },
  {
    title: "Check-in at the entrance",
    body: "Staff scan each QR code with a camera, or type the ticket ID. Eventra says whether the ticket is valid and marks it as used.",
  },
];

const steps = [
  { title: "Create your event", body: "Start with the name, venue and dates. It stays a draft, visible only to you." },
  { title: "Add ticket types", body: "Set a price, a quantity and a short description for each type." },
  { title: "Publish", body: "Switch the event to published and it appears on the public site." },
  { title: "Check guests in", body: "Staff scan tickets at the door. Used tickets can’t be scanned twice." },
];

const faqs = [
  {
    question: "Can I set up an event before it’s public?",
    answer:
      "Yes. Every event starts as a draft that only you can see. Switch it to published when you’re ready, and it goes live on the home page.",
  },
  {
    question: "Can I limit how many tickets I sell?",
    answer:
      "Yes. Set a quantity on each ticket type, or leave it blank for no limit.",
  },
  {
    question: "How do guests receive their tickets?",
    answer:
      "Right after checkout. The ticket, with its QR code, appears under My tickets in the guest’s account, and they show it on their phone.",
  },
  {
    question: "Who can scan tickets at the door?",
    answer:
      "Anyone with a staff account. They open Scan tickets, point the camera at a guest’s QR code, and see right away whether to let the guest in.",
  },
  {
    question: "Does Eventra take real payments yet?",
    answer:
      "Not in this version. Checkout is a test payment form, so no money moves. Connect a payment provider before you sell real tickets.",
  },
];

const container = "mx-auto max-w-[1280px] px-5 sm:px-8";

/** Decorative stand-in for a QR code in the sample ticket. */
const qrRows = [
  "111111101011111111",
  "100000101101000001",
  "101110100110101101",
  "101110101001101101",
  "101110100101001101",
  "100000101110000001",
  "111111101010111111",
  "000000001101000000",
  "110101110011010110",
  "001011001110101001",
  "101100110001100111",
  "000000001011010010",
  "111111100110111001",
  "100000101001010110",
  "101110101110101011",
  "101110100011001100",
  "100000100101110101",
  "111111101100101011",
];

const SampleQr: React.FC = () => (
  <div
    className="grid size-28 gap-px bg-white p-2"
    style={{ gridTemplateColumns: "repeat(18, minmax(0, 1fr))" }}
  >
    {qrRows.join("").split("").map((cell, i) => (
      <span key={i} className={cell === "1" ? "bg-ink" : "bg-white"} />
    ))}
  </div>
);

const OrganizersLandingPage: React.FC = () => {
  const { isLoading } = useAuth();
  const navigate = useNavigate();

  useDocumentTitle(
    "Sell event tickets with QR check-in | Eventra",
    "Create an event, sell tickets, and check guests in at the door with a QR code. Eventra covers the whole ticketing flow for organizers, guests and door staff.",
  );

  if (isLoading) {
    return (
      <PageShell>
        <LoadingState />
      </PageShell>
    );
  }

  return (
    <PageShell width="full">
      {/* 1. Hero: page colour */}
      <section aria-labelledby="org-hero" className="bg-background">
        <div className={`${container} grid gap-14 pt-14 pb-28 sm:pt-20 lg:grid-cols-12 lg:gap-8`}>
          <div className="flex flex-col justify-between lg:col-span-7 lg:pr-10">
            <h1
              id="org-hero"
              className="text-[clamp(2.75rem,7.4vw,6.5rem)] leading-[0.95] font-light tracking-[-0.035em]"
            >
              <span className="settle block" style={{ "--i": 0 } as React.CSSProperties}>
                Sell tickets.
              </span>
              <span className="settle block" style={{ "--i": 1 } as React.CSSProperties}>
                Scan them at
              </span>
              <span className="settle block" style={{ "--i": 2 } as React.CSSProperties}>
                the door.
              </span>
            </h1>

            <div className="mt-12 lg:mt-20">
              <p className="text-muted-foreground max-w-md text-lg leading-relaxed">
                Eventra handles ticket types, your public event page, and QR
                check-in, so you can spend your time on the event.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button size="lg" onClick={() => navigate("/dashboard/events")}>
                  Create an event
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/">Browse events</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="relative lg:col-span-5">
            <div className="bg-secondary border-edge aspect-[4/5] w-full overflow-hidden border shadow-md">
              <img
                src="/organizers-landing-hero.png"
                alt="A crowd at a live concert"
                fetchPriority="high"
                decoding="async"
                className="size-full object-cover"
              />
            </div>

            {/* A sample ticket, to show what guests receive. */}
            <div
              aria-hidden="true"
              className="ticket absolute -bottom-10 -left-4 w-[17rem] sm:-left-10"
            >
              <div className="ticket-top bg-ink text-ink-foreground px-5 pt-5 pb-7">
                <p className="text-ink-muted flex items-center gap-2 text-xs">
                  <TicketMark className="text-brand" />
                  Admit one
                </p>
                <p className="mt-4 font-serif text-2xl leading-tight font-light">
                  General admission
                </p>
              </div>
              <div className="ticket-bottom bg-card px-5 pt-4 pb-4">
                <div className="perforation -mt-4 mb-3" />
                <p className="text-muted-foreground text-xs">Scanned once, at the door</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. What you get: ivory band */}
      <section
        aria-labelledby="features-title"
        className="bg-card border-edge border-y-2"
      >
        <div className={`${container} grid gap-10 py-24 lg:grid-cols-12 lg:gap-8`}>
          <div className="lg:col-span-4">
            <h2
              id="features-title"
              className="max-w-[12ch] text-4xl leading-[1.05] font-light tracking-[-0.02em] sm:text-5xl"
            >
              Everything an event needs to sell out
            </h2>
          </div>
          <ul className="lg:col-span-7 lg:col-start-6">
            {features.map((feature, index) => (
              <li
                key={feature.title}
                className={`py-7 ${index === 0 ? "pt-0" : "border-edge border-t"}`}
              >
                <h3 className="text-2xl font-medium tracking-tight">{feature.title}</h3>
                <p className="text-muted-foreground mt-2 max-w-lg leading-relaxed">
                  {feature.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3. How it works: a real sequence, so the steps are numbered. Page colour. */}
      <section aria-labelledby="how-title" className="bg-background">
        <div className={`${container} py-24`}>
          <h2
            id="how-title"
            className="max-w-xl text-4xl leading-[1.05] font-light tracking-[-0.02em] sm:text-5xl"
          >
            From draft to full house in four steps
          </h2>
          <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="bg-card border-edge border-t-4 border-x border-b p-6 shadow-sm"
                style={{ borderTopColor: "var(--foreground)" }}
              >
                <span
                  aria-hidden="true"
                  className="text-brand-ink font-serif text-5xl leading-none font-light tabular-nums"
                >
                  {index + 1}
                </span>
                <h3 className="mt-5 text-2xl font-medium tracking-tight">{step.title}</h3>
                <p className="text-muted-foreground mt-2 leading-relaxed">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 4. Showcase: the real screens each role uses, on the ink band */}
      <section aria-labelledby="who-title" className="bg-ink text-ink-foreground">
        <div className={`${container} py-24`}>
          <h2
            id="who-title"
            className="max-w-xl text-4xl leading-[1.05] font-light tracking-[-0.02em] sm:text-5xl"
          >
            Three roles, one platform
          </h2>
          <p className="text-ink-muted mt-4 max-w-lg text-lg leading-relaxed">
            Everyone at your event gets a screen built for what they need to do.
          </p>

          <div className="mt-14 grid gap-12 lg:grid-cols-3 lg:gap-8">
            {/* Organizer */}
            <figure>
              <div
                aria-hidden="true"
                className="bg-card text-card-foreground border-edge h-[22rem] border shadow-xl"
              >
                <div className="border-edge bg-secondary border-b px-5 py-3.5">
                  <p className="text-sm font-semibold">Ticket types</p>
                </div>
                <ul>
                  <li className="border-border flex items-start justify-between border-b px-5 py-5">
                    <div>
                      <p className="font-serif text-xl font-medium">General admission</p>
                      <p className="text-muted-foreground text-sm">200 available</p>
                    </div>
                    <p className="font-serif text-xl font-light tabular-nums">$25</p>
                  </li>
                  <li className="border-border flex items-start justify-between border-b px-5 py-5">
                    <div>
                      <p className="font-serif text-xl font-medium">VIP</p>
                      <p className="text-muted-foreground text-sm">40 available</p>
                    </div>
                    <p className="font-serif text-xl font-light tabular-nums">$60</p>
                  </li>
                </ul>
                <div className="px-5 pt-6">
                  <span className="border-foreground/80 inline-flex h-9 items-center border px-3.5 text-sm font-medium">
                    + Add ticket type
                  </span>
                </div>
              </div>
              <figcaption className="mt-5">
                <p className="font-serif text-2xl font-medium tracking-tight">Organizers</p>
                <p className="text-ink-muted mt-1 leading-relaxed">
                  Create events, set ticket types, and publish when you’re ready.
                </p>
              </figcaption>
            </figure>

            {/* Guest */}
            <figure>
              <div
                aria-hidden="true"
                className="bg-secondary/10 border-ink-foreground/20 flex h-[22rem] items-center justify-center border"
              >
                <div className="ticket w-[15.5rem]">
                  <div className="ticket-top bg-brand text-brand-foreground px-5 pt-5 pb-7">
                    <p className="flex items-center gap-2 text-xs font-medium">
                      <TicketMark />
                      Admit one
                    </p>
                    <p className="mt-3 font-serif text-xl leading-tight font-medium">
                      General admission
                    </p>
                  </div>
                  <div className="ticket-bottom bg-card flex flex-col items-center px-5 pt-4 pb-5">
                    <div className="perforation -mt-4 mb-4 w-full" />
                    <div className="border-foreground border-2">
                      <SampleQr />
                    </div>
                    <p className="text-muted-foreground mt-3 text-xs">Show at the entrance</p>
                  </div>
                </div>
              </div>
              <figcaption className="mt-5">
                <p className="font-serif text-2xl font-medium tracking-tight">Guests</p>
                <p className="text-ink-muted mt-1 leading-relaxed">
                  Find an event, buy a ticket, and keep the QR code on your phone.
                </p>
              </figcaption>
            </figure>

            {/* Door staff */}
            <figure>
              <div
                aria-hidden="true"
                className="bg-success flex h-[22rem] flex-col justify-end border border-white/20 p-7 text-white shadow-xl"
              >
                <div className="flex size-14 items-center justify-center bg-white/15">
                  <Check className="size-8" strokeWidth={2.5} />
                </div>
                <p className="mt-6 font-serif text-5xl leading-none font-light tracking-[-0.02em]">
                  Let them in
                </p>
                <p className="mt-3 text-lg leading-snug text-white/90">
                  Valid ticket. It’s now marked as used.
                </p>
              </div>
              <figcaption className="mt-5">
                <p className="font-serif text-2xl font-medium tracking-tight">Door staff</p>
                <p className="text-ink-muted mt-1 leading-relaxed">
                  Scan tickets at the entrance and see instantly who to let in.
                </p>
              </figcaption>
            </figure>
          </div>
          <p className="text-ink-muted mt-10 text-sm">Sample screens, shown with example data.</p>
        </div>
      </section>

      {/* 5. FAQ: ivory band */}
      <section aria-labelledby="faq-title" className="bg-card border-edge border-b-2">
        <div className={`${container} grid gap-10 py-24 lg:grid-cols-12 lg:gap-8`}>
          <h2
            id="faq-title"
            className="text-4xl leading-[1.05] font-light tracking-[-0.02em] sm:text-5xl lg:col-span-4"
          >
            Questions, answered
          </h2>
          <div className="lg:col-span-7 lg:col-start-6">
            <Accordion
              items={faqs.map((f) => ({ question: f.question, answer: f.answer }))}
            />
          </div>
        </div>
      </section>

      {/* 6. Closing call to action: the one saffron band */}
      <section aria-labelledby="cta-title" className="bg-brand text-brand-foreground">
        <div
          className={`${container} flex flex-col gap-8 py-20 md:flex-row md:items-end md:justify-between`}
        >
          <h2
            id="cta-title"
            className="max-w-[16ch] text-5xl leading-[1] font-light tracking-[-0.03em] sm:text-6xl"
          >
            Put your event on sale today.
          </h2>
          <Button size="lg" onClick={() => navigate("/dashboard/events")}>
            Create an event
          </Button>
        </div>
      </section>
    </PageShell>
  );
};

export default OrganizersLandingPage;
