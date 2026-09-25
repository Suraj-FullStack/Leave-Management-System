// Login page — React Hook Form + Zod validation, posts to /api/auth/login/.
// On success it fetches the user profile and stores everything in Redux.

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useLoginMutation } from "../../api/authApi";
import { useAppDispatch } from "../../store";
import { setCredentials } from "../../store/authSlice";

const schema = z.object({
  email: z.string().email("Enter a valid email."),
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

      // Fetch the full user profile after getting the token
      // We need role info to redirect correctly
      const profileRes = await fetch("/api/auth/profile/", {
        headers: { Authorization: `Bearer ${tokens.access}` },
      });
      const user = await profileRes.json();

      dispatch(
        setCredentials({
          user,
          accessToken: tokens.access,
          refreshToken: tokens.refresh,
        })
      );
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err: unknown) {
      const error = err as { data?: { detail?: { non_field_errors?: string[]; } | string } };
      const detail = error?.data?.detail;
      const message =
        (typeof detail === "object" && detail?.non_field_errors?.[0]) ||
        (typeof detail === "string" ? detail : "Login failed. Check your credentials.");
      toast.error(message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Sign In</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              {...register("email")}
              type="email"
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              {...register("password")}
              type="password"
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p className="text-sm text-center mt-4 text-gray-600">
          No account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
