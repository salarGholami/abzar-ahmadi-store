import React, { useId, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      className = "",
      wrapperClassName = "",
      id: idProp,
      ...props
    },
    ref,
  ) => {
    const autoId = useId();
    const id = idProp ?? autoId;
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;

    const describedBy =
      [error ? errorId : null, hint && !error ? hintId : null]
        .filter(Boolean)
        .join(" ") || undefined;

    return (
      <div className={`flex flex-col gap-1.5 ${wrapperClassName}`}>
        {label ? (
          <label htmlFor={id} className="text-sm font-bold text-[var(--text)]">
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`input ${error ? "border-[var(--danger)] focus:ring-[var(--danger)]" : ""} ${className}`.trim()}
          {...props}
        />
        {error ? (
          <span id={errorId} role="alert" className="text-sm font-medium text-[var(--danger)]">
            {error}
          </span>
        ) : null}
        {hint && !error ? (
          <span id={hintId} className="text-xs font-medium text-[var(--muted)]">
            {hint}
          </span>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
