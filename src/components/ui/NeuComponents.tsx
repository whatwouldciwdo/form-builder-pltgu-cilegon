import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NeuCardProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
  size?: "sm" | "md" | "lg";
}

export const NeuCard: React.FC<NeuCardProps> = ({
  children,
  className,
  inset = false,
  size = "md",
  ...props
}) => {
  const shadowClass = inset
    ? size === "sm"
      ? "neu-inset-sm"
      : "neu-inset"
    : size === "sm"
    ? "neu-card-sm"
    : size === "lg"
    ? "neu-card-lg"
    : "neu-card";

  return (
    <div className={cn(shadowClass, "p-6", className)} {...props}>
      {children}
    </div>
  );
};

interface NeuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "danger";
  size?: "sm" | "md" | "lg";
}

export const NeuButton: React.FC<NeuButtonProps> = ({
  children,
  className,
  variant = "default",
  size = "md",
  ...props
}) => {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3 text-base",
  };

  const variantClass =
    variant === "primary"
      ? "neu-button-primary font-medium"
      : variant === "danger"
      ? "neu-button text-red-600 font-medium hover:text-red-700"
      : "neu-button text-[#2D3748] font-medium hover:text-[#00779E]";

  return (
    <button
      className={cn(variantClass, sizeClasses[size], "inline-flex items-center justify-center gap-2 select-none", className)}
      {...props}
    >
      {children}
    </button>
  );
};

interface NeuInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const NeuInput: React.FC<NeuInputProps> = ({
  label,
  error,
  className,
  id,
  ...props
}) => {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-[#718096] uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="neu-inset px-4 py-3 flex items-center">
        <input
          id={id}
          className={cn(
            "w-full bg-transparent text-[#2D3748] placeholder-[#A0AEC0] text-sm focus:outline-none",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};
