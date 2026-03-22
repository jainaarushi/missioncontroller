interface EmptyStateProps {
  message: string;
  description?: string;
}

export function EmptyState({ message, description }: EmptyStateProps) {
  return (
    <div className="text-center py-8">
      <p className="text-ink-secondary text-sm">{message}</p>
      {description && (
        <p className="text-ink-tertiary text-xs mt-1">{description}</p>
      )}
    </div>
  );
}
