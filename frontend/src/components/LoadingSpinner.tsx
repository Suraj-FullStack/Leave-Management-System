// Centered loading spinner with optional label text.

interface Props {
  label?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "w-5 h-5 border-2",
  md: "w-8 h-8 border-[3px]",
  lg: "w-12 h-12 border-4",
};

export default function LoadingSpinner({ label, size = "md" }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div
        className={`${sizes[size]} border-blue-600 border-t-transparent rounded-full animate-spin`}
      />
      {label && (
        <p className="text-sm text-slate-500 animate-pulse">{label}</p>
      )}
    </div>
  );
}
