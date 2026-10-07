// Apply for leave form — polished card layout with React Hook Form + Zod.

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useApplyLeaveMutation, useGetLeaveTypesQuery, useGetLeaveBalancesQuery } from "../../api/leaveApi";
import LoadingSpinner from "../../components/LoadingSpinner";

const schema = z
  .object({
    leave_type: z.string().min(1, "Select a leave type."),
    start_date: z.string().min(1, "Start date is required."),
    end_date: z.string().min(1, "End date is required."),
    reason: z.string().min(10, "Please provide at least 10 characters for the reason."),
  })
  .refine((d) => new Date(d.end_date) >= new Date(d.start_date), {
    message: "End date must be on or after start date.",
    path: ["end_date"],
  });

type FormValues = z.infer<typeof schema>;

export default function LeaveFormPage() {
  const navigate = useNavigate();
  const { data: leaveTypes, isLoading: typesLoading } = useGetLeaveTypesQuery();
  const { data: balances } = useGetLeaveBalancesQuery();
  const [applyLeave, { isLoading }] = useApplyLeaveMutation();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const selectedTypeId = watch("leave_type");
  const startDate = watch("start_date");
  const endDate = watch("end_date");

  // Calculate number of days for preview
  const numDaysPreview =
    startDate && endDate && new Date(endDate) >= new Date(startDate)
      ? Math.ceil(
          (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
        ) + 1
      : null;

  // Find balance for selected type
  const selectedBalance = balances?.find(
    (b) => String(b.leave_type) === selectedTypeId
  );

  async function onSubmit(data: FormValues) {
    try {
      await applyLeave({
        leave_type: parseInt(data.leave_type),
        start_date: data.start_date,
        end_date: data.end_date,
        reason: data.reason,
      }).unwrap();
      toast.success("Leave request submitted successfully!");
      navigate("/leaves");
    } catch (err: unknown) {
      const error = err as { data?: { detail?: { non_field_errors?: string[] } | string } };
      const detail = error?.data?.detail;
      const message =
        (typeof detail === "object" && detail?.non_field_errors?.[0]) ||
        (typeof detail === "string" ? detail : "Failed to submit request. Please try again.");
      toast.error(message);
    }
  }

  if (typesLoading) return <LoadingSpinner label="Loading leave types…" />;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/leaves"
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h2 className="page-title">Apply for Leave</h2>
          <p className="text-sm text-slate-500 mt-0.5">Fill in the form to submit a leave request</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main form */}
        <div className="lg:col-span-2 card p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Leave Type */}
            <div>
              <label className="label" htmlFor="leave_type">Leave Type</label>
              <select
                id="leave_type"
                {...register("leave_type")}
                className={`input-field mt-1 ${errors.leave_type ? "border-red-400" : ""}`}
              >
                <option value="">Select a leave type…</option>
                {leaveTypes?.map((lt) => (
                  <option key={lt.id} value={lt.id}>
                    {lt.name} — max {lt.max_days_per_year} days/year
                  </option>
                ))}
              </select>
              {errors.leave_type && <p className="error-text mt-1">{errors.leave_type.message}</p>}
            </div>

            {/* Date range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="start_date">Start Date</label>
                <input
                  id="start_date"
                  {...register("start_date")}
                  type="date"
                  className={`input-field mt-1 ${errors.start_date ? "border-red-400" : ""}`}
                />
                {errors.start_date && <p className="error-text mt-1">{errors.start_date.message}</p>}
              </div>
              <div>
                <label className="label" htmlFor="end_date">End Date</label>
                <input
                  id="end_date"
                  {...register("end_date")}
                  type="date"
                  className={`input-field mt-1 ${errors.end_date ? "border-red-400" : ""}`}
                />
                {errors.end_date && <p className="error-text mt-1">{errors.end_date.message}</p>}
              </div>
            </div>

            {/* Days preview */}
            {numDaysPreview !== null && (
              <div className="flex items-center gap-2 text-sm text-slate-600 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2.5">
                <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Duration: <span className="font-semibold text-blue-700">{numDaysPreview} day{numDaysPreview !== 1 ? "s" : ""}</span>
              </div>
            )}

            {/* Reason */}
            <div>
              <label className="label" htmlFor="reason">
                Reason
                <span className="text-slate-400 font-normal ml-1">(min. 10 characters)</span>
              </label>
              <textarea
                id="reason"
                {...register("reason")}
                rows={4}
                placeholder="Briefly explain the reason for your leave request…"
                className={`input-field mt-1 resize-none ${errors.reason ? "border-red-400" : ""}`}
              />
              {errors.reason && <p className="error-text mt-1">{errors.reason.message}</p>}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Submit Request
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate("/leaves")}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar — balance info */}
        <div className="space-y-4">
          {selectedBalance ? (
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Selected Leave Balance</h3>
              <div className="space-y-2 text-sm">
                {[
                  { label: "Total", value: selectedBalance.total_days, cls: "text-slate-700" },
                  { label: "Taken", value: selectedBalance.days_taken, cls: "text-slate-700" },
                  { label: "Pending", value: selectedBalance.days_pending, cls: "text-amber-600" },
                  { label: "Available", value: selectedBalance.days_available, cls: "text-emerald-600 font-semibold" },
                ].map(({ label, value, cls }) => (
                  <div key={label} className="flex justify-between items-center py-1.5 border-b border-slate-50">
                    <span className="text-slate-500">{label}</span>
                    <span className={cls}>{value} days</span>
                  </div>
                ))}
              </div>
              {numDaysPreview !== null && numDaysPreview > selectedBalance.days_available && (
                <div className="mt-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  ⚠️ Requested days exceed your available balance.
                </div>
              )}
            </div>
          ) : (
            <div className="card p-4 text-sm text-slate-400 text-center">
              <svg className="w-8 h-8 mx-auto mb-2 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Select a leave type to see your balance.
            </div>
          )}

          {/* Tips */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Tips</h3>
            <ul className="text-xs text-slate-500 space-y-1.5 list-disc list-inside">
              <li>Apply at least 2 days in advance.</li>
              <li>Add a clear reason for faster approval.</li>
              <li>Dates include both start and end date.</li>
              <li>Your manager will be notified automatically.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
