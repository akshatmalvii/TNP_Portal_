// Analytics logic stripped of mockData. Will be integrated with live aggregation APIs in the future.

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../../components/Card'

import { TrendingUp, Users, DollarSign, Briefcase } from 'lucide-react'

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

export default function AnalyticsPage() {
  const stats = [
    {
      title: 'Total Students',
      value: "0*",
      icon: Users,
      color: 'text-blue-500'
    },
    {
      title: 'Placed',
      value: "0*",
      icon: Briefcase,
      color: 'text-green-500'
    },
    {
      title: 'Avg. Salary',
      value: `0 LPA`,
      icon: DollarSign,
      color: 'text-purple-500'
    },
    {
      title: 'Placement %',
      value: `0%`,
      icon: TrendingUp,
      color: 'text-orange-500'
    }
  ]

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Analytics & Reports</h1>
        <p className="text-gray-500 mt-1">
          Placement statistics and detailed analytics.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon

          return (
            <Card key={idx}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">{stat.title}</p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  </div>

                  <div className={`p-2 rounded-lg ${stat.color} opacity-20`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Placement Status</CardTitle>
            <CardDescription>
              Distribution of student placement status
            </CardDescription>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {[]}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Salary Distribution</CardTitle>
            <CardDescription>
              Students across salary ranges
            </CardDescription>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Department Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Department-wise Placements</CardTitle>
          <CardDescription>
            Placement rates by department
          </CardDescription>
        </CardHeader>

        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[]} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip />
              <Legend />
              <Bar dataKey="placed" name="Placed" />
              <Bar dataKey="total" name="Total" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Highest Salary</p>
            <p className="text-3xl font-bold mt-2">
              0 LPA
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Lowest Salary</p>
            <p className="text-3xl font-bold mt-2">
              0 LPA
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Average Salary</p>
            <p className="text-3xl font-bold mt-2">
              0 LPA
            </p>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}



