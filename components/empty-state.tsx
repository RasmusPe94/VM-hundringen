type EmptyStateProps = {
  title: string;
  text: string;
};

export function EmptyState({ title, text }: EmptyStateProps) {
  return (
    <div className="rounded-md border border-dashed border-neutral-300 bg-white px-5 py-8 text-center shadow-soft">
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      <p className="mt-2 text-sm text-neutral-600">{text}</p>
    </div>
  );
}
