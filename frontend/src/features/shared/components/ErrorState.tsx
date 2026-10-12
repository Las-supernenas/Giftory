type ErrorStateProps = {
  message: string;
};

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <p
      role="alert"
      className="rounded-xl border border-error/20 bg-error/10 p-4 text-sm text-error"
    >
      {message}
    </p>
  );
}
