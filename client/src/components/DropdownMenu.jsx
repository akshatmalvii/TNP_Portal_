import React, { useState, useRef, useEffect } from "react";

export function DropdownMenu({ trigger, children }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();

  const toggleMenu = () => setOpen(!open);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={menuRef}>
      <div onClick={toggleMenu}>{trigger}</div>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-50">
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownMenuItem({ children, onClick, className = "" }) {
  return (
    <div
      onClick={onClick}
      className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${className}`}
    >
      {children}
    </div>
  );
}

export function DropdownMenuSeparator() {
  return <div className="border-t my-1"></div>;
}

export function DropdownMenuLabel({ children }) {
  return (
    <div className="px-4 py-2 text-xs text-gray-500 font-medium">
      {children}
    </div>
  );
}



