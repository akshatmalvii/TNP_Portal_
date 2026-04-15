import { Card } from "../../components/Card"
import { CardContent } from "../../components/Card";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { Clock } from "lucide-react";

const pendingTasks = [
  {
    id: 1,
    task: "Verify Rajesh Kumar's documents",
    company: "TechCorp Solutions",
    date: "2024-03-15",
    priority: "High",
  },
  {
    id: 2,
    task: "Review Priya Sharma's application",
    company: "DataFlow Systems",
    date: "2024-03-16",
    priority: "Medium",
  },
  {
    id: 3,
    task: "Approve Neha Singh's placement",
    company: "FinanceFlow Ltd",
    date: "2024-03-14",
    priority: "High",
  },
  {
    id: 4,
    task: "Process bulk verification",
    company: "Multiple Companies",
    date: "2024-03-18",
    priority: "Low",
  },
];

export default function PendingPage() {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-500/10 text-red-700 border-red-200";
      case "Medium":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
      case "Low":
        return "bg-green-500/10 text-green-700 border-green-200";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Pending Tasks
        </h1>
        <p className="text-muted-foreground mt-1">
          Tasks awaiting your attention and action.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 bg-card">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Total Pending
            </p>
            <p className="text-3xl font-bold mt-2">
              {pendingTasks.length}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              High Priority
            </p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {
                pendingTasks.filter(
                  (t) => t.priority === "High"
                ).length
              }
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Due Today
            </p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              2
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {pendingTasks.map((task) => (
          <Card
            key={task.id}
            className="border-0 bg-card hover:shadow-md transition"
          >
            <CardContent className="pt-6">
              <div className="flex justify-between">
                <div className="flex gap-4 flex-1">
                  <Clock className="w-5 h-5 text-primary mt-1" />

                  <div>
                    <h3 className="font-semibold">
                      {task.task}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {task.company}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Due:{" "}
                      {new Date(task.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <Badge
                  className={
                    getPriorityColor(task.priority) + " border"
                  }
                >
                  {task.priority}
                </Badge>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Button className="bg-primary hover:bg-primary/90">
                  Start Task
                </Button>
                <Button variant="outline">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
