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
    const format = searchParams.get("format") || "csv";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    // Fetch expenses
    const expenses = await db.expense.findMany({
      where: {
        userId: session.user.id,
        ...(startDate || endDate ? { date: dateFilter } : {}),
      },
      include: {
        cropEntry: { include: { crop: true } },
        livestockEntry: { include: { livestock: true } },
      },
      orderBy: { date: "desc" },
    });

    // Fetch income
    const incomes = await db.income.findMany({
      where: {
        userId: session.user.id,
        ...(startDate || endDate ? { date: dateFilter } : {}),
      },
      include: {
        cropEntry: { include: { crop: true } },
        livestockEntry: { include: { livestock: true } },
      },
      orderBy: { date: "desc" },
    });

    if (format === "csv") {
      // Generate CSV
      let csv = "Type,Date,Category,Description,Amount (GHS),Related To\n";

      expenses.forEach((exp) => {
        const relatedTo = exp.cropEntry?.crop?.englishName || exp.livestockEntry?.livestock?.englishName || "";
        csv += `Expense,${new Date(exp.date).toLocaleDateString()},${exp.category},"${exp.description || ""}",${exp.amount},${relatedTo}\n`;
      });

      incomes.forEach((inc) => {
        const relatedTo = inc.cropEntry?.crop?.englishName || inc.livestockEntry?.livestock?.englishName || "";
        csv += `Income,${new Date(inc.date).toLocaleDateString()},${inc.productType},"${inc.notes || ""}",${inc.totalAmount},${relatedTo}\n`;
      });

      // Add summary
      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
      const totalIncome = incomes.reduce((sum, i) => sum + i.totalAmount, 0);
      csv += `\n\nSUMMARY\n`;
      csv += `Total Income,,,,"${totalIncome.toFixed(2)}"\n`;
      csv += `Total Expenses,,,,"${totalExpenses.toFixed(2)}"\n`;
      csv += `Net Profit/Loss,,,,"${(totalIncome - totalExpenses).toFixed(2)}"\n`;

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="financial-report-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    // JSON format for other uses
    return NextResponse.json({
      expenses,
      incomes,
      summary: {
        totalExpenses: expenses.reduce((sum, e) => sum + e.amount, 0),
        totalIncome: incomes.reduce((sum, i) => sum + i.totalAmount, 0),
        netProfit: incomes.reduce((sum, i) => sum + i.totalAmount, 0) - expenses.reduce((sum, e) => sum + e.amount, 0),
      },
    });
  } catch (error) {
    console.error("Error exporting finances:", error);
    return NextResponse.json({ error: "Failed to export" }, { status: 500 });
  }
}
