// Left sidebar with navigation links, role badge, and app branding.

import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface NavItem {
  to: string;
  label: string;
  roles: string[];
  icon: string;
}

const navItems: NavItem[] = [
  { to: "/dashboard",    label: "Dashboard",       roles: ["admin", "manager", "employee"], icon: "▦" },
  { to: "/leaves",       label: "Leave Requests",  roles: ["admin", "manager", "employee"], icon: "📋" },
  { to: "/leaves/apply", label: "Apply for Leave", roles: ["employee"],                     icon: "✚" },
  { to: "/notifications",label: "Notifications",   roles: ["admin", "manager", "employee"], icon: "🔔" },
  { to: "/admin/users",  label: "User Management", roles: ["admin"],                        icon: "👥" },
];

const roleColors: Record<string, string> = {
  admin:    "bg-purple-500/20 text-purple-300",
  manager:  "bg-blue-500/20 text-blue-300",
  employee: "bg-emerald-500/20 text-emerald-300",
};

export default function Sidebar() {
  const { user } = useAuth();

  const visibleItems = navItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  return (
    <aside className="w-60 bg-slate-900 flex flex-col shrink-0 border-r border-slate-800">
      {/* Branding */}
      <div className="px-5 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            L
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-none">LeaveMS</p>
            <p className="text-slate-500 text-xs mt-0.5">Management System</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
          Menu
        </p>
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/leaves"}
            className={({ isActive }) =>
              `nav-link ${isActive ? "nav-link-active" : "nav-link-inactive"}`
            }
          >
            <span className="text-base w-5 text-center">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User info at bottom */}
      {user && (
        <div className="px-4 py-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-xs shrink-0">
              {user.first_name.charAt(0)}{user.last_name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-medium truncate">{user.full_name}</p>
              <span className={`inline-block text-xs px-1.5 py-0.5 rounded font-medium mt-0.5 ${roleColors[user.role]}`}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
