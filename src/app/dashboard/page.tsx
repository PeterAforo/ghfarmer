"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Leaf,
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  PawPrint,
  LayoutGrid,
  Users,
  Zap,
  CheckCircle,
  Info,
  DollarSign,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

interface DashboardData {
  type: "owner" | "team_member";
  user?: { name: string; role: string };
  memberships?: Array<{
    id: string;
    role: string;
    ownerName: string;
    farmCount: number;
    permissions: any;
  }>;
  stats: {
    totalFarms?: number;
    farmsAccess?: number;
    totalCrops: number;
    totalLivestock: number;
    totalPlots?: number;
    pendingTasks: number;
    overdueTasks: number;
    teamMembers?: number;
  };
  financials?: {
    monthly: { income: number; expenses: number; profit: number };
    yearly: { income: number; expenses: number; profit: number };
  };
  farms: Array<{
    id: string;
    name: string;
    region?: string;
    size?: number;
    sizeUnit?: string;
    _count?: { crops: number; livestock: number; plots: number };
  }>;
  upcomingTasks: Array<{
    id: string;
    title: string;
    dueDate: string;
    priority?: string;
    farm?: { name: string };
  }>;
  recommendations?: Array<{
    type: string;
    title: string;
    message: string;
    priority: string;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const dashboardData = await res.json();
        setData(dashboardData);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard");
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load dashboard</p>
      </div>
    );
  }

  // Team Member Dashboard
  if (data.type === "team_member") {
    return <TeamMemberDashboard data={data} />;
  }

  // Farm Owner Dashboard
  return <OwnerDashboard data={data} />;
}

