import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../../components/Card";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/Table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/Dialog";
import { Plus, Pencil, Trash2, BookOpen } from "lucide-react";
import { useConfirmDialog } from "../../components/ConfirmDialog";
import { API_BASE_URL } from '../../constants/api';

const API_BASE = `${API_BASE_URL}/api/v1`;

export default function DepartmentsPage() {
  const { confirm, confirmDialog } = useConfirmDialog();
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [form, setForm] = useState({ dept_code: "", dept_name: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({ course_name: "" });
  const [courseError, setCourseError] = useState("");
  const [courseSaving, setCourseSaving] = useState(false);
  const [deletingCourseId, setDeletingCourseId] = useState(null);

  const token = localStorage.getItem("token");
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchDepartments = async () => {
    const res = await fetch(`${API_BASE}/departments`, { headers });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to fetch departments");
    }

    setDepartments(Array.isArray(data) ? data : []);
  };

  const fetchCourses = async () => {
    const res = await fetch(`${API_BASE}/courses`, { headers });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to fetch courses");
    }

    setCourses(Array.isArray(data) ? data : []);
  };

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchDepartments(), fetchCourses()]);
    } catch (err) {
      console.error("Error fetching department data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getCoursesForDepartment = (deptId) =>
    courses.filter((course) => Number(course.dept_id) === Number(deptId));

  const resetDepartmentForm = () => {
    setEditingDept(null);
    setForm({ dept_code: "", dept_name: "" });
    setError("");
  };

  const openAdd = () => {
    resetDepartmentForm();
    setDialogOpen(true);
  };

  const openEdit = (dept) => {
    setEditingDept(dept);
    setForm({ dept_code: dept.dept_code, dept_name: dept.dept_name });
    setError("");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.dept_code.trim() || !form.dept_name.trim()) {
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
        body: JSON.stringify({
          dept_code: form.dept_code.trim(),
          dept_name: form.dept_name.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to save");

      setDialogOpen(false);
      resetDepartmentForm();
      await fetchDepartments();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (deptId) => {
    const shouldDelete = await confirm({
      title: "Delete department?",
      description:
        "This will remove the department record. Related records may block the deletion if they still depend on it.",
      confirmText: "Delete Department",
    });

    if (!shouldDelete) return;

    try {
      const res = await fetch(`${API_BASE}/departments/${deptId}`, {
        method: "DELETE",
        headers,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to delete");

      await Promise.all([fetchDepartments(), fetchCourses()]);
    } catch (err) {
      alert(err.message);
    }
  };

  const resetCourseForm = () => {
    setEditingCourse(null);
    setCourseForm({ course_name: "" });
    setCourseError("");
  };

  const closeCourseDialog = () => {
    setCourseDialogOpen(false);
    setSelectedDept(null);
    resetCourseForm();
    setDeletingCourseId(null);
  };

  const openCourseManager = (dept) => {
    setSelectedDept(dept);
    resetCourseForm();
    setCourseDialogOpen(true);
  };

  const handleCourseDialogChange = (open) => {
    if (!open) {
      closeCourseDialog();
      return;
    }
    setCourseDialogOpen(true);
  };

  const beginEditCourse = (course) => {
    setEditingCourse(course);
    setCourseForm({ course_name: course.course_name });
    setCourseError("");
  };

  const handleCourseSave = async () => {
    if (!selectedDept) return;

    const courseName = courseForm.course_name.trim();
    if (!courseName) {
      setCourseError("Course name is required");
      return;
    }

    setCourseSaving(true);
    setCourseError("");

    try {
      const url = editingCourse
        ? `${API_BASE}/courses/${editingCourse.course_id}`
        : `${API_BASE}/courses`;

      const res = await fetch(url, {
        method: editingCourse ? "PUT" : "POST",
        headers,
        body: JSON.stringify({
          course_name: courseName,
          dept_id: selectedDept.dept_id,
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to save course");

      resetCourseForm();
      await fetchCourses();
    } catch (err) {
      setCourseError(err.message);
    } finally {
      setCourseSaving(false);
    }
  };

  const handleDeleteCourse = async (course) => {
    const shouldDelete = await confirm({
      title: "Delete course?",
      description: `Remove "${course.course_name}" from ${selectedDept?.dept_code}? Students and drives linked to it may no longer match as expected.`,
      confirmText: "Delete Course",
    });

    if (!shouldDelete) {
      return;
    }

    setDeletingCourseId(course.course_id);
    setCourseError("");

    try {
      const res = await fetch(`${API_BASE}/courses/${course.course_id}`, {
        method: "DELETE",
        headers,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to delete course");

      if (editingCourse?.course_id === course.course_id) {
        resetCourseForm();
      }

      await fetchCourses();
    } catch (err) {
      setCourseError(err.message);
    } finally {
      setDeletingCourseId(null);
    }
  };

  const selectedDeptCourses = selectedDept
    ? getCoursesForDepartment(selectedDept.dept_id)
    : [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-500 mt-1">
            Manage departments and their offered courses
          </p>
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
            <p className="text-center py-8 text-gray-500">
              No departments found. Click "Add Department" to create one.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Courses</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((dept) => {
                  const deptCourses = getCoursesForDepartment(dept.dept_id);

                  return (
                    <TableRow key={dept.dept_id}>
                      <TableCell>
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {dept.dept_code}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        {dept.dept_name}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2 max-w-xl">
                          <p className="text-xs text-gray-500">
                            {deptCourses.length > 0
                              ? `${deptCourses.length} course${deptCourses.length > 1 ? "s" : ""} linked`
                              : "No courses added yet"}
                          </p>
                          {deptCourses.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {deptCourses.map((course) => (
                                <span
                                  key={course.course_id}
                                  className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                                >
                                  {course.course_name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm">
                        {dept.created_at
                          ? new Date(dept.created_at).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2 flex-wrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openCourseManager(dept)}
                            className="gap-2"
                          >
                            <BookOpen className="w-4 h-4" />
                            Manage Courses
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(dept)}
                          >
                            <Pencil className="w-4 h-4 text-gray-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(dept.dept_id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDept ? "Edit Department" : "Add Department"}
            </DialogTitle>
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
                onChange={(e) =>
                  setForm({ ...form, dept_code: e.target.value.toUpperCase() })
                }
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
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editingDept ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={courseDialogOpen} onOpenChange={handleCourseDialogChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedDept
                ? `Manage Courses - ${selectedDept.dept_code}`
                : "Manage Courses"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {selectedDept && (
              <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                Courses added here will be linked to{" "}
                <span className="font-semibold">
                  {selectedDept.dept_name} ({selectedDept.dept_code})
                </span>
                .
              </div>
            )}

            {courseError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                {courseError}
              </div>
            )}

            <div className="rounded-xl border p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-gray-900">
                  {editingCourse ? "Edit Course" : "Add Course"}
                </h3>
                {editingCourse && (
                  <Button variant="ghost" size="sm" onClick={resetCourseForm}>
                    Cancel Edit
                  </Button>
                )}
              </div>

              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="text-sm font-medium">Course Name</label>
                  <Input
                    placeholder="e.g. B.Tech"
                    value={courseForm.course_name}
                    onChange={(e) =>
                      setCourseForm({ course_name: e.target.value })
                    }
                  />
                </div>
                <Button onClick={handleCourseSave} disabled={courseSaving}>
                  {courseSaving
                    ? "Saving..."
                    : editingCourse
                      ? "Update Course"
                      : "Add Course"}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Existing Courses</h3>
                <span className="text-sm text-gray-500">
                  {selectedDeptCourses.length} total
                </span>
              </div>

              {selectedDeptCourses.length === 0 ? (
                <div className="rounded-xl border border-dashed py-8 text-center text-sm text-gray-500">
                  No courses linked to this department yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedDeptCourses.map((course) => (
                    <div
                      key={course.course_id}
                      className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {course.course_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Course ID: {course.course_id}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => beginEditCourse(course)}
                        >
                          <Pencil className="w-4 h-4 text-gray-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCourse(course)}
                          disabled={deletingCourseId === course.course_id}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeCourseDialog}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {confirmDialog}
    </div>
  );
}






