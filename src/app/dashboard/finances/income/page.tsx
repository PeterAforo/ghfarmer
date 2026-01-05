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

const PAYMENT_METHODS = [
  { value: "CASH", label: "Cash" },
  { value: "MOBILE_MONEY", label: "Mobile Money" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "CREDIT", label: "Credit" },
  { value: "OTHER", label: "Other" },
];

const QUANTITY_UNITS = [
  { value: "KG", label: "Kilograms (kg)" },
  { value: "BAGS", label: "Bags" },
  { value: "CRATES", label: "Crates" },
  { value: "PIECES", label: "Pieces" },
  { value: "LITERS", label: "Liters" },
  { value: "BUNCHES", label: "Bunches" },
  { value: "HEADS", label: "Heads" },
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

export default function LogIncomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [crops, setCrops] = useState<CropEntry[]>([]);
  const [livestock, setLivestock] = useState<LivestockEntry[]>([]);
  const [linkType, setLinkType] = useState<"none" | "crop" | "livestock">("none");

  const [formData, setFormData] = useState({
    productType: "",
    quantity: "",
    quantityUnit: "KG",
    pricePerUnit: "",
    totalAmount: "",
    date: new Date().toISOString().split("T")[0],
    buyerName: "",
    buyerContact: "",
    paymentMethod: "",
    notes: "",
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
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto-calculate total if quantity and price are set
      if (field === "quantity" || field === "pricePerUnit") {
        const qty = parseFloat(field === "quantity" ? value : prev.quantity) || 0;
        const price =
          parseFloat(field === "pricePerUnit" ? value : prev.pricePerUnit) || 0;
        if (qty > 0 && price > 0) {
          updated.totalAmount = (qty * price).toFixed(2);
        }
      }

      return updated;
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/finances/income", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productType: formData.productType,
          quantity: formData.quantity ? parseFloat(formData.quantity) : undefined,
          quantityUnit: formData.quantityUnit || undefined,
          pricePerUnit: formData.pricePerUnit
            ? parseFloat(formData.pricePerUnit)
            : undefined,
          totalAmount: parseFloat(formData.totalAmount),
          date: formData.date,
          buyerName: formData.buyerName || undefined,
          buyerContact: formData.buyerContact || undefined,
          paymentMethod: formData.paymentMethod || undefined,
          notes: formData.notes || undefined,
          cropEntryId: linkType === "crop" ? formData.cropEntryId : undefined,
          livestockEntryId:
            linkType === "livestock" ? formData.livestockEntryId : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to log income");
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
          <h1 className="text-2xl font-bold text-gray-900">Log Income</h1>
          <p className="text-gray-600">Record a sale or income</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Income Details</CardTitle>
          <CardDescription>
            Enter the details of your sale or income.
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
              <Label htmlFor="productType">Product Type *</Label>
              <Input
                id="productType"
                placeholder="e.g., Maize, Eggs, Tomatoes"
                required
                value={formData.productType}
                onChange={(e) => updateFormData("productType", e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0"
                  value={formData.quantity}
                  onChange={(e) => updateFormData("quantity", e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantityUnit">Unit</Label>
                <Select
                  value={formData.quantityUnit}
                  onValueChange={(value) => updateFormData("quantityUnit", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {QUANTITY_UNITS.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pricePerUnit">Price/Unit (GHS)</Label>
                <Input
                  id="pricePerUnit"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.pricePerUnit}
                  onChange={(e) => updateFormData("pricePerUnit", e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalAmount">Total Amount (GHS) *</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  required
                  value={formData.totalAmount}
                  onChange={(e) => updateFormData("totalAmount", e.target.value)}
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="buyerName">Buyer Name</Label>
                <Input
                  id="buyerName"
                  placeholder="e.g., Makola Market Trader"
                  value={formData.buyerName}
                  onChange={(e) => updateFormData("buyerName", e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buyerContact">Buyer Contact</Label>
                <Input
                  id="buyerContact"
                  placeholder="e.g., 024 XXX XXXX"
                  value={formData.buyerContact}
                  onChange={(e) => updateFormData("buyerContact", e.target.value)}
                  disabled={isLoading}
                />
              </div>
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

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Any additional notes..."
                value={formData.notes}
                onChange={(e) => updateFormData("notes", e.target.value)}
                disabled={isLoading}
              />
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
                disabled={
                  isLoading || !formData.productType || !formData.totalAmount
                }
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Log Income
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
