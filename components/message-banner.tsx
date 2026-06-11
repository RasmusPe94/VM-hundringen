import { getParam } from "@/lib/strings";

type MessageBannerProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export function MessageBanner({ searchParams }: MessageBannerProps) {
  const error   = getParam(searchParams?.error);
  const message = getParam(searchParams?.message);

  if (!error && !message) return null;

  return (
    <div
      className={`rounded-lg border px-4 py-3 text-sm font-medium ${
        error
          ? "border-red-800/50 bg-red-900/20 text-red-300"
          : "border-emerald-700/50 bg-emerald-900/20 text-emerald-300"
      }`}
      role="status"
    >
      {error ? "⚠️ " : "✅ "}{error || message}
    </div>
  );
}
