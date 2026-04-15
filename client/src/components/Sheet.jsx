import React from "react";
import { X } from "lucide-react";

export function Sheet({ open, onClose, side = "right", children }) {
  if (!open) return null;

  const sideStyles = {
    right: "right-0 top-0 h-full w-80",
    left: "left-0 top-0 h-full w-80",
    top: "top-0 left-0 w-full h-60",
    bottom: "bottom-0 left-0 w-full h-60",
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Sheet Panel */}
      <div
        className={`fixed z-50 bg-white shadow-lg p-4 ${sideStyles[side]}`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded hover:bg-gray-100"
        >
          <X size={18} />
        </button>

        {children}
      </div>
    </>
  );
}

export function SheetHeader({ children }) {
  return (
    <div className="mb-4">
      {children}
    </div>
  );
}

export function SheetTitle({ children }) {
  return (
    <h2 className="text-lg font-semibold">
      {children}
    </h2>
  );
}

export function SheetDescription({ children }) {
  return (
    <p className="text-sm text-gray-500">
      {children}
    </p>
  );
}

export function SheetFooter({ children }) {
  return (
    <div className="mt-6 flex gap-2">
      {children}
    </div>
  );
}
