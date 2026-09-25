// Registration page — creates a new user account.
// Role defaults to employee; admins can change roles via the user management page.

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
      toast.success("Account created. Please log in.");
      navigate("/login");
    } catch (err: unknown) {
      const error = err as { data?: { detail?: string } };
      const detail = error?.data?.detail;
      const message =
        typeof detail === "string" ? detail : "Registration failed. Please try again.";
      toast.error(message);
    }
  }

  const Field = ({
    name,
    label,
    type = "text",
  }: {
    name: keyof FormValues;
    label: string;
    type?: string;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        {...rhfRegister(name)}
        type={type}
        className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {errors[name] && (
        <p className="text-red-500 text-xs mt-1">{errors[name]?.message}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Create Account</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
          <Field name="first_name" label="First Name" />
          <Field name="last_name" label="Last Name" />
          <div className="col-span-2">
            <Field name="email" label="Email" type="email" />
          </div>
          <Field name="username" label="Username" />
          <Field name="department" label="Department" />
          <Field name="password" label="Password" type="password" />
          <Field name="confirm_password" label="Confirm Password" type="password" />
          <div className="col-span-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? "Creating account..." : "Register"}
            </button>
          </div>
        </form>
        <p className="text-sm text-center mt-4 text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
