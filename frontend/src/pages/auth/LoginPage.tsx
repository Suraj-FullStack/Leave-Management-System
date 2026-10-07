// Login page — polished two-column layout with design system classes.
// React Hook Form + Zod validation. Fetches profile after token login.

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useLoginMutation } from "../../api/authApi";
import { useAppDispatch } from "../../store";
import { setCredentials } from "../../store/authSlice";

const schema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormValues) {
    try {
      const tokens = await login(data).unwrap();
      const profileRes = await fetch("/api/auth/profile/", {
        headers: { Authorization: `Bearer ${tokens.access}` },
      });
      const user = await profileRes.json();
      dispatch(setCredentials({ user, accessToken: tokens.access, refreshToken: tokens.refresh }));
      toast.success(`Welcome back, ${user.first_name || user.email}!`);
      navigate("/dashboard");
    } catch (err: unknown) {
      const error = err as { data?: { detail?: { non_field_errors?: string[] } | string } };
      const detail = error?.data?.detail;
      const message =
        (typeof detail === "object" && detail?.non_field_errors?.[0]) ||
        (typeof detail === "string" ? detail : "Login failed. Check your credentials.");
      toast.error(message);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      {/* Card */}
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 shadow-lg mb-4">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Leave Management</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="label" htmlFor="email">Email address</label>
              <input
                id="email"
                {...register("email")}
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                className={`input-field mt-1 ${errors.email ? "border-red-400 focus:ring-red-400" : ""}`}
              />
              {errors.email && (
                <p className="error-text mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input
                id="password"
                {...register("password")}
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className={`input-field mt-1 ${errors.password ? "border-red-400 focus:ring-red-400" : ""}`}
              />
              {errors.password && (
                <p className="error-text mt-1">{errors.password.message}</p>
              )}
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
                  Signing in…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign In
                </>
              )}
            </button>
          </form>

          <p className="text-sm text-center text-slate-500 mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-600 font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>

        {/* Demo hint */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Demo — admin@company.com / Admin@1234
        </p>
      </div>
    </div>
  );
}
