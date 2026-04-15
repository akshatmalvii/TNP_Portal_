import React from "react";

export function Separator({ orientation = "horizontal", className = "" }) {
  const baseStyle = "bg-gray-300";

  const styles =
    orientation === "vertical"
      ? "w-px h-full"
      : "h-px w-full";

  return <div className={`${baseStyle} ${styles} ${className}`} />;
}



