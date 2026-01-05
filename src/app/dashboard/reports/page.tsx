"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Leaf,
  PawPrint,
  Calendar,
  Download,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { exportToCSV, exportToPDF } from "@/lib/export";

interface ReportData {
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
  };
  byCategory: {
    category: string;
    income: number;
    expenses: number;
    profit: number;
  }[];
  monthlyTrend: {
    month: string;
    income: number;
    expenses: number;
  }[];
  topCrops: {
    name: string;
    revenue: number;
    yield: number;
  }[];
  topLivestock: {
    name: string;
    revenue: number;
    count: number;
  }[];
}

const PERIODS = [
  { value: "month", label: "This Month" },
  { value: "quarter", label: "This Quarter" },
  { value: "year", label: "This Year" },
  { value: "all", label: "All Time" },
];

export default function ReportsPage() {
  const [period, setPeriod] = useState("year");
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<ReportData | null>(null);

  useEffect(() => {
    fetchReportData();
  }, [period]);

  async function fetchReportData() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/reports?period=${period}`);
      if (res.ok) {
        const reportData = await res.json();
        setData(reportData);
      } else {
        // Fallback to sample data if API fails
        setData({
          summary: {
            totalIncome: 0,
            totalExpenses: 0,
            netProfit: 0,
            profitMargin: 0,
          },
          byCategory: [
            { category: "Crops", income: 0, expenses: 0, profit: 0 },
            { category: "Livestock", income: 0, expenses: 0, profit: 0 },
          ],
          monthlyTrend: [],
          topCrops: [{ name: "No data", revenue: 0, yield: 0 }],
          topLivestock: [{ name: "No data", revenue: 0, count: 0 }],
        });
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load report data</p>
      </div>
    );
  }

  const maxMonthlyValue = Math.max(
    ...data.monthlyTrend.map((m) => Math.max(m.income, m.expenses))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Track your farm's performance</p>
        </div>
        <div className="flex gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 rounded-lg border bg-white text-gray-900"
          >
            {PERIODS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <Button variant="outline" onClick={() => exportToPDF(data!, `farm-report-${period}`)}>
            <FileText className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" onClick={() => exportToCSV(data!, `farm-report-${period}`)}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              GHS {data.summary.totalIncome.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              GHS {data.summary.totalExpenses.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.summary.netProfit >= 0 ? "text-primary" : "text-red-600"}`}>
              GHS {data.summary.netProfit.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Profit Margin</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {data.summary.profitMargin.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Monthly Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <div className="flex items-end justify-between h-48 gap-2">
              {data.monthlyTrend.map((month, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex gap-0.5 items-end h-40">
                    <div
                      className="flex-1 bg-green-500 rounded-t"
                      style={{ height: `${(month.income / maxMonthlyValue) * 100}%` }}
                      title={`Income: GHS ${month.income}`}
                    />
                    <div
                      className="flex-1 bg-red-400 rounded-t"
                      style={{ height: `${(month.expenses / maxMonthlyValue) * 100}%` }}
                      title={`Expenses: GHS ${month.expenses}`}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{month.month}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded" />
                <span className="text-sm text-gray-600">Income</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-400 rounded" />
                <span className="text-sm text-gray-600">Expenses</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown & Top Products */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* By Category */}
        <Card>
          <CardHeader>
            <CardTitle>Profit by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.byCategory.map((cat, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{cat.category}</span>
                    <span className={cat.profit >= 0 ? "text-green-600" : "text-red-600"}>
                      GHS {cat.profit.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-1 h-2">
                    <div
                      className="bg-green-500 rounded"
                      style={{ width: `${(cat.income / (cat.income + cat.expenses)) * 100}%` }}
                    />
                    <div
                      className="bg-red-400 rounded"
                      style={{ width: `${(cat.expenses / (cat.income + cat.expenses)) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Income: GHS {cat.income.toLocaleString()}</span>
                    <span>Expenses: GHS {cat.expenses.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
                  <Leaf className="h-4 w-4" /> Crops
                </h4>
                <div className="space-y-2">
                  {data.topCrops.map((crop, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span>{crop.name}</span>
                      <span className="font-medium text-green-600">
                        GHS {crop.revenue.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
                  <PawPrint className="h-4 w-4" /> Livestock
                </h4>
                <div className="space-y-2">
                  {data.topLivestock.map((animal, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span>{animal.name}</span>
                      <span className="font-medium text-green-600">
                        GHS {animal.revenue.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
              <FileText className="h-6 w-6" />
              <span>Seasonal Summary</span>
              <span className="text-xs text-gray-500">Crops, livestock, financials</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
              <FileText className="h-6 w-6" />
              <span>Input Usage Report</span>
              <span className="text-xs text-gray-500">Seeds, fertilizers, feed</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
              <FileText className="h-6 w-6" />
              <span>Sales Report</span>
              <span className="text-xs text-gray-500">Revenue by product</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
