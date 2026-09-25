// Notifications page — lists all notifications for the user, with mark-all-read.

import {
  useGetNotificationsQuery,
  useMarkReadMutation,
  useMarkAllReadMutation,
} from "../../api/notificationApi";
import LoadingSpinner from "../../components/LoadingSpinner";
import toast from "react-hot-toast";

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

  if (isLoading) return <LoadingSpinner />;

  const unread = notifications?.filter((n) => !n.is_read).length ?? 0;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Notifications{" "}
          {unread > 0 && (
            <span className="text-sm text-red-500 ml-2">({unread} unread)</span>
          )}
        </h2>
        {unread > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="text-sm text-blue-600 hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-2">
        {notifications?.length === 0 && (
          <p className="text-gray-500 text-sm">No notifications yet.</p>
        )}
        {notifications?.map((n) => (
          <div
            key={n.id}
            className={`bg-white rounded shadow px-4 py-3 flex items-start justify-between gap-4 ${
              !n.is_read ? "border-l-4 border-blue-500" : ""
            }`}
          >
            <div>
              <p className="text-sm text-gray-800">{n.message}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(n.created_at).toLocaleString()}
              </p>
            </div>
            {!n.is_read && (
              <button
                onClick={() => markRead(n.id)}
                className="text-xs text-blue-500 hover:underline whitespace-nowrap"
              >
                Mark read
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
