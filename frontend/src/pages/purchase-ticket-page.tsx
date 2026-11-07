import { useDocumentTitle } from "@/hooks/use-document-title";
import { Button } from "@/components/ui/button";
import { confirmPayment, createPaymentIntent } from "@/lib/api";
import { CreatePaymentIntentResponse } from "@/domain/domain";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "react-oidc-context";
import { useNavigate, useParams } from "react-router";
import PageShell from "@/components/page-shell";
import PageHeader from "@/components/page-header";
import { ErrorState, LoadingState } from "@/components/state-views";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

interface CheckoutFormProps {
  intentData: CreatePaymentIntentResponse;
  accessToken: string;
  onSuccess: () => void;
}

const StripeCheckoutForm: React.FC<CheckoutFormProps> = ({
  intentData,
  accessToken,
  onSuccess,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(undefined);

      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || "Please check your payment details.");
        setIsSubmitting(false);
        return;
      }

      const { error: confirmError, paymentIntent } =
        await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: window.location.href,
          },
          redirect: "if_required",
        });

      if (confirmError) {
        setError(confirmError.message || "Payment confirmation failed.");
        setIsSubmitting(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        await confirmPayment(accessToken, paymentIntent.id);
        onSuccess();
      } else {
        setError(
          `Payment not completed. Current status: ${paymentIntent?.status || "unknown"}`
        );
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === "string") {
        setError(err);
      } else {
        setError("An error occurred while confirming your payment.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedAmount = (intentData.amount / 100).toFixed(2);

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card border-edge mb-16 border p-6 shadow-md sm:p-8"
      noValidate
    >
      {/* Order Summary banner */}
      <div className="mb-6 rounded-lg border border-purple-500/20 bg-purple-950/20 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold tracking-wider text-purple-400 uppercase">
              Order Summary
            </p>
            <p className="mt-1 text-lg font-medium text-foreground">
              {intentData.ticketTypeName}
            </p>
            {intentData.eventName && (
              <p className="text-muted-foreground text-sm">
                {intentData.eventName}
              </p>
            )}
          </div>
          <div className="text-right">
            <span className="text-xs text-muted-foreground">Total</span>
            <p className="text-2xl font-light tabular-nums text-foreground">
              ${formattedAmount}{" "}
              <span className="text-xs font-normal text-muted-foreground uppercase">
                {intentData.currency}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Stripe Test Mode Notice */}
      <div className="mb-6 flex items-start gap-3 rounded-md border border-amber-500/30 bg-amber-950/20 p-3 text-xs text-amber-300">
        <span className="font-semibold uppercase tracking-wider">
          Test Mode:
        </span>
        <span>
          Use Stripe test card <code className="rounded bg-black/40 px-1 py-0.5 font-mono text-amber-200">4242 4242 4242 4242</code>, any future date, and any 3-digit CVC.
        </span>
      </div>

      {error && (
        <ErrorState
          className="mb-6"
          title="Payment didn’t go through"
          message={`${error}. Check the details and try again.`}
        />
      )}

      {/* Embedded Stripe Payment Element */}
      <div className="mb-6">
        <PaymentElement
          id="payment-element"
          options={{
            layout: {
              type: "tabs",
              defaultCollapsed: false,
            },
          }}
        />
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={!stripe || !elements || isSubmitting}
        className="mt-6 w-full"
      >
        {isSubmitting ? "Processing Payment…" : `Pay $${formattedAmount} & Get Ticket`}
      </Button>

      <p className="text-muted-foreground mt-4 text-center text-xs">
        Secured by Stripe in test mode. Your QR ticket is issued immediately upon successful payment.
      </p>
    </form>
  );
};

