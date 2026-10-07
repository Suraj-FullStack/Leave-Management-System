// Notifications page — feed layout with unread indicators and mark-as-read actions.

import {
  useGetNotificationsQuery,
  useMarkReadMutation,
  useMarkAllReadMutation,
} from "../../api/notificationApi";
import LoadingSpinner from "../../components/LoadingSpinner";
import toast from "react-hot-toast";

// ─── Relative time helper ──────────────────────────────────────────────────────
function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

// ─── Notification type icon ───────────────────────────────────────────────────
function NotifIcon({ message }: { message: string }) {
  const msg = message.toLowerCase();
  if (msg.includes("approved")) {
    return (
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
        <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    );
  }
  if (msg.includes("rejected")) {
    return (
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
        <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    );
  }
  if (msg.includes("new") || msg.includes("applied") || msg.includes("submitted")) {
    return (
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
    );
  }
  if (msg.includes("cancel")) {
    return (
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
        <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    );
  }
  // Default
  return (
    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
      <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const { data: notifications, isLoading } = useGetNotificationsQuery();
  const [markRead] = useMarkReadMutation();
  const [markAllRead, { isLoading: markingAll }] = useMarkAllReadMutation();

  async function handleMarkAllRead() {
    try {
      await markAllRead().unwrap();
      toast.success("All notifications marked as read.");
    } catch {
      toast.error("Something went wrong.");
    }
  }

  async function handleMarkOne(id: number) {
    try {
      await markRead(id).unwrap();
    } catch {
      toast.error("Failed to mark as read.");
    }
  }

  if (isLoading) return <LoadingSpinner label="Loading notifications…" />;

  const unread = notifications?.filter((n) => !n.is_read).length ?? 0;
  const isEmpty = !notifications || notifications.length === 0;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Notifications</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {unread > 0 ? (
              <span className="text-blue-600 font-medium">{unread} unread</span>
            ) : (
              "All caught up!"
            )}
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="btn-secondary text-sm"
          >
            {markingAll ? (
              <span className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            Mark all as read
          </button>
        )}
      </div>

      {/* Empty state */}
      {isEmpty && (
        <div className="card p-16 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-100 mb-4">
            <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <p className="text-slate-600 font-medium">No notifications yet</p>
          <p className="text-slate-400 text-sm mt-1">You'll see updates about your leave requests here.</p>
        </div>
      )}

      {/* Notification feed */}
      {!isEmpty && (
        <div className="card divide-y divide-slate-100 overflow-hidden">
          {notifications?.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 px-5 py-4 transition-colors ${
                !n.is_read ? "bg-blue-50/60 hover:bg-blue-50" : "hover:bg-slate-50"
              }`}
            >
              <NotifIcon message={n.message} />

              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-relaxed ${!n.is_read ? "font-medium text-slate-800" : "text-slate-600"}`}>
                  {n.message}
                </p>
                <p className="text-xs text-slate-400 mt-1">{relativeTime(n.created_at)}</p>
              </div>

              <div className="flex-shrink-0 flex items-center gap-2">
                {!n.is_read ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <button
                      onClick={() => handleMarkOne(n.id)}
                      className="text-xs text-blue-600 hover:text-blue-800 transition-colors whitespace-nowrap"
                    >
                      Mark read
                    </button>
                  </>
                ) : (
                  <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
