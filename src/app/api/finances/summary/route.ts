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
    const period = searchParams.get("period") || "month";

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
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
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Get totals
    const [expenseTotal, incomeTotal, expensesByCategory, recentTransactions] =
      await Promise.all([
        db.expense.aggregate({
          where: {
            userId: session.user.id,
            date: { gte: startDate },
          },
          _sum: { amount: true },
        }),
        db.income.aggregate({
          where: {
            userId: session.user.id,
            date: { gte: startDate },
          },
          _sum: { totalAmount: true },
        }),
        db.expense.groupBy({
          by: ["category"],
          where: {
            userId: session.user.id,
            date: { gte: startDate },
          },
          _sum: { amount: true },
        }),
        Promise.all([
          db.expense.findMany({
            where: { userId: session.user.id },
            orderBy: { date: "desc" },
            take: 5,
            select: {
              id: true,
              category: true,
              amount: true,
              date: true,
              description: true,
            },
          }),
          db.income.findMany({
            where: { userId: session.user.id },
            orderBy: { date: "desc" },
            take: 5,
            select: {
              id: true,
              productType: true,
              totalAmount: true,
              date: true,
              notes: true,
            },
          }),
        ]),
      ]);

    const totalExpenses = expenseTotal._sum.amount || 0;
    const totalIncome = incomeTotal._sum.totalAmount || 0;
    const profit = totalIncome - totalExpenses;

    // Combine and sort recent transactions
    const [expenses, incomes] = recentTransactions;
    const combined = [
      ...expenses.map((e) => ({
        id: e.id,
        type: "expense" as const,
        category: e.category,
        amount: -e.amount,
        date: e.date,
        description: e.description || e.category,
      })),
      ...incomes.map((i) => ({
        id: i.id,
        type: "income" as const,
        category: i.productType,
        amount: i.totalAmount,
        date: i.date,
        description: i.notes || i.productType,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      period,
      startDate,
      endDate: now,
      totalExpenses,
      totalIncome,
      profit,
      profitMargin: totalIncome > 0 ? (profit / totalIncome) * 100 : 0,
      expensesByCategory: expensesByCategory.map((e) => ({
        category: e.category,
        amount: e._sum.amount || 0,
      })),
      recentTransactions: combined.slice(0, 10),
    });
  } catch (error) {
    console.error("Error fetching financial summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch financial summary" },
      { status: 500 }
    );
  }
}
