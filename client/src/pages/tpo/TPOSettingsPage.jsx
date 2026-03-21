import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../../components/Card'

import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Settings, Bell, Lock, Shield } from 'lucide-react'

export default function TPOSettingsPage() {
  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage TPO settings and preferences.
        </p>
      </div>

      {/* Organization Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Information</CardTitle>
          <CardDescription>Basic organization details</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Organization Name</label>
            <Input value="Training & Placement Office" disabled />
          </div>

          <div>
            <label className="text-sm font-medium">Contact Email</label>
            <Input type="email" defaultValue="tpo@college.edu" />
          </div>

          <div>
            <label className="text-sm font-medium">Contact Phone</label>
            <Input type="tel" defaultValue="+91 98765 43210" />
          </div>

          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5" />
            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Configure notification preferences
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">

          {[
            {
              title: 'Company Requests',
              desc: 'New company drive requests'
            },
            {
              title: 'Placement Updates',
              desc: 'Student placement notifications'
            },
            {
              title: 'Approvals Pending',
              desc: 'Alerts for pending approvals'
            }
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>

              <input type="checkbox" defaultChecked className="w-5 h-5" />
            </div>
          ))}

        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5" />
            <div>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Manage your account security
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            <Lock className="w-4 h-4 mr-2" />
            Change Password
          </Button>

          <Button variant="outline" className="w-full justify-start">
            <Shield className="w-4 h-4 mr-2" />
            Two-Factor Authentication
          </Button>
        </CardContent>
      </Card>

      {/* Data */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Manage portal data</CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            Export Data
          </Button>

          <Button variant="outline" className="w-full justify-start">
            Generate Reports
          </Button>
        </CardContent>
      </Card>

    </div>
  )
}