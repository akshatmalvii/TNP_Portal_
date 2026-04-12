import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/Card";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import {
  Briefcase,
  TrendingUp,
  Building2,
  CheckCircle2,
  UserPlus,
  CalendarClock,
  AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useConfirmDialog } from "../../components/ConfirmDialog";

export default function TPODashboard() {
  const { confirm, confirmDialog } = useConfirmDialog();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  // Placement season state
  const [currentSeason, setCurrentSeason] = useState(null);
  const [seasonLoading, setSeasonLoading] = useState(true);
  const [isEditingSeason, setIsEditingSeason] = useState(false);
  const [seasonStartYear, setSeasonStartYear] = useState("");
  const [seasonSaving, setSeasonSaving] = useState(false);
  const [seasonError, setSeasonError] = useState("");
  const [seasonSuccess, setSeasonSuccess] = useState("");

  useEffect(() => {
    fetchDrives();
    fetchPlacementSeason();
  }, []);

  const fetchPlacementSeason = async () => {
    try {
      setSeasonLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/v1/tpo/placement-season", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentSeason(data.current_placement_season);
        if (data.current_placement_season) {
          setSeasonStartYear(data.current_placement_season.split("-")[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch placement season", err);
    } finally {
      setSeasonLoading(false);
    }
  };

  const fetchDrives = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/v1/tpo/drives", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setDrives(await res.json());
    } catch (err) {
      console.error("Failed to load drives", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSeason = async () => {
    const startYear = parseInt(seasonStartYear);
    if (!startYear || startYear < 2020 || startYear > 2099) {
      setSeasonError("Enter a valid year (2020–2099)");
      return;
    }

    const newSeason = `${startYear}-${startYear + 1}`;

    const shouldProceed = await confirm({
      title: `Set placement season to ${newSeason}?`,
      description: currentSeason
        ? `This will change the active placement season from ${currentSeason} to ${newSeason}. All new companies and drives created after this will be tagged with ${newSeason}. Existing drives will keep their original season.`
        : `This will set the active placement season to ${newSeason}. Coordinators will be able to create companies and drives after this.`,
      confirmText: "Yes, set season",
    });

    if (!shouldProceed) return;

    setSeasonSaving(true);
    setSeasonError("");
    setSeasonSuccess("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/v1/tpo/placement-season", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ placement_season: newSeason }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to set placement season");

      setCurrentSeason(data.current_placement_season);
      setIsEditingSeason(false);
      setSeasonSuccess(`Placement season set to ${data.current_placement_season}`);
      setTimeout(() => setSeasonSuccess(""), 4000);
    } catch (err) {
      setSeasonError(err.message);
    } finally {
      setSeasonSaving(false);
    }
  };

  const getDefaultStartYear = () => {
    const now = new Date();
    const month = now.getMonth();
    return month >= 6 ? now.getFullYear() : now.getFullYear() - 1;
  };

  const stats = [
    {
      title: "Total Drives Posted",
      value: drives.length,
      icon: Briefcase,
      color: "text-blue-500",
    },
    {
      title: "Students Placed",
      value: "0*", // Analytics pending
      icon: CheckCircle2,
      color: "text-green-500",
    },
    {
      title: "Avg. Salary",
      value: "0 LPA", // Analytics pending
      icon: TrendingUp,
      color: "text-purple-500",
    },
    {
      title: "Active Drives",
      value: drives.filter(d => d.drive_status === "OPEN" || d.drive_status === "Active").length,
      icon: Building2,
      color: "text-orange-500",
    },
  ];

  const pendingApprovals = [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          TPO Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage placements, drives, and company relationships.
        </p>
      </div>

      {/* Placement Season Card */}
      <Card className={`border-2 ${currentSeason ? 'border-indigo-200 bg-gradient-to-r from-indigo-50/60 to-blue-50/60' : 'border-amber-300 bg-gradient-to-r from-amber-50/80 to-yellow-50/80'}`}>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${currentSeason ? 'bg-indigo-100' : 'bg-amber-100'}`}>
                <CalendarClock className={`w-7 h-7 ${currentSeason ? 'text-indigo-600' : 'text-amber-600'}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Active Placement Season</p>
                {seasonLoading ? (
                  <p className="text-lg text-gray-400 mt-0.5">Loading…</p>
                ) : currentSeason ? (
                  <p className="text-2xl font-bold text-indigo-700 mt-0.5">{currentSeason}</p>
                ) : (
                  <div className="flex items-center gap-2 mt-0.5">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <p className="text-lg font-semibold text-amber-700">Not set yet</p>
                  </div>
                )}
              </div>
            </div>

            {!isEditingSeason ? (
              <Button
                onClick={() => {
                  setIsEditingSeason(true);
                  setSeasonError("");
                  setSeasonSuccess("");
                  if (!seasonStartYear) setSeasonStartYear(String(getDefaultStartYear()));
                }}
                className={currentSeason ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-amber-600 hover:bg-amber-700'}
              >
                {currentSeason ? "Change Season" : "Set Placement Season"}
              </Button>
            ) : (
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    min="2020"
                    max="2099"
                    className="w-24 text-center font-semibold"
                    value={seasonStartYear}
                    onChange={(e) => setSeasonStartYear(e.target.value)}
                    placeholder="2025"
                  />
                  <span className="text-gray-500 font-medium">–</span>
                  <span className="text-gray-700 font-semibold w-12">
                    {parseInt(seasonStartYear) ? parseInt(seasonStartYear) + 1 : "----"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveSeason} disabled={seasonSaving} size="sm">
                    {seasonSaving ? "Saving…" : "Save"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setIsEditingSeason(false); setSeasonError(""); }}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {seasonError && (
            <p className="text-sm text-red-600 mt-3 bg-red-50 border border-red-200 rounded-md px-3 py-2">{seasonError}</p>
          )}
          {seasonSuccess && (
            <p className="text-sm text-green-700 mt-3 bg-green-50 border border-green-200 rounded-md px-3 py-2">{seasonSuccess}</p>
          )}

          {!currentSeason && !isEditingSeason && (
            <p className="text-sm text-amber-700/80 mt-3">
              ⚠️ Coordinators cannot add companies or create drives until the placement season is set.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="border-0 bg-card">
              <CardContent className="pt-6">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`p-2 rounded-lg ${stat.color} opacity-20`}
                  >
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Approvals */}
        <Card className="lg:col-span-2 border-0 bg-card">
          <CardHeader>
            <CardTitle>Pending Company Approvals</CardTitle>
            <CardDescription>
              Company requests awaiting approval
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              {pendingApprovals.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No pending approvals
                </p>
              ) : (
                pendingApprovals.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 border rounded-lg hover:bg-secondary/20"
                  >
                    <div className="flex justify-between mb-2">
                      <h3 className="font-semibold">
                        {req.company}
                      </h3>

                      <Badge className="bg-yellow-500/10 text-yellow-700 border border-yellow-200">
                        Pending
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {req.position}
                    </p>

                    <p className="text-sm font-medium text-primary mt-2">
                      {req.salary}
                    </p>

                    <div className="flex gap-2 mt-3">
                      <Button className="bg-green-600 hover:bg-green-700">
                        Approve
                      </Button>
                      <Button variant="outline">
                        Request Changes
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Link to="/dashboard/tpo/approvals">
              <Button variant="outline" className="w-full mt-4">
                View All Requests
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Overview */}
        <Card className="border-0 bg-card">
          <CardHeader>
            <CardTitle>Placement Overview</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="p-4 bg-primary/10 rounded-lg border">
              <p className="text-xs text-muted-foreground">
                Placement %
              </p>
              <p className="text-3xl font-bold text-primary mt-1">
                N/A
              </p>
            </div>

            <div className="p-4 bg-accent/10 rounded-lg border">
              <p className="text-xs text-muted-foreground">
                Highest Salary
              </p>
              <p className="text-2xl font-bold mt-1">
                N/A
              </p>
            </div>

            <Link to="/dashboard/tpo/reports">
              <Button variant="outline" className="w-full">
                View Reports
              </Button>
            </Link>

            <Link to="/dashboard/tpo/coordinators">
              <Button variant="outline" className="w-full">
                <UserPlus className="w-4 h-4 mr-2" />
                Manage Coordinators
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Drives */}
      <Card className="border-0 bg-card">
        <CardHeader>
          <CardTitle>Active Job Drives</CardTitle>
          <CardDescription>
            Currently ongoing recruitment drives
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {drives.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No active drives.
              </p>
            ) : (
              drives.slice(0, 3).map((drive) => (
              <div
                key={drive.drive_id || drive.id}
                className="p-4 border rounded-lg hover:bg-secondary/20"
              >
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold">
                      {drive.company_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {drive.role_title}
                    </p>
                  </div>

                  <Badge
                    className={
                      (drive.drive_status || "") === "OPEN"
                        ? "bg-green-500/10 text-green-700 border border-green-200"
                        : "bg-gray-500/10 text-gray-700 border border-gray-200"
                    }
                  >
                    {drive.drive_status || "Closed"}
                  </Badge>
                </div>
              </div>
            )))}
          </div>

          <Link to="/dashboard/tpo/drives">
            <Button variant="outline" className="w-full mt-4">
              Manage Drives
            </Button>
          </Link>
        </CardContent>
      </Card>

      {confirmDialog}
    </div>
  );
}
