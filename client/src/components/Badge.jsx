import React from "react";

export function Badge({ children, variant = "default", className = "" }) {

  const baseStyle =
    "inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-medium";

  const variants = {
    default: "bg-indigo-600 text-white",
    secondary: "bg-gray-200 text-gray-800",
    destructive: "bg-red-600 text-white",
    outline: "border border-gray-300 text-gray-700",
  };

  return (
    <span className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}



