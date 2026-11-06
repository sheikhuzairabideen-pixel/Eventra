import { useDocumentTitle } from "@/hooks/use-document-title";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import {
  TicketValidationMethod,
  TicketValidationStatus,
} from "@/domain/domain";
import { Check, X } from "lucide-react";
import { validateTicket } from "@/lib/api";
import { useAuth } from "react-oidc-context";
import DashboardShell from "@/components/dashboard-shell";
import PageHeader from "@/components/page-header";
import { ErrorState } from "@/components/state-views";
import { cn } from "@/lib/utils";

const DashboardValidateQrPage: React.FC = () => {
  useDocumentTitle("Scan tickets | Eventra");
  const { user } = useAuth();
  const [isManual, setIsManual] = useState(false);
  const [data, setData] = useState<string>("");
  const [error, setError] = useState<string | undefined>();
  const [validationStatus, setValidationStatus] = useState<
    TicketValidationStatus | undefined
  >();
  const [isValidating, setIsValidating] = useState(false);

  const handleReset = () => {
    setData("");
    setError(undefined);
    setValidationStatus(undefined);
  };

  const handleError = (err: unknown) => {
    if (err instanceof Error) {
      setError(err.message);
    } else if (typeof err === "string") {
      setError(err);
    } else {
      setError("An unknown error occurred");
    }
  };

  const handleValidate = async (id: string, method: TicketValidationMethod) => {
    if (!user?.access_token || !id.trim()) {
      return;
    }
    try {
      setIsValidating(true);
      setError(undefined);
      const response = await validateTicket(user.access_token, {
        id: id.trim(),
        method,
      });
      setValidationStatus(response.status);
    } catch (err) {
      handleError(err);
    } finally {
      setIsValidating(false);
    }
  };

  const isValid = validationStatus === TicketValidationStatus.VALID;

  const modeButton = (active: boolean) =>
    cn(
      "flex-1 cursor-pointer border-2 px-4 py-3 text-[0.95rem] font-semibold transition-colors",
      active
        ? "bg-primary text-primary-foreground border-primary"
        : "bg-card border-edge hover:bg-accent",
    );

  return (
    <DashboardShell size="narrow">
      <PageHeader
        ruled
        title="Check in guests"
        description="Scan a guest’s QR code, or type the ticket ID if the code won’t scan."
      />

      <div className="flex" role="group" aria-label="Check-in method">
        <button
          type="button"
          aria-pressed={!isManual}
          onClick={() => {
            setIsManual(false);
            handleReset();
          }}
          className={modeButton(!isManual)}
        >
          Scan with camera
        </button>
        <button
          type="button"
          aria-pressed={isManual}
          onClick={() => {
            setIsManual(true);
            handleReset();
          }}
          className={cn(modeButton(isManual), "-ml-0.5")}
        >
          Enter ticket ID
        </button>
      </div>

      <div className="mt-10">
        {error && (
          <ErrorState
            className="mb-8"
            title="Couldn’t check that ticket"
            message={`${error}. Try scanning again or enter the ticket ID.`}
          />
        )}

        {/* Result */}
        {validationStatus && (
          <div
            role={isValid ? "status" : "alert"}
            className={cn(
              "px-7 py-10 text-white sm:px-10",
              isValid ? "bg-success" : "bg-destructive",
            )}
          >
            <div className="flex size-14 items-center justify-center bg-white/15">
              {isValid ? (
                <Check className="size-8" strokeWidth={2.5} aria-hidden="true" />
              ) : (
                <X className="size-8" strokeWidth={2.5} aria-hidden="true" />
              )}
            </div>
            <h2 className="mt-6 text-5xl leading-none font-light tracking-[-0.02em]">
              {isValid ? "Let them in" : "Don’t admit"}
            </h2>
            <p className="mt-4 max-w-sm text-lg leading-snug text-white/90">
              {isValid
                ? "Valid ticket. It’s now marked as used."
                : "This ticket isn’t valid, or it has already been used."}
            </p>
            <Button
              onClick={handleReset}
              size="lg"
              className="mt-8 bg-white text-black hover:bg-white/90"
            >
              Check next guest
            </Button>
          </div>
        )}

        {/* Scanner or manual entry */}
        {!validationStatus &&
          (isManual ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleValidate(data, TicketValidationMethod.MANUAL);
              }}
              className="bg-card border-edge space-y-6 border p-6 shadow-sm"
            >
              <div className="space-y-2">
                <Label htmlFor="ticket-id">Ticket ID</Label>
                <Input
                  id="ticket-id"
                  placeholder="9388deb3-4b51-4835-b739-01999c2831f7"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                  className="text-sm"
                />
                <p className="text-muted-foreground text-sm">
                  You’ll find the ID at the bottom of the guest’s ticket.
                </p>
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={isValidating || !data.trim()}
                className="w-full"
              >
                {isValidating ? "Checking…" : "Check ticket"}
              </Button>
            </form>
          ) : (
            <div>
              <div className="bg-secondary border-edge mx-auto aspect-square w-full max-w-sm overflow-hidden border-2 shadow-md">
                <Scanner
                  onScan={(results) => {
                    if (results && results.length > 0 && results[0].rawValue) {
                      handleValidate(results[0].rawValue, TicketValidationMethod.QR_SCAN);
                    }
                  }}
                  onError={handleError}
                />
              </div>
              <p className="text-muted-foreground mt-5 text-center text-sm" aria-live="polite">
                {isValidating
                  ? "Checking ticket…"
                  : "Hold the guest’s QR code inside the frame. It checks automatically."}
              </p>
            </div>
          ))}
      </div>
    </DashboardShell>
  );
};

export default DashboardValidateQrPage;
