import { formatStatus } from "@/lib/format";

type StatusPillProps = { status: string };

const styles: Record<string, string> = {
  pending: "border-amber-700/50 bg-amber-900/30 text-amber-300",
  won:     "border-emerald-700/50 bg-emerald-900/30 text-emerald-300",
  lost:    "border-red-800/50 bg-red-900/30 text-red-400",
  void:    "border-border bg-rim text-muted"
};

export function StatusPill({ status }: StatusPillProps) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[status] ?? styles.void}`}>
      {formatStatus(status)}
    </span>
  );
}
