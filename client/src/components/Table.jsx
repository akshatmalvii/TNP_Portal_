import React from "react";

export function Table({ children, className = "", ...props }) {
  return (
    <div className="relative w-full overflow-x-auto">
      <table className={`w-full text-sm ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className = "", ...props }) {
  return (
    <thead className={`border-b ${className}`} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className = "", ...props }) {
  return (
    <tbody className={`${className}`} {...props}>
      {children}
    </tbody>
  );
}

export function TableFooter({ children, className = "", ...props }) {
  return (
    <tfoot className={`border-t font-medium bg-gray-50 ${className}`} {...props}>
      {children}
    </tfoot>
  );
}

export function TableRow({ children, className = "", ...props }) {
  return (
    <tr
      className={`border-b hover:bg-gray-50 transition-colors ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({ children, className = "", ...props }) {
  return (
    <th
      className={`h-10 px-3 text-left font-medium text-gray-700 ${className}`}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className = "", ...props }) {
  return (
    <td className={`p-3 ${className}`} {...props}>
      {children}
    </td>
  );
}

export function TableCaption({ children, className = "", ...props }) {
  return (
    <caption className={`mt-4 text-sm text-gray-500 ${className}`} {...props}>
      {children}
    </caption>
  );
}
