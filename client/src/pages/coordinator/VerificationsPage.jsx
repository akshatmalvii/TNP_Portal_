import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../components/Card";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { CheckCircle2, XCircle, Clock, FileText, User, ExternalLink } from "lucide-react";

const API_BASE = "http://localhost:5000/api/v1/verification";

export default function VerificationsPage() {
  const [pendingStudents, setPendingStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [approvedCount, setApprovedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchPending();
    fetchAllCounts();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await fetch(`${API_BASE}/coordinator/pending`, { headers });
      if (res.ok) {
        const data = await res.json();
        setPendingStudents(data);
      }
    } catch (err) {
      console.error("Error fetching pending:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCounts = async () => {
    try {
      const res = await fetch(`${API_BASE}/coordinator/all`, { headers });
      if (res.ok) {
        const data = await res.json();
        let approved = 0, rejected = 0;
        data.forEach(s => {
          const vr = s.StudentVerificationRequest;
          if (vr?.coordinator_status === "Approved") approved++;
          if (vr?.coordinator_status === "Rejected") rejected++;
        });
        setApprovedCount(approved);
        setRejectedCount(rejected);
      }
    } catch (err) {
      console.error("Error fetching counts:", err);
    }
  };

  const handleApprove = async (student_id) => {
    setActionLoading(student_id);
    try {
      const res = await fetch(`${API_BASE}/coordinator/${student_id}`, {
        method: "POST",
        headers,
      });
      if (res.ok) {
        setPendingStudents(prev => prev.filter(s => s.student_id !== student_id));
        setApprovedCount(prev => prev + 1);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to approve");
      }
    } catch (err) {
      console.error("Error approving:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (student_id) => {
    if (!confirm("Are you sure you want to reject this student's verification?")) return;
    setActionLoading(student_id);
    try {
      const res = await fetch(`${API_BASE}/coordinator/${student_id}`, {
        method: "DELETE",
        headers,
      });
      if (res.ok) {
        setPendingStudents(prev => prev.filter(s => s.student_id !== student_id));
        setRejectedCount(prev => prev + 1);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to reject");
      }
    } catch (err) {
      console.error("Error rejecting:", err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Student Verifications
        </h1>
        <p className="text-muted-foreground mt-1">
          Review student profiles and documents — approve or reject verification requests.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingStudents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{approvedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold">{rejectedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* List */}
      <div className="space-y-4">
        {pendingStudents.length === 0 ? (
          <Card className="border-0 bg-card">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground py-8">
                No pending verification requests. All caught up! 🎉
              </p>
            </CardContent>
          </Card>
        ) : (
          pendingStudents.map((student) => {
            const docs = student.StudentDocuments || [];
            const edus = student.StudentEducations || [];
            const isExpanded = expandedId === student.student_id;
            const isLoading = actionLoading === student.student_id;

            return (
              <Card key={student.student_id} className="border-0 bg-card hover:shadow-md transition">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{student.full_name || "Name not provided"}</h3>
                          <p className="text-sm text-muted-foreground">
                            {student.email} • PRN: {student.prn || "—"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {student.Department?.dept_name || "—"} • {student.Course?.course_name || "—"}
                          </p>
                        </div>
                      </div>

                      <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-200 border">
                        Pending Verification
                      </Badge>
                    </div>

                    {/* Documents */}
                    <div className="bg-secondary/30 p-4 rounded-lg">
                      <p className="text-sm font-semibold mb-2">
                        Documents ({docs.length} uploaded):
                      </p>
                      {docs.length === 0 ? (
                        <p className="text-sm text-gray-400">No documents uploaded</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {docs.map((doc) => (
                            <a
                              key={doc.document_id}
                              href={doc.view_url || doc.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs rounded-full border hover:bg-primary/20 transition"
                            >
                              <FileText className="w-3 h-3" />
                              {doc.document_type.replace(/_/g, " ")}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Toggle Details */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : student.student_id)}
                      className="text-sm text-primary hover:underline"
                    >
                      {isExpanded ? "Hide Details ▲" : "View Details ▼"}
                    </button>

                    {isExpanded && (
                      <div className="bg-secondary/20 p-4 rounded-lg border space-y-3">
                        {/* Personal Info */}
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Personal</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                            <div><span className="text-gray-500">Gender:</span> {student.gender || "—"}</div>
                            <div><span className="text-gray-500">DOB:</span> {student.date_of_birth || "—"}</div>
                            <div><span className="text-gray-500">Mobile:</span> {student.mobile_number || "—"}</div>
                            <div><span className="text-gray-500">Category:</span> {student.category || "—"}</div>
                            <div><span className="text-gray-500">Blood Group:</span> {student.blood_group || "—"}</div>
                            <div><span className="text-gray-500">Nationality:</span> {student.nationality || "—"}</div>
                          </div>
                        </div>

                        {/* Academic Info */}
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Academic</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                            <div><span className="text-gray-500">Backlogs:</span> {student.running_backlogs}</div>
                            <div><span className="text-gray-500">Total KTs:</span> {student.total_kt}</div>
                          </div>
                        </div>

                        {/* Education */}
                        {edus.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Education ({edus.length})</p>
                            <div className="space-y-1">
                              {edus.map(e => (
                                <p key={e.education_id} className="text-sm">
                                  <span className="font-mono bg-gray-100 px-1 rounded text-xs">{e.education_type}</span>
                                  {" — "}{e.institution_name || "N/A"}
                                  {e.percentage ? ` — ${e.percentage}%` : e.cgpa ? ` — CGPA: ${e.cgpa}` : ""}
                                  {e.passing_year ? ` (${e.passing_year})` : ""}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Addresses */}
                        {(student.present_address || student.permanent_address) && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Addresses</p>
                            {student.present_address && (
                              <p className="text-sm"><span className="text-gray-500">Present:</span> {student.present_address}</p>
                            )}
                            {student.permanent_address && (
                              <p className="text-sm"><span className="text-gray-500">Permanent:</span> {student.permanent_address}</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        onClick={() => handleApprove(student.student_id)}
                        disabled={isLoading}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        {isLoading ? "Processing..." : "Approve"}
                      </Button>

                      <Button
                        onClick={() => handleReject(student.student_id)}
                        disabled={isLoading}
                        variant="destructive"
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
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
