import React, { useState } from "react";
import { mockDrives } from "./mockData";
import { Card, CardContent } from "../../components/Card";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Search, Plus, Edit2, Trash2 } from "lucide-react";
import CreateDriveForm from "../../components/tpo/CreateDriveForm";

export default function TPODrivesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [drives, setDrives] = useState(mockDrives);
  const [isCreating, setIsCreating] = useState(false);

  const filteredDrives = drives.filter((drive) =>
    (drive.company || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (drive.position || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id) => {
    setDrives(drives.filter((d) => d.id !== id));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
      case "Active":
        return "bg-green-500/10 text-green-700 border-green-200";
      case "Closed":
        return "bg-red-500/10 text-red-700 border-red-200";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-200";
    }
  };

  if (isCreating) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <CreateDriveForm 
          onCancel={() => setIsCreating(false)} 
          onSuccess={(newDrive) => {
             // For now, format it loosely like a mock
             setDrives([{ 
               id: newDrive.drive_id, 
               company: "Company Role " + newDrive.company_role_id, 
               position: "New Role",
               salary: newDrive.package_lpa + " LPA",
               deadline: newDrive.deadline,
               status: newDrive.drive_status
             }, ...drives]);
             setIsCreating(false);
          }} 
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Job Drives</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage job drives for companies.
          </p>
        </div>

        <Button className="bg-primary hover:bg-primary/90 gap-2" onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4" />
          New Drive
        </Button>
      </div>

      {/* Search */}
      <Card className="border-0 bg-card">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search drives..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Drives List */}
      <div className="space-y-4">
        {filteredDrives.length === 0 ? (
          <Card className="border-0 bg-card">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground py-8">
                No drives found
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredDrives.map((drive) => (
            <Card
              key={drive.id || drive.drive_id}
              className="border-0 bg-card hover:shadow-md transition"
            >
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-5 gap-4 items-center">
                  {/* Company */}
                  <div>
                    <h3 className="font-bold">{drive.company}</h3>
                    <p className="text-sm text-muted-foreground">
                      {drive.position}
                    </p>
                  </div>

                  {/* Salary */}
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Salary
                    </p>
                    <p className="font-semibold">
                      {drive.salary}
                    </p>
                  </div>

                  {/* Deadline */}
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Deadline
                    </p>
                    <p className="font-semibold">
                      {new Date(
                        drive.deadline
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Status */}
                  <div>
                    <Badge
                      className={
                        getStatusColor(drive.status) + " border"
                      }
                    >
                      {drive.status}
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="outline">
                      <Edit2 className="w-4 h-4 mr-1" />
                      Edit
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(drive.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}