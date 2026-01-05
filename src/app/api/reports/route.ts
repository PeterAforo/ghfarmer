import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "year";

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "quarter":
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(0); // All time
    }

    // Fetch income data (using totalAmount field from schema)
    const income = await db.income.findMany({
      where: {
        userId: session.user.id,
        date: { gte: startDate },
      },
    });

    // Fetch expense data
    const expenses = await db.expense.findMany({
      where: {
        userId: session.user.id,
        date: { gte: startDate },
      },
    });

    // Calculate totals (Income uses totalAmount, Expense uses amount)
    const totalIncome = income.reduce((sum, i) => sum + (i.totalAmount || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const netProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

    // Group expenses by category
    const expensesByCategory = new Map<string, number>();
    expenses.forEach((e) => {
      const cat = e.category || "OTHER";
      expensesByCategory.set(cat, (expensesByCategory.get(cat) || 0) + (e.amount || 0));
    });

    // Group income by productType
    const incomeByType = new Map<string, number>();
    income.forEach((i) => {
      const type = i.productType || "OTHER";
      incomeByType.set(type, (incomeByType.get(type) || 0) + (i.totalAmount || 0));
    });

    // Build category breakdown
    const byCategory = [
      { 
        category: "Crops", 
        income: income.filter(i => i.cropEntryId).reduce((sum, i) => sum + (i.totalAmount || 0), 0),
        expenses: Array.from(expensesByCategory.entries())
          .filter(([k]) => ["SEEDS", "FERTILIZERS", "PESTICIDES", "LABOR"].includes(k))
          .reduce((sum, [, v]) => sum + v, 0),
        profit: 0
      },
      { 
        category: "Livestock", 
        income: income.filter(i => i.livestockEntryId).reduce((sum, i) => sum + (i.totalAmount || 0), 0),
        expenses: Array.from(expensesByCategory.entries())
          .filter(([k]) => ["FEED", "VETERINARY", "LIVESTOCK_PURCHASE"].includes(k))
          .reduce((sum, [, v]) => sum + v, 0),
        profit: 0
      },
    ];
    byCategory.forEach(c => c.profit = c.income - c.expenses);

    // Monthly trend (last 12 months)
    const monthlyTrend = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthIncome = income
        .filter((inc) => {
          const d = new Date(inc.date);
          return d >= monthStart && d <= monthEnd;
        })
        .reduce((sum, inc) => sum + (inc.totalAmount || 0), 0);

      const monthExpenses = expenses
        .filter((exp) => {
          const d = new Date(exp.date);
          return d >= monthStart && d <= monthEnd;
        })
        .reduce((sum, exp) => sum + (exp.amount || 0), 0);

      monthlyTrend.push({
        month: monthStart.toLocaleDateString("en-US", { month: "short" }),
        income: monthIncome,
        expenses: monthExpenses,
      });
    }

    // Get top products by income (group by productType)
    const productTotals = new Map<string, number>();
    income.forEach((i) => {
      const product = i.productType || "Unknown";
      productTotals.set(product, (productTotals.get(product) || 0) + (i.totalAmount || 0));
    });

    const topCrops = Array.from(productTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, revenue]) => ({ name, revenue, yield: 0 }));

    const topLivestock = income
      .filter(i => i.livestockEntryId)
      .reduce((acc, i) => {
        const name = i.productType || "Unknown";
        const existing = acc.find(x => x.name === name);
        if (existing) {
          existing.revenue += i.totalAmount || 0;
        } else {
          acc.push({ name, revenue: i.totalAmount || 0, count: 0 });
        }
        return acc;
      }, [] as { name: string; revenue: number; count: number }[])
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3);

    return NextResponse.json({
      summary: {
        totalIncome,
        totalExpenses,
        netProfit,
        profitMargin: Math.round(profitMargin * 10) / 10,
      },
      byCategory: byCategory.length > 0 ? byCategory : [
        { category: "Crops", income: 0, expenses: 0, profit: 0 },
        { category: "Livestock", income: 0, expenses: 0, profit: 0 },
      ],
      monthlyTrend,
      topCrops: topCrops.length > 0 ? topCrops : [
        { name: "No data", revenue: 0, yield: 0 },
      ],
      topLivestock: topLivestock.length > 0 ? topLivestock : [
        { name: "No data", revenue: 0, count: 0 },
      ],
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
