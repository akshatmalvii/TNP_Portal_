import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Card";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from "../../components/Table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "../../components/Dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";

const API_BASE = "http://localhost:5000/api/v1";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [form, setForm] = useState({ dept_code: "", dept_name: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("token");
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  useEffect(() => { fetchDepartments(); }, []);

  const fetchDepartments = async () => {
    try {
      const res = await fetch(`${API_BASE}/departments`, { headers });
      const data = await res.json();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching departments:", err);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingDept(null);
    setForm({ dept_code: "", dept_name: "" });
    setError("");
    setDialogOpen(true);
  };

  const openEdit = (dept) => {
    setEditingDept(dept);
    setForm({ dept_code: dept.dept_code, dept_name: dept.dept_name });
    setError("");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.dept_code || !form.dept_name) {
      setError("Both fields are required");
      return;
    }
    setSaving(true);
    setError("");

    try {
      const url = editingDept
        ? `${API_BASE}/departments/${editingDept.dept_id}`
        : `${API_BASE}/departments`;

      const res = await fetch(url, {
        method: editingDept ? "PUT" : "POST",
        headers,
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to save");

      setDialogOpen(false);
      fetchDepartments();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (dept_id) => {
    if (!confirm("Are you sure you want to delete this department?")) return;

    try {
      const res = await fetch(`${API_BASE}/departments/${dept_id}`, {
        method: "DELETE",
        headers,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to delete");

      fetchDepartments();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-500 mt-1">Manage departments in the system</p>
        </div>
        <Button onClick={openAdd} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Department
        </Button>
      </div>

      <Card className="border-0">
        <CardContent className="pt-6">
          {loading ? (
            <p className="text-center py-8 text-gray-500">Loading...</p>
          ) : departments.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No departments found. Click "Add Department" to create one.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((dept) => (
                  <TableRow key={dept.dept_id}>
                    <TableCell>
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {dept.dept_code}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{dept.dept_name}</TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {dept.created_at ? new Date(dept.created_at).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(dept)}>
                          <Pencil className="w-4 h-4 text-gray-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(dept.dept_id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingDept ? "Edit Department" : "Add Department"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Department Code</label>
              <Input
                placeholder="e.g. CSE"
                value={form.dept_code}
                onChange={(e) => setForm({ ...form, dept_code: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Department Name</label>
              <Input
                placeholder="e.g. Computer Science & Engineering"
                value={form.dept_name}
                onChange={(e) => setForm({ ...form, dept_name: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : (editingDept ? "Update" : "Create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
