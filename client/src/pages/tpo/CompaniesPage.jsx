import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../components/Card";
import { Building2, Globe } from "lucide-react";
import { API_BASE_URL } from '../constants/api';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/v1/tpo/companies`, {
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
    fetchCompanies();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Companies</h1>
          <p className="text-muted-foreground mt-1">
            View all recruiting companies created by your coordinators.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading companies...</div>
      ) : companies.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed text-gray-500">
          <Building2 className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No companies added yet</h3>
          <p className="mt-1">Your coordinators can add new companies from the coordinator dashboard.</p>
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
                    <a href={company.company_website.startsWith('http') ? company.company_website : `https://${company.company_website}`} target="_blank" rel="noreferrer truncate">
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




