import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../Card";
import { Button } from "../Button";
import { Input } from "../Input";
import { Plus, Trash2 } from "lucide-react";

export default function CreateDriveForm({ onCancel, onSuccess }) {
  const [formData, setFormData] = useState({
    company_role_id: "",
    offer_type: "Placement",
    package_lpa: "",
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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Options fetched from backend (mocked here if endpoints don't exist yet, but we will try fetching)
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [companyRoles, setCompanyRoles] = useState([]);

  useEffect(() => {
    // Fetch departments and courses
    const fetchMetadata = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        
        const depRes = await fetch("http://localhost:5000/api/v1/departments", { headers });
        if (depRes.ok) setDepartments(await depRes.json());

        const crsRes = await fetch("http://localhost:5000/api/v1/courses", { headers });
        if (crsRes.ok) setCourses(await crsRes.json());

        const rolesRes = await fetch("http://localhost:5000/api/v1/tpo/company-roles", { headers });
        if (rolesRes.ok) {
          const fetchedRoles = await rolesRes.json();
          setCompanyRoles(fetchedRoles);
          if (fetchedRoles.length > 0) {
            setFormData(prev => ({ ...prev, company_role_id: fetchedRoles[0].role_id }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch metadata", err);
      }
    };
    fetchMetadata();
  }, []);

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

  const addDynamicField = () => {
    setDynamicFields([...dynamicFields, { label: "", type: "TEXT", required: false, order: dynamicFields.length + 1 }]);
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
      const payload = {
        ...formData,
        package_lpa: parseFloat(formData.package_lpa) || 0,
        company_role_id: parseInt(formData.company_role_id) || 0,
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

      const res = await fetch("http://localhost:5000/api/v1/tpo/drive", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create drive");
      
      onSuccess(data.drive);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Create New Job Drive</h2>
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
              <label className="text-sm font-medium">Company Role *</label>
              <select 
                className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                required
                value={formData.company_role_id}
                onChange={e => setFormData({...formData, company_role_id: e.target.value})}
              >
                <option value="">Select a Company Role</option>
                {companyRoles.map(role => (
                  <option key={role.role_id} value={role.role_id}>
                    {role.Company?.company_name} - {role.role_title}
                  </option>
                ))}
              </select>
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
            <div>
              <label className="text-sm font-medium">Deadline *</label>
              <Input 
                type="date" 
                required 
                value={formData.deadline} 
                onChange={e => setFormData({...formData, deadline: e.target.value})} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Audience */}
        <Card className="border-0 bg-card">
          <CardHeader><CardTitle>Target Audience</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium block mb-2">Allowed Departments *</label>
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
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Allowed Courses *</label>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                {courses.map(c => (
                  <label key={c.course_id} className="flex items-center gap-2 text-sm">
                    <input 
                      type="checkbox" 
                      className="rounded"
                      checked={formData.allowed_courses.includes(c.course_id)}
                      onChange={() => handleToggleArray("allowed_courses", c.course_id)}
                    />
                    {c.course_name}
                  </label>
                ))}
                {courses.length === 0 && <span className="text-gray-400 text-sm">No courses loaded</span>}
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
            {submitting ? "Publishing..." : "Publish Drive"}
          </Button>
        </div>
      </form>
    </div>
  );
}
