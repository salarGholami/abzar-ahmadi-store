import React, { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  wrapperClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", wrapperClassName = "", ...props }, ref) => {
    return (
      <div className={`flex flex-col gap-1 ${wrapperClassName}`}>
        {label && (
          <label className="text-sm font-medium text-gray-700">{label}</label>
        )}
        <input
          ref={ref}
          className={`input ${error ? "border-red-500 focus:ring-red-500" : ""} ${className}`}
          {...props}
        />
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
