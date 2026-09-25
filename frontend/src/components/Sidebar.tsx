// Left sidebar — navigation links filtered by role.

import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface NavItem {
  to: string;
  label: string;
  roles: string[];
}

const navItems: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", roles: ["admin", "manager", "employee"] },
  { to: "/leaves", label: "Leave Requests", roles: ["admin", "manager", "employee"] },
  { to: "/leaves/apply", label: "Apply for Leave", roles: ["employee"] },
  { to: "/notifications", label: "Notifications", roles: ["admin", "manager", "employee"] },
  { to: "/admin/users", label: "User Management", roles: ["admin"] },
];

export default function Sidebar() {
  const { user } = useAuth();

  const visibleItems = navItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  return (
    <aside className="w-56 bg-gray-800 text-white flex flex-col">
      <div className="px-4 py-5 font-bold text-lg border-b border-gray-700">
        LMS
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block px-4 py-2 rounded text-sm transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-700"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-3 text-xs text-gray-400 border-t border-gray-700">
        {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}
      </div>
    </aside>
  );
}
