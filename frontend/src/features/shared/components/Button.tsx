import type { ComponentProps } from "react";

type ButtonProps = ComponentProps<"button"> & {
  variant?: "primary" | "accent" | "secondary";
};

const baseClasses =
  "border-0 inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50";
const variantClasses = {
  primary: "bg-primary text-white",
  accent: "bg-accent-dusty-pink text-foreground",
  secondary: "bg-accent-lavender text-foreground",
};

export function Button({
  variant = "primary",
  className = "",
  ...buttonProps
}: ButtonProps) {
  return (
    <button
      type="button"
      {...buttonProps}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    />
  );
}
