"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Leaf,
  PawPrint,
  Plus,
  Pencil,
  Wallet,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Info,
  Zap,
  LayoutGrid,
  DollarSign,
  Target,
  Clock,
  BarChart3,
  PieChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

interface FarmDashboard {
  farm: {
    id: string;
    name: string;
    size: number | null;
    sizeUnit: string;
    region: string | null;
    district: string | null;
  };
  stats: {
    totalCrops: number;
    totalLivestock: number;
    totalPlots: number;
    pendingTasks: number;
    overdueTasks: number;
  };
  financials: {
    monthly: { income: number; expenses: number; profit: number };
    yearly: { income: number; expenses: number; profit: number };
    recentExpenses: Array<{ id: string; category: string; amount: number; date: string; description: string | null }>;
    recentIncome: Array<{ id: string; source: string; amount: number; date: string; description: string | null }>;
  };
  landUsage: {
    totalSize: number;
    usedSize: number;
    availableSize: number;
    utilizationPercent: number;
    plots: Array<{ id: string; name: string; size: number | null; sizeUnit: string; cropCount: number; penCount: number }>;
  };
  crops: {
    entries: Array<{ id: string; status: string; crop: { englishName: string; category: string } | null; plot: { name: string } | null }>;
    byStatus: Record<string, number>;
  };
  livestock: {
    entries: Array<{ id: string; quantity: number; livestock: { englishName: string; category: string } | null }>;
    byCategory: Record<string, number>;
    totalCount: number;
  };
  tasks: {
    upcoming: Array<{ id: string; title: string; dueDate: string; status: string }>;
    pendingCount: number;
    overdueCount: number;
  };
  recommendations: Array<{
    type: "warning" | "success" | "info" | "action";
    title: string;
    message: string;
    priority: "high" | "medium" | "low";
  }>;
}

