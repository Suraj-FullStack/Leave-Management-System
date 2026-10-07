// Registration page — polished card with grid layout.
// Role defaults to employee; admins can change roles via user management.

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useRegisterMutation } from "../../api/authApi";

const schema = z
  .object({
    email: z.string().email("Enter a valid email."),
    username: z.string().min(3, "Username must be at least 3 characters."),
    first_name: z.string().min(1, "First name is required."),
    last_name: z.string().min(1, "Last name is required."),
    department: z.string().min(1, "Department is required."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords do not match.",
    path: ["confirm_password"],
  });

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();

  const {
    register: rhfRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormValues) {
    try {
      await register({ ...data, role: "employee" }).unwrap();
      toast.success("Account created! Please sign in.");
      navigate("/login");
    } catch (err: unknown) {
      const error = err as { data?: { detail?: string } };
      const detail = error?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Registration failed. Try again.");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 shadow-lg mb-4">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create Your Account</h1>
          <p className="text-slate-400 text-sm mt-1">Join the Leave Management System</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="first_name">First name</label>
                <input
                  id="first_name"
                  {...rhfRegister("first_name")}
                  type="text"
                  placeholder="Alice"
                  className={`input-field mt-1 ${errors.first_name ? "border-red-400" : ""}`}
                />
                {errors.first_name && <p className="error-text mt-1">{errors.first_name.message}</p>}
              </div>
              <div>
                <label className="label" htmlFor="last_name">Last name</label>
                <input
                  id="last_name"
                  {...rhfRegister("last_name")}
                  type="text"
                  placeholder="Johnson"
                  className={`input-field mt-1 ${errors.last_name ? "border-red-400" : ""}`}
                />
                {errors.last_name && <p className="error-text mt-1">{errors.last_name.message}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="label" htmlFor="email">Email address</label>
              <input
                id="email"
                {...rhfRegister("email")}
                type="email"
                placeholder="alice@company.com"
                className={`input-field mt-1 ${errors.email ? "border-red-400" : ""}`}
              />
              {errors.email && <p className="error-text mt-1">{errors.email.message}</p>}
            </div>

            {/* Username + Department */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="username">Username</label>
                <input
                  id="username"
                  {...rhfRegister("username")}
                  type="text"
                  placeholder="alice.j"
                  className={`input-field mt-1 ${errors.username ? "border-red-400" : ""}`}
                />
                {errors.username && <p className="error-text mt-1">{errors.username.message}</p>}
              </div>
              <div>
                <label className="label" htmlFor="department">Department</label>
                <input
                  id="department"
                  {...rhfRegister("department")}
                  type="text"
                  placeholder="Engineering"
                  className={`input-field mt-1 ${errors.department ? "border-red-400" : ""}`}
                />
                {errors.department && <p className="error-text mt-1">{errors.department.message}</p>}
              </div>
            </div>

            {/* Password row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="password">Password</label>
                <input
                  id="password"
                  {...rhfRegister("password")}
                  type="password"
                  placeholder="••••••••"
                  className={`input-field mt-1 ${errors.password ? "border-red-400" : ""}`}
                />
                {errors.password && <p className="error-text mt-1">{errors.password.message}</p>}
              </div>
              <div>
                <label className="label" htmlFor="confirm_password">Confirm password</label>
                <input
                  id="confirm_password"
                  {...rhfRegister("confirm_password")}
                  type="password"
                  placeholder="••••••••"
                  className={`input-field mt-1 ${errors.confirm_password ? "border-red-400" : ""}`}
                />
                {errors.confirm_password && (
                  <p className="error-text mt-1">{errors.confirm_password.message}</p>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full justify-center py-2.5 mt-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account…
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="text-sm text-center text-slate-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
