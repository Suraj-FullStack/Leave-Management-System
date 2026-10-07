// Top navigation bar — page title area, notification bell, user menu.

import { Link, useLocation } from "react-router-dom";
import { useAppDispatch } from "../store";
import { logout } from "../store/authSlice";
import { useAuth } from "../hooks/useAuth";
import { useGetUnreadCountQuery } from "../api/notificationApi";
import { useLogoutMutation } from "../api/authApi";
import toast from "react-hot-toast";

// Maps routes to human-readable page titles
const pageTitles: Record<string, string> = {
  "/dashboard":     "Dashboard",
  "/leaves":        "Leave Requests",
  "/leaves/apply":  "Apply for Leave",
  "/notifications": "Notifications",
  "/admin/users":   "User Management",
};

export default function Navbar() {
  const dispatch    = useAppDispatch();
  const location    = useLocation();
  const { user }    = useAuth();
  const [logoutApi] = useLogoutMutation();

  const { data: unreadData } = useGetUnreadCountQuery(undefined, {
    pollingInterval: 30000,
  });

  // Figure out page title — detail pages get a generic title
  const title =
    pageTitles[location.pathname] ||
    (location.pathname.startsWith("/leaves/") ? "Leave Details" : "Leave Management");

  async function handleLogout() {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      try {
        await logoutApi({ refresh: refreshToken }).unwrap();
      } catch {
        // Token already expired — still clear local state
      }
    }
    dispatch(logout());
    toast.success("You have been logged out.");
  }

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shrink-0">
      <h1 className="text-lg font-semibold text-slate-800">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <Link
          to="/notifications"
          className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Notifications"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadData && unreadData.unread_count > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
              {unreadData.unread_count > 9 ? "9+" : unreadData.unread_count}
            </span>
          )}
        </Link>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-200" />

        {/* User info + logout */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-xs">
            {user?.first_name.charAt(0)}{user?.last_name.charAt(0)}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-800 leading-none">{user?.full_name}</p>
            <p className="text-xs text-slate-500 mt-0.5 capitalize">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="ml-1 p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Logout"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
