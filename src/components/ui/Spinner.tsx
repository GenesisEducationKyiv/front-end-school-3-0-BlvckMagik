"use client";

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "primary" | "white" | "gray";
  text?: string;
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-8 h-8", 
  lg: "w-12 h-12",
  xl: "w-16 h-16"
};

const colorClasses = {
  primary: "border-blue-500",
  white: "border-white",
  gray: "border-gray-500"
};

export function Spinner({ 
  size = "md", 
  color = "primary", 
  text,
  className = "" 
}: SpinnerProps): React.JSX.Element {
  const spinnerClasses = [
    sizeClasses[size],
    colorClasses[color],
    "border-2",
    "border-t-transparent",
    "rounded-full",
    "animate-spin"
  ].join(" ");

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`.trim()}>
      <div 
        className={spinnerClasses}
        role="status"
        aria-label="Завантаження"
      />
      {text && (
        <p className="text-sm text-gray-600 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}

export function PageSpinner(): React.JSX.Element {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <Spinner size="xl" color="primary" />
    </div>
  );
}