export default function FarmDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [dashboard, setDashboard] = useState<FarmDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, [id]);

  async function fetchDashboard() {
    try {
      const response = await fetch(`/api/farms/${id}/dashboard`);
      if (!response.ok) {
        if (response.status === 404) {
          setError("Farm not found");
        } else {
          throw new Error("Failed to fetch farm");
        }
        return;
      }
      const data = await response.json();
      setDashboard(data);
    } catch (err) {
      setError("Failed to load farm dashboard");
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

  if (error || !dashboard) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/farms">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Farms
          </Link>
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">{error || "Farm not found"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { farm, stats, financials, landUsage, crops, livestock, tasks, recommendations } = dashboard;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/farms">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{farm.name}</h1>
            {(farm.region || farm.district) && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>
                  {[farm.district, farm.region].filter(Boolean).join(", ")}
                </span>
              </div>
            )}
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/dashboard/farms/${farm.id}/edit`}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit Farm
          </Link>
        </Button>
      </div>

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
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

      {/* Key Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <StatCard
          title="Crops"
          value={stats.totalCrops}
          icon={<Leaf className="h-5 w-5 text-green-600" />}
        />
        <StatCard
          title="Livestock"
          value={stats.totalLivestock}
          icon={<PawPrint className="h-5 w-5 text-amber-600" />}
        />
        <StatCard
          title="Plots"
          value={stats.totalPlots}
          icon={<LayoutGrid className="h-5 w-5 text-blue-600" />}
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
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Monthly Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Income</span>
                <span className="font-medium text-green-600">
                  GHS {financials.monthly.income.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Expenses</span>
                <span className="font-medium text-red-600">
                  GHS {financials.monthly.expenses.toLocaleString()}
                </span>
              </div>
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="font-medium">Net Profit/Loss</span>
                <span className={`font-bold text-lg ${financials.monthly.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {financials.monthly.profit >= 0 ? (
                    <TrendingUp className="h-4 w-4 inline mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 inline mr-1" />
                  )}
                  GHS {Math.abs(financials.monthly.profit).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Yearly Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Income</span>
                <span className="font-medium text-green-600">
                  GHS {financials.yearly.income.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Expenses</span>
                <span className="font-medium text-red-600">
                  GHS {financials.yearly.expenses.toLocaleString()}
                </span>
              </div>
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="font-medium">Net Profit/Loss</span>
                <span className={`font-bold text-lg ${financials.yearly.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {financials.yearly.profit >= 0 ? (
                    <TrendingUp className="h-4 w-4 inline mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 inline mr-1" />
                  )}
                  GHS {Math.abs(financials.yearly.profit).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Land Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            Land Utilization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Total Farm Size</span>
              <span className="font-medium">{landUsage.totalSize} {farm.sizeUnit?.toLowerCase().replace("_", " ")}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-green-500 h-4 rounded-full transition-all"
                style={{ width: `${Math.min(landUsage.utilizationPercent, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Used: {landUsage.usedSize} ({landUsage.utilizationPercent}%)</span>
              <span>Available: {landUsage.availableSize}</span>
            </div>
            
            {landUsage.plots.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium mb-2">Plots Breakdown</p>
                <div className="grid gap-2">
                  {landUsage.plots.map((plot) => (
                    <Link
                      key={plot.id}
                      href={`/dashboard/plots/${plot.id}`}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100"
                    >
                      <span className="text-sm font-medium">{plot.name}</span>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{plot.size || 0} {plot.sizeUnit?.toLowerCase().replace("_", " ")}</span>
                        <span>{plot.cropCount} crops</span>
                        <span>{plot.penCount} pens</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Crops & Livestock Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Crops Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-600" />
              Crops ({stats.totalCrops})
            </CardTitle>
            <Button size="sm" asChild>
              <Link href={`/dashboard/crops/new?farmId=${farm.id}`}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {crops.entries.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No crops added yet</p>
            ) : (
              <>
                {/* Status breakdown */}
                <div className="flex gap-2 mb-4 flex-wrap">
                  {Object.entries(crops.byStatus || {}).map(([status, count]) => (
                    <span
                      key={status}
                      className={`text-xs px-2 py-1 rounded-full ${
                        status === "GROWING"
                          ? "bg-green-100 text-green-700"
                          : status === "HARVESTING"
                          ? "bg-amber-100 text-amber-700"
                          : status === "HARVESTED"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {status}: {count}
                    </span>
                  ))}
                </div>
                <ul className="space-y-2 max-h-48 overflow-y-auto">
                  {crops.entries.slice(0, 5).map((entry) => (
                    <li
                      key={entry.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm"
                    >
                      <span className="font-medium">{entry.crop?.englishName}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        entry.status === "GROWING" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                      }`}>
                        {entry.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </CardContent>
        </Card>

        {/* Livestock Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <PawPrint className="h-5 w-5 text-amber-600" />
              Livestock ({livestock.totalCount})
            </CardTitle>
            <Button size="sm" asChild>
              <Link href={`/dashboard/livestock/new?farmId=${farm.id}`}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {livestock.entries.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No livestock added yet</p>
            ) : (
              <>
                {/* Category breakdown */}
                <div className="flex gap-2 mb-4 flex-wrap">
                  {Object.entries(livestock.byCategory || {}).map(([category, count]) => (
                    <span
                      key={category}
                      className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700"
                    >
                      {category}: {count}
                    </span>
                  ))}
                </div>
                <ul className="space-y-2 max-h-48 overflow-y-auto">
                  {livestock.entries.slice(0, 5).map((entry) => (
                    <li
                      key={entry.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm"
                    >
                      <span className="font-medium">{entry.livestock?.englishName}</span>
                      <span className="text-gray-600">{entry.quantity} heads</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Tasks & Recent Transactions */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Upcoming Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Upcoming Tasks
            </CardTitle>
            <Button size="sm" variant="outline" asChild>
              <Link href="/dashboard/tasks">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {tasks.upcoming.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No upcoming tasks</p>
            ) : (
              <ul className="space-y-2">
                {tasks.upcoming.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm"
                  >
                    <span className="font-medium truncate">{task.title}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-600" />
              AI Insights & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recommendations.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No recommendations at this time</p>
            ) : (
              <ul className="space-y-3">
                {recommendations.slice(0, 4).map((rec, idx) => (
                  <li
                    key={idx}
                    className={`flex items-start gap-2 p-2 rounded-lg text-sm ${
                      rec.type === "warning"
                        ? "bg-red-50"
                        : rec.type === "success"
                        ? "bg-green-50"
                        : rec.type === "action"
                        ? "bg-blue-50"
                        : "bg-yellow-50"
                    }`}
                  >
                    {rec.type === "warning" && <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />}
                    {rec.type === "success" && <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />}
                    {rec.type === "action" && <Zap className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />}
                    {rec.type === "info" && <Info className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />}
                    <div>
                      <p className="font-medium">{rec.title}</p>
                      <p className="text-gray-600 text-xs">{rec.message}</p>
                    </div>
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
            <p className="text-sm text-gray-600">{title}</p>
            <p className={`text-2xl font-bold ${highlight ? "text-red-600" : ""}`}>{value}</p>
          </div>
          <div className={`rounded-full p-3 ${highlight ? "bg-red-100" : "bg-gray-100"}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
