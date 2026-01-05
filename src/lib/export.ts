import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ReportData {
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
  };
  byCategory: Array<{
    category: string;
    income: number;
    expenses: number;
    profit: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    income: number;
    expenses: number;
  }>;
  topCrops: Array<{
    name: string;
    revenue: number;
    yield: number;
  }>;
  topLivestock: Array<{
    name: string;
    revenue: number;
    count: number;
  }>;
}

export function exportToCSV(data: ReportData, filename: string = "farm-report") {
  const lines: string[] = [];
  
  // Summary section
  lines.push("FARM FINANCIAL REPORT");
  lines.push("");
  lines.push("SUMMARY");
  lines.push(`Total Income,GHS ${data.summary.totalIncome.toLocaleString()}`);
  lines.push(`Total Expenses,GHS ${data.summary.totalExpenses.toLocaleString()}`);
  lines.push(`Net Profit,GHS ${data.summary.netProfit.toLocaleString()}`);
  lines.push(`Profit Margin,${data.summary.profitMargin}%`);
  lines.push("");
  
  // Category breakdown
  lines.push("BREAKDOWN BY CATEGORY");
  lines.push("Category,Income,Expenses,Profit");
  data.byCategory.forEach((cat) => {
    lines.push(`${cat.category},${cat.income},${cat.expenses},${cat.profit}`);
  });
  lines.push("");
  
  // Monthly trend
  lines.push("MONTHLY TREND");
  lines.push("Month,Income,Expenses");
  data.monthlyTrend.forEach((month) => {
    lines.push(`${month.month},${month.income},${month.expenses}`);
  });
  lines.push("");
  
  // Top crops
  lines.push("TOP PERFORMING CROPS");
  lines.push("Crop,Revenue");
  data.topCrops.forEach((crop) => {
    lines.push(`${crop.name},${crop.revenue}`);
  });
  lines.push("");
  
  // Top livestock
  lines.push("TOP PERFORMING LIVESTOCK");
  lines.push("Livestock,Revenue");
  data.topLivestock.forEach((livestock) => {
    lines.push(`${livestock.name},${livestock.revenue}`);
  });
  
  const csvContent = lines.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToPDF(data: ReportData, filename: string = "farm-report") {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Title
  doc.setFontSize(20);
  doc.setTextColor(22, 163, 74); // Green color
  doc.text("Ghana Farmer", pageWidth / 2, 20, { align: "center" });
  
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("Farm Financial Report", pageWidth / 2, 30, { align: "center" });
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, 38, { align: "center" });
  
  // Summary Cards
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("Financial Summary", 14, 50);
  
  const summaryData = [
    ["Total Income", `GHS ${data.summary.totalIncome.toLocaleString()}`],
    ["Total Expenses", `GHS ${data.summary.totalExpenses.toLocaleString()}`],
    ["Net Profit", `GHS ${data.summary.netProfit.toLocaleString()}`],
    ["Profit Margin", `${data.summary.profitMargin}%`],
  ];
  
  autoTable(doc, {
    startY: 55,
    head: [["Metric", "Value"]],
    body: summaryData,
    theme: "striped",
    headStyles: { fillColor: [22, 163, 74] },
    margin: { left: 14, right: 14 },
  });
  
  // Category Breakdown
  const categoryY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.text("Breakdown by Category", 14, categoryY);
  
  const categoryData = data.byCategory.map((cat) => [
    cat.category,
    `GHS ${cat.income.toLocaleString()}`,
    `GHS ${cat.expenses.toLocaleString()}`,
    `GHS ${cat.profit.toLocaleString()}`,
  ]);
  
  autoTable(doc, {
    startY: categoryY + 5,
    head: [["Category", "Income", "Expenses", "Profit"]],
    body: categoryData,
    theme: "striped",
    headStyles: { fillColor: [22, 163, 74] },
    margin: { left: 14, right: 14 },
  });
  
  // Monthly Trend
  const monthlyY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.text("Monthly Trend", 14, monthlyY);
  
  const monthlyData = data.monthlyTrend.map((m) => [
    m.month,
    `GHS ${m.income.toLocaleString()}`,
    `GHS ${m.expenses.toLocaleString()}`,
  ]);
  
  autoTable(doc, {
    startY: monthlyY + 5,
    head: [["Month", "Income", "Expenses"]],
    body: monthlyData,
    theme: "striped",
    headStyles: { fillColor: [22, 163, 74] },
    margin: { left: 14, right: 14 },
  });
  
  // Check if we need a new page
  if ((doc as any).lastAutoTable.finalY > 220) {
    doc.addPage();
  }
  
  // Top Crops
  const cropsY = (doc as any).lastAutoTable.finalY > 220 ? 20 : (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.text("Top Performing Crops", 14, cropsY);
  
  const cropsData = data.topCrops.map((c) => [
    c.name,
    `GHS ${c.revenue.toLocaleString()}`,
  ]);
  
  autoTable(doc, {
    startY: cropsY + 5,
    head: [["Crop", "Revenue"]],
    body: cropsData,
    theme: "striped",
    headStyles: { fillColor: [22, 163, 74] },
    margin: { left: 14, right: 14 },
    tableWidth: pageWidth / 2 - 20,
  });
  
  // Top Livestock
  const livestockY = cropsY;
  doc.text("Top Performing Livestock", pageWidth / 2 + 5, livestockY);
  
  const livestockData = data.topLivestock.map((l) => [
    l.name,
    `GHS ${l.revenue.toLocaleString()}`,
  ]);
  
  autoTable(doc, {
    startY: livestockY + 5,
    head: [["Livestock", "Revenue"]],
    body: livestockData,
    theme: "striped",
    headStyles: { fillColor: [22, 163, 74] },
    margin: { left: pageWidth / 2 + 5, right: 14 },
    tableWidth: pageWidth / 2 - 20,
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount} | Ghana Farmer - Digital Farm Management`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }
  
  doc.save(`${filename}.pdf`);
}
