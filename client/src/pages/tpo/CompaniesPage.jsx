import React from "react";
import { Card, CardContent } from "../../components/Card";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { Building2, Plus, Mail, Phone } from "lucide-react";

const companies = [
  {
    id: 1,
    name: "TechCorp Solutions",
    industry: "Software",
    contact: "hr@techcorp.com",
    phone: "+91-8765432100",
    activePositions: 3,
    placed: 5,
  },
  {
    id: 2,
    name: "DataFlow Systems",
    industry: "Data Analytics",
    contact: "careers@dataflow.com",
    phone: "+91-9876543210",
    activePositions: 2,
    placed: 3,
  },
  {
    id: 3,
    name: "CloudInnovate Inc",
    industry: "Cloud Services",
    contact: "recruitment@cloudinnovate.com",
    phone: "+91-7654321098",
    activePositions: 4,
    placed: 8,
  },
  {
    id: 4,
    name: "FinanceFlow Ltd",
    industry: "Financial Services",
    contact: "jobs@financeflow.com",
    phone: "+91-6543210987",
    activePositions: 2,
    placed: 4,
  },
];

export default function CompaniesPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            Companies
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage recruiting companies and their information.
          </p>
        </div>

        <Button className="bg-primary hover:bg-primary/90 gap-2">
          <Plus className="w-4 h-4" />
          Add Company
        </Button>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {companies.map((company) => (
          <Card
            key={company.id}
            className="border-0 bg-card hover:shadow-md transition"
          >
            <CardContent className="pt-6 space-y-4">
              {/* Top */}
              <div className="flex justify-between">
                <div className="flex gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>

                  <div>
                    <h3 className="font-bold text-lg">
                      {company.name}
                    </h3>
                    <Badge variant="secondary" className="mt-1">
                      {company.industry}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  {company.contact}
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  {company.phone}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Active Positions
                  </p>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {company.activePositions}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Students Placed
                  </p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {company.placed}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1">
                  View Profile
                </Button>

                <Button variant="outline" className="flex-1">
                  Contact
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}