import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { purchaseTicket } from "@/lib/api";
import { CheckCircle, CreditCard, ArrowLeft, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { useNavigate, useParams } from "react-router";
import NavBar from "@/components/nav-bar";

const PurchaseTicketPage: React.FC = () => {
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
      <div className="bg-slate-950 min-h-screen text-white flex flex-col">
        <NavBar showBackHome={true} />
        <div className="container mx-auto px-4 py-16 flex-1 flex items-center justify-center">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-black text-white">Purchase Confirmed!</h2>
            <p className="text-sm text-slate-300">
              Your ticket order has been processed successfully. Your scannable digital QR pass is now ready in your dashboard.
            </p>
            <div className="pt-4 flex flex-col gap-2">
              <Button
                onClick={() => navigate("/dashboard/tickets")}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white rounded-xl py-2.5 font-bold cursor-pointer"
              >
                View My Tickets
              </Button>
              <Button
                onClick={() => navigate("/")}
                variant="ghost"
                className="w-full text-slate-400 hover:text-white rounded-xl py-2 text-xs cursor-pointer"
              >
                Back to Events
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 flex flex-col">
      <NavBar showBackHome={true} />

      <main className="container mx-auto px-4 py-12 flex-1 max-w-lg">
        {/* Back Link */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(eventId ? `/events/${eventId}` : "/")}
            className="text-slate-400 hover:text-white hover:bg-slate-900 cursor-pointer rounded-xl -ml-2 text-xs flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Event Details</span>
          </Button>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold tracking-wider text-purple-400">
              Secure Checkout
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight">Complete Your Order</h1>
            <p className="text-xs text-slate-400">
              Simulated payment gateway for local testing. No actual charges will be made.
            </p>
          </div>

          {error && (
            <div className="border border-red-800/80 rounded-xl p-3 bg-red-950/40 text-red-300 text-xs font-medium">
              <strong>Error:</strong> {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Card Number */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300">Card Number</Label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="4532 8920 1234 5678"
                  defaultValue="4532 8920 1234 5678"
                  maxLength={19}
                  className="bg-slate-950 border-slate-800 text-white pl-10 rounded-xl text-sm"
                />
                <CreditCard className="absolute h-4 w-4 text-slate-500 top-3 left-3" />
              </div>
            </div>

            {/* Cardholder */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300">Cardholder Name</Label>
              <Input
                type="text"
                placeholder="Alex Morgan"
                defaultValue={user?.profile?.name || "Eventra Attendee"}
                className="bg-slate-950 border-slate-800 text-white rounded-xl text-sm"
              />
            </div>

            {/* Expiry & CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-300">Expiry (MM/YY)</Label>
                <Input
                  type="text"
                  placeholder="12/28"
                  defaultValue="12/28"
                  maxLength={5}
                  className="bg-slate-950 border-slate-800 text-white rounded-xl text-sm text-center"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-300">CVV</Label>
                <Input
                  type="password"
                  placeholder="888"
                  defaultValue="888"
                  maxLength={4}
                  className="bg-slate-950 border-slate-800 text-white rounded-xl text-sm text-center"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button
              onClick={handlePurchase}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 text-sm rounded-xl cursor-pointer shadow-lg shadow-purple-900/40 transition"
            >
              {isSubmitting ? "Processing Ticket..." : "Confirm & Pay Now"}
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 border-t border-slate-800/80 pt-4">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Guaranteed authentic ticket token issued instantly</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PurchaseTicketPage;
