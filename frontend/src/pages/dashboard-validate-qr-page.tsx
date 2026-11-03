import NavBar from "@/components/nav-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import {
  TicketValidationMethod,
  TicketValidationStatus,
} from "@/domain/domain";
import { AlertCircle, Check, X, QrCode, Keyboard, RotateCcw, ArrowLeft, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { validateTicket } from "@/lib/api";
import { useAuth } from "react-oidc-context";
import { useNavigate } from "react-router";

const DashboardValidateQrPage: React.FC = () => {
  const { isLoading, user } = useAuth();
  const navigate = useNavigate();
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

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 flex flex-col selection:bg-purple-500 selection:text-white">
      <NavBar showBackHome={true} />

      <main className="container mx-auto px-4 py-10 flex-1 max-w-xl">
        <div className="mb-6 flex justify-between items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-slate-400 hover:text-white hover:bg-slate-900 cursor-pointer rounded-xl -ml-2 text-xs flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Events</span>
          </Button>

          <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Staff Mode Active</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold tracking-wider text-purple-400">
              Event Door Check-In
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Validate Attendee Pass
            </h1>
            <p className="text-xs text-slate-400">
              Scan attendee ticket QR code or manually verify their pass ID to grant or deny venue entry.
            </p>
          </div>

          {/* Mode Switch Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsManual(false);
                handleReset();
              }}
              className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer ${
                !isManual
                  ? "bg-purple-600 text-white shadow-md shadow-purple-900/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Camera Scanner</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsManual(true);
                handleReset();
              }}
              className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer ${
                isManual
                  ? "bg-purple-600 text-white shadow-md shadow-purple-900/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Keyboard className="w-4 h-4" />
              <span>Manual Entry</span>
            </button>
          </div>

          {error && (
            <Alert variant="destructive" className="bg-red-950/50 border-red-700 text-white rounded-2xl">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <AlertTitle className="text-sm font-bold">Validation Error</AlertTitle>
              <AlertDescription className="text-xs text-red-200 mt-1">{error}</AlertDescription>
            </Alert>
          )}

          {/* Result Banner */}
          {validationStatus && (
            <div
              className={`p-6 rounded-2xl border text-center space-y-2 animate-in fade-in duration-200 ${
                validationStatus === TicketValidationStatus.VALID
                  ? "bg-emerald-950/50 border-emerald-500/50 text-emerald-200"
                  : "bg-red-950/50 border-red-500/50 text-red-200"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center ${
                  validationStatus === TicketValidationStatus.VALID
                    ? "bg-emerald-500 text-slate-950"
                    : "bg-red-500 text-white"
                }`}
              >
                {validationStatus === TicketValidationStatus.VALID ? (
                  <Check className="w-8 h-8 stroke-[3]" />
                ) : (
                  <X className="w-8 h-8 stroke-[3]" />
                )}
              </div>
              <h2 className="text-xl font-black">
                {validationStatus === TicketValidationStatus.VALID
                  ? "Valid Ticket — Grant Entry"
                  : "Invalid / Previously Scanned Ticket"}
              </h2>
              <p className="text-xs opacity-90 max-w-sm mx-auto">
                {validationStatus === TicketValidationStatus.VALID
                  ? "The pass has been successfully recorded and marked as redeemed."
                  : "This pass is not valid or has already been used for entry."}
              </p>
              <div className="pt-2">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="sm"
                  className="bg-slate-900 border-slate-700 text-white rounded-xl text-xs cursor-pointer hover:bg-slate-800"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Scan Next Ticket
                </Button>
              </div>
            </div>
          )}

          {/* Scanner or Manual Form */}
          {!validationStatus && (
            <div>
              {isManual ? (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Ticket UUID / Pass ID
                    </label>
                    <Input
                      placeholder="e.g. 9388deb3-4b51-4835-b739-01999c2831f7"
                      value={data}
                      onChange={(e) => setData(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-white font-mono text-xs rounded-xl"
                    />
                  </div>
                  <Button
                    onClick={() => handleValidate(data, TicketValidationMethod.MANUAL)}
                    disabled={isValidating || !data.trim()}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl py-2.5 text-xs cursor-pointer shadow-lg"
                  >
                    {isValidating ? "Validating Pass..." : "Verify Ticket Now"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-full aspect-square max-w-xs mx-auto rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 relative">
                    <Scanner
                      onScan={(results) => {
                        if (results && results.length > 0 && results[0].rawValue) {
                          handleValidate(results[0].rawValue, TicketValidationMethod.QR_SCAN);
                        }
                      }}
                      onError={handleError}
                    />
                  </div>
                  <p className="text-center text-xs text-slate-500">
                    Align QR code inside camera view to validate automatically.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardValidateQrPage;
