// Top navigation bar with the user's name, unread notification badge, and logout.

import { Link } from "react-router-dom";
import { useAppDispatch } from "../store";
import { logout } from "../store/authSlice";
import { useAuth } from "../hooks/useAuth";
import { useGetUnreadCountQuery } from "../api/notificationApi";
import { useLogoutMutation } from "../api/authApi";
import toast from "react-hot-toast";

export default function Navbar() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { data: unreadData } = useGetUnreadCountQuery(undefined, {
    pollingInterval: 30000, // refresh every 30 seconds
  });
  const [logoutApi] = useLogoutMutation();

  async function handleLogout() {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      try {
        await logoutApi({ refresh: refreshToken }).unwrap();
      } catch {
        // token may already be expired, proceed to clear state anyway
      }
    }
    dispatch(logout());
    toast.success("Logged out.");
  }

  return (
    <header className="bg-white shadow-sm px-6 py-3 flex items-center justify-between">
      <h1 className="text-lg font-semibold text-gray-800">Leave Management System</h1>
      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <Link to="/notifications" className="relative text-gray-600 hover:text-gray-900">
          <span className="text-xl">&#128276;</span>
          {unreadData && unreadData.unread_count > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {unreadData.unread_count}
            </span>
          )}
        </Link>
        <span className="text-sm text-gray-700">{user?.full_name}</span>
        <button
          onClick={handleLogout}
          className="text-sm text-red-600 hover:text-red-800"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
