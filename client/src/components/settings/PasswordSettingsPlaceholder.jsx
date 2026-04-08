import React from "react";
import { Lock, KeyRound } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../Card";
import { Button } from "../Button";

export default function PasswordSettingsPlaceholder({ roleLabel = "account" }) {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage your {roleLabel.toLowerCase()} password settings.
        </p>
      </div>

      <Card className="border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600" />
            Password
          </CardTitle>
          <CardDescription>
            Only password management will be kept here for the MVP.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm font-medium text-blue-900">
              Change/Reset Password
            </p>
            <p className="mt-1 text-sm text-blue-700">
              This is a placeholder option for now. The real password workflow
              will be implemented later.
            </p>
          </div>

          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            disabled
          >
            <KeyRound className="w-4 h-4" />
            Change / Reset Password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
