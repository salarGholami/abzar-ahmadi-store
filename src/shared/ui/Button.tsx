import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

const variantClass: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  danger: "btn-danger",
  ghost:
    "bg-transparent border-transparent text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 text-xs",
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-14 px-5 text-sm",
};

export function Button({
  className = "",
  type = "button",
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  leftIcon,
  rightIcon,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={`btn ${variantClass[variant]} ${sizeClass[size]} ${className}`.trim()}
      {...props}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin shrink-0" aria-hidden />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  );
}

export default Button;
