import React from "react";

export function Input({ type = "text", className = "", ...props }) {
  return (
    <input
      type={type}
      className={`h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm outline-none 
      placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
      disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}