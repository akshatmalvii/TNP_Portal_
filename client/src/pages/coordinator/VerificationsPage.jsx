import React, { useState } from "react";
import { mockPendingApplications } from "./mockData";
import { Card, CardContent } from "../../components/Card";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

export default function VerificationsPage() {
  const [verifications, setVerifications] = useState(
    mockPendingApplications
  );
  const [expandedId, setExpandedId] = useState(null);

  const handleApprove = (id) => {
    setVerifications(verifications.filter((v) => v.id !== id));
  };

  const handleReject = (id) => {
    setVerifications(verifications.filter((v) => v.id !== id));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending Verification":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
      case "Pending Review":
        return "bg-blue-500/10 text-blue-700 border-blue-200";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Application Verifications
        </h1>
        <p className="text-muted-foreground mt-1">
          Review and verify student placement applications.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">
                  {verifications.length}
                </p>
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
                <p className="text-2xl font-bold">24</p>
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
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* List */}
      <div className="space-y-4">
        {verifications.length === 0 ? (
          <Card className="border-0 bg-card">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground py-8">
                All applications verified!
              </p>
            </CardContent>
          </Card>
        ) : (
          verifications.map((app) => (
            <Card
              key={app.id}
              className="border-0 bg-card hover:shadow-md transition"
            >
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-bold text-lg">
                        {app.studentName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {app.company} • {app.position}
                      </p>
                    </div>

                    <Badge
                      className={
                        getStatusColor(app.status) + " border"
                      }
                    >
                      {app.status}
                    </Badge>
                  </div>

                  {/* Documents */}
                  <div className="bg-secondary/30 p-4 rounded-lg">
                    <p className="text-sm font-semibold mb-2">
                      Documents:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {app.documents
                        .split(", ")
                        .map((doc, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full border"
                          >
                            {doc}
                          </span>
                        ))}
                    </div>
                  </div>

                  {/* Toggle */}
                  <button
                    onClick={() =>
                      setExpandedId(
                        expandedId === app.id ? null : app.id
                      )
                    }
                    className="text-sm text-primary"
                  >
                    {expandedId === app.id
                      ? "Hide Details"
                      : "View Details"}
                  </button>

                  {expandedId === app.id && (
                    <div className="bg-secondary/20 p-4 rounded-lg border">
                      <p className="text-sm">
                        ✓ Valid resume and details
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      onClick={() => handleApprove(app.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Approve
                    </Button>

                    <Button
                      onClick={() => handleReject(app.id)}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>

                    <Button variant="outline" className="flex-1">
                      Request Info
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}