import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../components/Card";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Search, Edit2, Trash2 } from "lucide-react";
import CreateDriveForm from "../../components/tpo/CreateDriveForm";
import { useConfirmDialog } from "../../components/ConfirmDialog";
import { API_BASE_URL } from '../constants/api';

export default function TPODrivesPage() {
  const { confirm, confirmDialog } = useConfirmDialog();
  const [searchTerm, setSearchTerm] = useState("");
  const [drives, setDrives] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingDrive, setEditingDrive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePlacementSeason, setActivePlacementSeason] = useState("");
  const [department, setDepartment] = useState(null);

  useEffect(() => {
    fetchDrives();
    fetchPolicy();
  }, []);

  const fetchPolicy = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("`${API_BASE_URL}`/api/v1/tpo/policy", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setActivePlacementSeason(data.department?.current_placement_season || "");
        setDepartment(data.department);
      }
    } catch (err) {
      console.error("Failed to fetch policy", err);
    }
  };

  const fetchDrives = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("`${API_BASE_URL}`/api/v1/tpo/drives", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setDrives(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch drives", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDrives = drives.filter((drive) =>
    (drive.company_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (drive.role_title || drive.position || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    const shouldDelete = await confirm({
      title: "Delete drive?",
      description:
        "This will permanently remove the drive and its related setup from the portal.",
      confirmText: "Delete Drive",
    });

    if (!shouldDelete) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(``${API_BASE_URL}`/api/v1/tpo/drive/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setDrives(drives.filter((d) => (d.drive_id || d.id) !== id));
      } else {
        alert("Failed to delete drive");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting drive");
    }
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

  if (isCreating || editingDrive) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <CreateDriveForm 
          initialData={editingDrive}
          activePlacementSeason={activePlacementSeason}
          fixedDepartmentId={department?.dept_id}
          fixedDepartmentLabel={department?.dept_name}
          onCancel={() => {
            setIsCreating(false);
            setEditingDrive(null);
          }} 
          onSuccess={() => {
             // Reload real drives immediately from DB
             fetchDrives();
             setIsCreating(false);
             setEditingDrive(null);
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
            Review and manage department drives after coordinator submission.
          </p>
        </div>
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
                    <h3 className="font-bold">{drive.company_name || "Unknown Company"}</h3>
                    <p className="text-sm text-muted-foreground">
                      {drive.role_title}
                    </p>
                  </div>

                  {/* Salary */}
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Salary
                    </p>
                    <p className="font-semibold">
                      {drive.package_lpa ? `${drive.package_lpa} LPA` : "N/A"}
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
                        getStatusColor(drive.drive_status || drive.status) + " border"
                      }
                    >
                      {drive.drive_status || drive.status}
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="outline" onClick={() => setEditingDrive(drive)}>
                      <Edit2 className="w-4 h-4 mr-1" />
                      Edit
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(drive.drive_id || drive.id)}
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

      {confirmDialog}
    </div>
  );
}


