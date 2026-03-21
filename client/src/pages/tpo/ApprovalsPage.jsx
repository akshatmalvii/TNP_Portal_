import React, { useState } from "react";
import { mockCompanyRequests } from "./mockData";
import { Card, CardContent } from "../../components/Card";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

export default function ApprovalsPage() {
  const [requests, setRequests] = useState(mockCompanyRequests);

  const handleApprove = (id) => {
    setRequests(
      requests.map((r) =>
        r.id === id ? { ...r, status: "Approved" } : r
      )
    );
  };

  const handleReject = (id) => {
    setRequests(requests.filter((r) => r.id !== id));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-500/10 text-green-700 border-green-200";
      case "Pending Approval":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-200";
    }
  };

  const approved = requests.filter(
    (r) => r.status === "Approved"
  );
  const pending = requests.filter(
    (r) => r.status === "Pending Approval"
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          Company Approvals
        </h1>
        <p className="text-muted-foreground mt-1">
          Review and approve company recruitment requests.
        </p>
      </div>

      {/* Summary */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="border-0 bg-card">
          <CardContent className="pt-6 flex items-center gap-3">
            <Clock className="w-5 h-5 text-yellow-500" />
            <div>
              <p className="text-sm text-muted-foreground">
                Pending
              </p>
              <p className="text-2xl font-bold">
                {pending.length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card">
          <CardContent className="pt-6 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">
                Approved
              </p>
              <p className="text-2xl font-bold">
                {approved.length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Total Requests
            </p>
            <p className="text-2xl font-bold mt-1">
              {requests.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">
            Pending Requests
          </h2>

          {pending.map((req) => (
            <Card
              key={req.id}
              className="border-0 bg-card hover:shadow-md"
            >
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-bold text-lg">
                      {req.company}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {req.position}
                    </p>
                  </div>

                  <Badge
                    className={
                      getStatusColor(req.status) + " border"
                    }
                  >
                    {req.status}
                  </Badge>
                </div>

                {/* Details */}
                <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Salary
                    </p>
                    <p className="font-semibold">
                      {req.salary}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      CGPA
                    </p>
                    <p className="font-semibold">
                      {req.requiredCGPA}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Department
                    </p>
                    <p className="font-semibold">
                      {req.department}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => handleApprove(req.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Approve
                  </Button>

                  <Button
                    onClick={() => handleReject(req.id)}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Approved */}
      {approved.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">
            Approved Requests
          </h2>

          {approved.map((req) => (
            <Card key={req.id} className="border-0 bg-card">
              <CardContent className="pt-6 flex justify-between">
                <div>
                  <h3 className="font-bold">
                    {req.company}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {req.position}
                  </p>
                </div>

                <Badge className="bg-green-500/10 text-green-700 border border-green-200">
                  Approved
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}