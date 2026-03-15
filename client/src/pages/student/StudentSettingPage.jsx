import React from "react";
import { Bell, Lock, Eye, Shield } from "lucide-react";

export default function StudentSettingPage() {
  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* Notifications */}
      <div className="bg-white shadow rounded-lg p-6 space-y-4">

        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-indigo-600" />
          <div>
            <h2 className="text-lg font-semibold">Notifications</h2>
            <p className="text-sm text-gray-500">
              Manage how you receive updates
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center p-3 border rounded-lg">
          <div>
            <p className="font-medium">Email Notifications</p>
            <p className="text-sm text-gray-500">
              Receive updates via email
            </p>
          </div>
          <input type="checkbox" defaultChecked className="w-5 h-5" />
        </div>

        <div className="flex justify-between items-center p-3 border rounded-lg">
          <div>
            <p className="font-medium">New Drive Alerts</p>
            <p className="text-sm text-gray-500">
              Get notified about new job drives
            </p>
          </div>
          <input type="checkbox" defaultChecked className="w-5 h-5" />
        </div>

        <div className="flex justify-between items-center p-3 border rounded-lg">
          <div>
            <p className="font-medium">Application Updates</p>
            <p className="text-sm text-gray-500">
              Notifications on application status
            </p>
          </div>
          <input type="checkbox" defaultChecked className="w-5 h-5" />
        </div>

      </div>

      {/* Privacy */}
      <div className="bg-white shadow rounded-lg p-6 space-y-4">

        <div className="flex items-center gap-3">
          <Eye className="w-5 h-5 text-indigo-600" />
          <div>
            <h2 className="text-lg font-semibold">Privacy</h2>
            <p className="text-sm text-gray-500">
              Control your privacy settings
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center p-3 border rounded-lg">
          <div>
            <p className="font-medium">Public Profile</p>
            <p className="text-sm text-gray-500">
              Allow others to view your profile
            </p>
          </div>
          <input type="checkbox" className="w-5 h-5" />
        </div>

        <div className="flex justify-between items-center p-3 border rounded-lg">
          <div>
            <p className="font-medium">Show CGPA</p>
            <p className="text-sm text-gray-500">
              Display your CGPA publicly
            </p>
          </div>
          <input type="checkbox" defaultChecked className="w-5 h-5" />
        </div>

      </div>

      {/* Security */}
      <div className="bg-white shadow rounded-lg p-6 space-y-4">

        <div className="flex items-center gap-3">
          <Lock className="w-5 h-5 text-indigo-600" />
          <div>
            <h2 className="text-lg font-semibold">Security</h2>
            <p className="text-sm text-gray-500">
              Manage your account security
            </p>
          </div>
        </div>

        <button className="w-full flex items-center gap-2 border rounded-lg p-3 hover:bg-gray-100">
          <Lock className="w-4 h-4" />
          Change Password
        </button>

        <button className="w-full flex items-center gap-2 border rounded-lg p-3 hover:bg-gray-100">
          <Shield className="w-4 h-4" />
          Two-Factor Authentication
        </button>

      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 border border-red-200 shadow rounded-lg p-6 space-y-4">

        <div>
          <h2 className="text-lg font-semibold text-red-600">
            Danger Zone
          </h2>
          <p className="text-sm text-gray-500">
            Irreversible actions
          </p>
        </div>

        <button className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700">
          Delete Account
        </button>

      </div>

    </div>
  );
}