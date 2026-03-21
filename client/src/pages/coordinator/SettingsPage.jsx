import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/Card";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    email: "coordinator@university.edu",
    notifications: true,
    autoApprove: false,
  });

  const handleSave = () => {
    // Save settings logic
    alert("Settings saved!");
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your coordinator settings and preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
            />
            <label>Enable notifications</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.autoApprove}
              onChange={(e) => setSettings({ ...settings, autoApprove: e.target.checked })}
            />
            <label>Auto-approve verified applications</label>
          </div>
          <Button onClick={handleSave}>Save Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}