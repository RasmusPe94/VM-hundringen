"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
  variant?: "primary" | "secondary" | "danger";
};

const variants = {
  primary:
    "bg-grass text-white hover:bg-[#11633c] disabled:bg-neutral-400",
  secondary:
    "border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-100 disabled:text-neutral-400",
  danger:
    "bg-[#b42318] text-white hover:bg-[#8f1d14] disabled:bg-neutral-400"
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
