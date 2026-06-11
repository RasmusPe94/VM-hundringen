"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
  variant?: "primary" | "secondary" | "danger";
};

const variants = {
  primary:   "bg-turf text-white hover:bg-turf2 disabled:opacity-50",
  secondary: "border border-border bg-rim text-body hover:bg-fence disabled:opacity-40",
  danger:    "bg-danger text-white hover:bg-danger2 disabled:opacity-50"
};

export function SubmitButton({
  children,
  pendingText = "Sparar...",
  className = "",
  variant = "primary"
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      className={`focus-ring inline-flex min-h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition ${variants[variant]} ${className}`}
      disabled={pending}
      type="submit"
    >
      {pending ? pendingText : children}
    </button>
  );
}
