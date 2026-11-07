import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { useAuth } from "react-oidc-context";
import { useDocumentTitle } from "@/hooks/use-document-title";
import DashboardShell from "@/components/dashboard-shell";
import PageHeader from "@/components/page-header";
import { ErrorState, LoadingState } from "@/components/state-views";
import { Button } from "@/components/ui/button";
import { getEventAnalytics } from "@/lib/api";
import { EventAnalytics } from "@/domain/domain";
import { ArrowLeft, TrendingUp, Users, DollarSign, Ticket, CheckCircle2 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

// ─── Stat Card ───────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  sub?: string;
}
const StatCard: React.FC<StatCardProps> = ({ label, value, icon, sub }) => (
  <div className="bg-card border border-edge shadow-md rounded-xl p-5 flex flex-col gap-2">
    <div className="flex items-center justify-between text-muted-foreground">
      <span className="text-sm font-medium">{label}</span>
      <span className="opacity-60">{icon}</span>
    </div>
    <p className="text-3xl font-bold text-foreground">{value}</p>
    {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
  </div>
);

// ─── Tooltip formatters ───────────────────────────────────────────────────────
const formatCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

// ─── Page ─────────────────────────────────────────────────────────────────────
const DashboardEventAnalyticsPage: React.FC = () => {
  useDocumentTitle("Event Analytics | Eventra");
  const { id: eventId } = useParams<{ id: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const [analytics, setAnalytics] = useState<EventAnalytics | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user?.access_token || !eventId) return;
    setLoading(true);
    getEventAnalytics(user.access_token, eventId)
      .then(setAnalytics)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [authLoading, user, eventId]);

  if (loading || authLoading) {
    return (
      <DashboardShell>
        <div className="py-20">
          <LoadingState label="Loading analytics…" />
        </div>
      </DashboardShell>
    );
  }

  if (error || !analytics) {
    return (
      <DashboardShell>
        <div className="py-20">
          <ErrorState
            title="Analytics unavailable"
            message={error ?? "Could not load analytics for this event."}
          />
        </div>
      </DashboardShell>
    );
  }

  // Limit daily sales to last 30 entries for readability
  const dailyData = analytics.dailySales.slice(-30);

  return (
    <DashboardShell>
      {/* Back + Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button asChild size="sm" variant="ghost">
          <Link to="/dashboard/events">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to events
          </Link>
        </Button>
      </div>

      <PageHeader
        title={analytics.eventName}
        description={`Analytics · ${analytics.eventVenue}`}
      />

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
        <StatCard
          label="Tickets Sold"
          value={analytics.totalTicketsSold.toLocaleString()}
          icon={<Ticket className="w-5 h-5" />}
          sub={`of ${analytics.totalCapacity.toLocaleString()} available`}
        />
        <StatCard
          label="Total Revenue"
          value={formatCurrency(analytics.totalRevenue)}
          icon={<DollarSign className="w-5 h-5" />}
        />
        <StatCard
          label="Occupancy Rate"
          value={`${analytics.occupancyRate.toFixed(1)}%`}
          icon={<TrendingUp className="w-5 h-5" />}
          sub="of capacity filled"
        />
        <StatCard
          label="Total Checked In"
          value={analytics.totalCheckedIn.toLocaleString()}
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          label="Check-in Rate"
          value={`${analytics.checkInRate.toFixed(1)}%`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          sub="of sold tickets"
        />
      </div>

      {/* ── Daily Sales Chart ── */}
      <section className="mt-8 bg-card border border-edge shadow-md rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4 text-foreground">
          Daily Ticket Sales &amp; Revenue
          <span className="ml-2 text-xs font-normal text-muted-foreground">(last 30 days)</span>
        </h2>
        {dailyData.length === 0 ? (
          <p className="text-muted-foreground text-sm py-6 text-center">No sales data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={dailyData} margin={{ top: 4, right: 24, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickFormatter={(v: string) => {
                  const d = new Date(v);
                  return `${d.getMonth() + 1}/${d.getDate()}`;
                }}
              />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#9ca3af" }} allowDecimals={false} />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickFormatter={(v: number) => `$${v}`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e1e2e", border: "1px solid #374151", borderRadius: 8 }}
                labelStyle={{ color: "#e5e7eb" }}
                formatter={(value: any, name: any) =>
                  name === "revenue" ? [formatCurrency(Number(value) || 0), "Revenue"] : [value, "Tickets Sold"]
                }
              />
              <Legend wrapperStyle={{ fontSize: 12, color: "#9ca3af" }} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="ticketsSold"
                stroke="#a855f7"
                strokeWidth={2}
                dot={false}
                name="Tickets Sold"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </section>

      {/* ── Hourly Check-In Chart ── */}
      <section className="mt-6 bg-card border border-edge shadow-md rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4 text-foreground">Hourly Check-In Distribution</h2>
        {analytics.hourlyCheckIns.length === 0 ? (
          <p className="text-muted-foreground text-sm py-6 text-center">No check-in data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={analytics.hourlyCheckIns} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e1e2e", border: "1px solid #374151", borderRadius: 8 }}
                labelStyle={{ color: "#e5e7eb" }}
                formatter={(value: any) => [value, "Check-ins"]}
              />
              <Bar dataKey="checkIns" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Check-ins" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>

      {/* ── Ticket Type Breakdown ── */}
      <section className="mt-6 bg-card border border-edge shadow-md rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4 text-foreground">Ticket Type Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-edge text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">Type</th>
                <th className="pb-3 pr-4 font-medium text-right">Price</th>
                <th className="pb-3 pr-4 font-medium text-right">Available</th>
                <th className="pb-3 pr-4 font-medium text-right">Sold</th>
                <th className="pb-3 pr-4 font-medium">Fill Rate</th>
                <th className="pb-3 pr-4 font-medium text-right">Revenue</th>
                <th className="pb-3 font-medium text-right">Checked In</th>
              </tr>
            </thead>
            <tbody>
              {analytics.ticketTypeBreakdown.map((tt) => (
                <tr key={tt.ticketTypeId} className="border-b border-edge/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 pr-4 font-medium text-foreground">{tt.name}</td>
                  <td className="py-3 pr-4 text-right tabular-nums">{formatCurrency(tt.price)}</td>
                  <td className="py-3 pr-4 text-right tabular-nums">{tt.totalAvailable ?? "∞"}</td>
                  <td className="py-3 pr-4 text-right tabular-nums">{tt.sold}</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2 min-w-[60px]">
                        <div
                          className="bg-purple-500 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(tt.fillRate, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">
                        {tt.fillRate.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-right tabular-nums">{formatCurrency(tt.revenue)}</td>
                  <td className="py-3 text-right tabular-nums">{tt.checkedIn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardShell>
  );
};

export default DashboardEventAnalyticsPage;
