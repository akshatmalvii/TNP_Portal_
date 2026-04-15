import React from "react";

export function Skeleton({ className = "", ...props }) {
  return (
    <div
      className={`bg-gray-200 animate-pulse rounded-md ${className}`}
      {...props}
    />
  );
}



