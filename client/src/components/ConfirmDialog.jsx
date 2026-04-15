import React, { useState } from "react";
import { AlertTriangle, LogOut } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./Dialog";
import { Button } from "./Button";

const toneStyles = {
  danger: {
    iconWrapper: "bg-red-100 text-red-600",
    confirmVariant: "destructive",
  },
  neutral: {
    iconWrapper: "bg-blue-100 text-blue-600",
    confirmVariant: "default",
  },
};

export function useConfirmDialog() {
  const [options, setOptions] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const closeDialog = (result) => {
    if (confirming) return;
    if (options?.resolve) {
      options.resolve(result);
    }
    setOptions(null);
  };

  const confirm = (nextOptions = {}) =>
    new Promise((resolve) => {
      setOptions({
        title: nextOptions.title || "Please confirm",
        description:
          nextOptions.description ||
          "Please confirm that you want to continue.",
        confirmText: nextOptions.confirmText || "Confirm",
        cancelText: nextOptions.cancelText || "Cancel",
        tone: nextOptions.tone || "danger",
        icon: nextOptions.icon || null,
        resolve,
      });
    });

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      if (options?.resolve) {
        options.resolve(true);
      }
      setOptions(null);
    } finally {
      setConfirming(false);
    }
  };

  const activeTone = toneStyles[options?.tone] || toneStyles.danger;
  const Icon = options?.icon || AlertTriangle;

  const confirmDialog = (
    <Dialog open={Boolean(options)} onOpenChange={(open) => !open && closeDialog(false)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="sm:text-left">
          <div
            className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full ${activeTone.iconWrapper}`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <DialogTitle>{options?.title}</DialogTitle>
          <DialogDescription>{options?.description}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => closeDialog(false)} disabled={confirming}>
            {options?.cancelText || "Cancel"}
          </Button>
          <Button
            variant={activeTone.confirmVariant}
            onClick={handleConfirm}
            disabled={confirming}
          >
            {confirming ? "Please wait..." : options?.confirmText || "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return { confirm, confirmDialog };
}

export const confirmDialogIcons = {
  alert: AlertTriangle,
  logout: LogOut,
};




