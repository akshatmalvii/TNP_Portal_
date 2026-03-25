import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/Card";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { CheckCircle2, Upload, User, GraduationCap, FileText, Send } from "lucide-react";

const API_BASE = "http://localhost:5000/api/v1/student-profile";

const STEPS = ["Personal Info", "Academic Info", "Documents", "Review & Submit"];

const EDUCATION_TYPES = ["SSC", "HSC", "Diploma", "UG"];
const DOCUMENT_TYPES = [
  { value: "Aadhaar", label: "Aadhaar Card" },
  { value: "SSC_Marksheet", label: "SSC Marksheet" },
  { value: "HSC_Marksheet", label: "HSC Marksheet" },
  { value: "UG_Marksheet", label: "UG Marksheet" },
  { value: "Photo", label: "Passport Photo" },
  { value: "Resume", label: "Resume" },
];

export default function StudentProfileFormPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);

  // Personal info
  const [personal, setPersonal] = useState({
    full_name: "", gender: "", marital_status: "", date_of_birth: "",
    mobile_number: "", parent_mobile_number: "", blood_group: "",
    category: "", nationality: "Indian", height_cm: "", weight_kg: "",
    present_address: "", permanent_address: "",
  });

  // Academic info
  const [academic, setAcademic] = useState({
    dept_id: "", course_id: "", prn: "", running_backlogs: 0, total_kt: 0,
  });

  // Education records
  const [educations, setEducations] = useState([]);

  // Documents
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [profileRes, deptRes, courseRes] = await Promise.all([
        fetch(`${API_BASE}/profile`, { headers }),
        fetch("http://localhost:5000/api/v1/departments", { headers }),
        fetch("http://localhost:5000/api/v1/courses", { headers }),
      ]);

      if (deptRes.ok) setDepartments(await deptRes.json());
      if (courseRes.ok) setCourses(await courseRes.json());

      if (profileRes.ok) {
        const data = await profileRes.json();

        // Pre-fill personal info
        setPersonal({
          full_name: data.full_name || "",
          gender: data.gender || "",
          marital_status: data.marital_status || "",
          date_of_birth: data.date_of_birth || "",
          mobile_number: data.mobile_number || "",
          parent_mobile_number: data.parent_mobile_number || "",
          blood_group: data.blood_group || "",
          category: data.category || "",
          nationality: data.nationality || "Indian",
          height_cm: data.height_cm || "",
          weight_kg: data.weight_kg || "",
          present_address: data.present_address || "",
          permanent_address: data.permanent_address || "",
        });

        setAcademic({
          dept_id: data.dept_id || "",
          course_id: data.course_id || "",
          prn: data.prn || "",
          running_backlogs: data.running_backlogs || 0,
          total_kt: data.total_kt || 0,
        });

        if (data.StudentEducations) setEducations(data.StudentEducations);
        if (data.StudentDocuments) setDocuments(data.StudentDocuments);

        // If already submitted for verification, redirect
        if (data.StudentVerificationRequest) {
          navigate("/dashboard/student/verification-pending");
          return;
        }
      }
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const savePersonal = async () => {
    setSaving(true); setError("");
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: "PUT", headers: jsonHeaders, body: JSON.stringify(personal),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setStep(1);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const saveAcademic = async () => {
    setSaving(true); setError("");
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: "PUT", headers: jsonHeaders, body: JSON.stringify(academic),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setStep(2);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const saveEducation = async (eduData) => {
    setError("");
    try {
      const res = await fetch(`${API_BASE}/education`, {
        method: "POST", headers: jsonHeaders, body: JSON.stringify(eduData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Refresh education list
      const profileRes = await fetch(`${API_BASE}/profile`, { headers });
      if (profileRes.ok) {
        const profile = await profileRes.json();
        if (profile.StudentEducations) setEducations(profile.StudentEducations);
      }
      return true;
    } catch (err) { setError(err.message); return false; }
  };

  const handleFileUpload = async (file, document_type) => {
    setUploading(true); setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("document_type", document_type);

      const res = await fetch(`${API_BASE}/documents`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Refresh documents
      const profileRes = await fetch(`${API_BASE}/profile`, { headers });
      if (profileRes.ok) {
        const profile = await profileRes.json();
        if (profile.StudentDocuments) setDocuments(profile.StudentDocuments);
      }
    } catch (err) { setError(err.message); }
    finally { setUploading(false); }
  };

  const handleSubmitVerification = async () => {
    setSaving(true); setError("");
    try {
      const res = await fetch(`${API_BASE}/submit-verification`, {
        method: "POST", headers: jsonHeaders,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      navigate("/dashboard/student/verification-pending");
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Complete Your Profile</h1>
        <p className="text-gray-500 mt-1">
          Fill in your details to apply for placement drives
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              i < step ? "bg-green-500 text-white" :
              i === step ? "bg-blue-600 text-white" :
              "bg-gray-200 text-gray-500"
            }`}>
              {i < step ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
            </div>
            <span className={`text-sm hidden sm:inline ${i === step ? "font-semibold" : "text-gray-400"}`}>{s}</span>
            {i < STEPS.length - 1 && <div className="w-8 h-px bg-gray-300" />}
          </div>
        ))}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">{error}</div>
      )}
      {successMsg && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">{successMsg}</div>
      )}

      {/* Step 0: Personal Info */}
      {step === 0 && (
        <Card className="border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="w-5 h-5" /> Personal Information</CardTitle>
            <CardDescription>Enter your personal details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Full Name *</label>
                <Input value={personal.full_name} onChange={e => setPersonal({ ...personal, full_name: e.target.value })} placeholder="John Doe" />
              </div>
              <div>
                <label className="text-sm font-medium">Gender</label>
                <select value={personal.gender} onChange={e => setPersonal({ ...personal, gender: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm bg-white">
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Date of Birth</label>
                <Input type="date" value={personal.date_of_birth} onChange={e => setPersonal({ ...personal, date_of_birth: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Marital Status</label>
                <select value={personal.marital_status} onChange={e => setPersonal({ ...personal, marital_status: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm bg-white">
                  <option value="">Select</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Mobile Number</label>
                <Input value={personal.mobile_number} onChange={e => setPersonal({ ...personal, mobile_number: e.target.value })} placeholder="9876543210" />
              </div>
              <div>
                <label className="text-sm font-medium">Parent Mobile Number</label>
                <Input value={personal.parent_mobile_number} onChange={e => setPersonal({ ...personal, parent_mobile_number: e.target.value })} placeholder="9876543210" />
              </div>
              <div>
                <label className="text-sm font-medium">Blood Group</label>
                <select value={personal.blood_group} onChange={e => setPersonal({ ...personal, blood_group: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm bg-white">
                  <option value="">Select</option>
                  {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <select value={personal.category} onChange={e => setPersonal({ ...personal, category: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm bg-white">
                  <option value="">Select</option>
                  {["General", "OBC", "SC", "ST", "EWS", "NT", "SBC", "VJ/DT"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Nationality</label>
                <Input value={personal.nationality} onChange={e => setPersonal({ ...personal, nationality: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Height (cm)</label>
                <Input type="number" value={personal.height_cm} onChange={e => setPersonal({ ...personal, height_cm: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Weight (kg)</label>
                <Input type="number" value={personal.weight_kg} onChange={e => setPersonal({ ...personal, weight_kg: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 mt-4">
              <div>
                <label className="text-sm font-medium">Present Address</label>
                <textarea value={personal.present_address} onChange={e => setPersonal({ ...personal, present_address: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm" rows={2} />
              </div>
              <div>
                <label className="text-sm font-medium">Permanent Address</label>
                <textarea value={personal.permanent_address} onChange={e => setPersonal({ ...personal, permanent_address: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm" rows={2} />
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button onClick={savePersonal} disabled={saving}>
                {saving ? "Saving..." : "Save & Continue"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Academic Info */}
      {step === 1 && (
        <Card className="border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><GraduationCap className="w-5 h-5" /> Academic Information</CardTitle>
            <CardDescription>Enter your academic details and education history</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Department *</label>
                <select value={academic.dept_id} onChange={e => setAcademic({ ...academic, dept_id: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm bg-white">
                  <option value="">Select department</option>
                  {departments.map(d => <option key={d.dept_id} value={d.dept_id}>{d.dept_code} — {d.dept_name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Course *</label>
                <select value={academic.course_id} onChange={e => setAcademic({ ...academic, course_id: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm bg-white">
                  <option value="">Select course</option>
                  {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.course_name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">PRN</label>
                <Input value={academic.prn} onChange={e => setAcademic({ ...academic, prn: e.target.value })} placeholder="University PRN" />
              </div>
              <div>
                <label className="text-sm font-medium">Running Backlogs</label>
                <Input type="number" value={academic.running_backlogs} onChange={e => setAcademic({ ...academic, running_backlogs: parseInt(e.target.value) || 0 })} />
              </div>
              <div>
                <label className="text-sm font-medium">Total KTs</label>
                <Input type="number" value={academic.total_kt} onChange={e => setAcademic({ ...academic, total_kt: parseInt(e.target.value) || 0 })} />
              </div>
            </div>

            {/* Education Records */}
            <div>
              <h3 className="font-semibold mb-3">Education History</h3>
              {EDUCATION_TYPES.map(type => {
                const existing = educations.find(e => e.education_type === type);
                return (
                  <EducationRow
                    key={type}
                    type={type}
                    existing={existing}
                    onSave={(data) => saveEducation(data)}
                  />
                );
              })}
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
              <Button onClick={saveAcademic} disabled={saving}>
                {saving ? "Saving..." : "Save & Continue"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Documents */}
      {step === 2 && (
        <Card className="border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Upload className="w-5 h-5" /> Upload Documents</CardTitle>
            <CardDescription>Upload required documents (JPEG, PNG, or PDF, max 5MB)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {DOCUMENT_TYPES.map(docType => {
              const existing = documents.find(d => d.document_type === docType.value);
              return (
                <div key={docType.value} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-sm">{docType.label}</p>
                      {existing ? (
                        <a href={existing.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                          ✅ Uploaded — View file
                        </a>
                      ) : (
                        <p className="text-xs text-gray-400">Not uploaded</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      id={`file-${docType.value}`}
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files[0]) handleFileUpload(e.target.files[0], docType.value);
                      }}
                    />
                    <Button
                      variant={existing ? "outline" : "default"}
                      size="sm"
                      disabled={uploading}
                      onClick={() => document.getElementById(`file-${docType.value}`).click()}
                    >
                      {uploading ? "Uploading..." : existing ? "Replace" : "Upload"}
                    </Button>
                  </div>
                </div>
              );
            })}

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={() => setStep(3)}>Continue to Review</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review & Submit */}
      {step === 3 && (
        <Card className="border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Send className="w-5 h-5" /> Review & Submit</CardTitle>
            <CardDescription>Review your information before submitting for verification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Personal Summary */}
            <div>
              <h3 className="font-semibold text-sm text-gray-500 uppercase mb-2">Personal Info</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div><span className="text-gray-500">Name:</span> <span className="font-medium">{personal.full_name || "—"}</span></div>
                <div><span className="text-gray-500">Gender:</span> <span className="font-medium">{personal.gender || "—"}</span></div>
                <div><span className="text-gray-500">DOB:</span> <span className="font-medium">{personal.date_of_birth || "—"}</span></div>
                <div><span className="text-gray-500">Mobile:</span> <span className="font-medium">{personal.mobile_number || "—"}</span></div>
                <div><span className="text-gray-500">Category:</span> <span className="font-medium">{personal.category || "—"}</span></div>
                <div><span className="text-gray-500">Blood Group:</span> <span className="font-medium">{personal.blood_group || "—"}</span></div>
              </div>
            </div>

            {/* Academic Summary */}
            <div>
              <h3 className="font-semibold text-sm text-gray-500 uppercase mb-2">Academic Info</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div><span className="text-gray-500">Department:</span> <span className="font-medium">{departments.find(d => d.dept_id == academic.dept_id)?.dept_name || "—"}</span></div>
                <div><span className="text-gray-500">Course:</span> <span className="font-medium">{courses.find(c => c.course_id == academic.course_id)?.course_name || "—"}</span></div>
                <div><span className="text-gray-500">PRN:</span> <span className="font-medium">{academic.prn || "—"}</span></div>
                <div><span className="text-gray-500">Backlogs:</span> <span className="font-medium">{academic.running_backlogs}</span></div>
                <div><span className="text-gray-500">Total KTs:</span> <span className="font-medium">{academic.total_kt}</span></div>
              </div>
            </div>

            {/* Education Summary */}
            <div>
              <h3 className="font-semibold text-sm text-gray-500 uppercase mb-2">Education ({educations.length} records)</h3>
              {educations.length === 0 ? (
                <p className="text-sm text-gray-400">No education records added</p>
              ) : (
                <div className="space-y-1">
                  {educations.map(e => (
                    <p key={e.education_id} className="text-sm">
                      <span className="font-mono bg-gray-100 px-1 rounded">{e.education_type}</span> — {e.institution_name || "N/A"} — {e.percentage ? `${e.percentage}%` : e.cgpa ? `CGPA: ${e.cgpa}` : ""}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Documents Summary */}
            <div>
              <h3 className="font-semibold text-sm text-gray-500 uppercase mb-2">Documents ({documents.length} uploaded)</h3>
              {documents.length === 0 ? (
                <p className="text-sm text-yellow-600">⚠ No documents uploaded. Please go back and upload at least one.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {documents.map(d => (
                    <span key={d.document_id} className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-md">
                      ✅ {d.document_type}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={handleSubmitVerification} disabled={saving} className="bg-green-600 hover:bg-green-700">
                {saving ? "Submitting..." : "Submit for Verification"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Sub-component for education row
function EducationRow({ type, existing, onSave }) {
  const [expanded, setExpanded] = useState(false);
  const [form, setForm] = useState({
    education_type: type,
    institution_name: existing?.institution_name || "",
    board_or_university: existing?.board_or_university || "",
    course_name: existing?.course_name || "",
    program: existing?.program || "",
    stream: existing?.stream || "",
    passing_year: existing?.passing_year || "",
    percentage: existing?.percentage || "",
    cgpa: existing?.cgpa || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const success = await onSave(form);
    setSaving(false);
    if (success) setExpanded(false);
  };

  return (
    <div className="border rounded-lg mb-3">
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{type}</span>
          {existing && <CheckCircle2 className="w-4 h-4 text-green-500" />}
        </div>
        <span className="text-sm text-gray-400">{expanded ? "▲" : "▼"}</span>
      </div>

      {expanded && (
        <div className="p-3 pt-0 border-t">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            <div>
              <label className="text-xs font-medium">Institution</label>
              <Input value={form.institution_name} onChange={e => setForm({ ...form, institution_name: e.target.value })} placeholder="School / College name" />
            </div>
            <div>
              <label className="text-xs font-medium">Board / University</label>
              <Input value={form.board_or_university} onChange={e => setForm({ ...form, board_or_university: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium">Passing Year</label>
              <Input type="number" value={form.passing_year} onChange={e => setForm({ ...form, passing_year: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium">Percentage</label>
              <Input type="number" step="0.01" value={form.percentage} onChange={e => setForm({ ...form, percentage: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium">CGPA</label>
              <Input type="number" step="0.01" value={form.cgpa} onChange={e => setForm({ ...form, cgpa: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium">Stream</label>
              <Input value={form.stream} onChange={e => setForm({ ...form, stream: e.target.value })} placeholder="e.g. Science, Commerce" />
            </div>
          </div>
          <div className="flex justify-end mt-3">
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
