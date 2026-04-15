import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../Card";
import { Button } from "../Button";
import { Input } from "../Input";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { API_BASE_URL } from '../../constants/api';

const createDocumentInput = () => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  file: null,
});

export default function CreateDriveForm({
  onCancel,
  onSuccess,
  initialData,
  apiBase = `${API_BASE_URL}/api/v1/tpo`,
  fixedDepartmentId = null,
  fixedDepartmentLabel = "",
  submitLabel = "",
  activePlacementSeason = null,
}) {
  const [formData, setFormData] = useState({
    company_id: "",
    role_title: "",
    role_description: "",
    offer_type: "Placement",
    package_lpa: "",
    stipend_pm: "",
    has_bond: false,
    bond_months: "",
    has_security_deposit: false,
    security_deposit_amount: "",
    deadline: "",
    allowed_departments: [],
    allowed_courses: [],
  });

  const [eligibility, setEligibility] = useState({
    min_cgpa: "",
    max_backlogs: "",
    min_10th_percent: "",
    min_12th_percent: "",
    gender: "Any",
    passing_year: "",
  });

  const [dynamicFields, setDynamicFields] = useState([]);
  const [driveDocumentInputs, setDriveDocumentInputs] = useState([]);
  const [existingDriveDocuments, setExistingDriveDocuments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Options fetched from backend (mocked here if endpoints don't exist yet, but we will try fetching)
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [fetchedSeason, setFetchedSeason] = useState(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        
        const [depRes, crsRes, compRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/departments`, { headers }),
          fetch(`${API_BASE_URL}/api/v1/courses`, { headers }),
          fetch(`${apiBase}/companies`, { headers })
        ]);

        if (depRes.ok) setDepartments(await depRes.json());
        if (crsRes.ok) setCourses(await crsRes.json());
        
        let fetchedComps = [];
        if (compRes.ok) {
          fetchedComps = await compRes.json();
          setCompanies(fetchedComps);
        }

        if (initialData) {
          const driveId = initialData.drive_id || initialData.id;
          const driveRes = await fetch(`${apiBase}/drive/${driveId}`, { headers });
          if (driveRes.ok) {
            const driveData = await driveRes.json();
            
            setFormData({
              company_id: driveData.company_id || "",
              role_title: driveData.role_title || "",
              role_description: driveData.role_description || "",
              offer_type: driveData.offer_type || "Placement",
              package_lpa: driveData.package_lpa || "",
              stipend_pm: driveData.stipend_pm || "",
              has_bond: driveData.has_bond || false,
              bond_months: driveData.bond_months || "",
              has_security_deposit: driveData.has_security_deposit || false,
              security_deposit_amount: driveData.security_deposit_amount || "",
              deadline: driveData.deadline ? driveData.deadline.split("T")[0] : "",
              allowed_departments: driveData.DriveAllowedDepartments?.map(d => d.dept_id) || [],
              allowed_courses: driveData.DriveAllowedCourses?.map(c => c.course_id) || [],
            });

            if (driveData.DriveEligibility) {
              setEligibility({
                min_cgpa: driveData.DriveEligibility.min_cgpa || "",
                max_backlogs: driveData.DriveEligibility.max_backlogs || "",
                min_10th_percent: driveData.DriveEligibility.min_10th_percent || "",
                min_12th_percent: driveData.DriveEligibility.min_12th_percent || "",
                gender: driveData.DriveEligibility.gender || "Any",
                passing_year: driveData.DriveEligibility.passing_year || "",
              });
            }

            if (driveData.DynamicFormFields) {
              setDynamicFields(driveData.DynamicFormFields.map(f => ({
                label: f.field_label,
                type: f.field_type,
                required: f.is_required,
                order: f.field_order
              })));
            }

            setExistingDriveDocuments(driveData.DriveDocuments || []);
            setDriveDocumentInputs([]);
          }
        } else if (fetchedComps.length > 0) {
          setFormData(prev => ({
            ...prev,
            company_id: fetchedComps[0].company_id,
            allowed_departments: fixedDepartmentId ? [fixedDepartmentId] : prev.allowed_departments,
          }));
          setExistingDriveDocuments([]);
          setDriveDocumentInputs([]);
        }
      } catch (err) {
        console.error("Failed to fetch metadata or drive data", err);
      }
    };
    fetchMetadata();
  }, [initialData, apiBase, fixedDepartmentId]);

  useEffect(() => {
    if (!fixedDepartmentId) return;

    setFormData((prev) => {
      if (
        prev.allowed_departments.length === 1 &&
        prev.allowed_departments[0] === fixedDepartmentId
      ) {
        return prev;
      }

      return {
        ...prev,
        allowed_departments: [fixedDepartmentId],
      };
    });
  }, [fixedDepartmentId]);

  useEffect(() => {
    setFormData((prev) => {
      const visibleCourseIds = new Set(
        courses
          .filter((course) => prev.allowed_departments.includes(course.dept_id))
          .map((course) => course.course_id)
      );

      const nextAllowedCourses = prev.allowed_courses.filter((courseId) =>
        visibleCourseIds.has(courseId)
      );

      if (nextAllowedCourses.length === prev.allowed_courses.length) {
        return prev;
      }

      return { ...prev, allowed_courses: nextAllowedCourses };
    });
  }, [courses, formData.allowed_departments]);

  const handleToggleArray = (arrayName, id) => {
    setFormData((prev) => {
      const arr = prev[arrayName];
      if (arr.includes(id)) {
        return { ...prev, [arrayName]: arr.filter(i => i !== id) };
      } else {
        return { ...prev, [arrayName]: [...arr, id] };
      }
    });
  };

  const getDepartmentCode = (deptId) =>
    departments.find((department) => department.dept_id === deptId)?.dept_code || "Unknown";

  const visibleCourses = courses
    .filter((course) => formData.allowed_departments.includes(course.dept_id))
    .sort((a, b) => {
      const nameCompare = a.course_name.localeCompare(b.course_name);
      if (nameCompare !== 0) return nameCompare;
      return getDepartmentCode(a.dept_id).localeCompare(getDepartmentCode(b.dept_id));
    });

  const getCourseLabel = (course) => `${course.course_name} (${getDepartmentCode(course.dept_id)})`;

  const addDynamicField = () => {
    setDynamicFields([...dynamicFields, { label: "", type: "TEXT", required: false, order: dynamicFields.length + 1 }]);
  };

  const addDriveDocumentInput = () => {
    setDriveDocumentInputs((prev) => [...prev, createDocumentInput()]);
  };

  const updateDriveDocumentInput = (id, file) => {
    setDriveDocumentInputs((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, file } : entry))
    );
  };

  const removeDriveDocumentInput = (id) => {
    setDriveDocumentInputs((prev) => prev.filter((entry) => entry.id !== id));
  };

  const uploadDriveDocuments = async (driveId, token, files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("documents", file);
    });

    const response = await fetch(`${apiBase}/drive/${driveId}/documents`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to upload job description PDFs");
    }

    return data.documents || [];
  };

  const updateDynamicField = (index, key, value) => {
    const updated = [...dynamicFields];
    updated[index][key] = value;
    setDynamicFields(updated);
  };

  const removeDynamicField = (index) => {
    const updated = dynamicFields.filter((_, i) => i !== index);
    setDynamicFields(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const selectedDriveDocuments = driveDocumentInputs
        .map((entry) => entry.file)
        .filter(Boolean);
      
      const validAllowedCourses = formData.allowed_courses.filter((id) =>
        visibleCourses.some((course) => course.course_id === id)
      );

      const payload = {
        ...formData,
        package_lpa: parseFloat(formData.package_lpa) || 0,
        company_id: parseInt(formData.company_id) || null,
        stipend_pm: formData.offer_type !== "Placement" ? formData.stipend_pm : null,
        has_bond: formData.has_bond,
        bond_months: formData.has_bond ? (parseInt(formData.bond_months) || null) : null,
        has_security_deposit: formData.has_security_deposit,
        security_deposit_amount: formData.has_security_deposit ? formData.security_deposit_amount : null,
        allowed_departments: fixedDepartmentId
          ? [fixedDepartmentId]
          : formData.allowed_departments,
        allowed_courses: validAllowedCourses,
        eligibility: {
          min_cgpa: parseFloat(eligibility.min_cgpa) || null,
          max_backlogs: parseInt(eligibility.max_backlogs) || 0,
          min_10th_percent: parseFloat(eligibility.min_10th_percent) || null,
          min_12th_percent: parseFloat(eligibility.min_12th_percent) || null,
          gender: eligibility.gender,
          passing_year: parseInt(eligibility.passing_year) || null,
        },
        dynamic_form_fields: dynamicFields
      };

      const method = initialData ? "PUT" : "POST";
      const url = initialData 
        ? `${apiBase}/drive/${initialData.drive_id || initialData.id}` 
        : `${apiBase}/drive`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create drive");

      const savedDrive = data.drive;

      if (selectedDriveDocuments.length > 0) {
        try {
          await uploadDriveDocuments(savedDrive.drive_id || savedDrive.id, token, selectedDriveDocuments);
        } catch (uploadError) {
          window.alert(
            `${initialData ? "Drive updated" : "Drive created"}, but the job description PDFs could not be uploaded. You can edit the drive and retry.\n\n${uploadError.message}`
          );
        }
      }
      
      onSuccess(savedDrive);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{initialData ? "Edit Job Drive" : "Create New Job Drive"}</h2>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Core Settings */}
        <Card className="border-0 bg-card">
          <CardHeader><CardTitle>Job Details</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Company *</label>
              <select 
                className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                required
                value={formData.company_id}
                onChange={e => setFormData({...formData, company_id: e.target.value})}
              >
                <option value="">Select a Company</option>
                {companies.map(comp => (
                  <option key={comp.company_id} value={comp.company_id}>
                    {comp.company_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Role Title *</label>
                <Input 
                  required 
                  value={formData.role_title} 
                  onChange={e => setFormData({...formData, role_title: e.target.value})} 
                  placeholder="e.g. Software Engineer" 
                />
              </div>
              <div>
                <label className="text-sm font-medium">Role Description</label>
                <textarea 
                  className="w-full border rounded-md px-3 py-2 text-sm bg-white h-10"
                  value={formData.role_description} 
                  onChange={e => setFormData({...formData, role_description: e.target.value})} 
                  placeholder="Short description..." 
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Offer Type *</label>
              <select 
                className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                value={formData.offer_type}
                onChange={e => setFormData({...formData, offer_type: e.target.value})}
              >
                <option value="Placement">Placement</option>
                <option value="Internship">Internship</option>
                <option value="Internship+PPO">Internship+PPO</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Package (LPA)</label>
              <Input 
                type="number" step="0.01" 
                value={formData.package_lpa} 
                onChange={e => setFormData({...formData, package_lpa: e.target.value})} 
                placeholder="e.g. 12.5" 
              />
            </div>

            {formData.offer_type !== "Placement" && (
              <div>
                <label className="text-sm font-medium">Stipend (Per Month)</label>
                <Input 
                  value={formData.stipend_pm} 
                  onChange={e => setFormData({...formData, stipend_pm: e.target.value})} 
                  placeholder="e.g. 25000 or 25K" 
                />
              </div>
            )}

            <div className="md:col-span-2 border-t pt-4 mt-2">
              <h4 className="text-sm font-semibold mb-3">Additional Contract Details</h4>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Bond */}
                <div className="space-y-3 p-3 border rounded-lg bg-gray-50/50">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <input 
                      type="checkbox" 
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                      checked={formData.has_bond}
                      onChange={e => setFormData({...formData, has_bond: e.target.checked})}
                    />
                    Requires Service Bond / Agreement
                  </label>
                  {formData.has_bond && (
                    <div className="pl-6 transition-all duration-200">
                      <label className="text-xs font-medium text-gray-500 block mb-1">Duration (Months) *</label>
                      <Input 
                        type="number" 
                        min="1"
                        value={formData.bond_months} 
                        onChange={e => setFormData({...formData, bond_months: e.target.value})} 
                        placeholder="e.g. 24" 
                        required={formData.has_bond}
                        className="bg-white"
                      />
                    </div>
                  )}
                </div>
                
                {/* Security Deposit */}
                <div className="space-y-3 p-3 border rounded-lg bg-gray-50/50">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <input 
                      type="checkbox" 
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                      checked={formData.has_security_deposit}
                      onChange={e => setFormData({...formData, has_security_deposit: e.target.checked})}
                    />
                    Requires Security Cheque / Deposit
                  </label>
                  {formData.has_security_deposit && (
                    <div className="pl-6 transition-all duration-200">
                      <label className="text-xs font-medium text-gray-500 block mb-1">Amount / Details *</label>
                      <Input 
                        value={formData.security_deposit_amount} 
                        onChange={e => setFormData({...formData, security_deposit_amount: e.target.value})} 
                        placeholder="e.g. Rs 1,00,000 or Blank Cheque" 
                        required={formData.has_security_deposit}
                        className="bg-white"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Placement Season</label>
              <div className="w-full border rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-500 font-medium">
                {activePlacementSeason || fetchedSeason || "Set automatically"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Based on active department season.</p>
            </div>
            <div>
              <label className="text-sm font-medium">Deadline *</label>
              <Input 
                type="date" 
                required 
                min={new Date().toISOString().split("T")[0]}
                value={formData.deadline} 
                onChange={e => setFormData({...formData, deadline: e.target.value})} 
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card">
          <CardHeader>
            <div className="flex justify-between items-center gap-3">
              <CardTitle>Job Description PDFs</CardTitle>
              <Button type="button" size="sm" variant="outline" onClick={addDriveDocumentInput} className="gap-2">
                <Plus className="w-4 h-4" /> Add PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">
              Optional. Upload one or more company-shared job description PDFs for this drive.
            </p>

            {existingDriveDocuments.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Uploaded PDFs</p>
                <div className="flex flex-wrap gap-2">
                  {existingDriveDocuments.map((document) => (
                    <a
                      key={document.document_id}
                      href={document.view_url || document.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-primary hover:bg-primary/10"
                    >
                      <span>{document.file_name}</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {driveDocumentInputs.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No new PDFs selected.</p>
            ) : (
              <div className="space-y-3">
                {driveDocumentInputs.map((entry, index) => (
                  <div key={entry.id} className="rounded-lg border p-3 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">PDF {index + 1}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDriveDocumentInput(entry.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      className="w-full border rounded-md px-3 py-2 text-sm bg-white file:mr-3 file:rounded file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-primary"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        if (file && file.type !== "application/pdf") {
                          setError("Only PDF files can be uploaded as job descriptions");
                          e.target.value = "";
                          return;
                        }
                        setError("");
                        updateDriveDocumentInput(entry.id, file);
                      }}
                    />
                    <p className="text-xs text-gray-500">
                      {entry.file ? `Selected: ${entry.file.name}` : "No file selected yet"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Audience */}
        <Card className="border-0 bg-card">
          <CardHeader><CardTitle>Target Audience</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium block mb-2">Allowed Departments *</label>
              {fixedDepartmentId ? (
                <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                  This drive will be created only for{" "}
                  <span className="font-semibold">
                    {fixedDepartmentLabel ||
                      departments.find((d) => d.dept_id === fixedDepartmentId)?.dept_name ||
                      "your department"}
                  </span>
                  .
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                  {departments.map(d => (
                    <label key={d.dept_id} className="flex items-center gap-2 text-sm">
                      <input 
                        type="checkbox" 
                        className="rounded"
                        checked={formData.allowed_departments.includes(d.dept_id)}
                        onChange={() => handleToggleArray("allowed_departments", d.dept_id)}
                      />
                      {d.dept_code} - {d.dept_name}
                    </label>
                  ))}
                  {departments.length === 0 && <span className="text-gray-400 text-sm">No departments loaded</span>}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Allowed Courses * <span className="text-xs font-normal text-gray-500">(Mapped to selected departments)</span></label>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                {visibleCourses.map(c => (
                  <label key={c.course_id} className="flex items-center gap-2 text-sm">
                    <input 
                      type="checkbox" 
                      className="rounded"
                      checked={formData.allowed_courses.includes(c.course_id)}
                      onChange={() => handleToggleArray("allowed_courses", c.course_id)}
                    />
                    {getCourseLabel(c)}
                  </label>
                ))}
                {formData.allowed_departments.length === 0 && <span className="text-gray-400 text-sm italic col-span-2">Select a department first</span>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Eligibility */}
        <Card className="border-0 bg-card">
          <CardHeader><CardTitle>Eligibility Criteria</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Min CGPA</label>
              <Input 
                type="number" step="0.01" 
                value={eligibility.min_cgpa} 
                onChange={e => setEligibility({...eligibility, min_cgpa: e.target.value})} 
              />
            </div>
            <div>
              <label className="text-sm font-medium">Max Backlogs</label>
              <Input 
                type="number" 
                value={eligibility.max_backlogs} 
                onChange={e => setEligibility({...eligibility, max_backlogs: e.target.value})} 
              />
            </div>
            <div>
              <label className="text-sm font-medium">Passing Year</label>
              <Input 
                type="number" 
                value={eligibility.passing_year} 
                onChange={e => setEligibility({...eligibility, passing_year: e.target.value})} 
                placeholder="2026"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Min 10th %</label>
              <Input 
                type="number" step="0.01" 
                value={eligibility.min_10th_percent} 
                onChange={e => setEligibility({...eligibility, min_10th_percent: e.target.value})} 
              />
            </div>
            <div>
              <label className="text-sm font-medium">Min 12th / Diploma %</label>
              <Input 
                type="number" step="0.01" 
                value={eligibility.min_12th_percent} 
                onChange={e => setEligibility({...eligibility, min_12th_percent: e.target.value})} 
              />
            </div>
            <div>
              <label className="text-sm font-medium">Gender Allowed</label>
              <select 
                className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                value={eligibility.gender}
                onChange={e => setEligibility({...eligibility, gender: e.target.value})}
              >
                <option value="Any">Any</option>
                <option value="Male">Male only</option>
                <option value="Female">Female only</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Form Builder */}
        <Card className="border-0 bg-card">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Application Form Builder</CardTitle>
              <Button type="button" size="sm" variant="outline" onClick={addDynamicField} className="gap-2">
                <Plus className="w-4 h-4" /> Add Field
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {dynamicFields.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No custom fields added. Students will apply with just their base profile.</p>
            ) : (
              <div className="space-y-3">
                {dynamicFields.map((field, index) => (
                  <div key={index} className="flex flex-wrap md:flex-nowrap gap-3 items-end p-3 border rounded-lg bg-gray-50/50">
                    <div className="flex-1">
                      <label className="text-xs font-medium text-gray-500">Field Label</label>
                      <Input 
                        value={field.label} 
                        onChange={e => updateDynamicField(index, "label", e.target.value)} 
                        placeholder="e.g. GitHub URL, Cover Letter"
                        required
                      />
                    </div>
                    <div className="w-full md:w-48">
                      <label className="text-xs font-medium text-gray-500">Response Type</label>
                      <select 
                        className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                        value={field.type}
                        onChange={e => updateDynamicField(index, "type", e.target.value)}
                      >
                        <option value="TEXT">Text</option>
                        <option value="NUMBER">Number</option>
                        <option value="FILE">File Upload</option>
                      </select>
                    </div>
                    <div className="w-auto flex items-center mb-2 px-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <input 
                          type="checkbox" 
                          className="rounded"
                          checked={field.required}
                          onChange={e => updateDynamicField(index, "required", e.target.checked)}
                        />
                        Required
                      </label>
                    </div>
                    <div>
                      <Button type="button" variant="destructive" size="sm" onClick={() => removeDynamicField(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4 border-t">
          <Button type="submit" disabled={submitting} className="min-w-[150px]">
            {submitting ? "Saving..." : (submitLabel || (initialData ? "Update Drive" : "Publish Drive"))}
          </Button>
        </div>
      </form>
    </div>
  );
}