const PurchaseTicketPage: React.FC = () => {
  useDocumentTitle("Checkout | Eventra");
  const { eventId, ticketTypeId } = useParams();
  const { isLoading, user } = useAuth();
  const navigate = useNavigate();

  const [intentData, setIntentData] = useState<CreatePaymentIntentResponse | null>(null);
  const [initError, setInitError] = useState<string | undefined>();
  const [isInitializing, setIsInitializing] = useState(true);
  const [isPurchaseSuccess, setIsPurchaseASuccess] = useState(false);

  // Initialize PaymentIntent on mount
  useEffect(() => {
    let isMounted = true;

    const initPayment = async () => {
      if (isLoading) return;
      if (!user?.access_token) {
        setInitError("Please log in to purchase tickets.");
        setIsInitializing(false);
        return;
      }
      if (!ticketTypeId) {
        setInitError("Invalid ticket selection.");
        setIsInitializing(false);
        return;
      }

      // Check if returning from a 3D Secure / external redirect
      const urlParams = new URLSearchParams(window.location.search);
      const redirectPaymentIntentId = urlParams.get("payment_intent");
      const redirectStatus = urlParams.get("redirect_status");

      if (redirectPaymentIntentId && redirectStatus === "succeeded") {
        try {
          await confirmPayment(user.access_token, redirectPaymentIntentId);
          if (isMounted) {
            setIsPurchaseASuccess(true);
            setIsInitializing(false);
          }
          return;
        } catch (err) {
          console.error("Failed to confirm redirect payment", err);
        }
      }

      try {
        setIsInitializing(true);
        setInitError(undefined);
        const data = await createPaymentIntent(user.access_token, ticketTypeId);
        if (isMounted) {
          setIntentData(data);
        }
      } catch (err) {
        if (isMounted) {
          if (err instanceof Error) {
            setInitError(err.message);
          } else {
            setInitError("Failed to initiate payment session.");
          }
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    initPayment();

    return () => {
      isMounted = false;
    };
  }, [isLoading, user?.access_token, ticketTypeId]);

  // Load Stripe instance when publishableKey is available
  const stripePromise = useMemo<Promise<Stripe | null> | null>(() => {
    if (!intentData?.publishableKey) return null;
    return loadStripe(intentData.publishableKey);
  }, [intentData?.publishableKey]);

  // Handle post-purchase redirect
  useEffect(() => {
    if (!isPurchaseSuccess) {
      return;
    }
    const timer = setTimeout(() => {
      navigate("/dashboard/tickets");
    }, 2500);

    return () => clearTimeout(timer);
  }, [isPurchaseSuccess, navigate]);

  if (isPurchaseSuccess) {
    return (
      <PageShell width="narrow">
        <div role="status" className="py-24 sm:py-32">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-950/30 px-3 py-1 text-sm text-green-400">
            <span>✓ Payment Successful</span>
          </div>
          <h1 className="text-5xl leading-[1] font-light tracking-[-0.02em] sm:text-6xl">
            Your ticket is ready.
          </h1>
          <p className="text-muted-foreground mt-6 max-w-md text-lg leading-relaxed">
            Your QR code has been generated and saved under My tickets. Show it to staff at the entrance. We’re taking you there now.
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
        description="Complete your ticket purchase with Stripe test payment."
      />

      {isInitializing && (
        <div className="bg-card border-edge mb-16 border p-12 text-center shadow-md">
          <LoadingState label="Preparing secure checkout session…" />
        </div>
      )}

      {!isInitializing && initError && (
        <div className="bg-card border-edge mb-16 border p-6 shadow-md sm:p-8">
          <ErrorState
            className="mb-6"
            title="Unable to start checkout"
            message={initError}
          />
          <Button onClick={() => navigate(eventId ? `/events/${eventId}` : "/")}>
            Return to Event
          </Button>
        </div>
      )}

      {!isInitializing && intentData && stripePromise && user?.access_token && (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret: intentData.clientSecret,
            appearance: {
              theme: "night",
              variables: {
                colorPrimary: "#a855f7",
                colorBackground: "#0b0f19",
                colorText: "#f9fafb",
                colorDanger: "#ef4444",
                fontFamily: "Inter, system-ui, sans-serif",
                borderRadius: "6px",
              },
            },
          }}
        >
          <StripeCheckoutForm
            intentData={intentData}
            accessToken={user.access_token}
            onSuccess={() => setIsPurchaseASuccess(true)}
          />
        </Elements>
      )}
    </PageShell>
  );
};

export default PurchaseTicketPage;