function OwnerDashboard({ data }: { data: DashboardData }) {
  const { stats, financials, farms, upcomingTasks, recommendations } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {data.user?.name || "Farmer"}!
        </p>
      </div>

      {/* High Priority Recommendations */}
      {recommendations && recommendations.filter(r => r.priority === "high").length > 0 && (
        <div className="space-y-2">
          {recommendations.filter(r => r.priority === "high").map((rec, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 p-4 rounded-lg border ${
                rec.type === "warning"
                  ? "bg-red-50 border-red-200"
                  : rec.type === "success"
                  ? "bg-green-50 border-green-200"
                  : rec.type === "action"
                  ? "bg-blue-50 border-blue-200"
                  : "bg-yellow-50 border-yellow-200"
              }`}
            >
              {rec.type === "warning" && <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />}
              {rec.type === "success" && <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />}
              {rec.type === "action" && <Zap className="h-5 w-5 text-blue-500 mt-0.5" />}
              {rec.type === "info" && <Info className="h-5 w-5 text-yellow-500 mt-0.5" />}
              <div>
                <p className="font-medium text-sm">{rec.title}</p>
                <p className="text-sm text-gray-600">{rec.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Farms"
          value={stats.totalFarms || 0}
          icon={<MapPin className="h-5 w-5 text-green-600" />}
        />
        <StatCard
          title="Active Crops"
          value={stats.totalCrops}
          icon={<Leaf className="h-5 w-5 text-amber-600" />}
        />
        <StatCard
          title="Livestock"
          value={stats.totalLivestock}
          icon={<PawPrint className="h-5 w-5 text-blue-600" />}
        />
        <StatCard
          title="Pending Tasks"
          value={stats.pendingTasks}
          icon={<Clock className="h-5 w-5 text-yellow-600" />}
        />
        <StatCard
          title="Overdue"
          value={stats.overdueTasks}
          icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
          highlight={stats.overdueTasks > 0}
        />
      </div>

      {/* Financial Overview */}
      {financials && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Monthly Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Income</span>
                  <span className="font-medium text-green-600">
                    GHS {financials.monthly.income.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Expenses</span>
                  <span className="font-medium text-red-600">
                    GHS {financials.monthly.expenses.toLocaleString()}
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-medium">Net Profit</span>
                  <span className={`font-bold ${financials.monthly.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {financials.monthly.profit >= 0 ? <TrendingUp className="h-4 w-4 inline mr-1" /> : <TrendingDown className="h-4 w-4 inline mr-1" />}
                    GHS {Math.abs(financials.monthly.profit).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Yearly Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Income</span>
                  <span className="font-medium text-green-600">
                    GHS {financials.yearly.income.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Expenses</span>
                  <span className="font-medium text-red-600">
                    GHS {financials.yearly.expenses.toLocaleString()}
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-medium">Net Profit</span>
                  <span className={`font-bold ${financials.yearly.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {financials.yearly.profit >= 0 ? <TrendingUp className="h-4 w-4 inline mr-1" /> : <TrendingDown className="h-4 w-4 inline mr-1" />}
                    GHS {Math.abs(financials.yearly.profit).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Farms Overview & Tasks */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* My Farms */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-600" />
              My Farms
            </CardTitle>
            <Link href="/dashboard/farms" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </CardHeader>
          <CardContent>
            {farms.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm mb-2">No farms yet</p>
                <Link href="/dashboard/farms/new" className="text-primary text-sm hover:underline">
                  Create your first farm →
                </Link>
              </div>
            ) : (
              <ul className="space-y-2">
                {farms.slice(0, 4).map((farm) => (
                  <li key={farm.id}>
                    <Link
                      href={`/dashboard/farms/${farm.id}`}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                    >
                      <div>
                        <p className="font-medium">{farm.name}</p>
                        <p className="text-xs text-gray-500">{farm.region}</p>
                      </div>
                      <div className="flex gap-3 text-xs text-gray-500">
                        <span>{farm._count?.crops || 0} crops</span>
                        <span>{farm._count?.livestock || 0} livestock</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Upcoming Tasks
            </CardTitle>
            <Link href="/dashboard/tasks" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </CardHeader>
          <CardContent>
            {upcomingTasks.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No upcoming tasks</p>
            ) : (
              <ul className="space-y-2">
                {upcomingTasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      {task.priority === "URGENT" ? (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-gray-400" />
                      )}
                      <div>
                        <p className="font-medium text-sm truncate">{task.title}</p>
                        {task.farm && <p className="text-xs text-gray-500">{task.farm.name}</p>}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <QuickActionButton href="/dashboard/farms/new" label="Add Farm" />
            <QuickActionButton href="/dashboard/crops/new" label="Add Crop" />
            <QuickActionButton href="/dashboard/livestock/new" label="Add Livestock" />
            <QuickActionButton href="/dashboard/finances/expense" label="Log Expense" />
            <QuickActionButton href="/dashboard/finances/income" label="Log Income" />
            <QuickActionButton href="/dashboard/markets" label="Market Prices" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TeamMemberDashboard({ data }: { data: DashboardData }) {
  const { memberships, stats, farms, upcomingTasks } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Team Dashboard</h1>
        <p className="text-gray-600">
          You have access to {stats.farmsAccess} farm{stats.farmsAccess !== 1 ? "s" : ""} as a team member
        </p>
      </div>

      {/* Team Memberships */}
      {memberships && memberships.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Your Team Memberships
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {memberships.map((membership) => (
                <div
                  key={membership.id}
                  className="p-4 bg-gray-50 rounded-lg border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">{membership.ownerName}&apos;s Farm</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      membership.role === "ADMIN" ? "bg-purple-100 text-purple-700" :
                      membership.role === "MANAGER" ? "bg-blue-100 text-blue-700" :
                      membership.role === "WORKER" ? "bg-green-100 text-green-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {membership.role}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {membership.farmCount} farm{membership.farmCount !== 1 ? "s" : ""}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Farms Access"
          value={stats.farmsAccess || 0}
          icon={<MapPin className="h-5 w-5 text-green-600" />}
        />
        <StatCard
          title="Total Crops"
          value={stats.totalCrops}
          icon={<Leaf className="h-5 w-5 text-amber-600" />}
        />
        <StatCard
          title="Total Livestock"
          value={stats.totalLivestock}
          icon={<PawPrint className="h-5 w-5 text-blue-600" />}
        />
        <StatCard
          title="Pending Tasks"
          value={stats.pendingTasks}
          icon={<Clock className="h-5 w-5 text-yellow-600" />}
        />
      </div>

      {/* Farms & Tasks */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Accessible Farms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-600" />
              Accessible Farms
            </CardTitle>
          </CardHeader>
          <CardContent>
            {farms.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No farms accessible</p>
            ) : (
              <ul className="space-y-2">
                {farms.map((farm) => (
                  <li key={farm.id}>
                    <Link
                      href={`/dashboard/farms/${farm.id}`}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                    >
                      <div>
                        <p className="font-medium">{farm.name}</p>
                        <p className="text-xs text-gray-500">{farm.region}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Your Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingTasks.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No tasks assigned</p>
            ) : (
              <ul className="space-y-2">
                {upcomingTasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm">{task.title}</p>
                      {task.farm && <p className="text-xs text-gray-500">{task.farm.name}</p>}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  highlight = false,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "border-red-200 bg-red-50" : ""}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-2xl font-bold ${highlight ? "text-red-600" : "text-gray-900"}`}>
              {value}
            </p>
          </div>
          <div className={`rounded-full p-3 ${highlight ? "bg-red-100" : "bg-gray-100"}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionButton({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 transition-colors"
    >
      {label}
    </Link>
  );
}
