// Colour-coded pill badge for leave request statuses and user active state.

import { LeaveStatus } from "../types";

const statusConfig: Record<
  LeaveStatus,
  { bg: string; text: string; dot: string; label: string }
> = {
  pending: {
    bg: "bg-amber-50 border border-amber-200",
    text: "text-amber-700",
    dot: "bg-amber-400",
    label: "Pending",
  },
  approved: {
    bg: "bg-emerald-50 border border-emerald-200",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    label: "Approved",
  },
  rejected: {
    bg: "bg-red-50 border border-red-200",
    text: "text-red-700",
    dot: "bg-red-500",
    label: "Rejected",
  },
  cancelled: {
    bg: "bg-slate-100 border border-slate-200",
    text: "text-slate-600",
    dot: "bg-slate-400",
    label: "Cancelled",
  },
};

interface Props {
  status: LeaveStatus;
}

export default function StatusBadge({ status }: Props) {
  const cfg = statusConfig[status] ?? statusConfig.cancelled;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
