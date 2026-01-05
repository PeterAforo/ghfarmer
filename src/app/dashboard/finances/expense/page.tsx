"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

const CATEGORIES = [
  { value: "SEEDS", label: "Seeds" },
  { value: "FERTILIZERS", label: "Fertilizers" },
  { value: "PESTICIDES", label: "Pesticides" },
  { value: "VETERINARY", label: "Veterinary" },
  { value: "FEED", label: "Feed" },
  { value: "LABOR", label: "Labor" },
  { value: "EQUIPMENT", label: "Equipment" },
  { value: "TRANSPORTATION", label: "Transportation" },
  { value: "UTILITIES", label: "Utilities" },
  { value: "OTHER", label: "Other" },
];

const PAYMENT_METHODS = [
  { value: "CASH", label: "Cash" },
  { value: "MOBILE_MONEY", label: "Mobile Money" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "CREDIT", label: "Credit" },
  { value: "OTHER", label: "Other" },
];

interface CropEntry {
  id: string;
  plotName: string | null;
  crop: { name: string };
  farm: { name: string };
}

interface LivestockEntry {
  id: string;
  name: string | null;
  livestock: { name: string };
  farm: { name: string };
}

export default function LogExpensePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [crops, setCrops] = useState<CropEntry[]>([]);
  const [livestock, setLivestock] = useState<LivestockEntry[]>([]);
  const [linkType, setLinkType] = useState<"none" | "crop" | "livestock">("none");

  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    paymentMethod: "",
    cropEntryId: "",
    livestockEntryId: "",
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [cropsRes, livestockRes] = await Promise.all([
          fetch("/api/crops"),
          fetch("/api/livestock"),
        ]);

        if (cropsRes.ok) {
          const data = await cropsRes.json();
          setCrops(data);
        }
        if (livestockRes.ok) {
          const data = await livestockRes.json();
          setLivestock(data);
        }
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setIsLoadingData(false);
      }
    }

    loadData();
  }, []);

  function updateFormData(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/finances/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: formData.category,
          amount: parseFloat(formData.amount),
          date: formData.date,
          description: formData.description || undefined,
          paymentMethod: formData.paymentMethod || undefined,
          cropEntryId: linkType === "crop" ? formData.cropEntryId : undefined,
          livestockEntryId:
            linkType === "livestock" ? formData.livestockEntryId : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to log expense");
        return;
      }

      router.push("/dashboard/finances");
      router.refresh();
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/finances">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Log Expense</h1>
          <p className="text-gray-600">Record a new expense</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense Details</CardTitle>
          <CardDescription>
            Enter the details of your expense.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => updateFormData("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (GHS) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  required
                  value={formData.amount}
                  onChange={(e) => updateFormData("amount", e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => updateFormData("date", e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="e.g., NPK fertilizer for maize field"
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) => updateFormData("paymentMethod", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Link to Crop or Livestock */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <Label>Link to (Optional)</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setLinkType("none")}
                  className={`px-3 py-1.5 rounded text-sm ${
                    linkType === "none"
                      ? "bg-primary text-primary-foreground"
                      : "bg-white border"
                  }`}
                >
                  None
                </button>
                <button
                  type="button"
                  onClick={() => setLinkType("crop")}
                  className={`px-3 py-1.5 rounded text-sm ${
                    linkType === "crop"
                      ? "bg-primary text-primary-foreground"
                      : "bg-white border"
                  }`}
                >
                  Crop
                </button>
                <button
                  type="button"
                  onClick={() => setLinkType("livestock")}
                  className={`px-3 py-1.5 rounded text-sm ${
                    linkType === "livestock"
                      ? "bg-primary text-primary-foreground"
                      : "bg-white border"
                  }`}
                >
                  Livestock
                </button>
              </div>

              {linkType === "crop" && (
                <Select
                  value={formData.cropEntryId}
                  onValueChange={(value) => updateFormData("cropEntryId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select crop" />
                  </SelectTrigger>
                  <SelectContent>
                    {crops.map((crop) => (
                      <SelectItem key={crop.id} value={crop.id}>
                        {crop.crop.name} - {crop.farm.name}
                        {crop.plotName && ` (${crop.plotName})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {linkType === "livestock" && (
                <Select
                  value={formData.livestockEntryId}
                  onValueChange={(value) =>
                    updateFormData("livestockEntryId", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select livestock" />
                  </SelectTrigger>
                  <SelectContent>
                    {livestock.map((entry) => (
                      <SelectItem key={entry.id} value={entry.id}>
                        {entry.livestock.name} - {entry.farm.name}
                        {entry.name && ` (${entry.name})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading || !formData.category || !formData.amount}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Log Expense
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
