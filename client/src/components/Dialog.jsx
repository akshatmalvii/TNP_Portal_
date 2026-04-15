import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";

export function Dialog(props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

export function DialogTrigger(props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

export function DialogPortal(props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

export function DialogClose(props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

export function DialogOverlay({ className = "", ...props }) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={
        "data-[state=open]:animate-in data-[state=closed]:animate-out " +
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 " +
        "fixed inset-0 z-50 bg-black/60 backdrop-blur-[1px] " +
        className
      }
      {...props}
    />
  );
}

export function DialogContent({
  className = "",
  children,
  showCloseButton = true,
  ...props
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={
          "bg-white text-gray-900 data-[state=open]:animate-in data-[state=closed]:animate-out " +
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 " +
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 " +
          "fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] " +
          "max-h-[90vh] translate-x-[-50%] translate-y-[-50%] gap-4 overflow-y-auto rounded-xl border border-gray-200 p-6 shadow-2xl duration-200 sm:max-w-lg " +
          className
        }
        {...props}
      >
        {children}

        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="absolute top-4 right-4 rounded-md p-1 text-gray-500 opacity-80 transition hover:bg-gray-100 hover:text-gray-700 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

export function DialogHeader({ className = "", ...props }) {
  return (
    <div
      data-slot="dialog-header"
      className={"flex flex-col gap-2 text-center sm:text-left " + className}
      {...props}
    />
  );
}

export function DialogFooter({ className = "", ...props }) {
  return (
    <div
      data-slot="dialog-footer"
      className={
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end " + className
      }
      {...props}
    />
  );
}

export function DialogTitle({ className = "", ...props }) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={"text-lg leading-none font-semibold " + className}
      {...props}
    />
  );
}

export function DialogDescription({ className = "", ...props }) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={"text-sm text-gray-500 " + className}
      {...props}
    />
  );
}

