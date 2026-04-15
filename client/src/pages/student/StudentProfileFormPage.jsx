import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/Card";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { CheckCircle2, Upload, User, GraduationCap, FileText, Send } from "lucide-react";
import { API_BASE_URL } from '../../constants/api';

const API_BASE = `${API_BASE_URL}/api/v1/student-profile`;

const STEPS = ["Personal Info", "Academic Info", "Documents", "Review & Submit"];

const DOCUMENT_TYPES = [
  { value: "Aadhaar", label: "Aadhaar Card" },
  { value: "SSC_Marksheet", label: "SSC Marksheet" },
  { value: "HSC_Marksheet", label: "HSC Marksheet" },
  { value: "Diploma_Marksheet", label: "Diploma Marksheet" },
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

  // Personal info
  const [personal, setPersonal] = useState({
    full_name: "", gender: "", marital_status: "", date_of_birth: "",
    mobile_number: "", parent_mobile_number: "", blood_group: "",
    category: "", nationality: "Indian", height_cm: "", weight_kg: "",
    present_address: "", permanent_address: "",
  });

  // Academic / UG info
  const [academic, setAcademic] = useState({
    dept_id: "", prn: "", course_id: "", running_backlogs: 0, total_kt: 0, cgpa: "",
  });

  const [departmentCourses, setDepartmentCourses] = useState([]);

  // Education records
  const [educations, setEducations] = useState([]);

  // HSC or Diploma path selection: "HSC" | "Diploma" | ""
  const [educationPath, setEducationPath] = useState("");

  // Documents
  const [documents, setDocuments] = useState([]);
  const [uploadingType, setUploadingType] = useState("");

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (academic.dept_id) {
      fetch(`${API_BASE_URL}/api/v1/courses?dept_id=${academic.dept_id}`, { headers })
        .then(res => res.ok ? res.json() : [])
        .then(data => setDepartmentCourses(data))
        .catch(err => console.error(err));
    } else {
      setDepartmentCourses([]);
    }
  }, [academic.dept_id]);

  const loadData = async () => {
    try {
      const [profileRes, deptRes] = await Promise.all([
        fetch(`${API_BASE}/profile`, { headers }),
        fetch(`${API_BASE_URL}/api/v1/departments`, { headers }),
      ]);

      if (deptRes.ok) setDepartments(await deptRes.json());

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
          prn: data.prn || "",
          course_id: data.course_id || "",
          running_backlogs: data.running_backlogs || 0,
          total_kt: data.total_kt || 0,
          cgpa: data.cgpa || "",
        });

        if (data.StudentEducations) {
          setEducations(data.StudentEducations);
          // Determine the education path from existing records
          const hasDiploma = data.StudentEducations.some(e => e.education_type === "Diploma");
          const hasHSC = data.StudentEducations.some(e => e.education_type === "HSC");
          if (hasDiploma) setEducationPath("Diploma");
          else if (hasHSC) setEducationPath("HSC");
        }
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
    // Validate phone numbers (exactly 10 digits)
    if (personal.mobile_number && !/^\d{10}$/.test(personal.mobile_number)) {
      setError("Mobile number must be exactly 10 digits");
      setSaving(false);
      return;
    }
    if (personal.parent_mobile_number && !/^\d{10}$/.test(personal.parent_mobile_number)) {
      setError("Parent mobile number must be exactly 10 digits");
      setSaving(false);
      return;
    }
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
    // Validate PRN (exactly 10 digits)
    if (academic.prn && !/^\d{10}$/.test(academic.prn)) {
      setError("PRN must be exactly 10 digits");
      setSaving(false);
      return;
    }
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
    setUploadingType(document_type); setError("");
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
    finally { setUploadingType(""); }
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
            <CardDescription>Enter your undergraduate and education history details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">

            {/* ──────────── UG Information ──────────── */}
            <div>
              <h3 className="font-semibold text-base mb-4 pb-2 border-b">Undergraduate (UG) Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">PRN *</label>
                  <Input value={academic.prn} onChange={e => setAcademic({ ...academic, prn: e.target.value })} placeholder="University PRN" />
                </div>
                <div>
                  <label className="text-sm font-medium">Department *</label>
                  <select 
                    value={academic.dept_id} 
                    onChange={e => setAcademic({ ...academic, dept_id: e.target.value, course_id: "" })}
                    className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                  >
                    <option value="">Select department</option>
                    {departments.map(d => <option key={d.dept_id} value={d.dept_id}>{d.dept_code} — {d.dept_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Course *</label>
                  <select 
                    value={academic.course_id} 
                    onChange={e => setAcademic({ ...academic, course_id: e.target.value })}
                    className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                    disabled={!academic.dept_id || departmentCourses.length === 0}
                  >
                    <option value="">Select course</option>
                    {departmentCourses.map(c => <option key={c.course_id} value={c.course_id}>{c.course_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Total KT</label>
                  <Input type="number" value={academic.total_kt} onChange={e => setAcademic({ ...academic, total_kt: parseInt(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Running Backlogs</label>
                  <Input type="number" value={academic.running_backlogs} onChange={e => setAcademic({ ...academic, running_backlogs: parseInt(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className="text-sm font-medium">CGPA</label>
                  <Input type="number" step="0.01" value={academic.cgpa} onChange={e => setAcademic({ ...academic, cgpa: e.target.value })} placeholder="e.g. 8.5" />
                </div>
              </div>
            </div>

            {/* ──────────── SSC Information ──────────── */}
            <div>
              <h3 className="font-semibold text-base mb-4 pb-2 border-b">SSC Information</h3>
              <EducationSection
                type="SSC"
                existing={educations.find(e => e.education_type === "SSC")}
                onSave={saveEducation}
              />
            </div>

            {/* ──────────── HSC / Diploma Toggle ──────────── */}
            <div>
              <h3 className="font-semibold text-base mb-3 pb-2 border-b">After SSC</h3>
              <div className="flex items-center gap-6 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="educationPath"
                    value="HSC"
                    checked={educationPath === "HSC"}
                    onChange={() => setEducationPath("HSC")}
                    disabled={educations.some(e => e.education_type === "Diploma")}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-medium">HSC (12th Standard)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="educationPath"
                    value="Diploma"
                    checked={educationPath === "Diploma"}
                    onChange={() => setEducationPath("Diploma")}
                    disabled={educations.some(e => e.education_type === "HSC")}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-medium">Diploma</span>
                </label>
              </div>

              {educationPath === "" && (
                <p className="text-sm text-gray-400 italic">Please select whether you completed HSC or Diploma after SSC.</p>
              )}

              {educationPath === "HSC" && (
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-3">HSC Information</h4>
                  <EducationSection
                    type="HSC"
                    existing={educations.find(e => e.education_type === "HSC")}
                    onSave={saveEducation}
                  />
                </div>
              )}

              {educationPath === "Diploma" && (
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-3">Diploma Information</h4>
                  <EducationSection
                    type="Diploma"
                    existing={educations.find(e => e.education_type === "Diploma")}
                    onSave={saveEducation}
                  />
                </div>
              )}
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
            {DOCUMENT_TYPES.filter(dt => {
              // If student chose HSC, don't show Diploma marksheet upload and vice versa
              if (dt.value === "Diploma_Marksheet" && educationPath !== "Diploma") return false;
              if (dt.value === "HSC_Marksheet" && educationPath !== "HSC") return false;
              return true;
            }).map(docType => {
              const existing = documents.find(d => d.document_type === docType.value);
              return (
                <div key={docType.value} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-sm">{docType.label}</p>
                      {existing ? (
                        <p className="text-xs text-green-600">✅ Uploaded</p>
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
                      disabled={uploadingType !== ""}
                      onClick={() => document.getElementById(`file-${docType.value}`).click()}
                    >
                      {uploadingType === docType.value ? "Uploading..." : existing ? "Replace" : "Upload"}
                    </Button>
                  </div>
                </div>
              );
            })}

            {/* Missing documents warning */}
            {(() => {
              const requiredTypes = DOCUMENT_TYPES
                .filter(dt => {
                  // If student chose HSC, don't require Diploma marksheet and vice versa
                  if (dt.value === "Diploma_Marksheet" && educationPath !== "Diploma") return false;
                  if (dt.value === "HSC_Marksheet" && educationPath !== "HSC") return false;
                  return true;
                })
                .map(dt => dt.value);
              const uploadedTypes = documents.map(d => d.document_type);
              const missing = requiredTypes.filter(t => !uploadedTypes.includes(t));
              if (missing.length > 0) {
                return (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-md text-sm">
                    ⚠ Please upload all required documents before proceeding. Missing: {missing.length} document(s).
                  </div>
                );
              }
              return null;
            })()}

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button
                onClick={() => setStep(3)}
                disabled={(() => {
                  const requiredTypes = DOCUMENT_TYPES
                    .filter(dt => {
                      if (dt.value === "Diploma_Marksheet" && educationPath !== "Diploma") return false;
                      if (dt.value === "HSC_Marksheet" && educationPath !== "HSC") return false;
                      return true;
                    })
                    .map(dt => dt.value);
                  const uploadedTypes = documents.map(d => d.document_type);
                  return requiredTypes.some(t => !uploadedTypes.includes(t));
                })()}
              >
                Continue to Review
              </Button>
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

            {/* UG Academic Summary */}
            <div>
              <h3 className="font-semibold text-sm text-gray-500 uppercase mb-2">Undergraduate Info</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div><span className="text-gray-500">PRN:</span> <span className="font-medium">{academic.prn || "—"}</span></div>
                <div><span className="text-gray-500">Department:</span> <span className="font-medium">{departments.find(d => d.dept_id == academic.dept_id)?.dept_name || "—"}</span></div>
                <div><span className="text-gray-500">Course:</span> <span className="font-medium">{departmentCourses.find(c => c.course_id == academic.course_id)?.course_name || "—"}</span></div>
                <div><span className="text-gray-500">Total KT:</span> <span className="font-medium">{academic.total_kt}</span></div>
                <div><span className="text-gray-500">Backlogs:</span> <span className="font-medium">{academic.running_backlogs}</span></div>
                <div><span className="text-gray-500">CGPA:</span> <span className="font-medium">{academic.cgpa || "—"}</span></div>
              </div>
            </div>

            {/* Education Summary */}
            <div>
              <h3 className="font-semibold text-sm text-gray-500 uppercase mb-2">Education ({educations.length} records)</h3>
              {educations.length === 0 ? (
                <p className="text-sm text-gray-400">No education records added</p>
              ) : (
                <div className="space-y-2">
                  {educations.map(e => (
                    <div key={e.education_id} className="p-3 bg-gray-50 rounded-lg text-sm">
                      <span className="font-mono bg-gray-200 px-2 py-0.5 rounded text-xs font-semibold">{e.education_type}</span>
                      <span className="ml-2">{e.institution_name || "N/A"}</span>
                      {e.board_or_university && <span className="text-gray-500"> • {e.board_or_university}</span>}
                      {e.passing_year && <span className="text-gray-500"> • {e.passing_year}</span>}
                      {e.percentage ? <span className="text-gray-500"> • {e.percentage}%</span> : null}
                      {e.cgpa ? <span className="text-gray-500"> • CGPA: {e.cgpa}</span> : null}
                      {e.stream ? <span className="text-gray-500"> • {e.stream}</span> : null}
                      {e.course_name ? <span className="text-gray-500"> • {e.course_name}</span> : null}
                    </div>
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

// ─────────────────────────────────────────────────────────────
// Education Section component — renders the correct fields
// based on type: SSC, HSC, or Diploma
// ─────────────────────────────────────────────────────────────
function EducationSection({ type, existing, onSave }) {
  const getInitialForm = () => ({
    education_type: type,
    institution_name: existing?.institution_name || "",
    board_or_university: existing?.board_or_university || "",
    course_name: existing?.course_name || "",
    stream: existing?.stream || "",
    passing_year: existing?.passing_year || "",
    percentage: existing?.percentage || "",
    cgpa: existing?.cgpa || "",
  });

  const [form, setForm] = useState(getInitialForm);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const success = await onSave(form);
    setSaving(false);
  };

  // SSC: Passing year, School name, Board name, Percentage or CGPA
  if (type === "SSC") {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium">School Name *</label>
            <Input value={form.institution_name} onChange={e => setForm({ ...form, institution_name: e.target.value })} placeholder="School name" />
          </div>
          <div>
            <label className="text-xs font-medium">Board Name *</label>
            <Input value={form.board_or_university} onChange={e => setForm({ ...form, board_or_university: e.target.value })} placeholder="e.g. CBSE, State Board" />
          </div>
          <div>
            <label className="text-xs font-medium">Passing Year *</label>
            <Input type="number" value={form.passing_year} onChange={e => setForm({ ...form, passing_year: e.target.value })} placeholder="e.g. 2019" />
          </div>
          <div>
            <label className="text-xs font-medium">Percentage</label>
            <Input type="number" step="0.01" value={form.percentage} onChange={e => setForm({ ...form, percentage: e.target.value })} placeholder="e.g. 85.5" />
          </div>
          <div>
            <label className="text-xs font-medium">CGPA</label>
            <Input type="number" step="0.01" value={form.cgpa} onChange={e => setForm({ ...form, cgpa: e.target.value })} placeholder="e.g. 9.2" />
          </div>
        </div>
        <div className="flex justify-end">
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : existing ? "Update" : "Save"}
          </Button>
        </div>
        {existing && (
          <p className="text-xs text-green-600 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Saved
          </p>
        )}
      </div>
    );
  }

  // HSC: Passing year, School name, Board name, Stream, Percentage
  if (type === "HSC") {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium">School Name *</label>
            <Input value={form.institution_name} onChange={e => setForm({ ...form, institution_name: e.target.value })} placeholder="School name" />
          </div>
          <div>
            <label className="text-xs font-medium">Board Name *</label>
            <Input value={form.board_or_university} onChange={e => setForm({ ...form, board_or_university: e.target.value })} placeholder="e.g. CBSE, State Board" />
          </div>
          <div>
            <label className="text-xs font-medium">Passing Year *</label>
            <Input type="number" value={form.passing_year} onChange={e => setForm({ ...form, passing_year: e.target.value })} placeholder="e.g. 2021" />
          </div>
          <div>
            <label className="text-xs font-medium">Stream *</label>
            <Input value={form.stream} onChange={e => setForm({ ...form, stream: e.target.value })} placeholder="e.g. Science, Commerce, Arts" />
          </div>
          <div>
            <label className="text-xs font-medium">Percentage *</label>
            <Input type="number" step="0.01" value={form.percentage} onChange={e => setForm({ ...form, percentage: e.target.value })} placeholder="e.g. 78.5" />
          </div>
        </div>
        <div className="flex justify-end">
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : existing ? "Update" : "Save"}
          </Button>
        </div>
        {existing && (
          <p className="text-xs text-green-600 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Saved
          </p>
        )}
      </div>
    );
  }

  // Diploma: Passing year, College name, Course name, Percentage, CGPA
  if (type === "Diploma") {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium">College Name *</label>
            <Input value={form.institution_name} onChange={e => setForm({ ...form, institution_name: e.target.value })} placeholder="College name" />
          </div>
          <div>
            <label className="text-xs font-medium">Course Name *</label>
            <Input value={form.course_name} onChange={e => setForm({ ...form, course_name: e.target.value })} placeholder="e.g. Mechanical Engineering" />
          </div>
          <div>
            <label className="text-xs font-medium">Passing Year *</label>
            <Input type="number" value={form.passing_year} onChange={e => setForm({ ...form, passing_year: e.target.value })} placeholder="e.g. 2022" />
          </div>
          <div>
            <label className="text-xs font-medium">Percentage</label>
            <Input type="number" step="0.01" value={form.percentage} onChange={e => setForm({ ...form, percentage: e.target.value })} placeholder="e.g. 72.5" />
          </div>
          <div>
            <label className="text-xs font-medium">CGPA</label>
            <Input type="number" step="0.01" value={form.cgpa} onChange={e => setForm({ ...form, cgpa: e.target.value })} placeholder="e.g. 7.8" />
          </div>
        </div>
        <div className="flex justify-end">
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : existing ? "Update" : "Save"}
          </Button>
        </div>
        {existing && (
          <p className="text-xs text-green-600 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Saved
          </p>
        )}
      </div>
    );
  }

  return null;
}






