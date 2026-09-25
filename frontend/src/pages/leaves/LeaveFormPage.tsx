// Apply for leave form — React Hook Form + Zod validation.
// Lets an employee pick a leave type, date range, and reason.

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useApplyLeaveMutation, useGetLeaveTypesQuery } from "../../api/leaveApi";

const schema = z
  .object({
    leave_type: z.string().min(1, "Select a leave type."),
    start_date: z.string().min(1, "Start date is required."),
    end_date: z.string().min(1, "End date is required."),
    reason: z.string().min(10, "Reason must be at least 10 characters."),
  })
  .refine((d) => new Date(d.end_date) >= new Date(d.start_date), {
    message: "End date must be on or after start date.",
    path: ["end_date"],
  });

type FormValues = z.infer<typeof schema>;

export default function LeaveFormPage() {
  const navigate = useNavigate();
  const { data: leaveTypes, isLoading: typesLoading } = useGetLeaveTypesQuery();
  const [applyLeave, { isLoading }] = useApplyLeaveMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormValues) {
    try {
      await applyLeave({
        leave_type: parseInt(data.leave_type),
        start_date: data.start_date,
        end_date: data.end_date,
        reason: data.reason,
      }).unwrap();
      toast.success("Leave request submitted.");
      navigate("/leaves");
    } catch (err: unknown) {
      const error = err as { data?: { detail?: { non_field_errors?: string[] } | string } };
      const detail = error?.data?.detail;
      const message =
        (typeof detail === "object" && detail?.non_field_errors?.[0]) ||
        (typeof detail === "string" ? detail : "Failed to submit request.");
      toast.error(message);
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Apply for Leave</h2>
      <div className="bg-white rounded shadow p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
            <select
              {...register("leave_type")}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select type...</option>
              {leaveTypes?.map((lt) => (
                <option key={lt.id} value={lt.id}>
                  {lt.name} (max {lt.max_days_per_year} days/year)
                </option>
              ))}
            </select>
            {errors.leave_type && (
              <p className="text-red-500 text-xs mt-1">{errors.leave_type.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                {...register("start_date")}
                type="date"
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.start_date && (
                <p className="text-red-500 text-xs mt-1">{errors.start_date.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                {...register("end_date")}
                type="date"
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.end_date && (
                <p className="text-red-500 text-xs mt-1">{errors.end_date.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <textarea
              {...register("reason")}
              rows={4}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Briefly explain why you need leave..."
            />
            {errors.reason && (
              <p className="text-red-500 text-xs mt-1">{errors.reason.message}</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isLoading || typesLoading}
              className="bg-blue-600 text-white px-6 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? "Submitting..." : "Submit Request"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/leaves")}
              className="bg-gray-100 text-gray-700 px-6 py-2 rounded text-sm font-medium hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
