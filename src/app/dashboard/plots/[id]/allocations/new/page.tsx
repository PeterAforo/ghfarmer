"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { use } from "react";
import { ArrowLeft, Loader2, Calculator, Calendar, Coins, Sprout } from "lucide-react";
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

const SIZE_UNITS = [
  { value: "HECTARES", label: "Hectares" },
  { value: "ACRES", label: "Acres" },
  { value: "SQUARE_METERS", label: "Square Meters" },
];

const CROP_TYPES = [
  "Maize",
  "Rice",
  "Cassava",
  "Yam",
  "Tomato",
  "Pepper",
  "Onion",
  "Okra",
  "Groundnut",
  "Cowpea",
  "Soybean",
  "Cabbage",
  "Lettuce",
  "Cucumber",
  "Watermelon",
  "Pineapple",
  "Plantain",
  "Banana",
  "Cocoa",
  "Oil Palm",
  "Cashew",
  "Mango",
  "Orange",
  "Pawpaw",
];

interface Plot {
  id: string;
  name: string;
  size: number;
  sizeUnit: string;
  usageType: string;
}

interface CapacityInfo {
  capacity: number;
  areaInHectares: number;
  spacingInfo: {
    plantSpacing: number;
    rowSpacing: number;
    plantsPerHectare: number;
    description: string;
    daysToMaturity: number;
    plantingMaterial: string;
    seedUnit: string;
    seedRatePerHectare: number;
  } | null;
}

const SEED_UNITS = [
  { value: "kg", label: "Kilograms (kg)" },
  { value: "g", label: "Grams (g)" },
  { value: "pieces", label: "Pieces" },
  { value: "bundles", label: "Bundles" },
  { value: "bags", label: "Bags" },
  { value: "cuttings", label: "Cuttings" },
  { value: "suckers", label: "Suckers" },
  { value: "setts", label: "Setts" },
];

