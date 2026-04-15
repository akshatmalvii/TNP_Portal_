import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Card";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Building2, Plus, Trash2, Globe, X } from "lucide-react";
import { API_BASE_URL } from '../constants/api';

const API_BASE = `${API_BASE_URL}/api/v1/coordinator`;

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [coordinatorContext, setCoordinatorContext] = useState(null);
  const [formData, setFormData] = useState({
    company_name: "",
    company_website: "",
    contacts: [{ name: "", email: "", phone: "", designation: "" }],
  });

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token`);
      const res = await fetch(`${API_BASE}/companies`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setCompanies(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch companies", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchContext = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/context`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setCoordinatorContext(await res.json());
        }
      } catch (err) {
        console.error("Failed to fetch context", err);
      }
    };

    fetchCompanies();
    fetchContext();
  }, []);

  const handleAddContact = () => {
    setFormData((prev) => ({
      ...prev,
      contacts: [...prev.contacts, { name: "", email: "", phone: "", designation: "" }],
    }));
  };

  const handleRemoveContact = (index) => {
    setFormData((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index),
    }));
  };

  const handleContactChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.contacts];
      updated[index][field] = value;
      return { ...prev, contacts: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    // Validate phone numbers
    for (const contact of formData.contacts) {
      if (contact.phone && !/^\d{10}$/.test(contact.phone)) {
        setError("Phone number must be exactly 10 digits");
        setSubmitting(false);
        return;
      }
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/company`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add company");

      setShowAddModal(false);
      setFormData({
        company_name: "",
        company_website: "",
        contacts: [{ name: "", email: "", phone: "", designation: "" }],
      });
      fetchCompanies();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Companies</h1>
          <p className="text-muted-foreground mt-1">
            Add recruiting companies and manage company contacts for drive setup.
          </p>
          {coordinatorContext && !coordinatorContext.current_placement_season && (
            <p className="text-amber-600 text-sm font-medium mt-2 bg-amber-50 p-2 rounded-md inline-block border border-amber-200">
              ⚠️ TPO has not set the placement season yet. You cannot add companies.
            </p>
          )}
        </div>
        <Button 
          onClick={() => setShowAddModal(true)} 
          className="bg-primary hover:bg-primary/90 gap-2"
          disabled={coordinatorContext && !coordinatorContext.current_placement_season}
        >
          <Plus className="w-4 h-4" /> Add Company
        </Button>
      </div>

      {showAddModal && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" /> Add New Company
              </h2>
            </div>
            <Button variant="ghost" onClick={() => setShowAddModal(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {error && (
            <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-0 bg-card">
              <CardHeader>
                <CardTitle>Company Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Company Name *</label>
                  <Input
                    required
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    placeholder="e.g. Google, Amazon"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Website</label>
                  <Input
                    type="url"
                    value={formData.company_website}
                    onChange={(e) => setFormData({ ...formData, company_website: e.target.value })}
                    placeholder="https://www.example.com"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-card">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>HR / Contacts</CardTitle>
                  <Button type="button" size="sm" variant="outline" onClick={handleAddContact} className="gap-2">
                    <Plus className="w-4 h-4" /> Add Contact
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.contacts.map((contact, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-gray-50/50 relative">
                    {formData.contacts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveContact(index)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-500">Name</label>
                        <Input
                          value={contact.name}
                          onChange={(e) => handleContactChange(index, "name", e.target.value)}
                          placeholder="Recruiter Name"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">Designation</label>
                        <Input
                          value={contact.designation}
                          onChange={(e) => handleContactChange(index, "designation", e.target.value)}
                          placeholder="e.g. Talent Acquisition"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">Email</label>
                        <Input
                          type="email"
                          value={contact.email}
                          onChange={(e) => handleContactChange(index, "email", e.target.value)}
                          placeholder="hr@company.com"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">Phone</label>
                        <Input
                          type="tel"
                          pattern="[0-9]{10}"
                          value={contact.phone}
                          onChange={(e) => handleContactChange(index, "phone", e.target.value)}
                          placeholder="e.g. 9876543210"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save Company"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading companies...</div>
      ) : companies.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed text-gray-500">
          <Building2 className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No companies added yet</h3>
          <p className="mt-1">Use the button above to add your first recruiting company.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <Card key={company.company_id} className="border-0 bg-card hover:shadow-md transition">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg shrink-0">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div className="truncate">
                    <h3 className="font-bold text-lg truncate" title={company.company_name}>
                      {company.company_name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">Added: {new Date(company.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {company.company_website && (
                  <div className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                    <Globe className="w-4 h-4" />
                    <a
                      href={company.company_website.startsWith("http") ? company.company_website : `https://${company.company_website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate"
                    >
                      {company.company_website}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}





