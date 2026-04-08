import React, { useEffect, useState } from "react";
import { Calendar, ExternalLink, FileText, IndianRupee, Search, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Card";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";

export default function StudentDrivePage() {
  const [drives, setDrives] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [appliedDrives, setAppliedDrives] = useState([]);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [detailsDrive, setDetailsDrive] = useState(null);
  const [formFields, setFormFields] = useState([]);
  const [formResponses, setFormResponses] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const formatPackage = (packageLpa) => {
    if (!packageLpa) return "N/A";
    return `₹ ${packageLpa} LPA`;
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchData = async () => {
      try {
        const [drivesRes, appsRes] = await Promise.all([
          fetch("http://localhost:5000/api/v1/drives", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch("http://localhost:5000/api/v1/drives/applications", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (drivesRes.ok) {
          const driveData = await drivesRes.json();
          setDrives(driveData);
        }
        if (appsRes.ok) {
          const appData = await appsRes.json();
          setAppliedDrives(appData.map((a) => a.drive_id));
        }
      } catch (error) {
        console.error("Error loading drives", error);
      }
    };

    fetchData();
  }, []);

  const filteredDrives = drives.filter((drive) => {
    const companyName = drive.company_name || "";
    const position = drive.position || "";

    const matchesSearch =
      companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      position.toLowerCase().includes(searchTerm.toLowerCase());

    const status = drive.drive_status || "";
    const matchesStatus =
      statusFilter === "all" || status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleApplyClick = async (drive) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/v1/drives/${drive.drive_id || drive.id}/form`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const fields = await res.json();
        setFormFields(fields);
      }
      
      setSelectedDrive(drive);
      setFormResponses({});
      setFormError("");
      setShowApplicationForm(true);
    } catch (error) {
      console.error("Error fetching form fields", error);
      alert("Failed to load application form");
    }
  };

  const handleFieldChange = (fieldId, value) => {
    setFormResponses({
      ...formResponses,
      [fieldId]: value
    });
  };

  const handleFileChange = (fieldId, file) => {
    if (file) {
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setFormError(`File size exceeds 5MB limit for field "${formFields.find(f => f.field_id === fieldId)?.field_label}"`);
        return;
      }
      
      // Convert file to base64 for transmission
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormResponses({
          ...formResponses,
          [fieldId]: e.target.result // base64 encoded string
        });
      };
      reader.onerror = () => {
        setFormError("Failed to read file. Please try again.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!selectedDrive) return;

    setSubmitting(true);
    setFormError("");

    try {
      const token = localStorage.getItem("token");
      
      // Build form data with proper field mapping
      const responses = formFields.map(field => {
        const value = formResponses[field.field_id];
        return {
          fieldId: field.field_id,
          value: value || ""
        };
      });

      const payload = {
        responses
      };

      const res = await fetch(`http://localhost:5000/api/v1/drives/${selectedDrive.drive_id || selectedDrive.id}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to apply");

      setAppliedDrives((prev) => [...prev, selectedDrive.drive_id || selectedDrive.id]);
      setShowApplicationForm(false);
      alert("Application submitted successfully!");
    } catch (error) {
      console.error("Apply error", error);
      setFormError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (detailsDrive) {
    const detailsDeadline = detailsDrive.deadline ? new Date(detailsDrive.deadline) : null;

    return (
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
          <div>
            <h2 className="text-xl font-bold">{detailsDrive.company_name}</h2>
            <p className="text-sm text-gray-600">Drive Details</p>
          </div>
          <Button variant="ghost" onClick={() => setDetailsDrive(null)}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <Card className="border-0 bg-card">
          <CardHeader>
            <CardTitle>{detailsDrive.role_title || "Job Details"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg border p-4">
                <p className="text-gray-500 mb-1">Offer Type</p>
                <p className="font-semibold">{detailsDrive.offer_type || "N/A"}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-gray-500 mb-1">CTC</p>
                <p className="font-semibold">{formatPackage(detailsDrive.package_lpa)}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-gray-500 mb-1">Deadline</p>
                <p className="font-semibold">
                  {detailsDeadline ? detailsDeadline.toLocaleDateString() : "N/A"}
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-gray-500 mb-1">Status</p>
                <p className="font-semibold">{detailsDrive.drive_status || "N/A"}</p>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-gray-500 mb-2 text-sm">Role Description</p>
              <p className="text-sm leading-6 text-gray-700 whitespace-pre-wrap">
                {detailsDrive.role_description || "No role description provided."}
              </p>
            </div>

            {detailsDrive.DriveDocuments?.length > 0 && (
              <div className="rounded-lg border p-4">
                <p className="text-gray-500 mb-3 text-sm">Job Description PDFs</p>
                <div className="flex flex-wrap gap-2">
                  {detailsDrive.DriveDocuments.map((document) => (
                    <a
                      key={document.document_id}
                      href={document.view_url || document.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-indigo-700 hover:bg-indigo-50"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      {document.file_name}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDetailsDrive(null)}>
                Back to Drives
              </Button>
              <Button
                onClick={() => {
                  setDetailsDrive(null);
                  handleApplyClick(detailsDrive);
                }}
                disabled={appliedDrives.includes(detailsDrive.drive_id || detailsDrive.id) || (detailsDeadline && detailsDeadline < new Date())}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {appliedDrives.includes(detailsDrive.drive_id || detailsDrive.id)
                  ? "Applied"
                  : detailsDeadline && detailsDeadline < new Date()
                    ? "Expired"
                    : "Apply Now"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showApplicationForm && selectedDrive) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
          <div>
            <h2 className="text-xl font-bold">Apply to {selectedDrive.company_name}</h2>
            <p className="text-sm text-gray-600">{selectedDrive.role_title}</p>
          </div>
          <Button variant="ghost" onClick={() => setShowApplicationForm(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {formError && (
          <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-md">
            {formError}
          </div>
        )}

        <Card className="border-0 bg-card">
          <CardContent className="pt-6">
            {formFields.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No additional fields required. Click submit to apply.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitApplication} className="space-y-6">
                {formFields.map((field) => (
                  <div key={field.field_id}>
                    <label className="text-sm font-medium">
                      {field.field_label}
                      {field.is_required && <span className="text-red-500 ml-1">*</span>}
                    </label>

                    {field.field_type === "TEXT" && (
                      <textarea
                        className="w-full border rounded-md px-3 py-2 text-sm mt-1"
                        placeholder={`Enter ${field.field_label.toLowerCase()}`}
                        value={formResponses[field.field_id] || ""}
                        onChange={(e) => handleFieldChange(field.field_id, e.target.value)}
                        required={field.is_required}
                      />
                    )}

                    {field.field_type === "NUMBER" && (
                      <Input
                        type="number"
                        className="mt-1"
                        placeholder={`Enter ${field.field_label.toLowerCase()}`}
                        value={formResponses[field.field_id] || ""}
                        onChange={(e) => handleFieldChange(field.field_id, e.target.value)}
                        required={field.is_required}
                      />
                    )}

                    {field.field_type === "FILE" && (
                      <input
                        type="file"
                        className="w-full border rounded-md px-3 py-2 text-sm mt-1"
                        onChange={(e) => handleFileChange(field.field_id, e.target.files?.[0])}
                        required={field.is_required}
                      />
                    )}
                  </div>
                ))}

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setShowApplicationForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Application"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {formFields.length === 0 && (
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowApplicationForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitApplication} disabled={submitting}>
              {submitting ? "Applying..." : "Apply Now"}
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Job Drives</h1>
        <p className="text-gray-500 mt-1">
          Browse and apply to available job drives.
        </p>
      </div>

      {/* Search + Filter */}
      <Card className="border-0 bg-card shadow-sm">
        <CardContent className="pt-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by company or position..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {["all", "Active", "Shortlisted", "Selected"].map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1 rounded border text-sm ${
                  statusFilter === filter
                    ? "bg-indigo-600 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                {filter === "all" ? "All Drives" : filter}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Drives List */}
      <div className="space-y-4">
        {filteredDrives.length === 0 ? (
          <Card className="border-0 bg-card">
            <CardContent className="pt-6">
              <p className="text-center text-gray-400 py-8">
                No drives found matching your criteria
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredDrives.map((drive) => {
            const hasApplied = appliedDrives.includes(drive.drive_id || drive.id);
            const deadline = new Date(drive.deadline);
            const isExpired = deadline < new Date();

            return (
              <Card
                key={drive.drive_id || drive.id}
                className="border-0 bg-card hover:shadow-md transition"
              >
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Company */}
                    <div>
                      <h3 className="font-bold text-lg">
                        {drive.company_name}
                      </h3>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <IndianRupee className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-semibold">
                          {formatPackage(drive.package_lpa)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {isExpired
                            ? "Expired"
                            : `Deadline: ${deadline.toLocaleDateString()}`}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setDetailsDrive(drive)}
                      >
                        View Details
                      </Button>
                      {hasApplied ? (
                        <button
                          disabled
                          className="px-4 py-2 border rounded bg-gray-100 text-gray-500"
                        >
                          Applied
                        </button>
                      ) : isExpired ? (
                        <button
                          disabled
                          className="px-4 py-2 border rounded bg-gray-100 text-gray-500"
                        >
                          Expired
                        </button>
                      ) : (
                        <Button
                          onClick={() => handleApplyClick(drive)}
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          Apply Now
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
