// Admin-only user management page — searchable, filterable user table.

import { useState } from "react";
import { useListUsersQuery } from "../../api/authApi";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Role } from "../../types";

// ─── Role badge ───────────────────────────────────────────────────────────────
const roleBadgeConfig: Record<Role, { bg: string; text: string; dot: string }> = {
  admin: {
    bg: "bg-purple-50 border border-purple-200",
    text: "text-purple-700",
    dot: "bg-purple-500",
  },
  manager: {
    bg: "bg-blue-50 border border-blue-200",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
  employee: {
    bg: "bg-emerald-50 border border-emerald-200",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
};

function RoleBadge({ role }: { role: Role }) {
  const cfg = roleBadgeConfig[role] ?? roleBadgeConfig.employee;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
}

// ─── User initials avatar ─────────────────────────────────────────────────────
const avatarColors = [
  "bg-blue-500", "bg-emerald-500", "bg-violet-500",
  "bg-amber-500", "bg-rose-500", "bg-cyan-500",
];

function UserAvatar({ name, email }: { name: string; email: string }) {
  const idx = email.charCodeAt(0) % avatarColors.length;
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  return (
    <div
      className={`w-8 h-8 rounded-full ${avatarColors[idx]} flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}
    >
      {initials || "?"}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function UserManagementPage() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<string>("");
  const [department, setDepartment] = useState("");

  const { data: users, isLoading } = useListUsersQuery({
    search,
    role: role || undefined,
  });

  // Client-side department filter (simple)
  const filtered = department
    ? users?.filter((u) =>
        u.department?.toLowerCase().includes(department.toLowerCase())
      )
    : users;

  // Derive unique departments for quick filter chips
  const departments = Array.from(
    new Set(users?.map((u) => u.department).filter(Boolean) as string[])
  ).sort();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">User Management</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {filtered?.length ?? 0} {filtered?.length === 1 ? "user" : "users"} found
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="card p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>

          {/* Role filter */}
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="input-field"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
          </select>

          {/* Department filter */}
          <input
            type="text"
            placeholder="Filter by department…"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="input-field"
          />
        </div>

        {/* Department quick chips */}
        {departments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setDepartment("")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                !department
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All
            </button>
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setDepartment(dept === department ? "" : dept)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  dept === department
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingSpinner label="Loading users…" />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="table-th">User</th>
                  <th className="table-th">Email</th>
                  <th className="table-th">Role</th>
                  <th className="table-th">Department</th>
                  <th className="table-th">Manager</th>
                  <th className="table-th text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(!filtered || filtered.length === 0) && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-slate-500 text-sm font-medium">No users found</p>
                        <p className="text-xs text-slate-400">Try adjusting your search or filter.</p>
                      </div>
                    </td>
                  </tr>
                )}
                {filtered?.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    {/* User + avatar */}
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={u.full_name} email={u.email} />
                        <div>
                          <p className="font-medium text-slate-800 text-sm">{u.full_name}</p>
                          <p className="text-xs text-slate-400">@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-td text-slate-500 text-sm">{u.email}</td>
                    <td className="table-td">
                      <RoleBadge role={u.role as Role} />
                    </td>
                    <td className="table-td text-sm text-slate-600">
                      {u.department || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="table-td text-sm text-slate-600">
                      {u.manager_name || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="table-td text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          u.is_active
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? "bg-emerald-500" : "bg-slate-400"}`} />
                        {u.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          {filtered && filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50">
              <p className="text-xs text-slate-500">
                Showing <span className="font-medium text-slate-700">{filtered.length}</span>{" "}
                {filtered.length === 1 ? "user" : "users"}
                {role && <span> · Role: <span className="font-medium capitalize">{role}</span></span>}
                {department && <span> · Dept: <span className="font-medium">{department}</span></span>}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