export default function NewAllocationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: plotId } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPlot, setIsLoadingPlot] = useState(true);
  const [error, setError] = useState("");
  const [plot, setPlot] = useState<Plot | null>(null);
  const [capacityInfo, setCapacityInfo] = useState<CapacityInfo | null>(null);

  const [formData, setFormData] = useState({
    cropType: "",
    allocatedArea: "",
    areaUnit: "HECTARES",
    plantSpacing: "",
    rowSpacing: "",
    plannedPlantingDate: "",
    seedQuantity: "",
    seedUnit: "kg",
    seedCostPerUnit: "",
    notes: "",
  });

  // Calculate expected harvest date
  const expectedHarvestDate = formData.plannedPlantingDate && capacityInfo?.spacingInfo?.daysToMaturity
    ? new Date(
        new Date(formData.plannedPlantingDate).getTime() + 
        capacityInfo.spacingInfo.daysToMaturity * 24 * 60 * 60 * 1000
      ).toISOString().split('T')[0]
    : null;

  // Calculate total seed cost
  const totalSeedCost = formData.seedQuantity && formData.seedCostPerUnit
    ? parseFloat(formData.seedQuantity) * parseFloat(formData.seedCostPerUnit)
    : null;

  useEffect(() => {
    async function loadPlot() {
      try {
        const res = await fetch(`/api/plots/${plotId}`);
        if (res.ok) {
          const data = await res.json();
          setPlot(data);
          // Pre-fill with plot size
          setFormData((prev) => ({
            ...prev,
            allocatedArea: data.size.toString(),
            areaUnit: data.sizeUnit,
          }));
        } else {
          router.push("/dashboard/plots");
        }
      } catch (err) {
        console.error("Error loading plot:", err);
      } finally {
        setIsLoadingPlot(false);
      }
    }
    loadPlot();
  }, [plotId, router]);

  // Calculate capacity when crop type or area changes
  useEffect(() => {
    async function calculateCapacity() {
      if (formData.cropType && formData.allocatedArea) {
        try {
          const res = await fetch(
            `/api/plots/capacity?type=crop&name=${encodeURIComponent(formData.cropType)}&area=${formData.allocatedArea}&unit=${formData.areaUnit}`
          );
          if (res.ok) {
            const data = await res.json();
            setCapacityInfo({
              capacity: data.capacity,
              areaInHectares: data.areaInHectares,
              spacingInfo: data.spacingInfo,
            });
            // Auto-fill spacing, seed unit, and seed quantity if available
            if (data.spacingInfo) {
              const calculatedSeedQuantity = data.spacingInfo.seedRatePerHectare * data.areaInHectares;
              // Round appropriately based on unit type
              const roundedQuantity = data.spacingInfo.seedUnit === "kg" 
                ? Math.ceil(calculatedSeedQuantity * 10) / 10 // Round to 1 decimal for kg
                : Math.ceil(calculatedSeedQuantity); // Round up for pieces/cuttings/etc
              
              setFormData((prev) => ({
                ...prev,
                plantSpacing: prev.plantSpacing || data.spacingInfo.plantSpacing.toString(),
                rowSpacing: prev.rowSpacing || data.spacingInfo.rowSpacing.toString(),
                seedUnit: data.spacingInfo.seedUnit,
                seedQuantity: roundedQuantity.toString(),
              }));
            }
          }
        } catch (err) {
          console.error("Error calculating capacity:", err);
        }
      } else {
        setCapacityInfo(null);
      }
    }
    calculateCapacity();
  }, [formData.cropType, formData.allocatedArea, formData.areaUnit]);

  function updateFormData(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/plots/${plotId}/allocations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cropType: formData.cropType,
          allocatedArea: parseFloat(formData.allocatedArea),
          areaUnit: formData.areaUnit,
          plantSpacing: formData.plantSpacing ? parseFloat(formData.plantSpacing) : undefined,
          rowSpacing: formData.rowSpacing ? parseFloat(formData.rowSpacing) : undefined,
          plannedPlantingDate: formData.plannedPlantingDate || undefined,
          seedQuantity: formData.seedQuantity ? parseFloat(formData.seedQuantity) : undefined,
          seedUnit: formData.seedUnit || undefined,
          seedCostPerUnit: formData.seedCostPerUnit ? parseFloat(formData.seedCostPerUnit) : undefined,
          notes: formData.notes || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create allocation");
        return;
      }

      router.push(`/dashboard/plots/${plotId}`);
      router.refresh();
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoadingPlot) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!plot) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Plot not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/plots/${plotId}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Crop Allocation</h1>
          <p className="text-gray-600">Plan crop planting for {plot.name}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Crop Allocation Details</CardTitle>
          <CardDescription>
            Select a crop and the system will calculate how many plants can fit.
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
              <Label htmlFor="cropType">Crop Type *</Label>
              <Select
                value={formData.cropType}
                onValueChange={(value) => updateFormData("cropType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a crop" />
                </SelectTrigger>
                <SelectContent>
                  {CROP_TYPES.map((crop) => (
                    <SelectItem key={crop} value={crop}>
                      {crop}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="allocatedArea">Area to Allocate *</Label>
                <Input
                  id="allocatedArea"
                  type="number"
                  step="0.01"
                  min="0"
                  max={plot.size}
                  required
                  value={formData.allocatedArea}
                  onChange={(e) => updateFormData("allocatedArea", e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500">
                  Plot size: {plot.size} {plot.sizeUnit.toLowerCase()}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="areaUnit">Unit</Label>
                <Select
                  value={formData.areaUnit}
                  onValueChange={(value) => updateFormData("areaUnit", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SIZE_UNITS.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Capacity Calculator */}
            {capacityInfo && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <Calculator className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-green-800">Calculated Capacity</p>
                    <p className="text-2xl font-bold text-green-900">
                      {capacityInfo.capacity.toLocaleString()} plants
                    </p>
                    {capacityInfo.spacingInfo && (
                      <>
                        <p className="text-xs text-green-700">
                          {capacityInfo.spacingInfo.description}
                        </p>
                        <p className="text-xs text-green-700 mt-1">
                          <Sprout className="inline h-3 w-3 mr-1" />
                          Planting material: <span className="font-medium">{capacityInfo.spacingInfo.plantingMaterial}</span>
                          {" • "}
                          <Calendar className="inline h-3 w-3 mr-1" />
                          Days to harvest: <span className="font-medium">{capacityInfo.spacingInfo.daysToMaturity}</span>
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <h3 className="font-medium mb-4">Plant Spacing (optional)</h3>
              <p className="text-sm text-gray-500 mb-4">
                Customize spacing or use recommended values
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rowSpacing">Row Spacing (meters)</Label>
                  <Input
                    id="rowSpacing"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder={capacityInfo?.spacingInfo?.rowSpacing?.toString() || "e.g., 0.75"}
                    value={formData.rowSpacing}
                    onChange={(e) => updateFormData("rowSpacing", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plantSpacing">Plant Spacing (meters)</Label>
                  <Input
                    id="plantSpacing"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder={capacityInfo?.spacingInfo?.plantSpacing?.toString() || "e.g., 0.25"}
                    value={formData.plantSpacing}
                    onChange={(e) => updateFormData("plantSpacing", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Planting & Harvest Dates
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plannedPlantingDate">Planned Planting Date</Label>
                  <Input
                    id="plannedPlantingDate"
                    type="date"
                    value={formData.plannedPlantingDate}
                    onChange={(e) => updateFormData("plannedPlantingDate", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expectedHarvestDate">Expected Harvest Date</Label>
                  <Input
                    id="expectedHarvestDate"
                    type="date"
                    value={expectedHarvestDate || ""}
                    disabled
                    className="bg-gray-50"
                  />
                  {capacityInfo?.spacingInfo?.daysToMaturity && (
                    <p className="text-xs text-gray-500">
                      Auto-calculated: {capacityInfo.spacingInfo.daysToMaturity} days after planting
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <Coins className="h-4 w-4" />
                Planting Material & Cost
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {capacityInfo?.spacingInfo?.plantingMaterial 
                  ? `This crop uses ${capacityInfo.spacingInfo.plantingMaterial} for planting`
                  : "Select a crop to auto-calculate planting material requirements"}
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="seedQuantity">Quantity (auto-calculated)</Label>
                  <Input
                    id="seedQuantity"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Select crop first"
                    value={formData.seedQuantity}
                    onChange={(e) => updateFormData("seedQuantity", e.target.value)}
                    disabled={isLoading}
                    className="bg-gray-50"
                  />
                  {capacityInfo?.spacingInfo && (
                    <p className="text-xs text-gray-500">
                      Based on {capacityInfo.spacingInfo.seedRatePerHectare.toLocaleString()} {capacityInfo.spacingInfo.seedUnit}/ha
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seedUnit">Unit (auto-selected)</Label>
                  <Input
                    id="seedUnit"
                    type="text"
                    value={SEED_UNITS.find(u => u.value === formData.seedUnit)?.label || formData.seedUnit}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">
                    Based on crop type
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seedCostPerUnit">Cost per {formData.seedUnit} (GHS)</Label>
                  <Input
                    id="seedCostPerUnit"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g., 50.00"
                    value={formData.seedCostPerUnit}
                    onChange={(e) => updateFormData("seedCostPerUnit", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              {totalSeedCost !== null && totalSeedCost > 0 && (
                <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-amber-800">Total Planting Material Cost</span>
                    <span className="text-lg font-bold text-amber-900">
                      GHS {totalSeedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <p className="text-xs text-amber-700 mt-1">
                    This will be added to your production costs
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                disabled={isLoading || !formData.cropType || !formData.allocatedArea}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Allocation
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
