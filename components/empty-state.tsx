type EmptyStateProps = {
  title: string;
  text: string;
};

export function EmptyState({ title, text }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-surface px-6 py-12 text-center">
      <div className="mx-auto mb-3 text-4xl opacity-40">⚽</div>
      <h2 className="text-base font-semibold text-bright">{title}</h2>
      <p className="mt-1.5 text-sm text-muted">{text}</p>
    </div>
  );
}
