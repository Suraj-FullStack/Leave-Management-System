// Leave request detail page — full info card + approve/reject/cancel actions.

import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  useGetLeaveRequestQuery,
  useApproveLeaveMutation,
  useRejectLeaveMutation,
  useCancelLeaveMutation,
} from "../../api/leaveApi";
import { useAuth } from "../../hooks/useAuth";
import LoadingSpinner from "../../components/LoadingSpinner";
import StatusBadge from "../../components/StatusBadge";
import { LeaveStatus } from "../../types";

// ─── Row component ────────────────────────────────────────────────────────────
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 border-b border-slate-100 last:border-0">
      <span className="sm:w-40 text-xs font-medium uppercase tracking-wide text-slate-400 flex-shrink-0 pt-0.5">
        {label}
      </span>
      <div className="text-sm text-slate-800">{children}</div>
    </div>
  );
}

export default function LeaveDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isManagerOrAdmin, user } = useAuth();
  const [comment, setComment] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const { data: req, isLoading } = useGetLeaveRequestQuery(id!);
  const [approve, { isLoading: approving }] = useApproveLeaveMutation();
  const [reject, { isLoading: rejecting }] = useRejectLeaveMutation();
  const [cancel, { isLoading: cancelling }] = useCancelLeaveMutation();

  if (isLoading) return <LoadingSpinner label="Loading request details…" />;
  if (!req) return (
    <div className="card p-12 text-center">
      <p className="text-slate-500">Leave request not found.</p>
      <Link to="/leaves" className="btn-secondary mt-4 inline-flex">Back to list</Link>
    </div>
  );

  async function handleApprove() {
    try {
      await approve({ id: req!.id, comment }).unwrap();
      toast.success("Leave approved successfully.");
      navigate("/leaves");
    } catch (err: unknown) {
      const error = err as { data?: { detail?: string } };
      toast.error(error?.data?.detail || "Failed to approve.");
    }
  }

  async function handleReject() {
    if (!comment.trim()) {
      toast.error("Please enter a reason for rejection.");
      return;
    }
    try {
      await reject({ id: req!.id, comment }).unwrap();
      toast.success("Leave rejected.");
      navigate("/leaves");
    } catch (err: unknown) {
      const error = err as { data?: { detail?: string } };
      toast.error(error?.data?.detail || "Failed to reject.");
    }
  }

  async function handleCancel() {
    try {
      await cancel(req!.id).unwrap();
      toast.success("Leave request cancelled.");
      navigate("/leaves");
    } catch (err: unknown) {
      const error = err as { data?: { detail?: string } };
      toast.error(error?.data?.detail || "Failed to cancel.");
    }
  }

  const isOwner = user?.id === req.employee;
  const canCancel = isOwner && (req.status === "pending" || req.status === "approved");
  const canReview = isManagerOrAdmin && req.status === "pending";

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
        <div className="flex-1">
          <h2 className="page-title">Leave Request Details</h2>
        </div>
        <StatusBadge status={req.status as LeaveStatus} />
      </div>

      {/* Details card */}
      <div className="card p-6">
        <Row label="Employee">{req.employee_name}</Row>
        <Row label="Leave Type">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
            {req.leave_type_name}
          </span>
        </Row>
        <Row label="Start Date">{req.start_date}</Row>
        <Row label="End Date">{req.end_date}</Row>
        <Row label="Duration">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold">
            {req.num_days}
          </span>
          <span className="ml-2 text-slate-500">day{req.num_days !== 1 ? "s" : ""}</span>
        </Row>
        <Row label="Reason">{req.reason}</Row>
        <Row label="Applied On">
          {new Date(req.applied_on).toLocaleString("en-GB", {
            day: "2-digit", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
          })}
        </Row>

        {/* Review info — only if reviewed */}
        {req.reviewed_by_name && (
          <>
            <Row label="Reviewed By">{req.reviewed_by_name}</Row>
            <Row label="Reviewed On">
              {req.reviewed_on &&
                new Date(req.reviewed_on).toLocaleString("en-GB", {
                  day: "2-digit", month: "short", year: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
            </Row>
            {req.manager_comment && (
              <Row label="Manager Comment">
                <span className="italic text-slate-600">"{req.manager_comment}"</span>
              </Row>
            )}
          </>
        )}
      </div>

      {/* Reviewer action panel */}
      {canReview && (
        <div className="card p-6 border-l-4 border-blue-500">
          <h3 className="section-title mb-4">Review This Request</h3>
          <div className="space-y-4">
            <div>
              <label className="label" htmlFor="comment">
                Comment
                <span className="text-slate-400 font-normal ml-1">(required for rejection)</span>
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Add a note for the employee…"
                className="input-field mt-1 resize-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleApprove}
                disabled={approving || rejecting}
                className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {approving ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {approving ? "Approving…" : "Approve"}
              </button>
              <button
                onClick={handleReject}
                disabled={approving || rejecting}
                className="inline-flex items-center gap-2 px-5 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {rejecting ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                {rejecting ? "Rejecting…" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel panel */}
      {canCancel && (
        <div className="card p-6">
          <h3 className="section-title mb-1">Cancel Request</h3>
          <p className="text-sm text-slate-500 mb-4">
            This will cancel your leave request. This action cannot be undone.
          </p>
          {!showCancelConfirm ? (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="btn-secondary text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
            >
              Cancel This Request
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {cancelling ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : null}
                {cancelling ? "Cancelling…" : "Yes, Cancel It"}
              </button>
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="btn-secondary"
              >
                Keep Request
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
