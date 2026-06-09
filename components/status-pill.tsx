import { formatStatus } from "@/lib/format";

type StatusPillProps = {
  status: string;
};

const styles: Record<string, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-800",
  won: "border-emerald-200 bg-emerald-50 text-emerald-800",
  lost: "border-red-200 bg-red-50 text-red-800",
  void: "border-neutral-200 bg-neutral-100 text-neutral-700"
};

export function StatusPill({ status }: StatusPillProps) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${
        styles[status] ?? styles.void
      }`}
    >
      {formatStatus(status)}
    </span>
  );
}
