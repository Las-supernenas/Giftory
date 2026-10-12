import type { ComponentProps } from "react";

type InputProps = ComponentProps<"input"> & {
  id: string;
  label: string;
  error?: string;
};

export function Input({
  id,
  label,
  error,
  className = "",
  ...inputProps
}: InputProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={id}
        {...inputProps}
        className={`block w-full min-h-11 rounded-xl border ${error ? "border-error" : "border-muted"} bg-surface px-3 py-2.5 text-foreground placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error ? `${id}-error` : inputProps["aria-describedby"]
        }
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}
