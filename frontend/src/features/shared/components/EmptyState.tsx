type EmptyStateProps = {
  message: string;
};

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <p className="rounded-xl border border-solid border-foreground/10 bg-surface p-4 text-center text-sm text-muted">
      {message}
    </p>
  );
}
