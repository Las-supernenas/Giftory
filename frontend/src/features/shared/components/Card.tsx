import type { ComponentProps } from "react";

type CardProps = ComponentProps<"div">;

export function Card({ children, className = "", ...divProps }: CardProps) {
  return (
    <div
      {...divProps}
      className={`bg-surface p-4 rounded-2xl border border-foreground/10 ${className}`}
    >
      {children}
    </div>
  );
}
