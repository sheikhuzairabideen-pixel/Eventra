import { useDocumentTitle } from "@/hooks/use-document-title";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { purchaseTicket } from "@/lib/api";
import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { useNavigate, useParams } from "react-router";
import PageShell from "@/components/page-shell";
import PageHeader from "@/components/page-header";
import { ErrorState } from "@/components/state-views";

const PurchaseTicketPage: React.FC = () => {
  useDocumentTitle("Checkout | Eventra");
  const { eventId, ticketTypeId } = useParams();
  const { isLoading, user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | undefined>();
  const [isPurchaseSuccess, setIsPurchaseASuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isPurchaseSuccess) {
      return;
    }
    const timer = setTimeout(() => {
      navigate("/dashboard/tickets");
    }, 2500);

    return () => clearTimeout(timer);
  }, [isPurchaseSuccess, navigate]);

  const handlePurchase = async () => {
    if (isLoading || !user?.access_token || !eventId || !ticketTypeId) {
      return;
    }
    try {
      setIsSubmitting(true);
      setError(undefined);
      await purchaseTicket(user.access_token, eventId, ticketTypeId);
      setIsPurchaseASuccess(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === "string") {
        setError(err);
      } else {
        setError("An unknown error occurred during purchase");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPurchaseSuccess) {
    return (
      <PageShell width="narrow">
        <div role="status" className="py-24 sm:py-32">
          <h1 className="text-5xl leading-[1] font-light tracking-[-0.02em] sm:text-6xl">
            Your ticket is ready.
          </h1>
          <p className="text-muted-foreground mt-6 max-w-md text-lg leading-relaxed">
            Your QR code is saved under My tickets. Show it to staff at the
            entrance. We’re taking you there now.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button size="lg" onClick={() => navigate("/dashboard/tickets")}>
              View my tickets
            </Button>
            <Button size="lg" variant="ghost" onClick={() => navigate("/")}>
              Back to events
            </Button>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell width="narrow">
      <PageHeader
        back={{
          to: eventId ? `/events/${eventId}` : "/",
          label: "Back to the event",
        }}
        title="Checkout"
        description="This is a test payment form. No real charge is made."
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handlePurchase();
        }}
        className="bg-card border-edge mb-16 border p-6 shadow-md sm:p-8"
        noValidate
      >
        {error && (
          <ErrorState
            className="mb-10"
            title="Payment didn’t go through"
            message={`${error}. Check the details and try again.`}
          />
        )}

        <div className="space-y-7">
          <div className="space-y-2">
            <Label htmlFor="card-number">Card number</Label>
            <Input
              id="card-number"
              type="text"
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="4532 8920 1234 5678"
              defaultValue="4532 8920 1234 5678"
              maxLength={19}
              className="tabular-nums"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="card-name">Name on card</Label>
            <Input
              id="card-name"
              type="text"
              autoComplete="cc-name"
              placeholder="Alex Morgan"
              defaultValue={user?.profile?.name || "Eventra Attendee"}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="card-expiry">Expiry (MM/YY)</Label>
              <Input
                id="card-expiry"
                type="text"
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="12/28"
                defaultValue="12/28"
                maxLength={5}
                className="tabular-nums"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="card-cvv">Security code</Label>
              <Input
                id="card-cvv"
                type="password"
                inputMode="numeric"
                autoComplete="cc-csc"
                placeholder="888"
                defaultValue="888"
                maxLength={4}
                className="tabular-nums"
              />
            </div>
          </div>
        </div>

        <Button type="submit" size="lg" disabled={isSubmitting} className="mt-12 w-full">
          {isSubmitting ? "Processing…" : "Pay and get my ticket"}
        </Button>
        <p className="text-muted-foreground mt-4 text-center text-sm">
          Your QR ticket is issued the moment payment completes.
        </p>
      </form>
    </PageShell>
  );
};

export default PurchaseTicketPage;
