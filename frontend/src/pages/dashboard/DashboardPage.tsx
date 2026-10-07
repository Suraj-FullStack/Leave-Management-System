// Dashboard — role-differentiated stats with beautiful stat cards and progress bars.

import { useGetDashboardQuery } from "../../api/leaveApi";
import { useAuth } from "../../hooks/useAuth";
import LoadingSpinner from "../../components/LoadingSpinner";
import { EmployeeDashboard, ManagerDashboard, AdminDashboard, LeaveBalance } from "../../types";
import { Link } from "react-router-dom";

// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;      // Tailwind bg class for icon ring
  textColor: string;  // Tailwind text class for value
}

function StatCard({ label, value, icon, color, textColor }: StatCardProps) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
        <p className={`text-3xl font-bold mt-0.5 ${textColor}`}>{value}</p>
      </div>
    </div>
  );
}

// ─── Balance Card ─────────────────────────────────────────────────────────────
function BalanceCard({ balance }: { balance: LeaveBalance }) {
  const pct = balance.total_days > 0
    ? Math.round((balance.days_available / balance.total_days) * 100)
    : 0;

  const barColor =
    pct > 50 ? "bg-emerald-500" :
    pct > 25 ? "bg-amber-500" :
    "bg-red-500";

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-800 text-sm">{balance.leave_type_name}</h3>
        <span className="text-xs font-medium text-slate-500">{pct}% left</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-50 rounded-lg px-3 py-2">
          <p className="text-slate-500">Total</p>
          <p className="font-semibold text-slate-700 mt-0.5">{balance.total_days} days</p>
        </div>
        <div className="bg-slate-50 rounded-lg px-3 py-2">
          <p className="text-slate-500">Taken</p>
          <p className="font-semibold text-slate-700 mt-0.5">{balance.days_taken} days</p>
        </div>
        <div className="bg-amber-50 rounded-lg px-3 py-2">
          <p className="text-amber-600">Pending</p>
          <p className="font-semibold text-amber-700 mt-0.5">{balance.days_pending} days</p>
        </div>
        <div className="bg-emerald-50 rounded-lg px-3 py-2">
          <p className="text-emerald-600">Available</p>
          <p className="font-semibold text-emerald-700 mt-0.5">{balance.days_available} days</p>
        </div>
      </div>
    </div>
  );
}

// ─── Icons (inline SVG) ───────────────────────────────────────────────────────
const ClockIcon = ({ cls }: { cls: string }) => (
  <svg className={`w-6 h-6 ${cls}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const CheckCircleIcon = ({ cls }: { cls: string }) => (
  <svg className={`w-6 h-6 ${cls}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const XCircleIcon = ({ cls }: { cls: string }) => (
  <svg className={`w-6 h-6 ${cls}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const FileIcon = ({ cls }: { cls: string }) => (
  <svg className={`w-6 h-6 ${cls}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
const UsersIcon = ({ cls }: { cls: string }) => (
  <svg className={`w-6 h-6 ${cls}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const CalendarIcon = ({ cls }: { cls: string }) => (
  <svg className={`w-6 h-6 ${cls}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useGetDashboardQuery();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  if (isLoading) return <LoadingSpinner label="Loading dashboard…" />;
  if (!data) return (
    <div className="card p-12 text-center">
      <p className="text-slate-500">No dashboard data available.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {greeting()}, {user?.first_name || user?.username} 👋
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Here's what's happening with your leaves today.
          </p>
        </div>
        {user?.role === "employee" && (
          <Link to="/leaves/apply" className="btn-primary hidden sm:inline-flex">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Apply for Leave
          </Link>
        )}
      </div>

      {/* ── Employee Dashboard ── */}
      {user?.role === "employee" && (() => {
        const d = data as EmployeeDashboard;
        return (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Requests" value={d.total_requests}
                icon={<FileIcon cls="text-blue-600" />}
                color="bg-blue-50" textColor="text-blue-700" />
              <StatCard label="Pending" value={d.pending}
                icon={<ClockIcon cls="text-amber-600" />}
                color="bg-amber-50" textColor="text-amber-700" />
              <StatCard label="Approved" value={d.approved}
                icon={<CheckCircleIcon cls="text-emerald-600" />}
                color="bg-emerald-50" textColor="text-emerald-700" />
              <StatCard label="Rejected" value={d.rejected}
                icon={<XCircleIcon cls="text-red-600" />}
                color="bg-red-50" textColor="text-red-700" />
            </div>

            <div>
              <h3 className="section-title mb-3">Leave Balances</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {d.balances.map((b: LeaveBalance) => (
                  <BalanceCard key={b.id} balance={b} />
                ))}
              </div>
            </div>
          </>
        );
      })()}

      {/* ── Manager Dashboard ── */}
      {user?.role === "manager" && (() => {
        const d = data as ManagerDashboard;
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard label="Team Requests" value={d.team_total}
                icon={<UsersIcon cls="text-violet-600" />}
                color="bg-violet-50" textColor="text-violet-700" />
              <StatCard label="Pending Approvals" value={d.pending_approvals}
                icon={<ClockIcon cls="text-amber-600" />}
                color="bg-amber-50" textColor="text-amber-700" />
              <StatCard label="Approved This Month" value={d.approved_this_month}
                icon={<CheckCircleIcon cls="text-emerald-600" />}
                color="bg-emerald-50" textColor="text-emerald-700" />
            </div>

            {d.pending_approvals > 0 && (
              <div className="card p-5 flex items-center gap-4 bg-amber-50 border border-amber-200">
                <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <ClockIcon cls="text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-amber-800">
                    {d.pending_approvals} leave {d.pending_approvals === 1 ? "request requires" : "requests require"} your attention
                  </p>
                  <p className="text-sm text-amber-600 mt-0.5">Review them from the Leave Requests page.</p>
                </div>
                <Link to="/leaves" className="btn-secondary text-amber-700 border-amber-300 hover:bg-amber-100">
                  Review
                </Link>
              </div>
            )}
          </>
        );
      })()}

      {/* ── Admin Dashboard ── */}
      {user?.role === "admin" && (() => {
        const d = data as AdminDashboard;
        return (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard label="Total Requests" value={d.total_requests}
              icon={<FileIcon cls="text-blue-600" />}
              color="bg-blue-50" textColor="text-blue-700" />
            <StatCard label="Pending" value={d.pending}
              icon={<ClockIcon cls="text-amber-600" />}
              color="bg-amber-50" textColor="text-amber-700" />
            <StatCard label="Approved" value={d.approved}
              icon={<CheckCircleIcon cls="text-emerald-600" />}
              color="bg-emerald-50" textColor="text-emerald-700" />
            <StatCard label="Rejected" value={d.rejected}
              icon={<XCircleIcon cls="text-red-600" />}
              color="bg-red-50" textColor="text-red-700" />
            <StatCard label="On Leave Today" value={d.on_leave_today}
              icon={<CalendarIcon cls="text-indigo-600" />}
              color="bg-indigo-50" textColor="text-indigo-700" />
          </div>
        );
      })()}
    </div>
  );
}
