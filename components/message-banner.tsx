import { getParam } from "@/lib/strings";

type MessageBannerProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export function MessageBanner({ searchParams }: MessageBannerProps) {
  const error = getParam(searchParams?.error);
  const message = getParam(searchParams?.message);

  if (!error && !message) {
    return null;
  }

  return (
    <div
      className={`rounded-md border px-4 py-3 text-sm ${
        error
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-emerald-200 bg-emerald-50 text-emerald-800"
      }`}
      role="status"
    >
      {error || message}
    </div>
  );
}
