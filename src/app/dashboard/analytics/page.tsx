"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Leaf,
  PawPrint,
  CheckCircle2,
  Loader2,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AnalyticsData {
  summary: {
    farms: number;
    crops: number;
    livestock: number;
    totalExpenses: number;
    totalIncome: number;
    netProfit: number;
    profitMargin: number;
    expenseCount: number;
    incomeCount: number;
    taskCompletionRate: number;
  };
  recentTransactions: {
    expenses: any[];
    incomes: any[];
  };
  taskBreakdown: { status: string; count: number }[];
}

interface CropAnalytics {
  distribution: {
    byType: { cropType: string; count: number; totalArea: number }[];
    byStatus: { status: string; count: number }[];
  };
  yields: {
    averageByType: { cropType: string; averageYield: number; yieldPerHa: number }[];
    topPerformers: any[];
  };
  activities: { type: string; count: number; totalCost: number }[];
}

interface FinancialAnalytics {
  summary: {
    totalExpenses: number;
    totalIncome: number;
    netProfit: number;
    profitMargin: string;
  };
  breakdown: {
    expenses: { category: string; total: number; percentage: string }[];
    income: { category: string; total: number; percentage: string }[];
  };
  trend: { week: string; expenses: number; income: number; profit: number }[];
}

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [period, setPeriod] = useState("30");
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upgradeRequired, setUpgradeRequired] = useState(false);
  
  const [overviewData, setOverviewData] = useState<AnalyticsData | null>(null);
  const [cropData, setCropData] = useState<CropAnalytics | null>(null);
  const [financialData, setFinancialData] = useState<FinancialAnalytics | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [period, activeTab]);

  async function fetchAnalytics() {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/analytics?period=${period}&type=${activeTab}`);
      const data = await response.json();
      
      if (!response.ok) {
        if (data.upgradeRequired) {
          setUpgradeRequired(true);
        } else {
          setError(data.error || "Failed to fetch analytics");
        }
        return;
      }
      
      switch (activeTab) {
        case "overview":
          setOverviewData(data);
          break;
        case "crops":
          setCropData(data);
          break;
        case "financial":
          setFinancialData(data);
          break;
      }
    } catch (err) {
      setError("An error occurred while fetching analytics");
    } finally {
      setIsLoading(false);
    }
  }

  if (upgradeRequired) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-lg mx-auto text-center">
          <CardHeader>
            <div className="mx-auto mb-4 p-4 rounded-full bg-yellow-100">
              <Lock className="h-8 w-8 text-yellow-600" />
            </div>
            <CardTitle>Pro Feature</CardTitle>
            <CardDescription>
              Advanced Analytics is available on Pro plan and above
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Unlock powerful insights including yield analysis, financial trends, 
              productivity metrics, and more.
            </p>
            <Button onClick={() => router.push("/dashboard/pricing")}>
              Upgrade to Pro
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Advanced Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Deep insights into your farm performance
          </p>
        </div>
        
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {["overview", "crops", "livestock", "financial", "productivity"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              activeTab === tab
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Card className="text-center py-8">
          <CardContent>
            <p className="text-red-500">{error}</p>
            <Button onClick={fetchAnalytics} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Overview Tab */}
          {activeTab === "overview" && overviewData && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                    <DollarSign className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      GHS {overviewData.summary.totalIncome.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {overviewData.summary.incomeCount} transactions
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                    <DollarSign className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      GHS {overviewData.summary.totalExpenses.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {overviewData.summary.expenseCount} transactions
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                    {overviewData.summary.netProfit >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${
                      overviewData.summary.netProfit >= 0 ? "text-green-600" : "text-red-600"
                    }`}>
                      GHS {overviewData.summary.netProfit.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {overviewData.summary.profitMargin}% margin
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Task Completion</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {overviewData.summary.taskCompletionRate}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Tasks completed
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Assets Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-green-500" />
                      Farms
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{overviewData.summary.farms}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-green-500" />
                      Crop Entries
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{overviewData.summary.crops}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <PawPrint className="h-4 w-4 text-orange-500" />
                      Livestock Entries
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{overviewData.summary.livestock}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Transactions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Income</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {overviewData.recentTransactions.incomes.slice(0, 5).map((income) => (
                        <div key={income.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{income.category}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(income.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center text-green-600">
                            <ArrowUpRight className="h-4 w-4 mr-1" />
                            GHS {income.amount.toLocaleString()}
                          </div>
                        </div>
                      ))}
                      {overviewData.recentTransactions.incomes.length === 0 && (
                        <p className="text-muted-foreground text-center py-4">No recent income</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Expenses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {overviewData.recentTransactions.expenses.slice(0, 5).map((expense) => (
                        <div key={expense.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{expense.category}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(expense.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center text-red-600">
                            <ArrowDownRight className="h-4 w-4 mr-1" />
                            GHS {expense.amount.toLocaleString()}
                          </div>
                        </div>
                      ))}
                      {overviewData.recentTransactions.expenses.length === 0 && (
                        <p className="text-muted-foreground text-center py-4">No recent expenses</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Task Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Task Status Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    {overviewData.taskBreakdown.map((task) => (
                      <div key={task.status} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          task.status === "COMPLETED" ? "bg-green-500" :
                          task.status === "IN_PROGRESS" ? "bg-blue-500" :
                          task.status === "PENDING" ? "bg-yellow-500" :
                          "bg-gray-500"
                        }`} />
                        <span className="font-medium">{task.status}</span>
                        <span className="text-muted-foreground">({task.count})</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Crops Tab */}
          {activeTab === "crops" && cropData && (
            <div className="space-y-6">
              {/* Crop Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Crops by Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {cropData.distribution.byType.map((crop) => (
                        <div key={crop.cropType} className="flex items-center justify-between">
                          <span className="font-medium">{crop.cropType}</span>
                          <div className="text-right">
                            <span className="font-bold">{crop.count}</span>
                            <span className="text-muted-foreground ml-2">
                              ({crop.totalArea.toFixed(1)} ha)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Crops by Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {cropData.distribution.byStatus.map((status) => (
                        <div key={status.status} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${
                              status.status === "HARVESTED" ? "bg-green-500" :
                              status.status === "GROWING" ? "bg-blue-500" :
                              status.status === "PLANTED" ? "bg-yellow-500" :
                              "bg-gray-500"
                            }`} />
                            <span>{status.status}</span>
                          </div>
                          <span className="font-bold">{status.count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Yield Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Average Yield by Crop Type</CardTitle>
                  <CardDescription>Yield performance analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Crop Type</th>
                          <th className="text-right py-2">Avg Yield</th>
                          <th className="text-right py-2">Yield/Ha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cropData.yields.averageByType.map((crop) => (
                          <tr key={crop.cropType} className="border-b">
                            <td className="py-2">{crop.cropType}</td>
                            <td className="text-right">{crop.averageYield.toFixed(1)} kg</td>
                            <td className="text-right">{crop.yieldPerHa.toFixed(1)} kg/ha</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Activities */}
              <Card>
                <CardHeader>
                  <CardTitle>Activity Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {cropData.activities.map((activity) => (
                      <div key={activity.type} className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold">{activity.count}</div>
                        <div className="text-sm text-muted-foreground">{activity.type}</div>
                        <div className="text-xs text-green-600">
                          GHS {activity.totalCost.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Financial Tab */}
          {activeTab === "financial" && financialData && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-green-50">
                  <CardContent className="pt-6">
                    <div className="text-sm text-green-600 font-medium">Total Income</div>
                    <div className="text-2xl font-bold text-green-700">
                      GHS {financialData.summary.totalIncome.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-red-50">
                  <CardContent className="pt-6">
                    <div className="text-sm text-red-600 font-medium">Total Expenses</div>
                    <div className="text-2xl font-bold text-red-700">
                      GHS {financialData.summary.totalExpenses.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
                <Card className={financialData.summary.netProfit >= 0 ? "bg-blue-50" : "bg-orange-50"}>
                  <CardContent className="pt-6">
                    <div className={`text-sm font-medium ${
                      financialData.summary.netProfit >= 0 ? "text-blue-600" : "text-orange-600"
                    }`}>Net Profit</div>
                    <div className={`text-2xl font-bold ${
                      financialData.summary.netProfit >= 0 ? "text-blue-700" : "text-orange-700"
                    }`}>
                      GHS {financialData.summary.netProfit.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-purple-50">
                  <CardContent className="pt-6">
                    <div className="text-sm text-purple-600 font-medium">Profit Margin</div>
                    <div className="text-2xl font-bold text-purple-700">
                      {financialData.summary.profitMargin}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Expense Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {financialData.breakdown.expenses.map((expense) => (
                        <div key={expense.category}>
                          <div className="flex justify-between mb-1">
                            <span>{expense.category}</span>
                            <span className="font-medium">
                              GHS {expense.total.toLocaleString()} ({expense.percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-red-500 h-2 rounded-full"
                              style={{ width: `${expense.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Income Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {financialData.breakdown.income.map((income) => (
                        <div key={income.category}>
                          <div className="flex justify-between mb-1">
                            <span>{income.category}</span>
                            <span className="font-medium">
                              GHS {income.total.toLocaleString()} ({income.percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${income.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Week</th>
                          <th className="text-right py-2">Income</th>
                          <th className="text-right py-2">Expenses</th>
                          <th className="text-right py-2">Profit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {financialData.trend.map((week) => (
                          <tr key={week.week} className="border-b">
                            <td className="py-2">{week.week}</td>
                            <td className="text-right text-green-600">
                              GHS {week.income.toLocaleString()}
                            </td>
                            <td className="text-right text-red-600">
                              GHS {week.expenses.toLocaleString()}
                            </td>
                            <td className={`text-right font-medium ${
                              week.profit >= 0 ? "text-blue-600" : "text-orange-600"
                            }`}>
                              GHS {week.profit.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Placeholder for other tabs */}
          {(activeTab === "livestock" || activeTab === "productivity") && (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-muted-foreground">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} analytics coming soon...
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
