// Leave list page — filterable, paginated table of leave requests.
// Employees see their own; managers see their team; admins see everything.

import { useState } from "react";
import { Link } from "react-router-dom";
import { useGetLeaveRequestsQuery, useGetLeaveTypesQuery } from "../../api/leaveApi";
import { useAuth } from "../../hooks/useAuth";
import LoadingSpinner from "../../components/LoadingSpinner";
import StatusBadge from "../../components/StatusBadge";
import Pagination from "../../components/Pagination";
import { LeaveStatus } from "../../types";

const PAGE_SIZE = 10;

export default function LeaveListPage() {
  const { isEmployee } = useAuth();
  const { data: leaveTypes } = useGetLeaveTypesQuery();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [ordering, setOrdering] = useState("-applied_on");

  const { data, isLoading } = useGetLeaveRequestsQuery({
    page,
    search,
    status: status || undefined,
    leave_type: leaveType ? parseInt(leaveType) : undefined,
    ordering,
  });

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    setPage(1);
  }

  function resetFilters() {
    setSearch("");
    setStatus("");
    setLeaveType("");
    setOrdering("-applied_on");
    setPage(1);
  }

  const hasFilters = search || status || leaveType || ordering !== "-applied_on";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Leave Requests</h2>
          {data && (
            <p className="text-sm text-slate-500 mt-0.5">
              {data.count} {data.count === 1 ? "request" : "requests"} found
            </p>
          )}
        </div>
        {isEmployee && (
          <Link to="/leaves/apply" className="btn-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Apply for Leave
          </Link>
        )}
      </div>

      {/* Filter bar */}
      <div className="card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search name or reason…"
              value={search}
              onChange={handleSearch}
              className="input-field pl-9"
            />
          </div>

          {/* Status filter */}
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="input-field"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Leave type filter */}
          <select
            value={leaveType}
            onChange={(e) => { setLeaveType(e.target.value); setPage(1); }}
            className="input-field"
          >
            <option value="">All Leave Types</option>
            {leaveTypes?.map((lt) => (
              <option key={lt.id} value={lt.id}>{lt.name}</option>
            ))}
          </select>

          {/* Ordering */}
          <div className="flex gap-2">
            <select
              value={ordering}
              onChange={(e) => setOrdering(e.target.value)}
              className="input-field flex-1"
            >
              <option value="-applied_on">Newest First</option>
              <option value="applied_on">Oldest First</option>
              <option value="start_date">Start Date ↑</option>
              <option value="-start_date">Start Date ↓</option>
            </select>
            {hasFilters && (
              <button
                onClick={resetFilters}
                title="Clear filters"
                className="btn-secondary px-2.5 text-slate-500 hover:text-red-600"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingSpinner label="Loading requests…" />
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="table-th">Employee</th>
                    <th className="table-th">Leave Type</th>
                    <th className="table-th">Duration</th>
                    <th className="table-th text-center">Days</th>
                    <th className="table-th">Status</th>
                    <th className="table-th">Applied On</th>
                    <th className="table-th text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(!data?.results || data.results.length === 0) && (
                    <tr>
                      <td colSpan={7} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-slate-500 text-sm font-medium">No leave requests found</p>
                          {hasFilters && (
                            <button onClick={resetFilters} className="text-xs text-blue-600 hover:underline">
                              Clear filters
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                  {data?.results.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                      <td className="table-td font-medium text-slate-800">{req.employee_name}</td>
                      <td className="table-td">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                          {req.leave_type_name}
                        </span>
                      </td>
                      <td className="table-td whitespace-nowrap">
                        <span className="text-slate-700">{req.start_date}</span>
                        <span className="text-slate-400 mx-1">→</span>
                        <span className="text-slate-700">{req.end_date}</span>
                      </td>
                      <td className="table-td text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                          {req.num_days}
                        </span>
                      </td>
                      <td className="table-td">
                        <StatusBadge status={req.status as LeaveStatus} />
                      </td>
                      <td className="table-td text-slate-500">
                        {new Date(req.applied_on).toLocaleDateString("en-GB", {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                      </td>
                      <td className="table-td text-right">
                        <Link
                          to={`/leaves/${req.id}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          View
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <Pagination
            count={data?.count ?? 0}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
