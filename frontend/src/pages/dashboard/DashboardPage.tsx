// Dashboard — shows different stats depending on the user's role.

import { useGetDashboardQuery } from "../../api/leaveApi";
import { useAuth } from "../../hooks/useAuth";
import LoadingSpinner from "../../components/LoadingSpinner";
import { EmployeeDashboard, ManagerDashboard, AdminDashboard, LeaveBalance } from "../../types";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded shadow p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useGetDashboardQuery();

  if (isLoading) return <LoadingSpinner />;
  if (!data) return <p className="text-gray-500">No data available.</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Welcome, {user?.first_name}
      </h2>

      {user?.role === "employee" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Requests" value={(data as EmployeeDashboard).total_requests} />
            <StatCard label="Pending" value={(data as EmployeeDashboard).pending} />
            <StatCard label="Approved" value={(data as EmployeeDashboard).approved} />
            <StatCard label="Rejected" value={(data as EmployeeDashboard).rejected} />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-3">Leave Balances</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(data as EmployeeDashboard).balances.map((b: LeaveBalance) => (
              <div key={b.id} className="bg-white rounded shadow p-4">
                <p className="font-medium text-gray-800">{b.leave_type_name}</p>
                <div className="mt-2 text-sm text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Total</span>
                    <span>{b.total_days} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taken</span>
                    <span>{b.days_taken} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending</span>
                    <span>{b.days_pending} days</span>
                  </div>
                  <div className="flex justify-between font-semibold text-green-700">
                    <span>Available</span>
                    <span>{b.days_available} days</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {user?.role === "manager" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Team Requests" value={(data as ManagerDashboard).team_total} />
          <StatCard label="Pending Approvals" value={(data as ManagerDashboard).pending_approvals} />
          <StatCard label="Approved This Month" value={(data as ManagerDashboard).approved_this_month} />
        </div>
      )}

      {user?.role === "admin" && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Total Requests" value={(data as AdminDashboard).total_requests} />
          <StatCard label="Pending" value={(data as AdminDashboard).pending} />
          <StatCard label="Approved" value={(data as AdminDashboard).approved} />
          <StatCard label="Rejected" value={(data as AdminDashboard).rejected} />
          <StatCard label="On Leave Today" value={(data as AdminDashboard).on_leave_today} />
        </div>
      )}
    </div>
  );
}
